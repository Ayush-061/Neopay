import { config } from "@/config/config"
import { abi } from "@/contracts/erc20.json"
import { ethers } from "ethers"
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View
} from 'react-native'
import { useAccount, useWalletClient } from 'wagmi'



const TOKEN_ADDRESS = "0x34cA7B182E2166c93B66d366D31B3bceAE5c9f63" // Replace with your ERC-20 contract on Amoy
const erc20ABI = abi
export const TokenBalanceModal = ({ visible, onClose }:any) => {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  console.log("wallet client is :: " , walletClient)

   const provider = new ethers.JsonRpcProvider(config.RPC_URL);
    const contract = new ethers.Contract(TOKEN_ADDRESS , abi , provider)

    const [balance , setBalance] = useState<any>(null)

    useEffect(()=>{
        const f = async()=>{
            const data =contract.balanceOf(walletClient?.account.address)
        setBalance(data)
        }
        f()

            } , [])

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.modal}>
              <Text style={styles.title}>Token Balance</Text>
              {!balance? (
                <ActivityIndicator size="large" color="#7f57f1" />
              ) : (
                <Text style={styles.balanceText}>
                    {/* //@ts-ignore */}
                  {balance} JIIT
                </Text>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    width: '85%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  balanceText: {
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 8,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#7f57f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
  },
})
