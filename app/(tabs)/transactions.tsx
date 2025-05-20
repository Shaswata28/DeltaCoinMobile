import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, useColorScheme } from 'react-native';
import { CreditCard, Building2, Smartphone, Coffee, BookOpen, FlaskRound as Flask, Users, ChevronDown } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { AmountInput } from '@/components/payment/AmountInput';
import { PaymentSummary } from '@/components/payment/PaymentSummary';
import { Button } from '@/components/common/Button';

type PaymentMethod = 'bank' | 'card' | 'mobile';
type PaymentDestination = 'canteen' | 'library' | 'lab' | 'club';
type TabType = 'topup' | 'payment';
type PaymentStep = 'selection' | 'amount' | 'confirmation';

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

const PAYMENT_METHODS = {
  bank: { title: 'Bank Transfer', subtitle: 'Direct bank transfer' },
  card: { title: 'Credit/Debit Card', subtitle: 'Pay with your card' },
  mobile: { title: 'Mobile Banking', subtitle: 'bKash, Nagad, Rocket' },
};

export default function TransactionsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [activeTab, setActiveTab] = useState<TabType>('topup');
  const [step, setStep] = useState<PaymentStep>('selection');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<PaymentDestination | null>(null);
  const [showClubDropdown, setShowClubDropdown] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');

  const validateAmount = () => {
    const numericAmount = parseFloat(amount);
    if (!amount) {
      setAmountError('Please enter an amount');
      return false;
    }
    if (numericAmount < 1) {
      setAmountError('Amount must be at least $1');
      return false;
    }
    if (numericAmount > 10000) {
      setAmountError('Amount cannot exceed $10,000');
      return false;
    }
    setAmountError('');
    return true;
  };

  const handleProceed = () => {
    if (step === 'selection') {
      if (!selectedMethod && activeTab === 'topup') {
        return;
      }
      if (!selectedDestination && activeTab === 'payment') {
        return;
      }
      setStep('amount');
    } else if (step === 'amount') {
      if (validateAmount()) {
        setStep('confirmation');
      }
    } else {
      console.log('Processing payment...');
    }
  };

  const handleBack = () => {
    if (step === 'amount') {
      setStep('selection');
    } else if (step === 'confirmation') {
      setStep('amount');
    }
  };

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

  const renderContent = () => {
    if (step === 'selection') {
      return activeTab === 'topup' ? (
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
      );
    }

    if (step === 'amount') {
      return (
        <Animated.View entering={FadeInDown.duration(300)} style={styles.amountContainer}>
          <AmountInput
            value={amount}
            onChange={setAmount}
            error={amountError}
          />
        </Animated.View>
      );
    }

    if (step === 'confirmation') {
      return (
        <Animated.View entering={FadeInDown.duration(300)}>
          <PaymentSummary
            amount={amount}
            method={selectedMethod ? PAYMENT_METHODS[selectedMethod].title : undefined}
            destination={selectedDestination}
            club={selectedClub?.name}
            details={additionalDetails}
          />
        </Animated.View>
      );
    }
  };

  const getButtonTitle = () => {
    if (step === 'selection') return 'Continue';
    if (step === 'amount') return 'Review Payment';
    return 'Confirm Payment';
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.header, isDark && styles.headerDark]}>Transaction</Text>
      
      {step === 'selection' && (
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
              