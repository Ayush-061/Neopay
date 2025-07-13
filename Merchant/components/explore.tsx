import { encodeUTXO } from '@/libs/encoder';
import { ethers } from 'ethers';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Button, Text, View } from 'react-native';
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';

// Configs
const CONTRACT_ADDRESS = '0x42F9BE700172595f77Ce4039225421E6Bafab059'; // Replace with actual address
const ISSUER_PRIVATE_KEY = '5727c5982d90731260407ab34b95a6285a4f6f01ed5936763bc1836dfa3d1f86'; // Use secure store in production
const RPC_URL = 'https://polygon-amoy.g.alchemy.com/v2/G4BZQj8f0QjtctYnCYzteihYMYGxMSRJ'; // Your RPC endpoint
const RECIPIENT_ADDRESS = '0x45cCC056036317aBe5E0C382D3fEfCe428877C8d'; // Address to receive 1000

NfcManager.start();

export default function WriteUTXO() {
  const [loading, setLoading] = useState(false);
    const [data , setData] = useState("");
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const issuerWallet = new ethers.Wallet(ISSUER_PRIVATE_KEY, provider);

  const generateUTXO = async () => {
    const amount = '1000';
    const nonce = Math.floor(Math.random() * 1_000_000);
    
    const unsignedData = {
      recipient: RECIPIENT_ADDRESS,
      amount,
      nonce,
    };

    const domain = {
      name: "JIITUtxo",
      version: "1",
      chainId: await provider.getNetwork().then(n => Number(n.chainId)),
      verifyingContract: CONTRACT_ADDRESS,
    };

    const types = {
      Note: [
        { name: 'recipient', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
      ],
    };

    const signature = await issuerWallet.signTypedData(domain, types, unsignedData);

    return {
      ...unsignedData,
      signature,
    };
  };

  

  const writeNFC = async () => {
    try {
      setLoading(true);
      await NfcManager.requestTechnology(NfcTech.Ndef);
        const tag = await NfcManager.getTag();
        console.log('NFC Tag:', tag?.maxSize);
      const utxo = await generateUTXO();
      console.log('Generated UTXO:', utxo);
      const bytes = encodeUTXO(utxo);

      console.log('Encoded UTXO:', bytes);
      console.log("utxo 2 " , Array.from(bytes))
    if(!bytes) {
          throw new Error('Failed to encode NFC message');
        }      
        const record = Ndef.record(
          Ndef.TNF_WELL_KNOWN,
          '' ,
        [] ,
    Array.from(bytes))
    const message = Ndef.encodeMessage([record]);
    console.log('NFC Message:', message);
    console.log('NFC Message Length:', message.length);
    await NfcManager.ndefHandler.writeNdefMessage(message);
            setData(JSON.stringify(utxo, null, 2));
      Alert.alert('Success', 'Wrote UTXO to NFC Tag');
    } catch (error: any) {
      Alert.alert('NFC Write Error', error.message || String(error));
    } finally {
      setLoading(false);
      NfcManager.cancelTechnologyRequest().catch(() => {});
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Button
        title="Write 1000 UTXO to NFC"
        onPress={writeNFC}
        disabled={loading}
      />
      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}

      <Text style={{fontSize:40}}>{data}</Text>
    </View>
  );
}
