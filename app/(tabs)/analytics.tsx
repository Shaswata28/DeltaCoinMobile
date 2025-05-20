import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, useWindowDimensions } from 'react-native';
import { Wallet, TrendingUp, ArrowDownRight, ArrowUpRight, Filter, Calendar } from 'lucide-react-native';
import Animated, { FadeInDown, useAnimatedStyle, withSpring } from 'react-native-reanimated';

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
}

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width: windowWidth } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<'analytics' | 'budget'>('analytics');
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [isLoading, setIsLoading] = useState(true);

  const [categories] = useState<CategoryData[]>([
    {
      id: '1',
      name: 'Canteen',
      amount: 250.50,
      percentage: 35,
      icon: <Coffee size={24} color="#FFD700" />,
      color: '#FFD700'
    },
    {
      id: '2',
      name: 'Library',
      amount: 100.00,
      percentage: 15,
      icon: <Book size={24} color="#4D9FFF" />,
      color: '#4D9FFF'
    },
    {
      id: '3',
      name: 'Laboratory',
      amount: 180.00,
      percentage: 25,
      icon: <Beaker size={24} color="#FF6B6B" />,
      color: '#FF6B6B'
    },
    {
      id: '4',
      name: 'Clubs',
      amount: 120.50,
      percentage: 15,
      icon: <Users size={24} color="#10B981" />,
      color: '#10B981'
    },
    {
      id: '5',
      name: 'Others',
      amount: 75.00,
      percentage: 10,
      icon: <MoreHorizontal size={24} color="#A78BFA" />,
      color: '#A78BFA'
    }
  ]);

  const [budgets] = useState<BudgetCategory[]>([
    {
      id: '1',
      name: 'Canteen',
      amount: 250.50,
      limit: 300,
      percentage: 83,
      icon: <Coffee size={24} color="#FFD700" />,
      color: '#FFD700'
    },
    {
      id: '2',
      name: 'Library',
      amount: 100.00,
      limit: 150,
      percentage: 67,
      icon: <Book size={24} color="#4D9FFF" />,
      color: '#4D9FFF'
    },
    {
      id: '3',
      name: 'Laboratory',
      amount: 180.00,
      limit: 200,
      percentage: 90,
      icon: <Beaker size={24} color="#FF6B6B" />,
      color: '#FF6B6B'
    },
    {
      id: '4',
      name: 'Clubs',
      amount: 120.50,
      limit: 150,
      percentage: 80,
      icon: <Users size={24} color="#10B981" />,
      color: '#10B981'
    }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const totalSpent = categories.reduce((sum, cat) => sum + cat.amount, 0);
  const highestCategory = categories.reduce((prev, current) => 
    current.amount > prev.amount ? current : prev
  );

  const getProgressColor = (percentage: number) => {
    if (percentage <= 70) return '#10B981';
    if (percentage <= 90) return '#F59E0B';
    return '#EF4444';
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
            ${totalSpent.toFixed(2)}
          </Text>
          <Text style={[styles.chartCenterLabel, isDark && styles.textLightDark]}>
            Total Spent
          </Text>
        </View>
      </View>
    );
  };

  const renderSummaryPanel = () => (
    <View style={[styles.summaryPanel, isDark && styles.panelDark]}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <View style={styles.summaryIconContainer}>
            <Wallet size={24} color="#FFD700" />
          </View>
          <View>
            <Text style={[styles.summaryLabel, isDark && styles.textLightDark]}>Balance</Text>
            <Text style={[styles.summaryValue, isDark && styles.textDark]}>$1,245.50</Text>
          </View>
        </View>
        
        <View style={styles.summaryItem}>
          <View style={styles.summaryIconContainer}>
            <TrendingUp size={24} color="#10B981" />
          </View>
          <View>
            <Text style={[styles.summaryLabel, isDark && styles.textLightDark]}>Transactions</Text>
            <Text style={[styles.summaryValue, isDark && styles.textDark]}>24</Text>
          </View>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <View style={styles.summaryIconContainer}>
            <ArrowUpRight size={24} color="#EF4444" />
          </View>
          <View>
            <Text style={[styles.summaryLabel, isDark && styles.textLightDark]}>Highest Spend</Text>
            <Text style={[styles.summaryValue, isDark && styles.textDark]}>{highestCategory.name}</Text>
          </View>
        </View>
        
        <View style={styles.summaryItem}>
          <View style={styles.summaryIconContainer}>
            <ArrowDownRight size={24} color="#10B981" />
          </View>
          <View>
            <Text style={[styles.summaryLabel, isDark && styles.textLightDark]}>Last Updated</Text>
            <Text style={[styles.summaryValue, isDark && styles.textDark]}>2h ago</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderBudgetCard = (budget: BudgetCategory) => (
    <Animated.View 
      key={budget.id}
      entering={FadeInDown.delay(parseInt(budget.id) * 100).duration(400)}
      style={[styles.budgetCard, isDark && styles.cardDark]}
    >
      <View style={styles.budgetHeader}>
        <View style={styles.budgetIcon}>
          {budget.icon}
        </View>
        <View style={styles.budgetInfo}>
          <Text style={[styles.budgetName, isDark && styles.textDark]}>{budget.name}</Text>
          <Text style={[styles.budgetAmount, isDark && styles.textLightDark]}>
            ${budget.amount.toFixed(2)} / ${budget.limit.toFixed(2)}
          </Text>
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
          Remaining: ${(budget.limit - budget.amount).toFixed(2)}
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <ScrollView 
      style={[styles.container, isDark && styles.containerDark]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, isDark && styles.textDark]}>Analytics</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton}>
              <Filter size={20} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Calendar size={20} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.tabs, isDark && styles.tabsDark]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'analytics' && styles.activeTab,
              isDark && styles.tabDark,
              activeTab === 'analytics' && isDark && styles.activeTabDark
            ]}
            onPress={() => setActiveTab('analytics')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'analytics' && styles.activeTabText,
              isDark && styles.textDark
            ]}>
              Analytics
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'budget' && styles.activeTab,
              isDark && styles.tabDark,
              activeTab === 'budget' && isDark && styles.activeTabDark
            ]}
            onPress={() => setActiveTab('budget')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'budget' && styles.activeTabText,
              isDark && styles.textDark
            ]}>
              Budget
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      ) : activeTab === 'analytics' ? (
        <View style={styles.content}>
          {renderSummaryPanel()}
          
          <View style={styles.chartSection}>
            {renderDonutChart()}
            <View style={styles.legend}>
              {categories.map((category) => (
                <View key={category.id} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: category.color }]} />
                  <Text style={[styles.legendText, isDark && styles.textDark]}>
                    {category.name} ({category.percentage}%)
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          {budgets.map(renderBudgetCard)}
        </View>
      )}
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 6,
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
  activeTabText: {
    color: '#000000',
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    padding: 20,
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
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  chartCenterAmount: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
  },
  chartCenterLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  legend: {
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
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
  },
  budgetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
});