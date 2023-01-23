import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

import { deployBadgeMinter } from './fixtures';

async function getSignatureFromSigner(to: string, badgeId: number, verifyingContractAddress: string) {
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
  const signer = await ethers.getSigner(to);
  const signature = await signer._signTypedData(domain, types, value);
  return signature;
}

describe('BadgeMinter', function () {
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

  it('Should fail if signature is not valid', async function () {
    const { badgeMinter, otherAccount } = await loadFixture(deployBadgeMinter);
    const badgeId = 123;
    const signature = await getSignatureFromSigner(otherAccount.address, badgeId, badgeMinter.address);
    await expect(badgeMinter.claim(badgeId, signature)).to.be.revertedWith('_verify: invalid signature');
  });
});
