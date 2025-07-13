// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract JIIT is ERC20, Ownable {
    // Constructor to initialize th e token with a name and symbol
    constructor(address initialOwner) 
        
        ERC20("JIIT", "JIIT")
        Ownable(initialOwner)
        {
            // Mint an initial supply of 1 million tokens to the deployer (owner)
        // _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    // Mint function that only the owner can call
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
