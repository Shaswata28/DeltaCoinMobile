import React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Modal,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Calendar,
  X,
  Check,
  Coffee,
  Book,
  Beaker,
  Users,
  MoreHorizontal,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  getUserTransactions,
  getTransactionsByCategory,
  getTransactionsByDateRange,
} from '../../supabase/db';
import { Transaction as TransactionType } from '../../supabase/client';
import MonthYearPicker from '../../components/common/MonthYearPicker';
import { CategoryFilterModal } from '../../components/common/FilterModal';
interface Transaction extends TransactionType {
  status: 'completed' | 'pending' | 'failed';
  recipient: string;
}

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'sent' | 'received'
  >('all');

  // State variables for data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // State variables for pagination
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 10;

  // New state variables for filter and date modals
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // Add new state for year/month selection in the modal
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Categories for filter - updated based on transaction type
  const sentCategories = [
    'All Categories',
    'Canteen',
    'Library',
    'Lab',
    'Club',
    'Other',
  ];

  const receivedCategories = ['All Categories', 'topup'];

  // Update years array to show last 10 years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // Update months array to include value and label
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(currentYear, i).toLocaleString('default', {
      month: 'long',
    }),
  }));

  // Generate months and years for scrollable date picker
  const generateMonthsAndYears = () => {
    const months = [
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
    ];
    const currentYear = new Date().getFullYear();
    const years = [
      currentYear - 2,
      currentYear - 1,
      currentYear,
      currentYear + 1,
    ];

    const monthYearOptions = ['All Time'];

    years.forEach((year) => {
      months.forEach((month) => {
        monthYearOptions.push(`${month} ${year}`);
      });
    });

    return monthYearOptions;
  };

  const monthYearOptions = generateMonthsAndYears();

  // Function to load transactions from Supabase
  const loadTransactions = async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);

      if (refresh) {
        setPage(0);
        setHasMore(true);
      }

      let data: TransactionType[] = [];

      // Determine which API to call based on filters
      if (selectedCategory && selectedCategory !== 'All Categories') {
        data = await getTransactionsByCategory(selectedCategory);
      } else if (selectedMonth && selectedMonth !== 'All Time') {
        // Convert month name and year to date range
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

        // Create start and end dates for the month
        const startDate = `${year}-${String(monthIndex + 1).padStart(
          2,
          '0'
        )}-01`;
        const lastDay = new Date(parseInt(year), monthIndex + 1, 0).getDate();
        const endDate = `${year}-${String(monthIndex + 1).padStart(
          2,
          '0'
        )}-${lastDay}`;

        data = await getTransactionsByDateRange(startDate, endDate);
      } else {
        // Get paginated transactions
        data = await getUserTransactions(ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
      }

      // Map the data to include UI-specific fields
      const mappedData: Transaction[] = data.map((transaction) => ({
        ...transaction,
        status: 'completed', // Default status
        recipient: getRecipientFromCategory(
          transaction.category,
          transaction.type
        ),
      }));

      if (refresh || page === 0) {
        setTransactions(mappedData);
      } else {
        setTransactions((prev) => [...prev, ...mappedData]);
      }

      // Check if we have more data to load
      setHasMore(data.length === ITEMS_PER_PAGE);
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Helper function to get recipient name from category
  const getRecipientFromCategory = (category: string, type: string): string => {
    if (type === 'income') return 'Account Top-up';

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

  // Load transactions on mount and when filters change
  useEffect(() => {
    loadTransactions(true);
  }, [selectedCategory, selectedMonth]);

  // Function to handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadTransactions(true);
  };

  // Function to load more data when scrolling
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      loadTransactions();
    }
  };

  // Get categories based on selected filter
  const getCategories = () => {
    if (selectedFilter === 'sent') return sentCategories;
    if (selectedFilter === 'received') return receivedCategories;
    return [...new Set([...sentCategories, ...receivedCategories])];
  };

  // Filter transactions based on type (all, sent, received)
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
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.titleDark]}>
          Transaction History
        </Text>

        {/* Tabs */}
        <View style={[styles.tabs, isDark && styles.tabsDark]}>
          {(['all', 'sent', 'received'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.tab,
                selectedFilter === filter && styles.activeTab,
                isDark && styles.tabDark,
                selectedFilter === filter && isDark && styles.activeTabDark,
              ]}
              onPress={() => {
                setSelectedFilter(filter);
                setSelectedCategory(null);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedFilter === filter && styles.activeTabText,
                  isDark && styles.tabTextDark,
                  selectedFilter === filter &&
                    isDark &&
                    styles.activeTabTextDark,
                ]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Filter buttons below tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, isDark && styles.filterButtonDark]}
            onPress={() => setFilterModalVisible(true)}
          >
            <Filter size={20} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, isDark && styles.filterButtonDark]}
            onPress={() => setDateModalVisible(true)}
          >
            <Calendar size={20} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
          </TouchableOpacity>
        </View>

        {/* Active filters display */}
        {(selectedCategory || selectedMonth) && (
          <View style={styles.activeFilters}>
            {selectedCategory && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{selectedCategory}</Text>
                <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                  <X size={14} color="#2C2C2C" />
                </TouchableOpacity>
              </View>
            )}
            {selectedMonth && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{selectedMonth}</Text>
                <TouchableOpacity onPress={() => setSelectedMonth(null)}>
                  <X size={14} color="#2C2C2C" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Loading indicator */}
      {loading && page === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      )}

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
            {error}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadTransactions(true)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Transaction list */}
      {!loading && !error && (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.transactionList}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshing={refreshing && !loading}
          onRefresh={handleRefresh}
          ListFooterComponent={
            loading && hasMore ? (
              <ActivityIndicator
                size="small"
                color="#FFD700"
                style={{ marginVertical: 20 }}
              />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text
                style={[
                  styles.emptyStateText,
                  isDark && styles.emptyStateTextDark,
                ]}
              >
                No transactions found
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInDown.delay(index * 100).duration(400)}
              style={[
                styles.transactionCard,
                isDark && styles.transactionCardDark,
              ]}
            >
              <View style={styles.transactionHeader}>
                <View style={styles.transactionIcon}>
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
            </Animated.View>
          )}
        />
      )}

      {/* Filter Modal */}
      <CategoryFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
        categories={getCategories()} // Example: ['Canteen', 'Library', ...]
        isDark={isDark}
      />

      {/* Date Modal */}
      <MonthYearPicker
        visible={dateModalVisible}
        onClose={() => {
          setDateModalVisible(false);
          setSelectedYear(null);
        }}
        onSelect={(value: string) => {
          // The MonthYearPicker now sends "YYYY-MM" format
          if (value === 'All Time') {
            setSelectedMonth(null);
          } else {
            // Parse the YYYY-MM format to display format
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
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
    marginBottom: 24,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 6,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabsDark: {
    backgroundColor: '#1E1E1E',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabDark: {
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#FFD700',
  },
  activeTabDark: {
    backgroundColor: '#FFD700',
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  tabTextDark: {
    color: '#A6A6A6',
  },
  activeTabText: {
    color: '#2C2C2C',
    fontFamily: 'Inter-SemiBold',
  },
  activeTabTextDark: {
    color: '#2C2C2C',
    fontFamily: 'Inter-SemiBold',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  filterButton: {
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
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  filterBadgeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2C2C2C',
  },
  transactionList: {
    padding: 20,
    gap: 16,
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
    gap: 12,
    marginBottom: 12,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '50%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContentDark: {
    backgroundColor: '#1E1E1E',
  },
  modalScrollContent: {
    paddingVertical: 8,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 4,
  },
  modalItemDark: {
    backgroundColor: 'transparent',
  },
  modalItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#2C2C2C',
  },
  modalItemTextDark: {
    color: '#FFFFFF',
  },
  selectedItem: {
    backgroundColor: '#FFD700',
  },
  monthPickerContainer: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  monthPickerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardDark: {
    backgroundColor: '#1E1E1E',
  },
  textDark: {
    color: '#FFFFFF',
  },
});
