
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
const UTXSpender = buildModule("UTXSpender", (m:any) => {
  const token = m.contract("UTXSpender" ,[
    "0x34cA7B182E2166c93B66d366D31B3bceAE5c9f63"  ]);

  return { token };
});

module.exports = UTXSpender;