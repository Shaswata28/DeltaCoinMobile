import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, useColorScheme } from 'react-native';
import { CreditCard, Building2, Smartphone, Coffee, BookOpen, Flask, Users, ChevronDown } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

type PaymentMethod = 'bank' | 'card' | 'mobile';
type PaymentDestination = 'canteen' | 'library' | 'lab' | 'club';
type TabType = 'topup' | 'payment';

interface Club {
  id: string;
  name: string;
}

const CLUBS: Club[] = [
  { id: '1', name: 'Photography Club' },
  { id: '2', name: 'Tech Club' },
  { id: '3', name: 'Art Club' },
  { id: '4', name: 'Music Club' },
  { id: '5', name: 'Drama Club' },
];

export default function TransactionsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [activeTab, setActiveTab] = useState<TabType>('topup');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<PaymentDestination | null>(null);
  const [showClubDropdown, setShowClubDropdown] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [additionalDetails, setAdditionalDetails] = useState('');

  const PaymentMethodCard = ({ 
    type, 
    icon: Icon, 
    title, 
    subtitle 
  }: { 
    type: PaymentMethod; 
    icon: any; 
    title: string; 
    subtitle: string; 
  }) => (
    <TouchableOpacity
      onPress={() => setSelectedMethod(type)}
      style={[
        styles.methodCard,
        isDark && styles.methodCardDark,
        selectedMethod === type && styles.methodCardSelected,
        isDark && selectedMethod === type && styles.methodCardSelectedDark,
      ]}
    >
      <View style={[styles.methodIcon, isDark && styles.methodIconDark]}>
        <Icon size={24} color={isDark ? '#82B1FF' : '#4D9FFF'} />
      </View>
      <View style={styles.methodInfo}>
        <Text style={[styles.methodTitle, isDark && styles.methodTitleDark]}>
          {title}
        </Text>
        <Text style={[styles.methodSubtitle, isDark && styles.methodSubtitleDark]}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const DestinationCard = ({
    type,
    icon: Icon,
    title,
  }: {
    type: PaymentDestination;
    icon: any;
    title: string;
  }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedDestination(type);
        if (type === 'club') {
          setShowClubDropdown(true);
        } else {
          setShowClubDropdown(false);
          setSelectedClub(null);
        }
      }}
      style={[
        styles.destinationCard,
        isDark && styles.destinationCardDark,
        selectedDestination === type && styles.destinationCardSelected,
        isDark && selectedDestination === type && styles.destinationCardSelectedDark,
      ]}
    >
      <Icon size={24} color={isDark ? '#82B1FF' : '#4D9FFF'} />
      <Text style={[styles.destinationTitle, isDark && styles.destinationTitleDark]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.header, isDark && styles.headerDark]}>Transaction</Text>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('topup')}
          style={[
            styles.tab,
            activeTab === 'topup' && styles.activeTab,
            isDark && activeTab === 'topup' && styles.activeTabDark,
          ]}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'topup' && styles.activeTabText,
            isDark && styles.tabTextDark,
          ]}>
            Top-Up
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setActiveTab('payment')}
          style={[
            styles.tab,
            activeTab === 'payment' && styles.activeTab,
            isDark && activeTab === 'payment' && styles.activeTabDark,
          ]}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'payment' && styles.activeTabText,
            isDark && styles.tabTextDark,
          ]}>
            Payment
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'topup' ? (
          <Animated.View entering={FadeInDown.duration(300)}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Select Payment Method
            </Text>
            
            <View style={styles.methodsContainer}>
              <PaymentMethodCard
                type="bank"
                icon={Building2}
                title="Bank Transfer"
                subtitle="Direct bank transfer"
              />
              
              <PaymentMethodCard
                type="card"
                icon={CreditCard}
                title="Credit/Debit Card"
                subtitle="Pay with your card"
              />
              
              <PaymentMethodCard
                type="mobile"
                icon={Smartphone}
                title="Mobile Banking"
                subtitle="bKash, Nagad, Rocket"
              />
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInUp.duration(300)}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Select Destination
            </Text>
            
            <View style={styles.destinationsContainer}>
              <DestinationCard
                type="canteen"
                icon={Coffee}
                title="Canteen"
              />
              
              <DestinationCard
                type="library"
                icon={BookOpen}
                title="Library"
              />
              
              <DestinationCard
                type="lab"
                icon={Flask}
                title="Lab"
              />
              
              <DestinationCard
                type="club"
                icon={Users}
                title="Club"
              />
            </View>

            {selectedDestination === 'club' && (
              <Animated.View 
                entering={FadeInDown.duration(300)}
                style={styles.clubSection}
              >
                <TouchableOpacity
                  onPress={() => setShowClubDropdown(!showClubDropdown)}
                  style={[styles.clubDropdown, isDark && styles.clubDropdownDark]}
                >
                  <Text style={[styles.clubDropdownText, isDark && styles.clubDropdownTextDark]}>
                    {selectedClub ? selectedClub.name : 'Select Club'}
                  </Text>
                  <ChevronDown 
                    size={20} 
                    color={isDark ? '#A6A6A6' : '#6B6B6B'}
                    style={[
                      styles.dropdownIcon,
                      showClubDropdown && styles.dropdownIconOpen
                    ]} 
                  />
                </TouchableOpacity>

                {showClubDropdown && (
                  <View style={[styles.dropdownMenu, isDark && styles.dropdownMenuDark]}>
                    {CLUBS.map((club) => (
                      <TouchableOpacity
                        key={club.id}
                        style={[
                          styles.dropdownItem,
                          isDark && styles.dropdownItemDark,
                          selectedClub?.id === club.id && styles.dropdownItemSelected,
                          isDark && selectedClub?.id === club.id && styles.dropdownItemSelectedDark,
                        ]}
                        onPress={() => {
                          setSelectedClub(club);
                          setShowClubDropdown(false);
                        }}
                      >
                        <Text style={[
                          styles.dropdownItemText,
                          isDark && styles.dropdownItemTextDark,
                          selectedClub?.id === club.id && styles.dropdownItemTextSelected,
                        ]}>
                          {club.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <TextInput
                  placeholder="Additional Details (Optional)"
                  placeholderTextColor={isDark ? '#A6A6A6' : '#6B6B6B'}
                  value={additionalDetails}
                  onChangeText={setAdditionalDetails}
                  style={[styles.additionalDetails, isDark && styles.additionalDetailsDark]}
                  multiline
                  numberOfLines={3}
                />
              </Animated.View>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 24,
  },
  headerDark: {
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#4D9FFF',
  },
  activeTabDark: {
    backgroundColor: '#82B1FF',
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B6B6B',
  },
  tabTextDark: {
    color: '#A6A6A6',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    marginBottom: 16,
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  methodsContainer: {
    gap: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  methodCardDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2E2E2E',
  },
  methodCardSelected: {
    borderColor: '#4D9FFF',
    backgroundColor: '#F0F7FF',
  },
  methodCardSelectedDark: {
    borderColor: '#82B1FF',
    backgroundColor: '#1A2234',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodIconDark: {
    backgroundColor: '#2E2E2E',
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  methodTitleDark: {
    color: '#FFFFFF',
  },
  methodSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B6B6B',
  },
  methodSubtitleDark: {
    color: '#A6A6A6',
  },
  destinationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  destinationCard: {
    width: '48%',
    aspectRatio: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  destinationCardDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2E2E2E',
  },
  destinationCardSelected: {
    borderColor: '#4D9FFF',
    backgroundColor: '#F0F7FF',
  },
  destinationCardSelectedDark: {
    borderColor: '#82B1FF',
    backgroundColor: '#1A2234',
  },
  destinationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#2C2C2C',
    marginTop: 12,
    textAlign: 'center',
  },
  destinationTitleDark: {
    color: '#FFFFFF',
  },
  clubSection: {
    marginTop: 24,
    gap: 16,
  },
  clubDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  clubDropdownDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2E2E2E',
  },
  clubDropdownText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#2C2C2C',
  },
  clubDropdownTextDark: {
    color: '#FFFFFF',
  },
  dropdownIcon: {
    transform: [{ rotate: '0deg' }],
  },
  dropdownIconOpen: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  dropdownMenuDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2E2E2E',
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dropdownItemDark: {
    borderBottomColor: '#2E2E2E',
  },
  dropdownItemSelected: {
    backgroundColor: '#F0F7FF',
  },
  dropdownItemSelectedDark: {
    backgroundColor: '#1A2234',
  },
  dropdownItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#2C2C2C',
  },
  dropdownItemTextDark: {
    color: '#FFFFFF',
  },
  dropdownItemTextSelected: {
    color: '#4D9FFF',
  },
  additionalDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#2C2C2C',
    textAlignVertical: 'top',
  },
  additionalDetailsDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2E2E2E',
    color: '#FFFFFF',
  },
});