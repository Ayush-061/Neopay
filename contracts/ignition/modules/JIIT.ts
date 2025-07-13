// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const JIIToken = buildModule("JIITToken", (m) => {

  const customToken = m.contract("JIIT" , ["0x49a9e170d8a919B16b3d2021c20201e7A9a04829"]);

  return { customToken };
});

export default JIIToken;
