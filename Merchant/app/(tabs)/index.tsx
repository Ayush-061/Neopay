
import { supabase } from '@/libs/supabase';
import { IBMPlexSans_400Regular, IBMPlexSans_600SemiBold } from "@expo-google-fonts/ibm-plex-sans";
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { vs } from 'react-native-size-matters';
const transactions = [
  {
    id: '1',
    to: 'Marvilo',
    date: '29 Feb, 20:37',
    amount: '€27.19',
  },
  {
    id: '2',
    to: 'Marvilo',
    date: '5 Dec 2023, 22:21',
    amount: '€27.19',
  },
];

const MainScreen = () => {
  const [totalBalance, setTotalBalance] = useState(0);
  const [displayBalance, setDisplayBalance] = useState(0);
  const animatedBalance = useRef(new Animated.Value(0)).current;

  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [utxoBurnt, setUtxoBurnt] = useState(0);
  const [utxoIssued, setUtxIssued] = useState(0);

  const onDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString); // Set the selected date
  };


  const [fontsLoaded] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_600SemiBold,
    "SpaceMono": require('@/assets/fonts/SpaceMono-Regular.ttf'),
    "ProximaNova": require('@/assets/fonts/proximanova_black.otf'),
    "ProximaNovaBold": require('@/assets/fonts/proximanova_bold.otf'),
    "ProximaNovaRegular": require('@/assets/fonts/proximanova_regular.ttf'),
    "ProximaNovaExtraBold": require('@/assets/fonts/proximanova_extrabold.otf'),

  });

  const [barData, setBarData] = useState<any>([]);
  const getISTDate = () => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in ms
    return new Date(now.getTime() + istOffset);
  };
  
  const getISTISOString = () => getISTDate().toISOString();
  const getLast7DaysTransactions = async () => {
    const endDate = getISTDate(); // today's IST date as Date object
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6); // go 6 days back
    startDate.setDate(endDate.getDate() - 6); // last 7 days including today

    const { data, error } = await supabase
      .from('Transactions')
      .select('amount, created_at, type')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const dayTotals = new Array(7).fill(0);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
        frontColor: '#ffffff',
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

    console.log("Setting chart data :: ", chartData);
    setBarData(chartData);
  };
  useEffect(() => {



    // Query the "Transactions" table to get today's transactions
    async function getNetMoneyEarned() {
      
      
      console.log(getISTISOString());
      const today = getISTISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format
      console.log("Today is :: " , today)
      // Query the "Transactions" table and select the 'amount' and 'type' columns
      const { data, error } = await supabase
        .from('Transactions')
        .select('amount, type')
        .filter('created_at', 'gte', `${today} 00:00:00`) // Start of today
        .filter('created_at', 'lt', `${today} 23:59:59`); // End of today
      console.log("data length is " , data?.length)

      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }

      // Initialize counters for created and burnt amounts
      let totalCreated = 0;
      let totalBurnt = 0;

      // Iterate over the data and calculate the total created and total burnt amounts
      data.forEach(transaction => {
        if (transaction.type === 'created') {
          totalCreated += parseFloat(transaction.amount);  // Sum created amounts
        } else if (transaction.type === 'burnt') {
          totalBurnt += parseFloat(transaction.amount);  // Sum burnt amounts
        }
      });
      setUtxIssued(totalCreated)
      setUtxoBurnt(totalBurnt)
      const netMoneyEarned = totalBurnt - totalCreated;

      console.log('Net Money Earned:', netMoneyEarned);
      setTotalBalance(netMoneyEarned);

      Animated.timing(animatedBalance, {
        toValue: netMoneyEarned,
        duration: 1200,
        useNativeDriver: false,
      }).start();

      return netMoneyEarned;
    }

    getNetMoneyEarned();
    getLast7DaysTransactions();

  }, [])
  useEffect(() => {
    const listener = animatedBalance.addListener(({ value }) => {
      setDisplayBalance(parseFloat(value.toFixed(2)));
    });

    return () => {
      animatedBalance.removeListener(listener);
    };
  }, []);




  return (
    <SafeAreaProvider>
      <LinearGradient colors={['#4B00E0', '#7F00FF']} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity>
                <Image  source={require('@/assets/images/jiit.png')} style={styles.avatar} />
              </TouchableOpacity>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={16} color="#888" />
                <Text style={styles.searchText}>Search</Text>
              </View>
              <Feather name="bar-chart-2" size={20} color="white" />
            </View>

            {/* Balance Area */}
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceTitle}>Today - INR</Text>
              <Text style={styles.balanceValue}>₹ {displayBalance} </Text>
              <TouchableOpacity style={styles.accountsButton}>
                <Text style={styles.accountsText}>Merchant</Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <Action icon="add" label="Add money" onPress={()=>router.push("/(tabs)/payment")} />
              <Action icon="swap-horizontal" label="Setup Card" onPress={()=>router.push("/(pages)/Setup")} />
              <Action icon="document-text" label="Details" onPress={()=>{router.push('/(pages)/Details')}} />
              <Action icon="ellipsis-horizontal" label="Read" onPress={()=>{router.push("/(pages)/ReadCard")}}/>
            </View>
            {/* Transactions */}
            <View style={styles.transactionsCard}>
              <View style={styles.transactionRow}>
              <Feather name="arrow-up-right" size={24} color="green" />
                {/* <Ionicons name="paper-plane" size={24} color="#3366FF" /> */}
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.transactionTitle}>UTXO Burnt </Text>
                  <Text style={styles.transactionSubtitle}>
                    {JSON.stringify(new Date()).split("T")[0]} · Contract Call · Completed
                  </Text>
                </View>
                <Text style={styles.transactionAmount}>{utxoBurnt}</Text>
              </View>
              <View style={styles.transactionRow}>
              <Feather name="arrow-up-left" size={24} color="red" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.transactionTitle}>UTXO Issued </Text>
                  <Text style={styles.transactionSubtitle}>
                    {JSON.stringify(new Date()).split("T")[0]} · Contract Call · Completed
                  </Text>
                </View>
                <Text style={styles.transactionAmount}>{utxoIssued}</Text>
              </View>


              <TouchableOpacity style={styles.seeAll} onPress={() => router.push('/(tabs)/reciept')}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>


            <View style={{ marginVertical: 20 }}>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 10, fontFamily: 'IBMPlexSans_400Regular' }}>Last 7 Days</Text>
              <BarChart
                data={barData}
                barWidth={32}
                spacing={32}
                barBorderRadius={16}
                initialSpacing={10}
                frontColor="#8E2DE2" // Consistent with theme
                showValuesAsTopLabel={false} // Simplify top labels
                //@ts-ignore
                maxValue={Math.max(...barData.map(item => item.value)) + 1000}
                yAxisThickness={0}
                xAxisThickness={0}
                noOfSections={3}
                isAnimated

                yAxisTextStyle={{ color: 'white', fontFamily: 'IBMPlexSans_400Regular' }}
                xAxisLabelTextStyle={{ color: 'white', fontFamily: "IBMPlexSans_400Regular" }}
              />

            </View>




          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
};

