import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, useColorScheme } from 'react-native';
import { ArrowUpRight, ArrowDownRight, Send, Wallet, CirclePlus as PlusCircle, Clock, CircleHelp as HelpCircle } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  recipient: string;
  timestamp: Date;
}

interface WalletData {
  balance: number;
  monthlySpent: number;
  monthlyLimit: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    monthlySpent: 0,
    monthlyLimit: 2000, // Default limit
  });
  
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [userName, setUserName] = useState('');

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

  useEffect(() => {
    if (!user) return;
    
    fetchUserData();
    setupRealtimeSubscription();
    
    return () => {
      supabase.removeAllChannels();
    };
  }, [user]);

  const setupRealtimeSubscription = () => {
    const walletChannel = supabase
      .channel('wallet_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'wallets',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          setWalletData(prev => ({
            ...prev,
            balance: payload.new.balance,
          }));
        }
      )
      .subscribe();

    const transactionChannel = supabase
      .channel('transaction_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `wallet_id=eq.${user?.id}`,
        },
        () => {
          fetchUserData(); // Refresh all data when transactions change
        }
      )
      .subscribe();
  };

  const fetchUserData = async () => {
    try {
      if (!user) return;

      // Fetch user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single();
      
      if (userError) throw userError;
      setUserName(userData.full_name);

      // Fetch wallet data
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('user_id', user.id)
        .single();
      
      if (walletError) throw walletError;

      // Calculate monthly spending
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyTransactions, error: transactionError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'send')
        .gte('created_at', startOfMonth.toISOString())
        .eq('wallet_id', walletData.id);

      if (transactionError) throw transactionError;

      const monthlySpent = monthlyTransactions.reduce((sum, tx) => sum + tx.amount, 0);

      setWalletData({
        balance: walletData.balance,
        monthlySpent,
        monthlyLimit: 2000, // Could be fetched from user preferences
      });

      // Fetch recent transactions
      const { data: recentTxs, error: recentTxError } = await supabase
        .from('transactions')
        .select('*')
        .eq('wallet_id', walletData.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentTxError) throw recentTxError;

      setRecentTransactions(recentTxs.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        recipient: tx.recipient,
        timestamp: new Date(tx.created_at),
      })));

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

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

  const spendingProgress = (walletData.monthlySpent / walletData.monthlyLimit) * 100;

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, isDark && styles.containerDark]}>
        <Text style={[styles.loadingText, isDark && styles.textDark]}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, isDark && styles.containerDark]}>
        <Text style={[styles.errorText, isDark && styles.textDark]}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, isDark && styles.containerDark]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <Text style={[styles.greeting, isDark && styles.textDark]}>
            {greeting}, {userName}
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
        <View style={[styles.cardLeftSection, isDark && styles.cardLeftSectionDark]}>
          <Wallet size={48} color="#FFD700" />
        </View>
        <View style={[styles.cardRightSection, isDark && styles.cardRightSectionDark]}>
          <Text style={[styles.balanceLabel, isDark && styles.textLightDark]}>
            Available Balance
          </Text>
          <Text style={[styles.balanceAmount, isDark && styles.textDark]}>
            {formatCurrency(walletData.balance)}
          </Text>
        </View>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(400).duration(600).springify()}
        style={styles.quickActions}
      >
        <TouchableOpacity 
          style={[styles.actionButton, isDark && styles.actionButtonDark]}
          onPress={() => router.push('/transactions')}
        >
          <Send size={24} color="#FFD700" />
          <Text style={[styles.actionText, isDark && styles.textDark]}>Pay</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, isDark && styles.actionButtonDark]}
          onPress={() => router.push('/transactions')}
        >
          <PlusCircle size={24} color="#4D9FFF" />
          <Text style={[styles.actionText, isDark && styles.textDark]}>Top-up</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, isDark && styles.actionButtonDark]}
          onPress={() => router.push('/history')}
        >
          <Clock size={24} color="#10B981" />
          <Text style={[styles.actionText, isDark && styles.textDark]}>History</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, isDark && styles.actionButtonDark]}
          onPress={() => router.push('/help')}
        >
          <HelpCircle size={24} color="#A78BFA" />
          <Text style={[styles.actionText, isDark && styles.textDark]}>Help</Text>
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
              Spent: {formatCurrency(walletData.monthlySpent)}
            </Text>
            <Text style={[styles.budgetText, isDark && styles.textLightDark]}>
              Limit: {formatCurrency(walletData.monthlyLimit)}
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
          <TouchableOpacity onPress={() => router.push('/history')}>
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#2C2C2C',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FF4D4F',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4D9FFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
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
    flexDirection: 'row',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
    height: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceCardDark: {
    backgroundColor: '#1E1E1E',
  },
  cardLeftSection: {
    width: 100,
    backgroundColor: '#2C3E50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLeftSectionDark: {
    backgroundColor: '#2C3E50',
  },
  cardRightSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    justifyContent: 'center',
  },
  cardRightSectionDark: {
    backgroundColor: '#1E1E1E',
  },
  balanceLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    textAlign: 'center',
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
  textDark: {
    color: '#FFFFFF',
  },
  textLightDark: {
    color: '#A6A6A6',
  },
});