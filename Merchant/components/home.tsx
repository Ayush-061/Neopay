import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Platform, Text, TextInput, View } from 'react-native';
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';
import { abi } from "../contracts/utxo.json";

// Replace with your values
const UTXO_ABI = abi;
const CONTRACT_ADDRESS = '0x42F9BE700172595f77Ce4039225421E6Bafab059';
const ISSUER_PRIVATE_KEY = '5727c5982d90731260407ab34b95a6285a4f6f01ed5936763bc1836dfa3d1f86';
const RPC_URL = 'https://...'; // your RPC provider

interface UTXOData {
  recipient: string;
  amount: string;
  nonce: number;
  signature: string;
}

// Start NFC
NfcManager.start();

export default function NFCUTXOApp() {
  const [amount, setAmount] = useState('');
  const [utxo, setUtxo] = useState<UTXOData | null>(null);
  const [loading, setLoading] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const issuerWallet = new ethers.Wallet(ISSUER_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, UTXO_ABI, provider);

  useEffect(() => {
    const checkNfc = async () => {
      const supported = await NfcManager.isSupported();
      if (supported) {
        await NfcManager.start();
        setNfcSupported(true);
      }
    };
    checkNfc();

    return () => {
      NfcManager.unregisterTagEvent().catch(() => {});
    };
  }, []);

  const readNFCTag = async () => {
    try {
      setLoading(true);
      //@ts-ignore
      await NfcManager.registerTagEvent(tag=> {
        if (tag.ndefMessage?.length) {
          try {
            const ndefRecord = tag.ndefMessage[0];
            const payload = ndefRecord.payload;

            // Remove language code prefix if present
            const text = Platform.OS === 'android' ? new TextDecoder().decode(payload.slice(3)) : new TextDecoder().decode(payload);
            const parsed = JSON.parse(text);
            setUtxo(parsed);
            Alert.alert('UTXO Read', JSON.stringify(parsed, null, 2));
          } catch (err) {
            Alert.alert('Error parsing NFC data', String(err));
          }
        }
        NfcManager.unregisterTagEvent().catch(() => {});
      });
    } catch (error: any) {
      Alert.alert('NFC Error', error.message || String(error));
    } finally {
      setLoading(false);
    }
  };

  const generateSignature = async (newData: Omit<UTXOData, 'signature'>): Promise<string> => {
    const domain = {
      name: "JIITUtxo",
      version: "1",
      chainId: await provider.getNetwork().then(n => Number(n.chainId)),
      verifyingContract: CONTRACT_ADDRESS
    };

    const types = {
      Note: [
        { name: 'recipient', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
      ],
    };

    return issuerWallet.signTypedData(domain, types, newData);
  };

  const writeNFCTag = async (data: UTXOData) => {
    try {
      setLoading(true);
      await NfcManager.requestTechnology(NfcTech.Ndef);

      const payload = JSON.stringify(data);
      const bytes = Ndef.encodeMessage([
        Ndef.textRecord(payload),
      ]);

      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        Alert.alert('Success', 'NFC Tag Updated');
      } else {
        throw new Error('Failed to encode NFC message');
      }
    } catch (error: any) {
      Alert.alert('NFC Write Error', error.message || String(error));
    } finally {
      NfcManager.cancelTechnologyRequest().catch(() => {});
      setLoading(false);
    }
  };

  const handleSpend = async () => {
    if (!utxo || !amount) return;
    setLoading(true);

    try {
      const spendAmount = ethers.parseEther(amount);
      const originalAmount = ethers.parseEther(utxo.amount);

      if (spendAmount > originalAmount) {
        throw new Error('Amount exceeds UTXO value');
      }

      const newAmount = originalAmount - spendAmount;
      const newUTXO = {
        recipient: utxo.recipient,
        amount: ethers.formatEther(newAmount),
        nonce: utxo.nonce + 1,
        signature: ''
      };

      newUTXO.signature = await generateSignature(newUTXO);

      const contractWithSigner = contract.connect(issuerWallet);

      //@ts-ignore
      const tx = await contractWithSigner.spendNote(
        utxo.recipient,
        originalAmount,
        spendAmount,
        utxo.nonce,
        utxo.signature
      );
      await tx.wait();

      await writeNFCTag(newUTXO);
      setUtxo(newUTXO);
      setAmount('');
    } catch (error: any) {
      Alert.alert('Transaction Error', error.message || String(error));
    } finally {
      setLoading(false);
    }
  };

  if (!nfcSupported) {
    return (
      <View style={{ padding: 20 }}>
        <Text>NFC is not supported on this device</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Button 
        title={utxo ? 'Refresh NFC Tag' : 'Read NFC Tag'} 
        onPress={readNFCTag} 
        disabled={loading}
      />

      {utxo && (
        <>
          <Text>Current UTXO Amount: {utxo.amount}</Text>
          <TextInput
            placeholder="Amount to spend"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
          />

          <Button
            title={loading ? 'Processing...' : 'Spend UTXO'}
            onPress={handleSpend}
            disabled={loading}
          />
        </>
      )}
    </View>
  );
}
