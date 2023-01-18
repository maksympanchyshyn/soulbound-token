// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/access/AccessControl.sol';

contract BadgeMinter is AccessControl {
  address public badgeAddress;
  address public signer;

  constructor() {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  function setBadgeAddress(address _badgeAddress) external virtual onlyRole(DEFAULT_ADMIN_ROLE) {
    badgeAddress = _badgeAddress;
  }

  function setSigner(address _signer) external virtual onlyRole(DEFAULT_ADMIN_ROLE) {
    signer = _signer;
  }

  function getBadgeAddress() public view virtual returns (address) {
    return badgeAddress;
  }

  function getSigner() public view virtual returns (address) {
    return signer;
  }
}
