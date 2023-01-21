import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

const BigNumber = ethers.BigNumber;

describe('Badge', function () {
  async function deployBadge() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Badge = await ethers.getContractFactory('Badge');
    const badge = await Badge.deploy('https://ipfs.infura.io:5001');
    await badge.setMinterRole(owner.address);
    await badge.setPublisher(owner.address);
    return { badge, owner, otherAccount };
  }

  it('Should set the minter', async function () {
    const { badge, owner } = await loadFixture(deployBadge);
    const minter = await badge.MINTER_ROLE();
    expect(await badge.hasRole(minter, owner.address)).to.equal(true);
  });

  it('Should set the publisher', async function () {
    const { badge, owner } = await loadFixture(deployBadge);
    const publisher = await badge.PUBLISHER_ROLE();
    expect(await badge.hasRole(publisher, owner.address)).to.equal(true);
  });

  it('Should publish badge and emit BadgePublished Event', async function () {
    const { badge, owner } = await loadFixture(deployBadge);
    await expect(badge.publish('badgeHash')).to.emit(badge, 'BadgePublished').withArgs(owner.address, 1, 'badgeHash');
  });
});
