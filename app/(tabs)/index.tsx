import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { ArrowUpRight, ArrowDownRight, QrCode, Send, Wallet, Receipt, Clock, ChevronRight, Users } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  recipient: string;
  timestamp: Date;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [balance] = useState(5000.75);
  const [monthlySpent] = useState(750.25);
  const [monthlyLimit] = useState(2000);
  const [recentTransactions] = useState<Transaction[]>([
    { id: '1', type: 'receive', amount: 250.00, recipient: 'Sarah Johnson', timestamp: new Date(2024, 2, 15, 14, 30) },
    { id: '2', type: 'send', amount: 75.50, recipient: 'Coffee Shop', timestamp: new Date(2024, 2, 15, 10, 15) },
    { id: '3', type: 'send', amount: 120.00, recipient: 'Book Store', timestamp: new Date(2024, 2, 14, 16, 45) },
  ]);

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting('Good Morning');
      else if (hour < 17) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');
    };

    updateGreeting();
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      updateGreeting();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
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

  const spendingProgress = (monthlySpent / monthlyLimit) * 100;

  return (
    <ScrollView 
      style={[styles.container, isDark && styles.containerDark]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <Text style={[styles.greeting, isDark && styles.textDark]}>
            {greeting}, Alex
          </Text>
          <Text style={[styles.date, isDark && styles.textLightDark]}>
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </Animated.View>
      </View>

      <Animated.View 
        entering={FadeInDown.delay(200).duration(600).springify()}
        style={[styles.balanceCard, isDark && styles.balanceCardDark]}
      >
        <Text style={[styles.balanceLabel, isDark && styles.textLightDark]}>
          Total Balance
        </Text>
        <Text style={[styles.balanceAmount, isDark && styles.textDark]}>
          {formatCurrency(balance)}
        </Text>
        <View style={styles.balanceChange}>
          <ArrowUpRight 
            size={20} 
            color="#10B981"
            style={styles.balanceIcon}
          />
          <Text style={styles.balanceChangeText}>+2.4% this week</Text>
        </View>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(400).duration(600).springify()}
        style={styles.quickActions}
      >
        <TouchableOpacity style={[styles.actionButton, isDark && styles.actionButtonDark]}>
          <Send size={24} color={isDark ? '#82B1FF' : '#4D9FFF'} />
          <Text style={[styles.actionText, isDark && styles.textDark]}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, isDark && styles.actionButtonDark]}>
          <Receipt size={24} color={isDark ? '#82B1FF' : '#4D9FFF'} />
          <Text style={[styles.actionText, isDark && styles.textDark]}>Request</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, isDark && styles.actionButtonDark]}>
          <QrCode size={24} color={isDark ? '#82B1FF' : '#4D9FFF'} />
          <Text style={[styles.actionText, isDark && styles.textDark]}>Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, isDark && styles.actionButtonDark]}>
          <Wallet size={24} color={isDark ? '#82B1FF' : '#4D9FFF'} />
          <Text style={[styles.actionText, isDark && styles.textDark]}>Top Up</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            Monthly Budget
          </Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See Details</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.budgetCard, isDark && styles.cardDark]}>
          <View style={styles.budgetInfo}>
            <Text style={[styles.budgetText, isDark && styles.textLightDark]}>
              Spent: {formatCurrency(monthlySpent)}
            </Text>
            <Text style={[styles.budgetText, isDark && styles.textLightDark]}>
              Limit: {formatCurrency(monthlyLimit)}
            </Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${spendingProgress}%` },
                  spendingProgress > 80 && styles.progressWarning
                ]} 
              />
            </View>
            <Text style={[styles.progressText, isDark && styles.textLightDark]}>
              {spendingProgress.toFixed(1)}% used
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            Recent Activity
          </Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {recentTransactions.map((transaction, index) => (
          <Animated.View
            key={transaction.id}
            entering={FadeInRight.delay(index * 200).duration(600).springify()}
            style={[styles.transactionCard, isDark && styles.cardDark]}
          >
            <View style={styles.transactionIcon}>
              {transaction.type === 'send' ? (
                <ArrowUpRight size={20} color="#FF4D4F" />
              ) : (
                <ArrowDownRight size={20} color="#10B981" />
              )}
            </View>
            <View style={styles.transactionInfo}>
              <Text style={[styles.transactionRecipient, isDark && styles.textDark]}>
                {transaction.recipient}
              </Text>
              <Text style={[styles.transactionTime, isDark && styles.textLightDark]}>
                {formatTime(transaction.timestamp)}
              </Text>
            </View>
            <Text 
              style={[
                styles.transactionAmount,
                transaction.type === 'send' ? styles.amountNegative : styles.amountPositive
              ]}
            >
              {transaction.type === 'send' ? '-' : '+'}
              {formatCurrency(transaction.amount)}
            </Text>
          </Animated.View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            Quick Transfer
          </Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.contactsScroll}
        >
          {[...Array(5)].map((_, index) => (
            <TouchableOpacity 
              key={index}
              style={[styles.contactButton, isDark && styles.contactButtonDark]}
            >
              <View style={[styles.contactAvatar, isDark && styles.contactAvatarDark]}>
                <Users size={24} color={isDark ? '#82B1FF' : '#4D9FFF'} />
              </View>
              <Text style={[styles.contactName, isDark && styles.textDark]}>
                Contact {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
  greeting: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceCardDark: {
    backgroundColor: '#1E1E1E',
  },
  balanceLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  balanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceIcon: {
    marginRight: 4,
  },
  balanceChangeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '22%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonDark: {
    backgroundColor: '#1E1E1E',
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  seeAll: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4D9FFF',
  },
  budgetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1E1E1E',
  },
  budgetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  budgetText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  progressContainer: {
    gap: 8,
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4D9FFF',
    borderRadius: 4,
  },
  progressWarning: {
    backgroundColor: '#F59E0B',
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'right',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  transactionRecipient: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  amountPositive: {
    color: '#10B981',
  },
  amountNegative: {
    color: '#FF4D4F',
  },
  contactsScroll: {
    paddingHorizontal: 20,
  },
  contactButton: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  contactButtonDark: {
    backgroundColor: 'transparent',
  },
  contactAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactAvatarDark: {
    backgroundColor: '#2E2E2E',
  },
  contactName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    textAlign: 'center',
  },
  textDark: {
    color: '#FFFFFF',
  },
  textLightDark: {
    color: '#A6A6A6',
  },
});