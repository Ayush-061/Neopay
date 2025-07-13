import { Wallet, solidityPackedKeccak256, verifyMessage } from "ethers";

// Replace with merchant's private key
const privateKey = "5727c5982d90731260407ab34b95a6285a4f6f01ed5936763bc1836dfa3d1f86";
let expectedMerchantAddress = "0x98a69e2eA2413b1C67A197912d9D22e9618C1c30"; // Replace with the expected merchant address
async function signUtxo(utxoId, amount, owner) {
  const wallet = new Wallet(privateKey);
  console.log("Signer Address:", wallet.address);  // Check if this matches expectedMerchantAddress

  // Hash UTXO structure with packed encoding
  const utxoHash = solidityPackedKeccak256(
      ["bytes32", "uint256", "address"],
      [utxoId, amount, owner]
  );

  console.log("UTXO Hash:", utxoHash);

  // Sign the message using the private key
  const signature = await wallet.signMessage(utxoHash);
  return signature;
}

// Verify UTXO Signature function
async function verifyUtxoSignature(utxoId, amount, owner, signature) {
  const utxoHash = solidityPackedKeccak256(
      ["bytes32", "uint256", "address"],
      [utxoId, amount, owner]
  );

  // Recover the address from the signature
  const recoveredAddress = verifyMessage(utxoHash, signature);
  console.log("Recovered Address:", recoveredAddress);

  // Case-insensitive comparison
  return recoveredAddress.toLowerCase() === expectedMerchantAddress.toLowerCase();
}



(async () => {
  // Example usage of signUtxo and verifyUtxoSignature
  const utxoId = "0x610f04c0323fc4a2eeb8af2360c65737f42bb7c72e5f994c05efb9b88de80c99"; // Replace with actual UTXO ID
  const amount = 100;
  const owner = "0x49a9e170d8a919B16b3d2021c20201e7A9a04829";  // Replace with the user's address


  const newUtxo = {
    a:0,
    u:"0x610f04c0323fc4a2eeb8af2360c65737f42bb7c72e5f994c05efb9b88de80c99",
    s:"",
    o:"0xCCE1A7d93EAaD0a89BDBaEb41658632503635D89"
}
  // Step 1: Sign the UTXO data
  const signature = await signUtxo(utxoId, amount, owner);
  console.log("Signature:", signature);

  // Step 2: Verify the signature (In a real scenario, you'd send the signature to your NFC or backend to verify)
  const isValid = await verifyUtxoSignature(utxoId, amount, owner, signature);

  if (isValid) {
      console.log("Signature is valid and from the correct merchant.");
  } else {
      console.log("Signature is valid but not from the correct merchant.");
  }
})();


// export  function generateUtxoId(sender, nonce, amount) {
//   const packed = solidityPackedKeccak256(
//     ["address", "uint256", "uint256"],
//     [sender, BigInt(nonce), BigInt(amount)]
//   );

//   return packed;
// }


// console.log(generateUtxoId('0x98a69e2eA2413b1C67A197912d9D22e9618C1c30' , 1 , 1000))

