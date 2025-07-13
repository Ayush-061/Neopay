
import { supabase } from '@/utils/supabase'; // Import Supabase client
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { vs } from 'react-native-size-matters';

//@ts-ignore
import { LinearGradient } from 'expo-linear-gradient';

//@ts-ignore
import CalendarPicker from 'react-native-calendar-picker';
import { useAccount } from 'wagmi';

type TransactionType = 'income' | 'expense';

interface Transaction {
  type:"created"|"burnt";
  utxoId:string;
  owner:string;
  amount:string|number;
  created_at:string|Date;
}



const filterOptions = ['All', 'Burnt', 'Issued'];

const TransactionsScreen = () => {
  const sampleAdress = "0x0a0A0a0a0A0a0A0a0A0a0A0a0A0a0A0a0A0a0A0a"
  const [filter, setFilter] = useState('All');
  const sample = true
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [fontsLoaded] = useFonts({
    "ProximaNova": require('@/assets/fonts/proximanova_black.otf'),
    "ProximaNovaBold": require('@/assets/fonts/proximanova_bold.otf'),
    "ProximaNovaRegular": require('@/assets/fonts/proximanova_regular.ttf'),
    "ProximaNovaExtraBold": require('@/assets/fonts/proximanova_extrabold.otf'),
    "ProximaNovaBoldItalic": require('@/assets/fonts/proximanova_boldit.otf'),
  });

    const { address, isConnected } = useAccount();
  

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format
    fetchTransactions(today);
  }, []);

  useEffect(() => {
    if(selectedDate)
    fetchTransactions(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (date:any) => {
    const formattedDate = new Date(date).toISOString().split("T")[0];
    console.log("Formatted:", formattedDate); // e.g., 2025-05-05
    //@ts-ignore
    setSelectedDate(formattedDate);
  
    setModalVisible(false);
  };

  const fetchTransactions = async (today: string) => {
    setLoading(true);
    try {
      // Fetch transactions from the database for today
      const { data, error } = await supabase
        .from('Transactions')
        .select('utxoId, owner, amount, type, created_at')
        .eq("owner" , sample?sampleAdress:address)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);

      if (error) {
        console.error('Error fetching transactions:', error);
      } else {
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'All') return true;
    return filter === 'Burnt' ? tx.type === 'burnt' : tx.type === 'created';
  });

  return (
       <LinearGradient colors={['#f5efff', '#f0f4ff']} style={styles.container}>
             <StatusBar barStyle="dark-content" />
             <SafeAreaView style={styles.safeArea}>
      <Text style={[styles.header, { fontFamily: "ProximaNovaBoldItalic", marginLeft: vs(5) }]}>Receipts</Text>

      {/* Filter Options */}
      <View style={styles.filters}>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.filterButton,
              filter === option && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(option)}
          >
            <Text
              style={[
                styles.filterText,
                filter === option && styles.filterTextActive,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>


        ))}
                  <TouchableOpacity style={styles.filterButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.filterText}>Select Date</Text>
          </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {loading && <Text style={{fontFamily:"ProximaNovaExtraBold"}}>Loading transactions...</Text>}

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.utxoId}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={{fontFamily:"ProximaNovaExtraBold"}}>No Transactions for this date</Text>}
        renderItem={({ item }) => (
          <View style={styles.transactionCard}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={item.type === 'burnt' ? 'arrow-down-circle' : 'arrow-up-circle'}
                size={24}
                color={item.type === 'burnt' ? '#4CAF50' : '#F44336'}
              />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionTitle}>{item.owner}</Text>
              <Text style={styles.transactionSubtitle}>
                {item.utxoId} • {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                { color: item.type ==="burnt" ? '#4CAF50' : '#F44336' },
              ]}
            >
              {item.type=="burnt" ? `+₹${Number(item.amount).toFixed(2)}` : `-₹${Math.abs(Number(item.amount)).toFixed(2)}`}
            </Text>
          </View>
        )}
      />
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.calendarContainer}>
            <CalendarPicker onDateChange={handleDateChange} />
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{fontSize:vs(15) , marginLeft:vs(10)}}>❌</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </LinearGradient>
  );
};

export default TransactionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: 20,
    // paddingTop: vs(20),
    // paddingBottom:vs(36)
  },
  safeArea: {
    paddingHorizontal: 20,
    paddingTop:50
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginVertical: 20,
    fontFamily: "ProximaNovaBold",
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#007bff',
  },
  filterText: {
    color: '#555',
    fontWeight: '500',
    fontFamily: "ProximaNova",
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    paddingBottom: 30,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  transactionTitle: {
    fontWeight: '600',
    fontSize: 16,
    fontFamily: "ProximaNova",
  },
  transactionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontFamily: "ProximaNovaRegular",
  },
  transactionAmount: {
    fontWeight: '600',
    fontSize: 16,
    fontFamily: "ProximaNova",
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding:vs(10)
  },
  calendarContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    fontSize:vs(10)
  },
});

