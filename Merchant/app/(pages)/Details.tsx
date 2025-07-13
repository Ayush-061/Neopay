import { config } from '@/config/config';
import { IBMPlexSans_400Regular, IBMPlexSans_600SemiBold, useFonts } from "@expo-google-fonts/ibm-plex-sans";
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';

import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { s, vs } from 'react-native-size-matters';

const MerchantDetailsScreen = () => {
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const merchant = {
    name: 'JIIT Cafe',
    contractAddress: config.CONTRACT_ADDRESS,
    privateKey: config.ISSUER_PRIVATE_KEY,
    email: '22104053@mail.jiit.ac.in',
    phone: '+91 9929419734',
    publicKey: config.MERCHANT_PUBLIC_ADDR,
    rpcUrl : config.RPC_URL
  };

  const [fontsLoaded] = useFonts({
      IBMPlexSans_400Regular,
      IBMPlexSans_600SemiBold})

  return (
    <LinearGradient colors={['#4B00E0', '#7F00FF']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Merchant Profile</Text>

          <View style={styles.card}>
            <View style={styles.avatarCircle}>
                <Image
                    source={require('@/assets/images/jiit.png')}
                    style={{
                    width: s(80), // Adjust the width as needed
                    height: s(80), // Adjust the height as needed
                    resizeMode: 'contain', // key setting here
                              }}
                            />
              {/* <Ionicons name="person" size={40} color="#fff" /> */}
            </View>

            <Text style={styles.name}>{merchant.name}</Text>

            <View style={styles.field}>
              <Feather name="at-sign" size={16} color="#888" />
              <Text style={styles.value}>{merchant.email}</Text>
            </View>

            <View style={styles.field}>
              <Feather name="phone" size={16} color="#888" />
              <Text style={styles.value}>{merchant.phone}</Text>
            </View>

            <View style={styles.field}>
              <Feather name="file-text" size={16} color="#888" />
              <Text style={styles.value}>
                CA : {merchant.contractAddress}...
              </Text>
            </View>
            <View style={styles.field}>
              <Feather name="key" size={16} color="#888" />
              <Text style={styles.value}>
                Public Key :{merchant.publicKey}...
              </Text>
            </View>
            <View style={styles.field}>
              <Feather name="server" size={16} color="#888" />
              <Text style={styles.value}>
                RPC URL : {merchant.rpcUrl}...
              </Text>
            </View>

            <View style={styles.field}>
              <Feather name="key" size={16} color="#888" />
              <Text style={styles.value}>
                {showPrivateKey
                  ? merchant.privateKey
                  : '•••• •••• •••• ••••'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowPrivateKey(!showPrivateKey)}
              >
                <Feather
                  name={showPrivateKey ? 'eye-off' : 'eye'}
                  size={18}
                  color="#888"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default MerchantDetailsScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: 16,
  },
  container: {
    paddingBottom: 40,
    paddingTop:vs(100)
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
    fontFamily: 'IBMPlexSans_600SemiBold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: vs(30),
    padding: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  avatarCircle: {
    // backgroundColor: '#8E2DE2',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
    fontFamily:'IBMPlexSans_600SemiBold'
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 10,

  },
  value: {
    fontSize: 14,
    color: '#444',
    flex: 1,
    fontFamily:"IBMPlexSans_400Regular"
  },
});
