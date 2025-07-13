import { decodeUTXO } from '@/libs/encoder';
import { IBMPlexSans_400Regular, IBMPlexSans_600SemiBold } from '@expo-google-fonts/ibm-plex-sans';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
interface UTXOData {
    o: string;
    a: string|number;
    u: string;
    s: string;
  }
  
const SetupScreen = () => {
  const [nfcData, setNfcData] = useState<any>(null);

  const [loading , setLoading] = useState(false)



    const [fontsLoaded] = useFonts({
        IBMPlexSans_400Regular,
        IBMPlexSans_600SemiBold})


    const readNFC = async (tag:any):Promise<UTXOData|undefined> => {
        try {
            setLoading(true);
            // Read NDEF records
            const ndefMessage = tag?.ndefMessage;
            const payload = ndefMessage?.[0]?.payload;
            const text = decodeUTXO(payload);
            console.log('Decoded UTXO:', text);
            const readutxo = text
            return readutxo;  
        } catch (ex) {
            console.warn('Error reading tag:', ex);
        } finally {
            setLoading(false);
            // Cleanup
        }
        };


    const setupCard = async()=>{
        await NfcManager.cancelTechnologyRequest();
        setLoading(true)
        await NfcManager.requestTechnology(NfcTech.Ndef);
        const tag = await NfcManager.getTag()
        const readData = await readNFC(tag)
        setNfcData(readData)
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
            <Text style={styles.title}>Read Nfc Card</Text>
            <Text style={styles.subtitle}>
              Tap the Card
            </Text>
          </View>

          {nfcData&& <Text style={{fontSize:15 , color:'white',  fontFamily:"IBMPlexSans_400Regular" , marginBottom:30}}>{JSON.stringify(nfcData)}</Text>}

          <TouchableOpacity style={styles.button} onPress={setupCard}>
            {!loading?<Text style={styles.buttonText}>Tap the Card</Text> : <ActivityIndicator></ActivityIndicator>}
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
