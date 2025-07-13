
import {
  useFonts
} from '@expo-google-fonts/ibm-plex-sans';

import React, { useEffect, useState } from 'react';

import { config } from '@/config/config';
import { abi } from "@/contracts/utxo.json";
import { decodeUTXO, encodeUTXO } from '@/libs/encoder';
import { generateUtxoId, signUtxo, verifyUtxoSignature } from '@/libs/signature';
import { supabase } from '@/libs/supabase';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { ethers } from 'ethers';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { s, vs } from 'react-native-size-matters';


interface UTXOData {
  o: string;
  a: string|number;
  u: string;
  s: string;
}

NfcManager.start();

const Payment = () => {
  const [fontsLoaded] = useFonts({
    "SpaceMono": require('@/assets/fonts/SpaceMono-Regular.ttf'),
    "ProximaNova": require('@/assets/fonts/proximanova_black.otf'),
    // "ProximaNovaItalic": require('@/assets/fonts/proximanova_blackit.otf'),
    "ProximaNovaBold": require('@/assets/fonts/proximanova_bold.otf'),
    // "ProximaNovaBoldItalic": require('@/assets/fonts/proximanova_boldit.otf'),
    // "ProximaNovaLight": require('@/assets/fonts/proximanova_light.otf'),
    // "ProximaNovaExtraBold": require('@/assets/fonts/proximanova_extrabold.otf'),
    "ProximaNovaRegular": require('@/assets/fonts/proximanova_regular.ttf')
  });
  const [nfcModalVisible, setNfcModalVisible] = useState(false);

  const [amount, setAmount] = useState('');

  const [nfcSupported, setNfcSupported] = useState(false);
  const provider = new ethers.JsonRpcProvider(config.RPC_URL);
  const issuerWallet = new ethers.Wallet(config.ISSUER_PRIVATE_KEY, provider);
  const iface = new ethers.Interface(abi);

  const contract = new ethers.Contract(config.CONTRACT_ADDRESS , abi , issuerWallet)
  const [loading, setLoading] = useState(false);
  const [utxo, setUtxo] = useState<UTXOData | null>(null);
  const [nfcTag, setNfcTag] = useState<boolean>(false);
  const [transaction, setTransaction] = useState<boolean>(false);
  const [alertModal, setAlertModal] = useState<string>("");


  // useEffect(()=>{})
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

  const handlePress = (digit: string) => {
    if (digit === 'back') {
      setAmount((prev) => prev.slice(0, -1));
    } else if (digit === '.') {
      if (!amount.includes('.')) {
        setAmount((prev) => prev + digit);
      }
    } else {
      if (amount.replace('.', '').length >= 6) return;
      setAmount((prev) => prev + digit);
    }
  };
  const keypad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'back'],
  ];

  const renderKey = (label: string, value?: string) => (
    <TouchableOpacity
      key={label}
      style={styles.key}
      onPress={() => handlePress(value ?? label)}
    >
      <Text style={styles.keyText}>{label}</Text>
    </TouchableOpacity>
  );


  const readNFC = async (tag:any):Promise<UTXOData|undefined> => {
      try {
        setLoading(true);
        // Read NDEF records
        const ndefMessage = tag?.ndefMessage;
        const payload = ndefMessage?.[0]?.payload;
        const text = decodeUTXO(payload);
        console.log('Decoded UTXO:', text);
        const readutxo = text
        setUtxo(readutxo);
        return readutxo;  
      } catch (ex) {
        console.warn('Error reading tag:', ex);
      } finally {
        setLoading(false);
        // Cleanup
      }
    };
    
    
    
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
                    setUtxo(JSON.stringify(utxo, null, 2));
      } catch (error: any) {
        Alert.alert('NFC Write Error writein', error.message || String(error));
      } finally {
        setLoading(false);
      }
    };
    const topUp = async()=>{
      await NfcManager.cancelTechnologyRequest();
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      if(!tag) return
      setNfcTag(true);
      setLoading(true);
      const readutxo = await readNFC(tag);
      console.log("Read utxo :: " , readutxo)
      if(readutxo==undefined) return 
      try {
        console.log("issuing utxo")
        // const contractWithSigner = contract.connect(issuerWallet);
        const a = await contract.userBalances("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
        console.log("data is ::" , a)
        console.log("Sending amount to CA :: " , amount)
        const tx = await contract.issueUtxo(
          amount , readutxo.o
          
        );
        
        const receipt = await tx.wait(); // wait for block confirmation

        // Parse logs to get utxoId
        let utxoIdExtracted
        for (const log of receipt.logs) {
          try {
            const parsedLog = iface.parseLog(log);
            //@ts-ignore
            if (parsedLog.name === "LogGeneratedUTXO") {
              //@ts-ignore

              const utxoId = parsedLog.args.utxoId;
              console.log("🆔 UTXO ID:", utxoId); // bytes32
              utxoIdExtracted = utxoId ;
            }
          } catch (err) {
            // Not a matching log, ignore
          }
        }
        if(!utxoIdExtracted) return console.log("No utxoId found")
        const newUTXO = {
          u:utxoIdExtracted ,
          a: Number(amount)+ Number(readutxo.a),
          o: readutxo.o,
          s:''
        }
        newUTXO.s = await signUtxo(newUTXO)
        console.log("new utxo :: " , newUTXO)
        await writeNFCTag(newUTXO);
        setUtxo(newUTXO);
        setTransaction(true)
        
        setAmount('');
        const supaInsert = {"amount": Number(newUTXO.a), "owner": newUTXO.o, "utxoId": newUTXO.u , "type":'created'}
        console.log("supa insert :: " , supaInsert)
        supabase
          .from('Transactions')
          .insert([
            supaInsert
          ])
          .select().then(({ error }) => {
            if (error) {
              console.error("Supabase insert error:", error.message);
            }
          });
        //save to transaction to the database
      } catch (error: any) {
        Alert.alert('Transaction Error topup;',error.message || String(error));
      } finally {
        setLoading(false);
      }
    }
    const handleSpend = async () => {
      await NfcManager.cancelTechnologyRequest();
      
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      if(!tag) return
      setNfcTag(true);

      setLoading(true);

      const readutxo = await readNFC(tag);
      console.log("readutxo", readutxo)
      if(readutxo==undefined) return 
      const isValid = await verifyUtxoSignature(readutxo)
      if(!isValid) return setAlertModal("Invalid Signature")
      try {
        const spendAmount = Number(amount);
        const totalAmount = Number(readutxo.a);
  
        if (spendAmount > totalAmount) {
          return setAlertModal("Insufficient Funds")
          // throw new Error('Amount exceeds UTXO value');
        }
  
        const leftBalance = totalAmount - spendAmount;
        const leftBalanceString = String(leftBalance);
        console.log("left balance", leftBalanceString)
        console.log("typeof ", typeof leftBalanceString)
        const nonce = await contract.userNonce(readutxo.o)+1n;
        const utxoId = generateUtxoId(readutxo.o, nonce, leftBalanceString);
        const newUTXO = {
          u: utxoId,
          a: leftBalance,
          o: readutxo.o,
          s: ''
        };
        console.log("new utxo before sigingn", newUTXO)
        
        newUTXO.s = await signUtxo(newUTXO);

        console.log("new utxo", newUTXO)
  
        // const contractWithSigner = contract.connect(issuerWallet);
        console.log("burn utxo data ::" , readutxo.u,
          spendAmount,
          readutxo.o)
        console.log("spend amount is :: " , spendAmount )
        const tx = await contract.burnUtxo(
          readutxo.u,
          amount,
          readutxo.o
        );
        console.log(tx);
        
        const tx2 = contract.utxoIssued(utxoId , readutxo.o , leftBalance)
  
        await writeNFCTag(newUTXO);
        setUtxo(newUTXO);
        setTransaction(true)
        setAmount('');
        const supaInsertOld = {"amount": Number(totalAmount), "owner": readutxo.o, "utxoId": readutxo.u , "type":'burnt'}
        const old = await supabase.from("Transactions").select("amount").eq("utxoId" , readutxo.o)
        const supaInsertNew = {"amount": Number(leftBalance), "owner": readutxo.o, "utxoId": utxoId , "type":'created'}
        console.log("supa insert :: " , supaInsertOld)
        console.log("supa insert 2 :: " , supaInsertNew)
        supabase
        .from('Transactions')
        .insert([supaInsertOld, supaInsertNew])  // or 'utxoI' if that's your key
        .select()
        .then(({ error }) => {
          if (error) {
            console.error("Supabase upsert error:", error.message);
          }
        });
      
        //save to transaction to the database
      } catch (error: any) {
        Alert.alert('Transaction Error handlespend', error.message || String(error));
      } finally {
        setLoading(false);
        await NfcManager.cancelTechnologyRequest();
      }
    };
  if (!fontsLoaded) return null;

  if(!nfcSupported) {
    return Alert.alert('Error', 'NFC is not supported on this device.');
  
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={nfcModalVisible ? "light" : "dark"} animated={true} />

      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoiding}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}

          <View style={styles.header}>

            <FontAwesome5 name="bitcoin" size={30} color="white" style={{ alignSelf: 'center' }} />

            <Image
              source={require('@/assets/images/jiit.png')}
              style={{
                width: s(40), // Adjust the width as needed
                height: s(40), // Adjust the height as needed
                resizeMode: 'contain', // key setting here
              }}
            />



          </View>


          <Text style={styles.amountText}>₹{amount || '0'}</Text>

          <TouchableOpacity style={styles.currencyButton}>
            <Text style={styles.currencyText}>Cafe</Text>
          </TouchableOpacity>

          <View style={styles.keypad}>
            {keypad.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((item) =>
                  renderKey(item === 'back' ? '⌫' : item, item)
                )}
              </View>
            ))}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.requestButton} onPress={() => {setNfcModalVisible(true);topUp();}}>
              <Text style={styles.buttonText}>TopUp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.payButton} onPress={() => {setNfcModalVisible(true);handleSpend();}}>
              <Text style={styles.buttonText}>Request</Text>
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
        {nfcModalVisible && (
          <View style={StyleSheet.absoluteFill}>
            <StatusBar />

            <TouchableWithoutFeedback onPress={() => {setAlertModal("");setNfcModalVisible(false);setTransaction(false);setNfcTag(false);}}>
              <View style={styles.modalOverlay}>
                {/* Prevent touch from propagating */}
                <TouchableWithoutFeedback onPress={() => { }}>
                  <View style={styles.modalContent}>
                  
                    
                   <LottieView
                      source={alertModal!=""?require('@/assets/error.json'):transaction?require('@/assets/payment-success-2.json'):require('@/assets/nfc.json')}
                      autoPlay
                      loop
                      style={{ width: vs(200), height: vs(200) }}
                    />
                    <Text style={styles.modalText}>{alertModal!=""?alertModal:nfcTag?transaction?"Transaction Success":"Transaction Initiated":"Waiting for NFC tap..."}</Text>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </View>
        )}

      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#00B743',
    backgroundColor:"#D309D7",
    paddingBottom: 80, // Pushes content above tab bar
  }
  ,
  keyboardAvoiding: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: vs(20),
    marginTop: vs(10),
    marginBottom: vs(10),
    alignContent: 'center'
  },
  amountText: {
    fontSize: vs(58),
    color: 'white',
    textAlign: 'center',
    marginTop: 30,
    fontFamily: 'ProximaNovaBold',
  },
  currencyButton: {
    alignSelf: 'center',
    // backgroundColor: '#00A637',
    backgroundColor:"#DB5AE3",

    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 10,
  },
  currencyText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'ProximaNova',
  },
  keypad: {
    marginTop: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  key: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 28,
    color: 'white',
    fontFamily: 'ProximaNovaRegular',
    // fontWeight00'
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  requestButton: {
    flex: 1,
    // backgroundColor: '#00A637',
    backgroundColor:"#DB5AE3",
    // opacity: 0.5,
    marginRight: 10,
    paddingHorizontal:vs(0),
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    fontFamily: 'ProximaNova',
  },
  payButton: {
    flex: 1,
    // backgroundColor: '#00A637',
    backgroundColor:"#DB5AE3",
    // padding:vs(20),
    paddingVertical: 15,
    marginLeft: 10,
    // paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    fontFamily: 'ProximaNova',
  },
  buttonText: {
    color: 'white',
    fontSize: vs(10),
    fontFamily: 'ProximaNova',
  },
  modalContent: {
    backgroundColor: 'transparent',
    paddingVertical: vs(30),
    paddingHorizontal: s(20),
    borderRadius: vs(12),
    alignItems: 'center',
    width: '80%',
  },
  modalText: {
    marginTop: vs(10),
    fontSize: vs(16),
    fontFamily: 'ProximaNovaBold',
    color: 'white',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Increased opacity for better dimming
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,

  },



});

export default Payment;
