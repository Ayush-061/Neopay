import { config } from '@/config/config'
import { Poppins_600SemiBold, Poppins_600SemiBold_Italic, useFonts } from '@expo-google-fonts/poppins'
import React from 'react'
import {
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native'

export default function InfoModal({ visible, onClose }:any) {
    const [fontsLoaded] = useFonts({
        Poppins_600SemiBold_Italic,
        Poppins_600SemiBold
        })
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <Image
                source={{
                  uri: 'https://trustwallet.com/assets/images/media/assets/TWT.png',
                }}
                style={styles.walletIcon}
              />
              <Text style={styles.title}>JIIT NEO PAY</Text>

              <Text style={styles.label}>Token CA</Text>
              <Text style={styles.value}>{config.TOKEN_ADDRESS}</Text>

              <Text style={styles.label}>Network</Text>
              <Text style={styles.value}>Polygon</Text>

              <Text style={styles.label}>Chain ID</Text>
              <Text style={styles.value}>80002</Text>

              <Text style={styles.label}>Developer</Text>
              <Text style={styles.value}>Ayush Tomar, Ayush Pandey, Sarthak</Text>

              <Pressable onPress={onClose} style={styles.button}>
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
  walletIcon: {
    width: 60,
    height: 60,
    marginBottom: 16,
    borderRadius: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily:"Poppins_600SemiBold"
  },
  label: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
    fontFamily:"Poppins_600SemiBold_Italic"
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#7f57f1',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
})
