// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol';

import 'hardhat/console.sol';

contract Badge is ERC1155, AccessControl, ERC1155Supply {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  string private _uri;
  mapping(uint256 => string) public ipfsHashMap;

  event BadgePublished(address indexed publisher, uint256 indexed badgeId, string ipfsHash);
  event BadgeClaimed(uint256 indexed badgeId, address indexed to, uint256 amount);

  bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');
  bytes32 public constant PUBLISHER_ROLE = keccak256('PUBLISHER_ROLE');

  uint256 internal constant PUBLISHER_OFFSET_MULTIPLIER = uint256(2) ** (256 - 160);

  constructor(string memory _initUri) ERC1155('') {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _uri = _initUri;
  }

  function setMinterRole(address _account) external onlyRole(DEFAULT_ADMIN_ROLE) {
    _grantRole(MINTER_ROLE, _account);
  }

  function setPublisher(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
    _grantRole(PUBLISHER_ROLE, account);
  }

  function setURI(string memory _newUri) external onlyRole(DEFAULT_ADMIN_ROLE) {
    _uri = _newUri;
  }

  function publish(string memory ipfsHash) public onlyRole(PUBLISHER_ROLE) {
    address sender = msg.sender;
    _publish(sender, ipfsHash);
  }

  function mint(address account, uint256 badgeId, uint256 amount, bytes memory data) public onlyRole(MINTER_ROLE) {
    require(balanceOf(account, badgeId) == 0, 'Badge already minted');
    _mint(account, badgeId, amount, data);
    emit BadgeClaimed(badgeId, account, amount);
  }

  function uri(uint256 badgeId) public view override returns (string memory) {
    require(wasPublished(badgeId), 'uri: this badge id was never published');
    return _getFullUri(badgeId);
  }

  function wasPublished(uint256 badgeId) public view returns (bool) {
    console.log(getIpfsHashByBadgeId(badgeId));
    return keccak256(abi.encodePacked(getIpfsHashByBadgeId(badgeId))) != keccak256(abi.encodePacked(''));
  }

  function getIpfsHashByBadgeId(uint256 badgeId) public view returns (string memory) {
    return ipfsHashMap[badgeId];
  }

  function _publish(address publisher, string memory ipfsHash) private {
    _tokenIds.increment();
    uint256 newTokenId = _tokenIds.current();
    // owner (160) / Counter Token ID (96)
    uint256 _badgeId = uint256(uint160(publisher)) *
      PUBLISHER_OFFSET_MULTIPLIER + // Publisher
      newTokenId; // Counter Token ID
    console.log('Badge ID: %s', _badgeId);
    ipfsHashMap[_badgeId] = ipfsHash;

    emit BadgePublished(publisher, _badgeId, ipfsHash);
  }

  function _getFullUri(uint256 badgeId) private view returns (string memory) {
    string memory _ipfsHash = getIpfsHashByBadgeId(badgeId);
    return string(abi.encodePacked(_uri, _ipfsHash));
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
