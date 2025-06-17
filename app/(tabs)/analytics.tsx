import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, useWindowDimensions, ActivityIndicator, Platform, Modal, TextInput, Alert } from 'react-native';
import { Wallet, TrendingUp, ArrowDownRight, ArrowUpRight, Filter, Calendar, Coffee, Book, Beaker, Users, X, MoveHorizontal as MoreHorizontal, Download, Bell, Plus, Edit } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { 
  getUserWallet, 
  getUserTransactions, 
  getCategorySpending, 
  getBudgetProgress 
} from '../../supabase/db';
import { supabase } from '../../supabase/client';
import MonthPicker from '../../components/common/MonthYearPicker';
import { generateAnalyticsPDF } from '../../utils/pdfGenerator';

interface CategoryData {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  icon: React.ReactNode;
  color: string;
}

interface BudgetCategory extends CategoryData {
  limit: number;
  notifications: boolean;
}

// Function to get the current month in YYYY-MM format
const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width: windowWidth } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<'analytics' | 'budget'>('analytics');
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [isLoading, setIsLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');
  
  // State for category data
  const [categories, setCategories] = useState<CategoryData[]>([]);
  
  // State for budget data
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  
  // Add new state variables for calendar and budget creation
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [newBudget, setNewBudget] = useState({
    canteen: '',
    library: '',
    lab: '',
    club: '',
    other: ''
  });
  
  // Add new state for year selection
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Function to handle month selection
  const handleMonthSelect = (month: string) => {
    try {
      // The MonthYearPicker now sends "YYYY-MM" format directly
      // Validate the format
      const [year, monthNum] = month.split('-');
      if (!year || !monthNum || monthNum.length !== 2) {
        throw new Error('Invalid date format');
      }
      
      const monthInt = parseInt(monthNum, 10);
      if (monthInt < 1 || monthInt > 12) {
        throw new Error('Invalid month');
      }
      
      console.log('Selected month:', month);
      setSelectedMonth(month);
      setShowMonthPicker(false);
      loadAnalyticsData(month);
    } catch (error) {
      console.error('Error handling month selection:', error);
      // Keep the current selected month if there's an error
      Alert.alert('Invalid Date', 'Please select a valid month and year');
    }
  };
  
  // Function to load analytics data
  const loadAnalyticsData = async (month = selectedMonth) => {
    try {
      setIsLoading(true);
      
      // Get wallet balance
      const wallet = await getUserWallet();
      if (wallet) {
        setWalletBalance(Number(wallet.balance));
      }
      
      // Get transactions count for the selected month
      const transactions = await getUserTransactions();
      const filteredTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.created_at);
        const txMonth = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
        return txMonth === month;
      });
      setTransactionCount(filteredTransactions.length);
      
      if (filteredTransactions.length > 0) {
        // Format last updated time
        const lastTxDate = new Date(filteredTransactions[0].created_at);
        const hours = Math.floor((Date.now() - lastTxDate.getTime()) / (1000 * 60 * 60));
        setLastUpdated(`${hours}h ago`);
      }
      
      // Get category spending for the selected month
      const categorySpending = await getCategorySpending(month);
      
      // Calculate total spent
      const totalSpent = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);
      
      // Create category data with icons and colors
      const categoryData: CategoryData[] = [];
      
      // Define category icons and colors
      const categoryIcons: Record<string, { icon: React.ReactNode, color: string }> = {
        Canteen: { icon: <Coffee size={24} color="#FFD700" />, color: '#FFD700' },
        Library: { icon: <Book size={24} color="#4D9FFF" />, color: '#4D9FFF' },
        Lab: { icon: <Beaker size={24} color="#FF6B6B" />, color: '#FF6B6B' },
        Club: { icon: <Users size={24} color="#10B981" />, color: '#10B981' },
        Other: { icon: <MoreHorizontal size={24} color="#A78BFA" />, color: '#A78BFA' }
      };
      
      // Convert spending data to category data format
      Object.entries(categorySpending).forEach(([category, amount], index) => {
        const percentage = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
        const iconData = categoryIcons[category.charAt(0).toUpperCase() + category.slice(1)] || 
                        { icon: <MoreHorizontal size={24} color="#A78BFA" />, color: '#A78BFA' };
        
        categoryData.push({
          id: String(index + 1),
          name: category.charAt(0).toUpperCase() + category.slice(1),
          amount,
          percentage,
          icon: iconData.icon,
          color: iconData.color
        });
      });
      
      // Sort categories by amount (highest first)
      categoryData.sort((a, b) => b.amount - a.amount);
      setCategories(categoryData);
      
      // Load budget data for the selected month
      const budgetProgress = await getBudgetProgress(month);
      const budgetData: BudgetCategory[] = [];
      
      // Get existing budget notifications settings or set defaults
      const existingBudgetSettings = budgets.reduce((acc, budget) => {
        acc[budget.name.toLowerCase()] = budget.notifications;
        return acc;
      }, {} as Record<string, boolean>);
      
      // Convert budget progress to budget category format
      budgetProgress.forEach((item, index) => {
        const categoryName = item.category; // Already properly cased from getBudgetProgress
        const iconData = categoryIcons[categoryName] || 
                        { icon: <MoreHorizontal size={24} color="#A78BFA" />, color: '#A78BFA' };
        
        budgetData.push({
          id: String(index + 1),
          name: categoryName,
          amount: item.spent,
          limit: item.limit,
          percentage: Math.round(item.percentage),
          icon: iconData.icon,
          color: iconData.color,
          notifications: existingBudgetSettings[categoryName.toLowerCase()] ?? true
        });
      });
      
      setBudgets(budgetData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to create a new budget
  const createNewBudget = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      // Convert empty strings to 0 and ensure proper casing for category names
      const budgetValues = {
        canteen: Number(newBudget.canteen) || 0,
        library: Number(newBudget.library) || 0,
        lab: Number(newBudget.lab) || 0,
        club: Number(newBudget.club) || 0,
        other: Number(newBudget.other) || 0
      };
      
      // Check if a budget already exists for this month
      const { data: existingBudget } = await supabase
        .from('budgets')
        .select('id')
        .eq('user_id', user.id)
        .eq('month', selectedMonth)
        .single();
      
      if (existingBudget) {
        // Update existing budget
        await supabase
          .from('budgets')
          .update(budgetValues)
          .eq('id', existingBudget.id);
      } else {
        // Create new budget
        await supabase
          .from('budgets')
          .insert({
            user_id: user.id,
            month: selectedMonth,
            ...budgetValues
          });
      }
      
      // Reset form and reload data with the current selected month
      setShowBudgetForm(false);
      setNewBudget({ canteen: '', library: '', lab: '', club: '', other: '' });
      
      // Force a reload with the current selected month
      console.log('Reloading data after budget update for month:', selectedMonth);
      await loadAnalyticsData(selectedMonth);
    } catch (error) {
      console.error('Error creating budget:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load data on component mount and when selected period changes
  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);
  
  // Toggle budget notifications and save to state
  const toggleNotifications = (budgetId: string) => {
    setBudgets(prev => prev.map(budget => 
      budget.id === budgetId 
        ? { ...budget, notifications: !budget.notifications }
        : budget
    ));
  };
  
  // Calculate total spent
  const totalSpent = categories.reduce((sum, cat) => sum + cat.amount, 0);
  
  // Find highest spending category
  const highestCategory = categories.length > 0 ? 
    categories.reduce((prev, current) => current.amount > prev.amount ? current : prev, categories[0]) : 
    { name: 'None', amount: 0 };

  const getProgressColor = (percentage: number) => {
    if (percentage <= 70) return '#10B981';
    if (percentage <= 90) return '#F59E0B';
    return '#EF4444';
  };

  // Month picker is now imported as a component
  
  // Function to render budget form
  const renderBudgetForm = () => (
    <Modal
      visible={showBudgetForm}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowBudgetForm(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowBudgetForm(false)}
      >
        <View 
          style={[styles.budgetFormContainer, isDark && styles.cardDark]}
          onStartShouldSetResponder={() => true}
        >
          <Text style={[styles.budgetFormTitle, isDark && styles.textDark]}>Create Budget</Text>
          <Text style={[styles.budgetFormSubtitle, isDark && styles.textLightDark]}>
            {new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
          
          {/* Only show budget form for current month */}
          {selectedMonth === getCurrentMonth() ? (
            <>
              <View style={styles.budgetFormField}>
                <View style={styles.budgetFormLabel}>
                  <Coffee size={20} color="#FFD700" />
                  <Text style={[styles.budgetFormLabelText, isDark && styles.textDark]}>Canteen</Text>
                </View>
                <TextInput
                  style={[styles.budgetFormInput, isDark && styles.budgetFormInputDark]}
                  keyboardType="numeric"
                  value={newBudget.canteen}
                  onChangeText={(text) => setNewBudget({...newBudget, canteen: text})}
                  placeholder="Enter amount"
                  placeholderTextColor={isDark ? '#A6A6A6' : '#6B7280'}
                />
              </View>
              
              <View style={styles.budgetFormField}>
                <View style={styles.budgetFormLabel}>
                  <Book size={20} color="#4D9FFF" />
                  <Text style={[styles.budgetFormLabelText, isDark && styles.textDark]}>Library</Text>
                </View>
                <TextInput
                  style={[styles.budgetFormInput, isDark && styles.budgetFormInputDark]}
                  keyboardType="numeric"
                  value={newBudget.library}
                  onChangeText={(text) => setNewBudget({...newBudget, library: text})}
                  placeholder="Enter amount"
                  placeholderTextColor={isDark ? '#A6A6A6' : '#6B7280'}
                />
              </View>
              
              <View style={styles.budgetFormField}>
                <View style={styles.budgetFormLabel}>
                  <Beaker size={20} color="#FF6B6B" />
                  <Text style={[styles.budgetFormLabelText, isDark && styles.textDark]}>Lab</Text>
                </View>
                <TextInput
                  style={[styles.budgetFormInput, isDark && styles.budgetFormInputDark]}
                  keyboardType="numeric"
                  value={newBudget.lab}
                  onChangeText={(text) => setNewBudget({...newBudget, lab: text})}
                  placeholder="Enter amount"
                  placeholderTextColor={isDark ? '#A6A6A6' : '#6B7280'}
                />
              </View>
              
              <View style={styles.budgetFormField}>
                <View style={styles.budgetFormLabel}>
                  <Users size={20} color="#10B981" />
                  <Text style={[styles.budgetFormLabelText, isDark && styles.textDark]}>Club</Text>
                </View>
                <TextInput
                  style={[styles.budgetFormInput, isDark && styles.budgetFormInputDark]}
                  keyboardType="numeric"
                  value={newBudget.club}
                  onChangeText={(text) => setNewBudget({...newBudget, club: text})}
                  placeholder="Enter amount"
                  placeholderTextColor={isDark ? '#A6A6A6' : '#6B7280'}
                />
              </View>
              
              <View style={styles.budgetFormField}>
                <View style={styles.budgetFormLabel}>
                  <MoreHorizontal size={20} color="#A78BFA" />
                  <Text style={[styles.budgetFormLabelText, isDark && styles.textDark]}>Other</Text>
                </View>
                <TextInput
                  style={[styles.budgetFormInput, isDark && styles.budgetFormInputDark]}
                  keyboardType="numeric"
                  value={newBudget.other}
                  onChangeText={(text) => setNewBudget({...newBudget, other: text})}
                  placeholder="Enter amount"
                  placeholderTextColor={isDark ? '#A6A6A6' : '#6B7280'}
                />
              </View>
              
              <View style={styles.budgetFormActions}>
                <TouchableOpacity 
                  style={[styles.budgetFormButton, styles.budgetFormCancelButton]}
                  onPress={() => setShowBudgetForm(false)}
                >
                  <Text style={styles.budgetFormButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.budgetFormButton, styles.budgetFormSaveButton]}
                  onPress={createNewBudget}
                >
                  <Text style={styles.budgetFormButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.budgetFormMessage}>
              <Text style={[styles.budgetFormMessageText, isDark && styles.textDark]}>
                Budgets can only be created for the current month
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const handleGeneratePDF = async () => {
    await generateAnalyticsPDF(categories, budgets, setIsLoading);
  };

  const renderDonutChart = () => {
    let cumulativePercentage = 0;
    const radius = Math.min(windowWidth * 0.3, 120);
    const strokeWidth = radius * 0.2;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    return (
      <View style={[styles.chartContainer, { width: radius * 2, height: radius * 2 }]}>
        {categories.map((category) => {
          const startAngle = (cumulativePercentage / 100) * 360;
          const endAngle = ((cumulativePercentage + category.percentage) / 100) * 360;
          cumulativePercentage += category.percentage;

          return (
            <View
              key={category.id}
              style={[
                styles.chartSegment,
                {
                  width: radius * 2,
                  height: radius * 2,
                  transform: [{ rotate: `${startAngle}deg` }],
                },
              ]}
            >
              <View
                style={[
                  styles.chartSegmentInner,
                  {
                    width: radius * 2,
                    height: radius * 2,
                    borderWidth: strokeWidth,
                    borderColor: category.color,
                    transform: [{ rotate: `${endAngle - startAngle}deg` }],
                  },
                ]}
              />
            </View>
          );
        })}
        <View style={styles.chartCenter}>
          <Text style={[styles.chartCenterAmount, isDark && styles.textDark]}>
            ৳{totalSpent.toFixed(2)}
          </Text>
          <Text style={[styles.chartCenterLabel, isDark && styles.textLightDark]}>
            Total Spent
          </Text>
        </View>
      </View>
    );
  };

  // Update the renderSummaryPanel function to use real data
  const renderSummaryPanel = () => (
    <View style={[styles.summaryPanel, isDark && styles.panelDark]}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Wallet size={24} color="#FFD700" />
          <View>
            <Text style={[styles.summaryLabel, isDark && styles.textLightDark]}>Balance</Text>
            <Text style={[styles.summaryValue, isDark && styles.textDark]}>৳{walletBalance.toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.summaryItem}>
          <TrendingUp size={24} color="#10B981" />
          <View>
            <Text style={[styles.summaryLabel, isDark && styles.textLightDark]}>Transactions</Text>
            <Text style={[styles.summaryValue, isDark && styles.textDark]}>{transactionCount}</Text>
          </View>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <ArrowUpRight size={24} color="#EF4444" />
          <View>
            <Text style={[styles.summaryLabel, isDark && styles.textLightDark]}>Highest Spend</Text>
            <Text style={[styles.summaryValue, isDark && styles.textDark]}>{highestCategory.name}</Text>
          </View>
        </View>
        
        <View style={styles.summaryItem}>
          <ArrowDownRight size={24} color="#10B981" />
          <View>
            <Text style={[styles.summaryLabel, isDark && styles.textLightDark]}>Last Updated</Text>
            <Text style={[styles.summaryValue, isDark && styles.textDark]}>{lastUpdated}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Add function to handle budget editing
  const handleEditBudget = (category: string, currentLimit: number) => {
    setNewBudget(prev => ({
      ...prev,
      [category.toLowerCase()]: currentLimit.toString()
    }));
    setShowBudgetForm(true);
  };

  // Update the renderBudgetCard function to use icon instead of text
  const renderBudgetCard = (budget: BudgetCategory) => (
    <Animated.View 
      key={budget.id}
      entering={FadeInDown.delay(parseInt(budget.id) * 100).duration(400)}
      style={[styles.budgetCard, isDark && styles.cardDark]}
    >
      <View style={styles.budgetHeader}>
        {budget.icon}
        <View style={styles.budgetInfo}>
          <Text style={[styles.budgetName, isDark && styles.textDark]}>{budget.name}</Text>
          <Text style={[styles.budgetAmount, isDark && styles.textLightDark]}>
            ৳{budget.amount.toFixed(2)} / ৳{budget.limit.toFixed(2)}
          </Text>
        </View>
        <View style={styles.budgetActions}>
          <TouchableOpacity 
            onPress={() => handleEditBudget(budget.name, budget.limit)}
          >
            <Edit 
              size={20} 
              color="#FFD700"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleNotifications(budget.id)}>
            <Bell 
              size={20} 
              color={budget.notifications ? '#FFD700' : (isDark ? '#A6A6A6' : '#6B6B6B')}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${budget.percentage}%`,
                backgroundColor: getProgressColor(budget.percentage)
              }
            ]} 
          />
        </View>
        <Text style={[styles.progressText, isDark && styles.textLightDark]}>
          {budget.percentage}% used
        </Text>
      </View>

      <View style={styles.budgetFooter}>
        <Text style={[styles.remainingText, isDark && styles.textLightDark]}>
          Remaining: ৳{(budget.limit - budget.amount).toFixed(2)}
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Month Picker Modal */}
      <MonthPicker
        visible={showMonthPicker}
        onClose={() => setShowMonthPicker(false)}
        onSelect={handleMonthSelect}
        selectedValue={selectedMonth ? new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' }) : null}
      />

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, isDark && styles.textDark]}>Analytics</Text>
        </View>

        <View style={[styles.tabs, isDark && styles.tabsDark]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'analytics' && styles.activeTab, isDark && styles.tabDark, activeTab === 'analytics' && isDark && styles.activeTabDark]}
            onPress={() => setActiveTab('analytics')}
          >
            <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText, isDark && styles.tabTextDark, activeTab === 'analytics' && isDark && styles.activeTabTextDark]}>
              Analytics
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'budget' && styles.activeTab, isDark && styles.tabDark, activeTab === 'budget' && isDark && styles.activeTabDark]}
            onPress={() => setActiveTab('budget')}
          >
            <Text style={[styles.tabText, activeTab === 'budget' && styles.activeTabText, isDark && styles.tabTextDark, activeTab === 'budget' && isDark && styles.activeTabTextDark]}>
              Budget
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, isDark && styles.actionButtonDark]}
            onPress={handleGeneratePDF}
          >
            <Download size={20} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, isDark && styles.actionButtonDark]}
            onPress={() => setShowMonthPicker(true)}
          >
            <Calendar size={20} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
          </TouchableOpacity>
          
          {activeTab === 'budget' && (
            <TouchableOpacity 
              style={[styles.actionButton, isDark && styles.actionButtonDark]}
              onPress={() => setShowBudgetForm(true)}
            >
              <Plus size={20} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
            </TouchableOpacity>
          )}
        </View>
        {(selectedMonth) && (
          <View style={styles.activeFilters}>
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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'analytics' ? (
            <>
              {renderSummaryPanel()}
              
              <View style={styles.chartSection}>
                {renderDonutChart()}
                <View style={styles.legend}>
                  {categories.map((category) => (
                    <View key={category.id} style={styles.legendItem}>
                      {category.icon}
                      <View style={styles.legendTextContainer}>
                        <Text style={[styles.legendText, isDark && styles.textDark]}>
                          {category.name}
                        </Text>
                        <Text style={[styles.legendPercentage, isDark && styles.textLightDark]}>
                          {category.percentage}%
                        </Text>
                      </View>
                      <Text style={[styles.legendAmount, isDark && styles.textDark]}>
                        ৳{category.amount.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          ) : (
            <View>
              {budgets.map(renderBudgetCard)}
            </View>
          )}
        </ScrollView>
      )}

      {renderBudgetForm()}
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
  actions: {
    flexDirection: 'row',
    gap: 12,
    
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom : 15,
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
    backgroundColor: '#1E1E1E',
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
    color: '#000000',
    fontFamily: 'Inter-SemiBold',
  },
  activeTabTextDark: {
    color: '#000000',
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  panelDark: {
    backgroundColor: '#1E1E1E',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
  },
  chartSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  chartContainer: {
    position: 'relative',
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartSegment: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  chartSegmentInner: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  chartCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  chartCenterAmount: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
    textAlign: 'center',
  },
  chartCenterLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  legend: {
    width: '100%',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#2C2C2C',
  },
  legendPercentage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  legendAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
  },
  budgetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1E1E1E',
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  budgetAmount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'right',
  },
  budgetFooter: {
    marginTop: 8,
  },
  remainingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  textDark: {
    color: '#FFFFFF',
  },
  textLightDark: {
    color: '#A6A6A6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
  pickerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scrollColumn: {
    width: '48%',
    maxHeight: 250,
  },
  pickerItem: {
    paddingVertical: 12,
    
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#2C2C2C',
  },
  
  selectedItemText: {
    fontFamily: 'Inter-SemiBold',
    color: '#FFD700',
  },
  budgetFormContainer: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  budgetFormTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    marginBottom: 8,
    textAlign: 'center',
  },
  budgetFormSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  budgetFormField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  budgetFormLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  budgetFormLabelText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#2C2C2C',
  },
  budgetFormInput: {
    width: 120,
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#2C2C2C',
    textAlign: 'right',
  },
  budgetFormInputDark: {
    borderColor: '#333333',
    color: '#FFFFFF',
    backgroundColor: '#1E1E1E',
  },
  budgetFormActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  budgetFormButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  budgetFormCancelButton: {
    backgroundColor: '#E5E7EB',
  },
  budgetFormSaveButton: {
    backgroundColor: '#FFD700',
  },
  budgetFormButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
  },
  budgetFormMessage: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetFormMessageText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#2C2C2C',
    textAlign: 'center',
  },
  budgetActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
});