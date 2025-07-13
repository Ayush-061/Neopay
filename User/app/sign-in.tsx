// import { AppKitButton } from "@reown/appkit-wagmi-react-native";
import { useWalletAuth } from "@/hook/useWalletAuth";
import { useAppKit } from "@reown/appkit-wagmi-react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import React, { useEffect } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
export default function SignIn() {
    const { open } = useAppKit();

    const {isLoggedIn}= useWalletAuth();
    useEffect(()=>{
        if(isLoggedIn) router.replace("/(tabs)")
    })

  return (
    <LinearGradient colors={['#f5efff', '#f0f4ff']} style={styles.container}>
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.innerContainer}>
        {/* <Image
          source={require('@/assets/images/jiit.png')} // Replace with your logo path
          style={styles.logo}
          resizeMode="contain"
        /> */}

        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.appName}>Neo Pay</Text>
        <Text style={styles.subtitle}>Secure wallet login powered by Web3</Text>

        <View style={styles.buttonContainer}>
        <Pressable onPress={() => open()}>
        <Text>Connect Wallet</Text>
      </Pressable> 
        </View>
      </View>
    </SafeAreaView>
        </LinearGradient>
    
  );
}
const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent:'center',
        alignItems:'center'
      },
      safeArea: {
        paddingHorizontal: 20,
        paddingTop:50,
        justifyContent: 'center',
      alignItems: 'center',
      marginBottom:400
      },
    innerContainer: {
      width: '85%',
      alignItems: 'center',
    },
    logo: {
      width: 120,
      height: 120,
      marginBottom: 24,
    },
    title: {
      fontSize: 20,
      color: '#333',
    },
    appName: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#0070f3',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: '#666',
      marginBottom: 40,
      textAlign: 'center',
    },
    buttonContainer: {
      width: '100%',
      alignItems: 'center',
    },
    walletButton: {
      width: '100%',
    }
  });
  