const Action = ({ icon, label , onPress }: { icon: any; label: string , onPress:()=>void }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>

    {label=="Read" ?<MaterialIcons name="barcode-reader" size={24} color="white" />:<Ionicons name={icon} size={24} color="white" />}
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

export default MainScreen;
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingTop: vs(30)
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 10,
  },
  avatar: {
    backgroundColor:'white',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  searchBar: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 35,
  },
  searchText: {
    marginLeft: 5,
    color: '#888',
  },
  balanceContainer: {
    alignItems: 'center',
    marginVertical: 25,
  },
  balanceTitle: {
    color: 'white',
    fontSize: 16,
    fontFamily: "ProximaNovaBold"
  },
  balanceValue: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 5,
    fontFamily: "ProximaNovaExtraBold"

  },
  accountsButton: {
    backgroundColor: '#ffffff22',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  accountsText: {
    color: 'white',
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionLabel: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  promoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
  },
  promoTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  promoSubtitle: {
    color: '#666',
    marginTop: 4,
    fontSize: 12,
  },
  transactionsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionTitle: {
    fontWeight: 'bold',
    fontFamily: "IBMPlexSans_600SemiBold"

  },
  transactionSubtitle: {
    fontSize: 12,
    color: '#666',
    fontFamily: "IBMPlexSans_600SemiBold"

  },
  transactionAmount: {
    fontWeight: '600',
    color: '#333',
    fontFamily: "IBMPlexSans_600SemiBold"

  },
  seeAll: {
    alignItems: 'center',
    marginTop: 10,
  },
  seeAllText: {
    color: '#3366FF',
    fontWeight: '500',
    fontFamily: "IBMPlexSans_600SemiBold"

  },
  calendar: {
    marginBottom: 16,
  },
  selectedDateText: {
    fontSize: 16,
    color: 'blue',
  },
});




