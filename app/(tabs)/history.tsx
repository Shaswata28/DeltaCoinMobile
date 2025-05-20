import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { ArrowUpRight, ArrowDownRight, Filter, Calendar } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  recipient: string;
  category: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'sent' | 'received'>('all');

  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'receive',
      amount: 250.00,
      recipient: 'Sarah Johnson',
      category: 'Transfer',
      timestamp: new Date(2024, 2, 15, 14, 30),
      status: 'completed'
    },
    {
      id: '2',
      type: 'send',
      amount: 75.50,
      recipient: 'Coffee Shop',
      category: 'Food',
      timestamp: new Date(2024, 2, 15, 10, 15),
      status: 'completed'
    },
    {
      id: '3',
      type: 'send',
      amount: 120.00,
      recipient: 'Book Store',
      category: 'Education',
      timestamp: new Date(2024, 2, 14, 16, 45),
      status: 'failed'
    },
    {
      id: '4',
      type: 'receive',
      amount: 500.00,
      recipient: 'John Smith',
      category: 'Transfer',
      timestamp: new Date(2024, 2, 14, 9, 30),
      status: 'completed'
    },
    {
      id: '5',
      type: 'send',
      amount: 45.00,
      recipient: 'Library Fee',
      category: 'Education',
      timestamp: new Date(2024, 2, 13, 15, 20),
      status: 'pending'
    }
  ]);

  const filteredTransactions = transactions.filter(transaction => {
    if (selectedFilter === 'sent') return transaction.type === 'send';
    if (selectedFilter === 'received') return transaction.type === 'receive';
    return true;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <ScrollView 
      style={[styles.container, isDark && styles.containerDark]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, isDark && styles.titleDark]}>Transaction History</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionButton, isDark && styles.actionButtonDark]}>
              <Filter size={20} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, isDark && styles.actionButtonDark]}>
              <Calendar size={20} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.filterContainer, isDark && styles.filterContainerDark]}>
          {(['all', 'sent', 'received'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive,
                isDark && styles.filterButtonDark,
                selectedFilter === filter && isDark && styles.filterButtonActiveDark
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive,
                isDark && styles.filterTextDark,
                selectedFilter === filter && isDark && styles.filterTextActiveDark
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.transactionList}>
        {filteredTransactions.map((transaction, index) => (
          <Animated.View
            key={transaction.id}
            entering={FadeInDown.delay(index * 100).duration(400)}
            style={[styles.transactionCard, isDark && styles.transactionCardDark]}
          >
            <View style={styles.transactionHeader}>
              <View style={styles.transactionIcon}>
                {transaction.type === 'send' ? (
                  <ArrowUpRight size={20} color="#FF4D4F" />
                ) : (
                  <ArrowDownRight size={20} color="#10B981" />
                )}
              </View>
              <View style={styles.transactionInfo}>
                <Text style={[styles.recipientText, isDark && styles.recipientTextDark]}>
                  {transaction.recipient}
                </Text>
                <Text style={[styles.categoryText, isDark && styles.categoryTextDark]}>
                  {transaction.category}
                </Text>
              </View>
              <Text style={[
                styles.amountText,
                transaction.type === 'send' ? styles.amountNegative : styles.amountPositive
              ]}>
                {transaction.type === 'send' ? '-' : '+'}${transaction.amount.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.transactionFooter}>
              <Text style={[styles.timestampText, isDark && styles.timestampTextDark]}>
                {formatDate(transaction.timestamp)} at {formatTime(transaction.timestamp)}
              </Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(transaction.status)}20` }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(transaction.status) }
                ]}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </Text>
              </View>
            </View>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonDark: {
    backgroundColor: '#1E1E1E',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterContainerDark: {
    backgroundColor: '#1E1E1E',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterButtonDark: {
    backgroundColor: '#1E1E1E',
  },
  filterButtonActive: {
    backgroundColor: '#FFD700',
  },
  filterButtonActiveDark: {
    backgroundColor: '#FFD700',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  filterTextDark: {
    color: '#A6A6A6',
  },
  filterTextActive: {
    color: '#2C2C2C',
    fontFamily: 'Inter-SemiBold',
  },
  filterTextActiveDark: {
    color: '#2C2C2C',
    fontFamily: 'Inter-SemiBold',
  },
  transactionList: {
    padding: 20,
    gap: 12,
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionCardDark: {
    backgroundColor: '#1E1E1E',
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  recipientText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#2C2C2C',
    marginBottom: 2,
  },
  recipientTextDark: {
    color: '#FFFFFF',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  categoryTextDark: {
    color: '#A6A6A6',
  },
  amountText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  amountPositive: {
    color: '#10B981',
  },
  amountNegative: {
    color: '#FF4D4F',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestampText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  timestampTextDark: {
    color: '#A6A6A6',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});