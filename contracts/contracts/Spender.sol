// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Spender {
    using ECDSA for bytes32;

    struct Permit {
        address owner;
        address spender;
        uint256 maxAmount;
        uint256 deadline;
        uint256 nonce;
    }

    IERC20 public token;
    mapping(address => uint256) public nonces;
    mapping(address => uint256) public spent;

    bytes32 private constant PERMIT_TYPEHASH = keccak256(
        "Permit(address owner,address spender,uint256 maxAmount,uint256 deadline,uint256 nonce)"
    );

    bytes32 private DOMAIN_SEPARATOR;

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("JIITPermit")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    function usePermit(
        address owner,
        uint256 maxAmount,
        uint256 deadline,
        uint256 nonce,
        uint256 spendAmount,
        bytes calldata signature
    ) external {
        require(block.timestamp <= deadline, "Permit expired");
        require(spendAmount > 0, "Nothing to spend");
        require(nonce == nonces[owner], "Invalid nonce");
        require(spent[owner] + spendAmount <= maxAmount, "Over permitted limit");

        bytes32 structHash = keccak256(
            abi.encode(PERMIT_TYPEHASH, owner, msg.sender, maxAmount, deadline, nonce)
        );

        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );

        address recovered = digest.recover(signature);
        require(recovered == owner, "Invalid signature");

        // Update state before token transfer to prevent reentrancy
        nonces[owner]++;
        spent[owner] += spendAmount;

        // Perform the token transfer
        require(token.transferFrom(owner, msg.sender, spendAmount), "Transfer failed");
    }
}
