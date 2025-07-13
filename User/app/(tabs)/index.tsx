// App.tsx
import ApproveModal from "@/component/ApproveModal";
import InfoModal from "@/component/InfoModal";
import { TokenBalanceModal } from "@/component/TokenBalanceModal";
import { config } from "@/config/config";
import { abi } from "@/contracts/utxo.json";
import { useWalletAuth } from "@/hook/useWalletAuth";
import { supabase } from "@/utils/supabase";
import { IBMPlexSans_400Regular, IBMPlexSans_600SemiBold, IBMPlexSans_700Bold } from "@expo-google-fonts/ibm-plex-sans";
import { Poppins_400Regular_Italic, Poppins_600SemiBold_Italic } from "@expo-google-fonts/poppins";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import Feather from '@expo/vector-icons/Feather';
import { useAppKit, useWalletInfo } from "@reown/appkit-wagmi-react-native";
import { ethers } from "ethers";
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useAccount, useBalance, useChainId, useConfig, useDisconnect } from "wagmi";

export default function App() {
  const { isLoggedIn } = useWalletAuth(); // <-- This now works!
  const router = useRouter();
  console.log("ctrl reached here")
  useEffect(() => {
      if (!isLoggedIn) {
        router.replace('/sign-in');
      }
    
  }, [isLoggedIn]);

  const { open } = useAppKit();

  const provider = new ethers.JsonRpcProvider(config.RPC_URL);
  const contract = new ethers.Contract(config.CONTRACT_ADDRESS , abi , provider)
  const [showModal, setShowModal] = useState(false);

  const configWagmi = useConfig();
  const chainId = useChainId();
  const currentChain = configWagmi.chains.find((c) => c.id === chainId);
  const { address, isConnected } = useAccount();
  const [transactions ,setTransactions] = useState<any>([])
  const [balance , setBalance] = useState<any>(0)
  const sample = true
  const [barData , setBarData] = useState<any>([])
  const sampleAdress = "0x0a0A0a0a0A0a0A0a0A0a0A0a0A0a0A0a0A0a0A0a"
  const { walletInfo } = useWalletInfo();
  const { disconnect } = useDisconnect();
  const { data: bal } = useBalance({ address });

  const [modal2 , setModal2] = useState(false )

  const [modalBalance, setModalBalance] = useState(false)
  
  const [approveModal , setApproveModal] = useState(false)

  useEffect(()=>{
    if(!address) return
    const f = async()=>{
      const bal = await contract.userBalances(address)
      setBalance(bal)
    }
    f();
  } , [address])

  const [fontsLoaded] = useFonts({
    Poppins_600SemiBold_Italic,
    IBMPlexSans_400Regular,
    IBMPlexSans_600SemiBold,
    IBMPlexSans_700Bold,
    Poppins_400Regular_Italic})
    const getISTDateIST = () => {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in ms
      const istDate = new Date(now.getTime() + istOffset);
    
      return istDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const getISTDate = () => {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in ms
      return new Date(now.getTime() + istOffset);
    };
    const getISTISOString = () => getISTDate().toISOString();
    
    const getLast7DaysTransactions = async () => {
      console.log("Getting 7 days transactions")

      const endDate = getISTDate(); // today's IST date as Date object
      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 6); // go 6 days back
      startDate.setDate(endDate.getDate() - 6); // last 7 days including today
  
      const { data, error } = await supabase
        .from('Transactions')
        .select('*')
        .eq("owner" ,sample?sampleAdress:address )
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
  
      const dayTotals = new Array(7).fill(0);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      // console.log("7 days :: " ,data)
      if (!data) return
      data.forEach(txn => {
        const date = new Date(txn.created_at);
        const diff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff < 7) {
          const amount = parseFloat(txn.amount);
          if (txn.type === 'burnt') {
            dayTotals[diff] += amount;
          } else if (txn.type === 'created') {
            dayTotals[diff] -= amount;
          }
        }
      });
  
      const chartData = dayTotals.map((val, idx) => {
        const labelDate = new Date(startDate);
        labelDate.setDate(startDate.getDate() + idx);
        return {
          value: parseFloat(val.toFixed(2)),
          label: days[labelDate.getDay()],
          frontColor: '#7f57f1',
          topLabelComponent: () => (
            <Text
              style={{
                color: 'white',
                fontSize: 12,
                textAlign: 'center',
                fontFamily: "IBMPlexSans_400Regular"
              }}
              numberOfLines={1} // 👈 forces one-line rendering
              adjustsFontSizeToFit // optional, shrink text if needed
            >
              {val ? `₹${val.toFixed(0)}` : ''}
            </Text>
          )
  
        };
      });
  
      // console.log("Setting chart data :: ", chartData);
      setBarData(chartData);
    };
    const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    const getTodayTransactionSummary = async () => {
      console.log("Getting todays transactions")
      const todayStr = getISTISOString().split('T')[0]
    
      const { data, error } = await supabase
        .from('Transactions')
        .select('amount, type, owner')
        .eq('owner', sample?sampleAdress:address)
        .gte('created_at', `${todayStr} 00:00:00`)
        .lt('created_at', `${todayStr} 23:59:59`);
    
      if (error) {
        console.error("Error fetching today's transactions:", error);
        return { totalCreated: 0, totalBurnt: 0, net: 0 };
      }
      // console.log("today  :: " ,data)

    
      let totalCreated = 0;
      let totalBurnt = 0;
    
      data.forEach(txn => {
        const amt = parseFloat(txn.amount);
        if (txn.type === 'created') {
          totalCreated += amt;
        } else if (txn.type === 'burnt') {
          totalBurnt += amt;
        }
      });
    
      const net = totalBurnt - totalCreated;
      return { totalCreated, totalBurnt, net };
    };

    const getBalance = async()=>{
      if(!address) return
      const data = await contract.userBalances(address)
      setBalance(data)

    }

    useEffect(()=>{
      if(!address) return
      getTodayTransactionSummary()
      getBalance();
      getLast7DaysTransactions();
    } , [address])
    
    if(!fontsLoaded) return null;

    

  return (
    <LinearGradient colors={['#f5efff', '#f0f4ff']} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={()=>open()}>
            <Text style={styles.menu}>☰</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>setShowModal(true)}>
          <Image 
            source={require("@/assets/images/MetaMask-icon-fox.png")}
            style={styles.avatar}
          />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerText}>Your Balance</Text>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={{flexDirection:"row" , justifyContent:'space-between'}}>
          <Text style={styles.dateText}>{getISTDateIST()}</Text>
          <Image source={require("@/assets/images/metamask.png")} style={{height:25 , width:50}}></Image>
          </View>
          <Text style={styles.balanceText}>{balance} <Text style={styles.currency}>INR</Text></Text>
          <View style={styles.percentageRow}>
            <Text style={styles.gray}>{address} </Text>
          </View>
        </View>

        {/* Icons */}
        <View style={styles.iconRow}>
          <TouchableOpacity style={styles.iconBox} onPress={()=>setApproveModal(true)}>
               <Feather name="send" size={30} color="green" />
              <Text style={styles.iconLabel}>Approve Funds</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.iconBox , {marginRight:30}]} onPress={()=>setModalBalance(true)}>
            <FontAwesome name="google-wallet" size={30} color="black" />
              <Text style={styles.iconLabel}>Wallet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBox , {marginRight:10}]} onPress={()=>setModal2(true)}>
            <Entypo name="info-with-circle" size={30} color="black" />
              <Text style={styles.iconLabel}>Info</Text>
            </TouchableOpacity>
        </View>

        {/* Activities */}
        <View style={styles.activitiesRow}>
          <Text style={styles.sectionTitle}>Transactions</Text>
          <View style={styles.weeklyBadge}>
            <Text style={styles.weeklyText}>Weekly</Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>

            <BarChart
                data={barData}
                barWidth={32}
                spacing={32}
                barBorderRadius={16}
                initialSpacing={10}
                frontColor="#7f57f1"
                
                showValuesAsTopLabel={false} // Simplify top labels
                //@ts-ignore
                maxValue={Math.max(...barData.map(item => item.value)) + 1000}
                yAxisThickness={0}
                xAxisThickness={0}
                mostNegativeValue={0}
                noOfSections={3}
                isAnimated
                yAxisTextStyle={{ color: 'black', fontFamily: 'IBMPlexSans_400Regular' }}
                xAxisLabelTextStyle={{ color: 'black', fontFamily: "IBMPlexSans_400Regular" }}
              />

        </View>
        
    <Modal
      visible={showModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableWithoutFeedback onPress={() => {}}>
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 20,
                padding: 20,
                width: '90%',
                alignItems: 'center',
              }}
            >
              <Image
                source={{
                  uri:
                    walletInfo?.icon ||
                    'https://trustwallet.com/assets/images/media/assets/TWT.png',
                }}
                style={{ width: 50, height: 50, marginBottom: 16 }}
              />
              <Text
                style={{
                  fontFamily: 'IBMPlexSans_600SemiBold',
                  fontSize: 16,
                  marginBottom: 4,
                }}
              >
                Wallet
              </Text>
              <Text
                style={{
                  fontFamily: 'Poppins_400Regular_Italic',
                  fontSize: 14,
                }}
              >
                {walletInfo?.name || 'Trust Wallet'}
              </Text>

              <Text
                style={{
                  fontFamily: 'IBMPlexSans_600SemiBold',
                  fontSize: 16,
                  marginTop: 12,
                }}
              >
                Address
              </Text>
              <Text
                style={{
                  fontFamily: 'Poppins_400Regular_Italic',
                  fontSize: 12,
                }}
              >
                {/* @ts-ignore */}
                {shortenAddress(address)}
              </Text>

              <Text
                style={{
                  fontFamily: 'IBMPlexSans_600SemiBold',
                  fontSize: 16,
                  marginTop: 12,
                }}
              >
                Network
              </Text>
              <Text
                style={{
                  fontFamily: 'Poppins_400Regular_Italic',
                  fontSize: 12,
                }}
              >
                {chainId?.toString()}
              </Text>

              <Text
                style={{
                  fontFamily: 'IBMPlexSans_600SemiBold',
                  fontSize: 16,
                  marginTop: 12,
                }}
              >
                Balance
              </Text>
              <Text
                style={{
                  fontFamily: 'Poppins_400Regular_Italic',
                  fontSize: 12,
                }}
              >
                {bal?.formatted} {bal?.symbol}
              </Text>

              <Pressable
                onPress={() => {
                  disconnect();
                  setShowModal(false);
                }}
                style={{
                  marginTop: 20,
                  backgroundColor: '#7f57f1',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                  Disconnect
                </Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>

    <InfoModal visible={modal2} onClose={() => setModal2(false)} />

    <TokenBalanceModal visible={modalBalance} onClose={() => setModalBalance(false)} />
      <ApproveModal visible={approveModal} onClose = {()=>setApproveModal(false)}/>
        
              </SafeAreaView>
      <StatusBar backgroundColor={"dark"}></StatusBar>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    paddingHorizontal: 20,
    paddingTop:50
  },
  headerText:{
    marginTop:5 ,
    fontFamily:"IBMPlexSans_700Bold",
    fontSize:30
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menu: {
    fontSize: 26,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
  },
  balanceCard: {
    backgroundColor: 'rgba(219, 219, 219, 0.7)',
    borderRadius: 20,
    padding: 20,
    marginVertical: 20,
  
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    fontFamily:"IBMPlexSans_400Regular"
  },
  balanceText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    marginTop: 8,
    fontFamily:"IBMPlexSans_600SemiBold"

    
  },
  currency: {
    fontSize: 18,
    color: '#777',
    fontFamily:"IBMPlexSans_600SemiBold"

  },
  percentageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  gray: {
    fontSize:10 ,
    color: '#000000',
    fontFamily:"Poppins_400Regular_Italic"
  },
  red: {
    color: '#f25a5a',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconBox: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eee',
    marginBottom: 6,
  },
  iconLabel: {
    fontSize: 12,
    color: '#444',
    marginTop:10,
    fontFamily:"Poppins_600SemiBold_Italic"

  },
  activitiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop:40
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily:"Poppins_600SemiBold_Italic"
  },
  weeklyBadge: {
    backgroundColor: '#f4f4f4',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  weeklyText: {
    fontSize: 12,
    color: '#333',
    fontFamily:"Poppins_600SemiBold_Italic"
  },
  chartContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  barLabel: {
    textAlign: 'center',
    fontSize: 12,
    color: '#444',
    marginBottom: 4,
  },
});

