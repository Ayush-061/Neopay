import { config } from '@/config/config';
import { abi } from "@/contracts/utxo.json";
import { encodeUTXO } from '@/libs/encoder';
import { generateUtxoId, signUtxo } from '@/libs/signature';
import { IBMPlexSans_400Regular, IBMPlexSans_600SemiBold } from '@expo-google-fonts/ibm-plex-sans';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ethers } from 'ethers';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';
interface UTXOData {
    o: string;
    a: string|number;
    u: string;
    s: string;
  }

const SetupScreen = () => {
  const [walletAddress, setWalletAddress] = useState('');
    const provider = new ethers.JsonRpcProvider(config.RPC_URL);
    const issuerWallet = new ethers.Wallet(config.ISSUER_PRIVATE_KEY, provider);
    const iface = new ethers.Interface(abi);
  
    const contract = new ethers.Contract(config.CONTRACT_ADDRESS , abi , issuerWallet)
  
  const [loading , setLoading] = useState(false)

    const [fontsLoaded] = useFonts({
        IBMPlexSans_400Regular,
        IBMPlexSans_600SemiBold})


const writeNFCTag = async (utxo: UTXOData) => {
      try {
              setLoading(true);
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
            //@ts-ignore
      } catch (error: any) {
        Alert.alert('NFC Write Error writein', error.message || String(error));
      } finally {
        setLoading(false);
      }
    };


    const setupCard = async()=>{
        
        if(!walletAddress) return Alert.alert("Wallet Address" ,"Please enter a wallet address!")
          setLoading(true)
        await NfcManager.cancelTechnologyRequest();
        await NfcManager.requestTechnology(NfcTech.Ndef);
        const tag = await NfcManager.getTag();
        if(!tag) return

        const amount = 500
        console.log("Sending amount to CA :: " , amount)
        // const tx = await contract.issueUtxo(
        //   amount , walletAddress
          
        // );
        
        // const receipt = await tx.wait(); // wait for block confirmation

        // Parse logs to get utxoId
        // let utxoIdExtracted
        // for (const log of receipt.logs) {
        //   try {
        //     const parsedLog = iface.parseLog(log);
        //     //@ts-ignore
        //     if (parsedLog.name === "LogGeneratedUTXO") {
        //       //@ts-ignore

        //       const utxoId = parsedLog.args.utxoId;
        //       console.log("🆔 UTXO ID:", utxoId); // bytes32
        //       utxoIdExtracted = utxoId ;
        //     }
        //   } catch (err) {
        //     // Not a matching log, ignore
        //   }
        // }
        // if(!utxoIdExtracted) return console.log("No utxoId found")

        const nonce = await contract.userNonce(walletAddress)+1n;
        const utxoId = generateUtxoId(walletAddress, nonce, "500");
        const newUTXO = {
          u:utxoId ,
          a: Number(amount),
          o: walletAddress,
          s:''
        }
        newUTXO.s = await signUtxo(newUTXO)
        const tx2 = contract.utxoIssued(utxoId , walletAddress , amount)
  
        await writeNFCTag(newUTXO);

        
        
        
        console.log("writing to nfc card :: " , newUTXO)
        await writeNFCTag(newUTXO)
        setLoading(false)
        await NfcManager.cancelTechnologyRequest();
        
    }

  return (
    <LinearGradient colors={['#7F00FF', '#E100FF']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <View style={styles.header}>
            <Ionicons name="wallet-outline" size={40} color="#fff" />
            <Text style={styles.title}>Setup a Nfc Card</Text>
            <Text style={styles.subtitle}>
              Enter your wallet address to continue
            </Text>
          </View>

          <TextInput
            placeholder="Enter wallet address"
            placeholderTextColor="#ccc"
            value={walletAddress}
            onChangeText={setWalletAddress}
            style={styles.input}
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.button} onPress={setupCard}>
            {!loading?<Text style={styles.buttonText}>Continue</Text> : <ActivityIndicator></ActivityIndicator>}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SetupScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    fontFamily:"IBMPlexSans_600SemiBold"
  },
  subtitle: {
    color: '#eee',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    fontFamily:"IBMPlexSans_600SemiBold"
  },
  input: {
    backgroundColor: '#ffffff22',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 24,
    fontFamily:"IBMPlexSans_600SemiBold"
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  buttonText: {
    color: '#7F00FF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily:'IBMPlexSans_400Regular'
  },
});
