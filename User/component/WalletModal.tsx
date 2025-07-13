import { useWalletInfo } from '@reown/appkit-wagmi-react-native';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAccount, useBalance, useChainId, useDisconnect } from 'wagmi';



export default function WalletDetailsScreen() {
  function shortenAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const { walletInfo } = useWalletInfo();

  if (!isConnected) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>No wallet connected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{
            uri: walletInfo?.icon || 'https://trustwallet.com/assets/images/media/assets/TWT.png',
          }}
          style={styles.walletIcon}
        />

        <Text style={styles.label}>Wallet</Text>
        <Text style={styles.value}>{walletInfo?.name || 'Trust Wallet'}</Text>

        <Text style={styles.label}>Address</Text>
        <Text style={styles.value}>{shortenAddress(address!)}</Text>

        <Text style={styles.label}>Network</Text>
        <Text style={styles.value}>{chainId.toString()}</Text>

        <Text style={styles.label}>Balance</Text>
        <Text style={styles.value}>
          {balance?.formatted} {balance?.symbol}
        </Text>

        <Pressable onPress={() => disconnect()} style={styles.button}>
          <Text style={styles.buttonText}>Disconnect</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
  },
  walletIcon: {
    width: 60,
    height: 60,
    marginBottom: 16,
    borderRadius: 30,
  },
  label: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#ff4d4d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
  },
});

// import { onWalletConnectionError } from '@reown/appkit-core';
// import { useAppKit, useWalletInfo } from "@reown/appkit-wagmi-react-native";
// import { Core } from "@walletconnect/core";
// import { Pressable, Text, View } from "react-native";

// const core = new Core({
//   projectId: process.env.PROJECT_ID,
// });
// export default function ConnectView() {
//   const { open } = useAppKit()
//   const { walletInfo } = useWalletInfo()

//   console.log("walletINfo is " ,walletInfo)

  
  



//   return (
//     <View style={{flex:1 , justifyContent:'center' , alignContent:'center'}}>
//       <Pressable onPress={() => open()}>
//         <Text>Open Connect Modal</Text>
//       </Pressable>
//     </View>
//   );
// }