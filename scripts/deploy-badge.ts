import { ethers } from 'hardhat';

async function main() {
  const Badge = await ethers.getContractFactory('Badge');
  const badge = await Badge.deploy();

  await badge.deployed();

  console.log(`Badge deployed to ${badge.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
