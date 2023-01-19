import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { TypedDataUtils } from 'ethers-eip712';

describe('BadgeMinter', function () {
  async function deployBadgeMinter() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Badge = await ethers.getContractFactory('Badge');
    const badge = await Badge.deploy();

    const BadgeMinter = await ethers.getContractFactory('BadgeMinter');
    const badgeMinter = await BadgeMinter.deploy();

    await badge.setMinterRole(badgeMinter.address);
    await badgeMinter.setBadgeAddress(badge.address);
    await badgeMinter.setSigner(owner.address);

    return { badge, badgeMinter, owner, otherAccount };
  }

  async function getSignatureFromSigner(to: string, badgeId: number, signer: any, verifyingContractAddress: string) {
    const domain = {
      name: 'BadgeMinter',
      version: '1.0.0',
      chainId: 31337,
      verifyingContract: verifyingContractAddress,
    };
    const types = {
      Claim: [
        { name: 'to', type: 'address' },
        { name: 'badgeId', type: 'uint256' },
      ],
    };
    const value = { to, badgeId };

    const typedData = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Claim: [
          { name: 'to', type: 'address' },
          { name: 'badgeId', type: 'uint256' },
        ],
      },
      primaryType: 'Claim',
      domain,
      message: { to, badgeId },
    };

    const digest = TypedDataUtils.encodeDigest(typedData);
    const digestHex = ethers.utils.hexlify(digest);
    console.log('digestHext', digestHex);

    const signature = await signer._signTypedData(domain, types, value);
    const recoveredAddress = ethers.utils.verifyTypedData(domain, types, value, signature);

    return signature;
  }

  it('Should set the right badge contract address', async function () {
    const { badge, badgeMinter } = await loadFixture(deployBadgeMinter);
    expect(await badgeMinter.getBadgeAddress()).to.equal(badge.address);
  });

  it('Should set the right signer', async function () {
    const { badgeMinter, owner } = await loadFixture(deployBadgeMinter);
    expect(await badgeMinter.getSigner()).to.equal(owner.address);
  });

  it('Should have the minter role on a Badge contract', async function () {
    const { badge, badgeMinter } = await loadFixture(deployBadgeMinter);
    const minterRole = await badge.MINTER_ROLE();
    expect(await badge.hasRole(minterRole, badgeMinter.address)).to.equal(true);
  });

  it('Should claim badge from a Badge contract', async function () {
    const { badgeMinter, owner } = await loadFixture(deployBadgeMinter);
    const badgeId = 123;
    const signature = await getSignatureFromSigner(owner.address, badgeId, owner, badgeMinter.address);
    await badgeMinter.claim(badgeId, signature);
    expect(true).to.equal(true);
  });
});
