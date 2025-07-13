import { expect } from "chai";
import { ethers } from "hardhat";
import { AbiCoder, HDNodeWallet, Wallet } from "ethers";
import { JIIT, UTXOTransfer } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
describe("UTXOTransfer", function () {
  let jiitToken: JIIT;
  let utxo: UTXOTransfer;
  let deployer: any;
  let issuer:HDNodeWallet ;
  let user: SignerWithAddress;
  let merchant: SignerWithAddress;

  const name = "JIITUtxo";
  const version = "1";

  beforeEach(async () => {
    [deployer, user, merchant] = await ethers.getSigners();

    // Create off-chain signer (issuer)
    issuer = ethers.Wallet.createRandom().connect(ethers.provider);
    await deployer.sendTransaction({ to: issuer.address, value: ethers.parseEther("1") });

    // Deploy token
    const JIIT = await ethers.getContractFactory("JIIT");
    jiitToken = await JIIT.deploy(deployer.address);
    await jiitToken.waitForDeployment();

    // Mint some tokens to user
    await jiitToken.mint(user.address, ethers.parseEther("1000"));
    await jiitToken.connect(user).approve(deployer.address, ethers.parseEther("1000"));

    // Deploy UTXOTransfer
    const UTXO = await ethers.getContractFactory("UTXOTransfer");
    utxo = await UTXO.deploy(await jiitToken.getAddress(), issuer.address);
    await utxo.waitForDeployment();

    // Approve contract to spend on behalf of user
    await jiitToken.connect(user).approve(await utxo.getAddress(), ethers.parseEther("1000"));
  });

  it("should accept a valid signed UTXO note and transfer tokens", async () => {
    const amount = ethers.parseEther("100");
    const partialAmount = ethers.parseEther("50");
    const nonce = 1;

    const chainId = (await ethers.provider.getNetwork()).chainId;

    const domain = {
      name: name,
      version: "1",
      chainId,
      verifyingContract: await utxo.getAddress(),
    };

    const types = {
      Note: [
        { name: "recipient", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "nonce", type: "uint256" },
      ],
    };

    const value = {
      recipient: user.address,
      amount,
      nonce,
    };

    const signature = await issuer.signTypedData(domain, types, value);

    // Before balances
    const beforeUser = await jiitToken.balanceOf(user.address);
    const beforeMerchant = await jiitToken.balanceOf(merchant.address);
    console.log("beforeUser", ethers.formatEther(beforeUser).toString());
    console.log("beforeMerchant", ethers.formatEther(beforeMerchant).toString());

    // Merchant spends the note
    await utxo.connect(merchant).spendNote(user.address, amount, partialAmount, nonce, signature);

    const afterUser = await jiitToken.balanceOf(user.address);
    const afterMerchant = await jiitToken.balanceOf(merchant.address);
    console.log("afterUser",  ethers.formatEther(afterUser).toString());
    console.log("afterMerchant",  ethers.formatEther(afterMerchant).toString());
    expect(afterUser).to.equal(beforeUser- partialAmount);
    expect(afterMerchant).to.equal(beforeMerchant+ partialAmount);

    const received = await utxo.totalReceivedBy(merchant.address);
    expect(received).to.equal(partialAmount);
    const abiCoder = AbiCoder.defaultAbiCoder();

    const used = await utxo.usedNotes(
      ethers.keccak256(
        abiCoder.encode(
          ["bytes32", "address", "uint256", "uint256"],
          [
            ethers.keccak256(
              ethers.toUtf8Bytes("Note(address recipient,uint256 amount,uint256 nonce)")
            ),
            user.address,
            amount,
            nonce
          ]
        )
      )
    );

    expect(used).to.equal(true);
  });

  it("should allow reporting gas fee and track it", async () => {
    const fee = ethers.parseEther("0.01");

    await utxo.connect(deployer).reportGasFee(user.address, fee);
    const feeLogged = await utxo.totalGasSpentBy(user.address);
    expect(feeLogged).to.equal(fee);
  });
  it("should allow user to block an unused note and get refund", async () => {
    const amount = ethers.parseEther("100");
    const nonce = 2;

    const chainId = (await ethers.provider.getNetwork()).chainId;

    const domain = {
      name: name,
      version: "1",
      chainId,
      verifyingContract: await utxo.getAddress(),
    };

    const types = {
      Note: [
        { name: "recipient", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "nonce", type: "uint256" },
      ],
    };

    const value = {
      recipient: user.address,
      amount,
      nonce,
    };

    const signature = await issuer.signTypedData(domain, types, value);

    // Fund the contract with enough tokens to refund
    await jiitToken.connect(deployer).transfer(await utxo.getAddress(), amount);

    const beforeUser = await jiitToken.balanceOf(user.address);

    // User blocks and refunds the note
    await utxo.connect(user).blockNoteAndRefund(amount, nonce, signature);

    const afterUser = await jiitToken.balanceOf(user.address);

    expect(afterUser).to.equal(beforeUser + amount);

    // Confirm the note is marked as used
    const abiCoder = AbiCoder.defaultAbiCoder();
    const noteHash = ethers.keccak256(
      abiCoder.encode(
        ["bytes32", "address", "uint256", "uint256"],
        [
          ethers.keccak256(
            ethers.toUtf8Bytes("Note(address recipient,uint256 amount,uint256 nonce)")
          ),
          user.address,
          amount,
          nonce,
        ]
      )
    );

    const used = await utxo.usedNotes(noteHash);
    expect(used).to.equal(true);
  });

});
