import {
  IBMPlexSans_400Regular,
  IBMPlexSans_600SemiBold,
  useFonts,
} from '@expo-google-fonts/ibm-plex-sans';
import Ionicons from '@expo/vector-icons/Ionicons';
import LottieView from 'lottie-react-native';
import { TouchableWithoutFeedback } from 'react-native';

import React, { useState } from 'react';

import { StatusBar } from 'expo-status-bar';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { s, vs } from 'react-native-size-matters';

const Payment = () => {
  const [fontsLoaded] = useFonts({
    IBMPlexSans_600SemiBold,
    IBMPlexSans_400Regular,
  });
  const [nfcModalVisible, setNfcModalVisible] = useState(false);

  const [amount, setAmount] = useState('');

  const handleNumberPress = (digit: string) => {
    if (digit === 'delete') {
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



  if (!fontsLoaded) return null;

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
            <Ionicons name="chevron-back" size={24} color="black" />
            <Text style={styles.headerText}>Send Money</Text>
            <Ionicons name="search-outline" size={24} color="black" />
          </View>

          {/* Upper Half (Avatar Section) */}
          <View style={styles.upperHalf}>
            <View style={styles.avatarWrapper}>
              <Image
                source={require('@/assets/avatar-illustration.png')} // Replace with your image
                style={styles.avatarImage}
              />
            </View>
          </View>

          {/* Lower Half (Amount and Numpad Section) */}
          <View style={styles.lowerHalf}>
            {/* Amount Display */}
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <Text style={styles.amount}>{amount || '0'}</Text>
              {!amount.includes('.') && <Text style={styles.currencyDecimal}>.00</Text>}
            </View>

            {/* NumPad */}
            <View style={styles.numPad}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={styles.numButton}
                  onPress={() => handleNumberPress(num.toString())}
                >
                  <Text style={styles.numText}>{num}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.numButton} onPress={() => handleNumberPress('.')}>
                <Text style={styles.numText}>.</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.numButton} onPress={() => handleNumberPress('0')}>
                <Text style={styles.numText}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.numButton} onPress={() => handleNumberPress('delete')}>
                <Ionicons name="backspace-outline" size={28} color="#0B0A0A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Send Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.sendButton} onPress={() => setNfcModalVisible(true)}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {nfcModalVisible && (
  <View style={StyleSheet.absoluteFill}>
    <StatusBar  />

    <TouchableWithoutFeedback onPress={() => setNfcModalVisible(false)}>
      <View style={styles.modalOverlay}>
        {/* Prevent touch from propagating */}
        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={styles.modalContent}>
            <LottieView
              source={require('@/assets/nfc.json')}
              autoPlay
              loop
              style={{ width: 120, height: 120 }}
            />
            <Text style={styles.modalText}>Waiting for NFC tap...</Text>
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
    backgroundColor: '#FAF1E4', // Beige background for entire page
  },
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
    marginTop: vs(6),
    marginBottom: vs(10),
  },
  headerText: {
    fontSize: vs(20),
    fontFamily: 'IBMPlexSans_600SemiBold',
    color: '#0B0A0A',
  },
  upperHalf: {
    // fl, // Takes up 40% of the screen
    backgroundColor: '#FAF1E4', // Beige background
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginVertical: vs(20),
  },
  avatarImage: {
    width: vs(80),
    height: vs(80),
    borderRadius: vs(40),
  },
  lowerHalf: {
    borderRadius: vs(40),
    height: vs(80),
    paddingTop: vs(20),
    flex: 50, // Takes up 60% of the screen
    backgroundColor: 'white', // White background for the lower half
    paddingBottom: vs(30),
    borderTopLeftRadius: vs(30),
    borderTopRightRadius: vs(30),
    // maxHeight:vs(500),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5, // For Android shadow
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: vs(0),
  },
  currencySymbol: {
    fontSize: vs(20),
    fontFamily: 'IBMPlexSans_600SemiBold',
    color: '#0B0A0A',
    marginBottom: vs(5),
  },
  amount: {
    fontSize: vs(40),
    fontFamily: 'IBMPlexSans_600SemiBold',
    color: '#0B0A0A',
  },
  currencyDecimal: {
    fontSize: vs(20),
    fontFamily: 'IBMPlexSans_600SemiBold',
    color: '#666',
    marginBottom: vs(5),
  },
  numPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: s(10),
    marginBottom: vs(10),
  },
  numButton: {
    width: '30%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: vs(12),
    backgroundColor: 'white',
    marginVertical: vs(5),
  },
  numText: {
    fontSize: vs(20),
    fontFamily: 'IBMPlexSans_600SemiBold',
    color: '#0B0A0A',
  },
  footer: {
    paddingVertical: vs(10),
    position: 'absolute',
    bottom: 50,
    width: '80%',
    marginHorizontal: s(20),
    alignSelf: 'center',
  },
  sendButton: {
    backgroundColor: '#0B0A0A',
    paddingVertical: vs(14),
    paddingHorizontal: vs(40),
    borderRadius: vs(10),
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: vs(10),
    fontFamily: 'IBMPlexSans_600SemiBold',
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

  modalContent: {
    backgroundColor: 'white',
    paddingVertical: vs(30),
    paddingHorizontal: s(20),
    borderRadius: vs(12),
    alignItems: 'center',
    width: '80%',
  },
  modalText: {
    marginTop: vs(10),
    fontSize: vs(16),
    fontFamily: 'IBMPlexSans_600SemiBold',
    color: '#0B0A0A',
    textAlign: 'center',
  },

});

export default Payment;
