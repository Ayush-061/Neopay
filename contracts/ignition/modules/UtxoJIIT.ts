const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const UTXO = buildModule("UTXOTransfer", (m:any) => {
  const token = m.contract("UTXOTransfer" ,[
    "0x0956F07758FB582F9Bf332870C4Dad9FfE6158a7" , 
    "0x98a69e2eA2413b1C67A197912d9D22e9618C1c30"
  ]);

  return { token };
});

module.exports = UTXO;