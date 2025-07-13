import { expect } from "chai";
import { ethers } from "hardhat";
import { JIIT, Spender } from "../typechain-types";
import { BigNumberish, Signer,} from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("PermitSpender", function () {
  let permitSpender: Spender;
  let token: JIIT;
  let owner: any;
  let spender: any;
  let other: any;

  const MAX_AMOUNT = ethers.parseEther("1000");
  const SPEND_AMOUNT = ethers.parseEther("500");
  const DEADLINE_OFFSET = 3600;

  beforeEach(async function () {
    [owner, spender, other] = await ethers.getSigners();

    // Deploy mock ERC20
    const TokenFact = await ethers.getContractFactory("JIIT");
    token = await TokenFact.deploy(owner.address);
    await token.waitForDeployment();

    // Deploy PermitSpender
    const PermitSpenderFactory = await ethers.getContractFactory("Spender");
    permitSpender = await PermitSpenderFactory.deploy(token.getAddress())
    await permitSpender.waitForDeployment();

    // Approve PermitSpender
    await token.connect(owner).approve(permitSpender.getAddress(), MAX_AMOUNT);
  });

  interface PermitData {
    owner: string;
    spender: string;
    maxAmount: BigNumberish;
    deadline: number;
    nonce: BigNumberish;
  }

  async function createPermitSignature(permitData: PermitData, signer: Signer = owner): Promise<string> {
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const domain = {
      name: "JIITPermit",
      version: "1",
      chainId,
      verifyingContract:(await permitSpender.getAddress()),
    };

    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "maxAmount", type: "uint256" },
        { name: "deadline", type: "uint256" },
        { name: "nonce", type: "uint256" },
      ],
    };

    return signer.signTypedData(domain, types, permitData);
  }

  it("Should transfer tokens with valid permit", async function () {
    const nonce = await permitSpender.nonces(owner.address);
    const deadline = Math.floor(Date.now() / 1000) + DEADLINE_OFFSET;

    const permitData: PermitData = {
      owner: owner.address,
      spender: spender.address,
      maxAmount: MAX_AMOUNT,
      deadline,
      nonce,
    };

    const signature = await createPermitSignature(permitData);

    await expect(
      permitSpender.connect(spender).usePermit(
        owner.address,
        MAX_AMOUNT,
        deadline,
        nonce,
        SPEND_AMOUNT,
        signature
      )
    ).to.changeTokenBalances(
      token,
      [owner, spender],
      [-1n * SPEND_AMOUNT, SPEND_AMOUNT] // Use bigint multiplication
    );
    expect(await permitSpender.nonces(owner.address)).to.equal(nonce+1n);
    expect(await permitSpender.spent(owner.address)).to.equal(SPEND_AMOUNT);
  });

  it("Should reject expired permit", async function () {
    const nonce = await permitSpender.nonces(owner.address);
    const deadline = Math.floor(Date.now() / 1000) - DEADLINE_OFFSET;

    const permitData: PermitData = {
      owner: owner.address,
      spender: spender.address,
      maxAmount: MAX_AMOUNT,
      deadline,
      nonce,
    };

    const signature = await createPermitSignature(permitData);

    await expect(
      permitSpender.connect(spender).usePermit(
        owner.address,
        MAX_AMOUNT,
        deadline,
        nonce,
        SPEND_AMOUNT,
        signature
      )
    ).to.be.revertedWith("Permit expired");
  });

  it("Should reject invalid nonce", async function () {
    const invalidNonce = (await permitSpender.nonces(owner.address))+1n;
    const deadline = Math.floor(Date.now() / 1000) + DEADLINE_OFFSET;

    const permitData: PermitData = {
      owner: owner.address,
      spender: spender.address,
      maxAmount: MAX_AMOUNT,
      deadline,
      nonce: invalidNonce,
    };

    const signature = await createPermitSignature(permitData);

    await expect(
      permitSpender.connect(spender).usePermit(
        owner.address,
        MAX_AMOUNT,
        deadline,
        invalidNonce,
        SPEND_AMOUNT,
        signature
      )
    ).to.be.revertedWith("Invalid nonce");
  });

  it("Should prevent overspending", async function () {
    const overspendAmount = MAX_AMOUNT+1n;
    const nonce = await permitSpender.nonces(owner.address);
    const deadline = Math.floor(Date.now() / 1000) + DEADLINE_OFFSET;

    const permitData: PermitData = {
      owner: owner.address,
      spender: spender.address,
      maxAmount: MAX_AMOUNT,
      deadline,
      nonce,
    };

    const signature = await createPermitSignature(permitData);

    await expect(
      permitSpender.connect(spender).usePermit(
        owner.address,
        MAX_AMOUNT,
        deadline,
        nonce,
        overspendAmount,
        signature
      )
    ).to.be.revertedWith("Over permitted limit");
  });

  it("Should reject invalid signature", async function () {
    const nonce = await permitSpender.nonces(owner.address);
    const deadline = Math.floor(Date.now() / 1000) + DEADLINE_OFFSET;

    const permitData: PermitData = {
      owner: owner.address,
      spender: spender.address,
      maxAmount: MAX_AMOUNT,
      deadline,
      nonce,
    };

    // Sign with unauthorized account
    const signature = await createPermitSignature(permitData, other);

    await expect(
      permitSpender.connect(spender).usePermit(
        owner.address,
        MAX_AMOUNT,
        deadline,
        nonce,
        SPEND_AMOUNT,
        signature
      )
    ).to.be.revertedWith("Invalid signature");
  });

  it("Should prevent replay attacks", async function () {
    const nonce = await permitSpender.nonces(owner.address);
    const deadline = Math.floor(Date.now() / 1000) + DEADLINE_OFFSET;

    const permitData: PermitData = {
      owner: owner.address,
      spender: spender.address,
      maxAmount: MAX_AMOUNT,
      deadline,
      nonce,
    };

    const signature = await createPermitSignature(permitData);

    // First use (success)
    await permitSpender.connect(spender).usePermit(
      owner.address,
      MAX_AMOUNT,
      deadline,
      nonce,
      SPEND_AMOUNT,
      signature
    );

    // Replay attempt
    await expect(
      permitSpender.connect(spender).usePermit(
        owner.address,
        MAX_AMOUNT,
        deadline,
        nonce,
        SPEND_AMOUNT,
        signature
      )
    ).to.be.revertedWith("Invalid nonce");
  });

  it("Should reject zero spend amount", async function () {
    const nonce = await permitSpender.nonces(owner.address);
    const deadline = Math.floor(Date.now() / 1000) + DEADLINE_OFFSET;

    const permitData: PermitData = {
      owner: owner.address,
      spender: spender.address,
      maxAmount: MAX_AMOUNT,
      deadline,
      nonce,
    };

    const signature = await createPermitSignature(permitData);

    await expect(
      permitSpender.connect(spender).usePermit(
        owner.address,
        MAX_AMOUNT,
        deadline,
        nonce,
        0, // Zero amount
        signature
      )
    ).to.be.revertedWith("Nothing to spend");
  });

  // it("Should allow partial spending of permitted amount", async function () {
  //   const nonce = await permitSpender.nonces(owner.address);
  //   const deadline = Math.floor(Date.now() / 1000) + DEADLINE_OFFSET;
  //   const partialAmount1 = ethers.parseEther("300");
  //   const partialAmount2 = ethers.parseEther("200");
  
  //   const permitData: PermitData = {
  //     owner: owner.address,
  //     spender: spender.address,
  //     maxAmount: MAX_AMOUNT,
  //     deadline,
  //     nonce,
  //   };
  
  //   const signature = await createPermitSignature(permitData);
  
  //   // First partial spend
  //   await expect(
  //     permitSpender.connect(spender).usePermit(
  //       owner.address,
  //       MAX_AMOUNT,
  //       deadline,
  //       nonce,
  //       partialAmount1,
  //       signature
  //     )
  //   ).to.changeTokenBalances(
  //     token,
  //     [owner, spender],
  //     [-1n * partialAmount1, partialAmount1]
  //   );
  
  //   // Second partial spend
  //   await expect(
  //     permitSpender.connect(spender).usePermit(
  //       owner.address,
  //       MAX_AMOUNT,
  //       deadline,
  //       nonce + 1n, // Nonce increments after first use
  //       partialAmount2,
  //       signature // Note: In real usage you'd need a new signature for the new nonce
  //     )
  //   ).to.changeTokenBalances(
  //     token,
  //     [owner, spender],
  //     [-1n * partialAmount2, partialAmount2]
  //   );
  
  //   // Verify cumulative spending
  //   expect(await permitSpender.spent(owner.address)).to.equal(partialAmount1 + partialAmount2);
  // });
});