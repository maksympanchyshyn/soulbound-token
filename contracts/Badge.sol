// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol';

contract Badge is ERC1155, AccessControl, ERC1155Supply {
  bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');

  event BadgeClaimed(uint256 indexed badgeId, address indexed to, uint256 amount);

  constructor() ERC1155('') {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(MINTER_ROLE, msg.sender);
  }

  function mint(
    address account,
    uint256 badgeId,
    uint256 amount,
    bytes memory data
  ) public onlyRole(MINTER_ROLE) {
    require(balanceOf(account, badgeId) == 0, 'Badge already minted');
    _mint(account, badgeId, amount, data);
    emit BadgeClaimed(badgeId, account, amount);
  }

  // The following functions are overrides required by Solidity.
  function _beforeTokenTransfer(
    address operator,
    address from,
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) internal override(ERC1155, ERC1155Supply) {
    require(
      (from == address(0) && to != address(0)) || (from != address(0) && to == address(0)),
      'Transfer is not allowed'
    );
    super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
  }

  function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
    return super.supportsInterface(interfaceId);
  }
}
