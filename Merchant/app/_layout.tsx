import { config } from "@/config/config";
import { abi } from "@/contracts/utxo.json";
import { supabase } from '@/libs/supabase';
import { ethers } from 'ethers';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

export default function RootLayout() {
  const [loaded] = useFonts({
    "SpaceMono": require('../assets/fonts/SpaceMono-Regular.ttf'),
    
  });
  useEffect(() => {

    const supa = async(insertData:any)=>{
      const { data , error } = await supabase.from("utxo").insert([insertData])
      if (error) {
        console.error('Failed to insert UTXO in database:', error)
        return null
      }
    
      console.log("Supa data :: " ,data)

    }

    // Replace with your private key and provider URL (Infura or Alchemy)
    const privateKey = config.ISSUER_PRIVATE_KEY;  // Replace with your actual private key
    const providerUrl = config.RPC_URL;  // Replace with your Infura URL
    const contractAddress = config.CONTRACT_ADDRESS;  // Replace with your contract address

    // Create the provider (Infura in this case)
    const provider = new ethers.WebSocketProvider(providerUrl);

    // Create the wallet using the private key
    const wallet = new ethers.Wallet(privateKey, provider);

    // Create the contract instance
    const contract = new ethers.Contract(contractAddress, abi, wallet);

    

    // Define the event listener for the Transfer event
    //@ts-ignore
    const transactionBurnt = (utxoId:string , owner:string , amount:number|string) => {
      console.log(`UTXO burnt `);
      console.log("Burnt Data :: " , utxoId)
      console.log("Burnt Data :: " , owner)
      console.log("Burnt Data :: " , amount)
      supa({utxoId , owner , amount  , type:"burnt"})
     
    };
    const transactionCreated = (utxoId:string , owner:string , amount:number|string) => {
      console.log(`UTXO createad `);
      console.log("Created Data :: " , utxoId)
      console.log("Created Data :: " , owner)
      console.log("Created Data :: " , amount)
      supa({utxoId , owner , amount  , type:"created"})
     
    };

    // Start listening for the Transfer event
    contract.on("UTXOBurned", transactionBurnt);
    contract.on("UTXOCreated", transactionCreated);


    console.log("Listening for Balance events...");

    // Clean up the listener on component unmount
    return () => {
      contract.removeAllListeners()

      console.log("Stopped listening for Transfer events.");
    };
  }, []); 

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false}} />
        <Stack.Screen name="(pages)/Details" options={{ headerShown: false}} />
        <Stack.Screen name="(pages)/Setup" options={{ headerShown: false}} />
        <Stack.Screen name="(pages)/ReadCard" options={{ headerShown: false}} />



      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
