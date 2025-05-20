import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  recipient: string;
  timestamp: Date;
  category?: string;
  status: 'completed' | 'pending' | 'failed';
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  onTransactionPress?: (transaction: Transaction) => void;
}

export function TransactionHistory({ transactions, onTransactionPress }: TransactionHistoryProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
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
    <View style={styles.container}>
      {transactions.map((transaction, index) => (
        <Animated.View
          key={transaction.id}
          entering={FadeInRight.delay(index * 100).duration(400)}
        >
          <TouchableOpacity
            style={[styles.transactionCard, isDark && styles.transactionCardDark]}
            onPress={() => onTransactionPress?.(transaction)}
          >
            <View style={[
              styles.iconContainer,
              isDark && styles.iconContainerDark,
              { backgroundColor: transaction.type === 'send' ? '#FEE2E2' : '#DCFCE7' }
            ]}>
              {transaction.type === 'send' ? (
                <ArrowUpRight size={20} color="#EF4444" />
              ) : (
                <ArrowDownRight size={20} color="#10B981" />
              )}
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.mainDetails}>
                <Text style={[styles.recipient, isDark && styles.recipientDark]}>
                  {transaction.recipient}
                </Text>
                <Text style={[
                  styles.amount,
                  transaction.type === 'send' ? styles.amountNegative : styles.amountPositive
                ]}>
                  {transaction.type === 'send' ? '-' : '+'}
                  {formatAmount(transaction.amount)}
                </Text>
              </View>

              <View style={styles.subDetails}>
                <View style={styles.leftSubDetails}>
                  <Text style={[styles.time, isDark && styles.timeDark]}>
                    {formatTime(transaction.timestamp)}
                  </Text>
                  {transaction.category && (
                    <Text style={[styles.category, isDark && styles.categoryDark]}>
                      • {transaction.category}
                    </Text>
                  )}
                </View>
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
            </View>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  transactionCard: {
    flexDirection: 'row',
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerDark: {
    opacity: 0.8,
  },
  detailsContainer: {
    flex: 1,
  },
  mainDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recipient: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#2C2C2C',
  },
  recipientDark: {
    color: '#FFFFFF',
  },
  amount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  amountPositive: {
    color: '#10B981',
  },
  amountNegative: {
    color: '#EF4444',
  },
  subDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSubDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  timeDark: {
    color: '#A6A6A6',
  },
  category: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 4,
  },
  categoryDark: {
    color: '#A6A6A6',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});