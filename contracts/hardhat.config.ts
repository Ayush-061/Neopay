import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    amoy: {
      chainId: 80002,
      url :"https://polygon-amoy.g.alchemy.com/v2/G4BZQj8f0QjtctYnCYzteihYMYGxMSRJ",
      accounts:["c0f5cd802aa01a1fb90ec2e8bb95b48bddc80bce1e834ba3b8f65e470f6aeb64"]
    },
    localhost: {
      url: "http://0.0.0.0:8545"}
  },
};

export default config;
