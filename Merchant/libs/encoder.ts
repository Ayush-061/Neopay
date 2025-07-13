const ethers = require("ethers"); // for address and signature utilities
const { Buffer } = require("buffer");
type Utxo = {
  a: string | number; // amount
  u: string; // utxoId
  o: string; // recipient
  s: string; // signature
}
export const encodeUTXO = (utxo:Utxo)=> {
  if (!utxo.u || !utxo.o || !utxo.s) {
    throw new Error("Missing required UTXO fields: u (utxoId), o (recipient), or s (signature)");
  }

  const buffer = Buffer.alloc(121); // 4 + 32 + 20 + 65
  let offset = 0;

  buffer.writeUInt32BE(Number(utxo.a), offset); offset += 4;
  Buffer.from(utxo.u.slice(2), 'hex').copy(buffer, offset); offset += 32;
  Buffer.from(utxo.o.slice(2), 'hex').copy(buffer, offset); offset += 20;
  Buffer.from(utxo.s.slice(2), 'hex').copy(buffer, offset); offset += 65;

  return new Uint8Array(buffer);
}

export const decodeUTXO = (buffer:any):Utxo=> {
  buffer = Buffer.from(buffer);
  let offset = 0;

  const a = buffer.readUInt32BE(offset); offset += 4;
  const u = '0x' + buffer.slice(offset, offset + 32).toString('hex'); offset += 32;
  const o = '0x' + buffer.slice(offset, offset + 20).toString('hex'); offset += 20;
  const s = '0x' + buffer.slice(offset, offset + 65).toString('hex'); offset += 65;

  return { a: a.toString(), u, o, s };
}


// const x = encodeUTXO({
//   o: "0x49a9e170d8a919B16b3d2021c20201e7A9a04829",
//   a: 100,
//   u:"0xabc123abc123abc123abc123abc123abc123abc123abc123abc123abc123abcd",
//   s:"0x34b4fb5bb96379156a328e2ab6f9704c204f7bcdc27dee8e4fbd809c6cca0e27461bf73140ff9a5f561007884103faca3d62b31af54620c09ec5f20d99f0a46e1b"
// })

// console.log('decode ' , decodeUTXO(x))
