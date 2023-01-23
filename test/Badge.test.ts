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

  it('Should return valid badge uri', async function () {
    const { badge } = await loadFixture(deployBadge);
    await badge.publish('badgeHash');
    expect(await badge.uri(1)).to.equal('https://ipfs.infura.io:5001/badgeHash');
  });

  it('Should mint badge and emit BadgeClaimed event', async function () {
    const { badge, owner } = await loadFixture(deployBadge);
    await badge.publish('badgeHash');
    await expect(badge.mint(owner.address, 1, 1, '0x')).to.emit(badge, 'BadgeClaimed').withArgs(1, owner.address, 1);
  });

  it('Should revert mint if account already owns badge', async function () {
    const { badge, owner } = await loadFixture(deployBadge);
    await badge.publish('badgeHash');
    await badge.mint(owner.address, 1, 1, '0x');
    await expect(badge.mint(owner.address, 1, 1, '0x')).to.be.revertedWith('Badge already minted');
  });

  it('Should revert mint if badge was not published', async function () {
    const { badge, owner } = await loadFixture(deployBadge);
    await expect(badge.mint(owner.address, 1, 1, '0x')).to.be.revertedWith('uri: this badge id was never published');
  });

  it('Should revert badge transfer with error', async function () {
    const { badge, owner, otherAccount } = await loadFixture(deployBadge);
    await badge.publish('badgeHash');
    await badge.mint(owner.address, 1, 1, '0x');
    await expect(badge.safeTransferFrom(owner.address, otherAccount.address, 1, 1, '0x')).to.be.revertedWith(
      'Transfer is not allowed'
    );
  });
});
