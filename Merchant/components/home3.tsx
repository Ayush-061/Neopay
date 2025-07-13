import { decodeUTXO } from '@/libs/encoder';
import React, { useState } from 'react';
import { ActivityIndicator, Button, Text, View } from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

// Configs
const CONTRACT_ADDRESS = '0x42F9BE700172595f77Ce4039225421E6Bafab059'; // Replace with actual address
const ISSUER_PRIVATE_KEY = '5727c5982d90731260407ab34b95a6285a4f6f01ed5936763bc1836dfa3d1f86'; // Use secure store in production
const RPC_URL = 'https://polygon-amoy.g.alchemy.com/v2/G4BZQj8f0QjtctYnCYzteihYMYGxMSRJ'; // Your RPC endpoint
const RECIPIENT_ADDRESS = '0x45cCC056036317aBe5E0C382D3fEfCe428877C8d'; // Address to receive 1000

NfcManager.start();

export default function WriteUTXO() {
  const [loading, setLoading] = useState(false);

  const [data , setData] = useState("");

  

  

  const readNFC = async () => {
    try {
      setLoading(true);
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
// 
      console.log('Tag found:', tag);
  
      // Read NDEF records
      const ndefMessage = tag?.ndefMessage;
      const payload = ndefMessage?.[0]?.payload;
      const text = decodeUTXO(payload);
      console.log('Decoded UTXO:', text); 
      setData(JSON.stringify(text, null, 2));  
  
    } catch (ex) {
      console.warn('Error reading tag:', ex);
    } finally {
      setLoading(false);
      // Cleanup
      NfcManager.cancelTechnologyRequest();
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Button
        title="Read NFC Tag UTXO"
        onPress={readNFC}
        disabled={loading}
      />
      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}

      <Text style={{fontSize:40}}>{data}</Text>
    </View>
  );
}
