import { config } from "@/config/config";
import { Wallet, solidityPackedKeccak256, verifyMessage } from "ethers";
type Utxo = {
    a: string | number; // amount
    u: string; // utxoId
    o: string; // recipient
    s: string; // signature
  }

export const  signUtxo = async ({u , a , o , s}:Utxo) =>{
    const wallet = new Wallet(config.ISSUER_PRIVATE_KEY);
    console.log("Signer Address:", wallet.address);  // Check if this matches expectedMerchantAddress
    console.log("Recieved ::  " , u , "  -- " , a , " --- " , o  , " ---- " , s )
    // Hash UTXO structure with packed encoding
    const utxoHash = solidityPackedKeccak256(
        ["bytes32", "uint256", "address"],
        [u, a, o]
    );
  
    console.log("UTXO Hash:", utxoHash);
  
    // Sign the message using the private key
    const signature = await wallet.signMessage(utxoHash);
    return signature;
  }
  
  // Verify UTXO Signature function
export const verifyUtxoSignature = async({u , a , o , s}:Utxo)=> {
    const utxoHash = solidityPackedKeccak256(
        ["bytes32", "uint256", "address"],
        [u, a, o]
    );
  
    // Recover the address from the signature
    const recoveredAddress = verifyMessage(utxoHash, s);
    console.log("Recovered Address:", recoveredAddress);
  
    // Case-insensitive comparison
    return recoveredAddress.toLowerCase() === config.MERCHANT_PUBLIC_ADDR.toLowerCase();
  }

export  function generateUtxoId(sender:string, nonce:number, amount:number|string) {
    const packed = solidityPackedKeccak256(
      ["address", "uint256", "uint256"],
      [sender, BigInt(nonce), BigInt(amount)]
    );
  
    return packed;
  }