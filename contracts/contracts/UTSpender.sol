// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract UTXOTransfer {
    using ECDSA for bytes32;

    IERC20 public immutable token;
    address public immutable issuer;

    mapping(bytes32 => bool) public usedNotes;
    mapping(address => uint256) public totalReceived;
    mapping(address => uint256) public gasFeesPaid;

    bytes32 private constant NOTE_TYPEHASH = keccak256(
        "Note(address recipient,uint256 amount,uint256 nonce)"
    );

    bytes32 public immutable DOMAIN_SEPARATOR;

    event NoteSpent(
        address indexed user,
        address indexed merchant,
        uint256 amount,
        uint256 nonce
    );

    event FeeReported(
        address indexed user,
        uint256 feeAmount
    );

    constructor(address _token, address _issuer) {
        token = IERC20(_token);
        issuer = _issuer;

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256("JIITUtxo"),
                keccak256("1"),
                block.chainid,
                address(this)
            )
        );
    }

    function spendNote(
    address recipient,
    uint256 fullAmount,
    uint256 spendAmount,
    uint256 nonce,
    bytes calldata signature
) external {
    require(spendAmount > 0 && spendAmount <= fullAmount, "Invalid amount");

    bytes32 noteHash = keccak256(
        abi.encode(NOTE_TYPEHASH, recipient, fullAmount, nonce)
    );

    bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, noteHash));
    address recovered = digest.recover(signature);
    require(recovered == issuer, "Invalid issuer signature");
    require(!usedNotes[noteHash], "Note already spent");

    usedNotes[noteHash] = true;

    require(token.transferFrom(recipient, msg.sender, spendAmount), "Token transfer failed");

    totalReceived[msg.sender] += spendAmount;

    emit NoteSpent(recipient, msg.sender, spendAmount, nonce);
}


    /// @notice Merchant backend can report gas fee paid on behalf of user
    function reportGasFee(address user, uint256 fee) external {
        gasFeesPaid[user] += fee;
        emit FeeReported(user, fee);
    }

    /// @notice Net amount received by merchant
    function totalReceivedBy(address merchant) external view returns (uint256) {
        return totalReceived[merchant];
    }

    /// @notice Total gas fee tracked for a user (merchant-reported)
    function totalGasSpentBy(address user) external view returns (uint256) {
        return gasFeesPaid[user];
    }

    /// @notice Net received (assumes only receiving, not change/refund)
    function netReceivedBy(address user) external view returns (int256) {
        return int256(totalReceived[user]) - int256(gasFeesPaid[user]);
    }

    /// @notice User can block an unused note and get their tokens refunded
    function blockNoteAndRefund(
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    ) external {
        address user = msg.sender;

        // Reconstruct the note hash
        bytes32 noteHash = keccak256(
            abi.encode(NOTE_TYPEHASH, user, amount, nonce)
        );

        // Verify the signature
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, noteHash)
        );
        address recovered = digest.recover(signature);
        require(recovered == issuer, "Invalid issuer signature");

        require(!usedNotes[noteHash], "Note already used or blocked");

        // Mark the note as used to prevent future use
        usedNotes[noteHash] = true;

        // Refund the amount to the user's wallet
        require(token.transfer(user, amount), "Refund failed");
}

}

