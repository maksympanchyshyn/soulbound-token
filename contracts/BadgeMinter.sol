// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@openzeppelin/contracts/utils/cryptography/EIP712.sol';

import 'hardhat/console.sol';

contract BadgeMinter is AccessControl, EIP712 {
  address public badgeAddress;
  address public signer;

  bytes32 public CLAIM_TYPEHASH = keccak256('Claim(address to,uint256 badgeId)');

  constructor() EIP712('BadgeMinter', '1.0.0') {
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

  function claim(uint256 badgeId, bytes memory signature) public virtual {
    address to = msg.sender;
    bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(CLAIM_TYPEHASH, to, badgeId)));
    _verify(digest, signature);
    _claim(to, badgeId);
  }

  function _verify(bytes32 digest, bytes memory signature) internal virtual {
    address _signer = ECDSA.recover(digest, signature);
    console.log('recovered signer: %s', _signer);
    console.log('expected signer: %s', signer);
    require(_signer == signer, '_verify: invalid signature');
    require(_signer != address(0), 'ECDSA: invalid signature');
  }

  function _claim(address to, uint256 badgeId) internal virtual {
    require(badgeAddress != address(0), '_claim: !badgeAddress');

    Address.functionCall(
      badgeAddress,
      abi.encodeWithSignature('mint(address,uint256,uint256,bytes)', to, badgeId, 1, ''),
      '_claim: mint() failed'
    );
  }

  function supportsInterface(bytes4 interfaceId) public view override(AccessControl) returns (bool) {
    return super.supportsInterface(interfaceId);
  }
}
