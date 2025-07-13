import { config } from "@/config/config"
import { abi } from "@/contracts/erc20.json"
import React, { useState } from 'react'
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from 'react-native'
import { parseUnits } from 'viem'
import { useAccount, useWriteContract } from 'wagmi'

const erc20ABI = abi
const TOKEN_ADDRESS = "0x34cA7B182E2166c93B66d366D31B3bceAE5c9f63" // Replace with your ERC-20 contract on Amoy

export default function ApproveModal({ visible, onClose }: any) {
  const [amount, setAmount] = useState('')
  const { address } = useAccount()
  const { writeContract, data, isPending, isSuccess, error } = useWriteContract()
    const spender = config.CONTRACT_ADDRESS
  const approve = async () => {
    try {
      const parsedAmount = parseUnits(amount, 18) // Convert to wei
      await writeContract({
        address: TOKEN_ADDRESS, // <-- Replace with your token address
        abi: erc20ABI,
        functionName: 'approve',
        args: [spender, parsedAmount],
      })
    } catch (err) {
      console.error('Approval error:', err)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <Text style={styles.title}>Approve Token</Text>

              <Text style={styles.label}>Amount to Approve</Text>
              <TextInput
                placeholder="Enter amount"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                style={styles.input}
              />

              <Pressable onPress={approve} style={styles.button} disabled={isPending}>
                <Text style={styles.buttonText}>
                  {isPending ? 'Approving...' : 'Approve'}
                </Text>
              </Pressable>

              {isSuccess && <Text style={styles.success}>✅ Approved successfully</Text>}
              {error && <Text style={{ color: 'red' }}>❌ {error.message}</Text>}

              <Pressable onPress={onClose} style={styles.closeButton}>
                <Text style={styles.buttonText}>Close</Text>
              </Pressable>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#7f57f1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  success: {
    color: 'green',
    marginTop: 12,
  },
})
