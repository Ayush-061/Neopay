import { ethers } from "hardhat";
import { expect } from "chai";

describe("JIIToken", function () {
  it("Should deploy and mint tokens", async function () {
    const JIIToken = await ethers.getContractFactory("JIIT");
    const [owner] = await ethers.getSigners();
    const token = await JIIToken.deploy(owner.address);
    await token.waitForDeployment();

    const balance = await token.balanceOf(owner.address);
    expect(balance).to.be.gt(0);
  });
});
