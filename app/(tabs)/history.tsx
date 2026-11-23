import { SegmentedTabs } from '@/components/common/SegmentedTabs';
import React from 'react';
import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Modal,
  FlatList,
  ActivityIndicator,
  AppState,
} from 'react-native';
import { ArrowUpRight, ArrowDownRight, Filter, Calendar, X, Check, Coffee, Book, Beaker, Users, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';
import {
  getUserTransactions,
  getTransactionsByCategory,
  getTransactionsByDateRange,
  onTransactionCreated,
} from '../../supabase/db';
import { supabase, type Transaction as TransactionType } from '../../supabase/client';
import MonthYearPicker from '../../components/common/MonthYearPicker';
import { CategoryFilterModal } from '../../components/common/FilterModal';

interface Transaction extends TransactionType {
  status: 'completed' | 'pending' | 'failed';
  recipient: string;
}

let historySubscriptionId = 0;

const formatMonthDisplay = (monthString: string | null): string | null => {
  if (!monthString) return null;
  
  try {
    const [year, month] = monthString.split('-');
    const monthIndex = parseInt(month) - 1;
    const monthName = new Date(parseInt(year), monthIndex).toLocaleString('default', { month: 'long' });
    return `${monthName} ${year}`;
  } catch (error) {
    return monthString;
  }
};

const getRecipientFromCategory = (category: string, type: string): string => {
  if (category === 'transfer') return type === 'income' ? 'Money received' : 'Money sent';
  if (type === 'income') return 'Account top-up';

  switch (category) {
    case 'Canteen':
      return 'Main Canteen';
    case 'Library':
      return 'Central Library';
    case 'Lab':
      return 'Computer Lab';
    case 'Club':
      return category + ' Activities';
    default:
      return category;
  }
};

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'sent' | 'received'
  >('all');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const latestRequest = useRef(0);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const sentCategories = [
    'All Categories',
    'Canteen',
    'Library',
    'Lab',
    'Club',
    'Other',
  ];

  const receivedCategories = ['All Categories', 'topup'];

  const loadTransactions = useCallback(async (refresh = false, silent = false) => {
    const request = ++latestRequest.current;
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (!silent) {
        setLoading(true);
      }
      if (!silent) setError(null);

      let data: TransactionType[] = [];

      const category = selectedCategory && selectedCategory !== 'All Categories' ? selectedCategory : undefined;
      if (selectedMonth && selectedMonth !== 'All Time') {
        const [monthName, year] = selectedMonth.split(' ');
        const monthIndex = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ].indexOf(monthName);

        const startDate = `${year}-${String(monthIndex + 1).padStart(
          2,
          '0'
        )}-01`;
        const lastDay = new Date(parseInt(year), monthIndex + 1, 0).getDate();
        const endDate = `${year}-${String(monthIndex + 1).padStart(
          2,
          '0'
        )}-${lastDay}`;

        data = await getTransactionsByDateRange(startDate, endDate, category);
      } else if (category) {
        data = await getTransactionsByCategory(category);
      } else {
        data = await getUserTransactions();
      }

      const mappedData: Transaction[] = data.map((transaction) => ({
        ...transaction,
        status: transaction.status ?? 'completed',
        recipient: getRecipientFromCategory(
          transaction.category,
          transaction.type
        ),
      }));

      if (request === latestRequest.current) {
        setTransactions(mappedData);
        setError(null);
      }
    } catch (err) {
      if (request === latestRequest.current && !silent) setError('Failed to load transactions');
    } finally {
      if (request === latestRequest.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [selectedCategory, selectedMonth]);

  useFocusEffect(useCallback(() => {
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const queueRefresh = () => {
      if (!active || AppState.currentState === 'background') return;
      clearTimeout(timer);
      timer = setTimeout(() => void loadTransactions(false, true), 120);
    };

    const unsubscribeLocal = onTransactionCreated(queueRefresh);
    void loadTransactions(false);
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active || !session) return;
      channel = supabase.channel(`transaction-history-${++historySubscriptionId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${session.user.id}`,
        }, queueRefresh)
        .subscribe(status => {
          if (status === 'SUBSCRIBED') queueRefresh();
        });
    }).catch(() => {
      // Keep the focused refresh interval available if Realtime cannot start.
    });

    const foreground = AppState.addEventListener('change', state => {
      if (state === 'active') queueRefresh();
    });
    // Keep older Supabase projects current even before Realtime is enabled for the table.
    const fallback = setInterval(queueRefresh, 15_000);

    return () => {
      active = false;
      latestRequest.current++;
      clearTimeout(timer);
      clearInterval(fallback);
      unsubscribeLocal();
      foreground.remove();
      if (channel) void supabase.removeChannel(channel);
    };
  }, [loadTransactions]));

  const handleRefresh = () => {
    loadTransactions(true);
  };

  const getCategories = () => {
    if (selectedFilter === 'sent') return sentCategories;
    if (selectedFilter === 'received') return receivedCategories;
    return [...new Set([...sentCategories, ...receivedCategories])];
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (selectedFilter === 'sent' && transaction.type !== 'expense')
      return false;
    if (selectedFilter === 'received' && transaction.type !== 'income')
      return false;
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
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
    <View style={[styles.container, isDark && styles.containerDark]}>
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.transactionList}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={<>
          <View style={styles.header}>
            <Text style={[styles.title, isDark && styles.titleDark]}>
              History
            </Text>

            <View style={styles.filterTabs}>
              <SegmentedTabs
                value={selectedFilter}
                onChange={(filter) => {
                  setSelectedFilter(filter);
                  setSelectedCategory(null);
                }}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'sent', label: 'Sent' },
                  { value: 'received', label: 'Received' },
                ]}
              />
            </View>

            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[styles.filterButton, isDark && styles.filterButtonDark]}
                accessibilityRole="button"
                onPress={() => setFilterModalVisible(true)}
              >
                <Filter size={16} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
                <Text style={[styles.filterBadgeText, isDark && styles.filterBadgeTextDark]}>Category</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterButton, isDark && styles.filterButtonDark]}
                accessibilityRole="button"
                onPress={() => setDateModalVisible(true)}
              >
                <Calendar size={16} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
                <Text style={[styles.filterBadgeText, isDark && styles.filterBadgeTextDark]}>Month</Text>
              </TouchableOpacity>
            </View>

            {(selectedCategory || selectedMonth) && (
              <View style={styles.activeFilters}>
                {selectedCategory && selectedCategory !== 'All Categories' && (
                  <View style={[styles.filterBadge, isDark && styles.filterBadgeDark]}>
                    <Text style={[styles.filterBadgeText, isDark && styles.filterBadgeTextDark]}>
                      {selectedCategory}
                    </Text>
                    <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                      <X size={14} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
                    </TouchableOpacity>
                  </View>
                )}
                {selectedMonth && selectedMonth !== 'All Time' && (
                  <View style={[styles.filterBadge, isDark && styles.filterBadgeDark]}>
                    <Text style={[styles.filterBadgeText, isDark && styles.filterBadgeTextDark]}>
                      {selectedMonth}
                    </Text>
                    <TouchableOpacity onPress={() => setSelectedMonth(null)}>
                      <X size={14} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
                {error}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => loadTransactions(false)}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

        </>}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {loading && <ActivityIndicator color="#B88700" />}
            <Text
              style={[
                styles.emptyStateText,
                isDark && styles.emptyStateTextDark,
              ]}
            >
              {loading ? 'Loading transactions' : 'No transactions found'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.transactionCard,
              isDark && styles.transactionCardDark,
            ]}
          >
            <View style={styles.transactionHeader}>
              <View style={[styles.transactionIcon, isDark && { backgroundColor: '#303030' }]}>
                {item.type === 'expense' ? (
                  <ArrowUpRight size={20} color="#FF4D4F" />
                ) : (
                  <ArrowDownRight size={20} color="#52C41A" />
                )}
              </View>
              <View style={styles.transactionInfo}>
                <Text
                  style={[
                    styles.recipientText,
                    isDark && styles.recipientTextDark,
                  ]}
                >
                  {item.recipient}
                </Text>
                <Text
                  style={[
                    styles.categoryText,
                    isDark && styles.categoryTextDark,
                  ]}
                >
                  {item.category}
                </Text>
              </View>
              <Text
                style={[
                  styles.amountText,
                  item.type === 'expense'
                    ? styles.amountNegative
                    : styles.amountPositive,
                ]}
              >
                {item.type === 'expense' ? '-' : '+'}৳
                {parseFloat(item.amount.toString()).toFixed(2)}
              </Text>
            </View>

            <View style={styles.transactionFooter}>
              <Text
                style={[
                  styles.timestampText,
                  isDark && styles.timestampTextDark,
                ]}
              >
                {formatDate(item.date)} at {formatTime(item.created_at)}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(item.status)}20` },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        )}
      />

      <CategoryFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
        categories={getCategories()}
        isDark={isDark}
      />

      <MonthYearPicker
        visible={dateModalVisible}
        onClose={() => {
          setDateModalVisible(false);
        }}
        onSelect={(value: string) => {
          if (value === 'All Time') {
            setSelectedMonth(null);
          } else {
            const [year, month] = value.split('-');
            const monthName = new Date(
              parseInt(year),
              parseInt(month) - 1
            ).toLocaleString('default', { month: 'long' });
            setSelectedMonth(`${monthName} ${year}`);
          }
          setDateModalVisible(false);
        }}
        selectedValue={
          selectedMonth ? selectedMonth.split(' ').reverse().join('-') : null
        }
      />
    </View>
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
    paddingHorizontal: 0,
    paddingTop: 14,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
    marginBottom: 24,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  filterTabs: { marginBottom: 12 },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  filterButton: {
    minHeight: 44,
    paddingHorizontal: 13,
    flexDirection: 'row',
    gap: 7,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonDark: {
    backgroundColor: '#1E1E1E',
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterBadgeDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2E2E2E',
  },
  filterBadgeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2C2C2C',
  },
  filterBadgeTextDark: {
    color: '#FFFFFF',
  },
  transactionList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 8,
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
  },
  transactionCardDark: {
    backgroundColor: '#1E1E1E',
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  recipientText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    marginBottom: 4,
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
    color: '#52C41A',
  },
  amountNegative: {
    color: '#FF4D4F',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  timestampText: {
    fontSize: 14,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyStateTextDark: {
    color: '#A6A6A6',
  },
  errorContainer: {
    flex: 1,
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
  errorTextDark: {
    color: '#FF7875',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFD700',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
  },
});
