const {ethers}  = require("hardhat")
const {abi} = require("../artifacts/contracts/UTXSpender.sol/UTXSpender.json")
const provider = new ethers.JsonRpcProvider("http://192.168.29.177:8545")
const issuerWallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);

const contract = new ethers.Contract("0x0165878A594ca255338adfa4d48449f69242Eb8F" , abi , issuerWallet)


const f = async()=>{
    const data = await contract.userBalance("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
    console.log(data)
}

f()