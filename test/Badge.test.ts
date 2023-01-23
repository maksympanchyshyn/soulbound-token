import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

import { deployBadge } from './fixtures';

describe('Badge', function () {
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

  it('Should revert badge transfer with error', async function () {
    const { badge, owner, otherAccount } = await loadFixture(deployBadge);
    await badge.publish('badgeHash');
    await badge.mint(owner.address, 1, 1, '0x');
    await expect(badge.safeTransferFrom(owner.address, otherAccount.address, 1, 1, '0x')).to.be.revertedWith(
      'Transfer is not allowed'
    );
  });

  it('Should revert badge transfer with error', async function () {
    const { badge, owner } = await loadFixture(deployBadge);
    await expect(badge.mint(owner.address, 1, 1, '0x')).to.be.revertedWith('uri: this badge id was never published');
  });
});
