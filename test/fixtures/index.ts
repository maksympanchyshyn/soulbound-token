import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

export async function deployBadge() {
  const [owner, otherAccount] = await ethers.getSigners();

  const Badge = await ethers.getContractFactory('Badge');
  const badge = await Badge.deploy('https://ipfs.infura.io:5001');
  await badge.setMinterRole(owner.address);
  await badge.setPublisher(owner.address);
  return { badge, owner, otherAccount };
}

export async function deployBadgeMinter() {
  const { badge, owner, otherAccount } = await loadFixture(deployBadge);

  const BadgeMinter = await ethers.getContractFactory('BadgeMinter');
  const badgeMinter = await BadgeMinter.deploy();

  await badge.setMinterRole(badgeMinter.address);
  await badgeMinter.setBadgeAddress(badge.address);
  await badgeMinter.setSigner(owner.address);

  return { badge, badgeMinter, owner, otherAccount };
}
