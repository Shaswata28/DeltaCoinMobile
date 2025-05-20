import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { Bank, CreditCard, Smartphone, Book, Coffee, Beaker, Users } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AmountInput } from '@/components/payment/AmountInput';
import { PaymentSummary } from '@/components/payment/PaymentSummary';
import { FormInput } from '@/components/common/FormInput';
import { Button } from '@/components/common/Button';

type PaymentMethod = 'bank' | 'card' | 'mobile';
type PaymentDestination = 'canteen' | 'library' | 'lab' | 'club';
type Club = 'photography' | 'tech' | 'art' | 'sports' | 'music';

interface PaymentDetails {
  method?: PaymentMethod;
  destination?: PaymentDestination;
  club?: Club;
  amount: string;
  details?: string;
}

export default function TransactionsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [activeTab, setActiveTab] = useState<'topup' | 'payment'>('topup');
  const [step, setStep] = useState<'selection' | 'amount' | 'summary'>('selection');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    amount: '',
  });

  const handleMethodSelect = (method: PaymentMethod) => {
    setPaymentDetails(prev => ({ ...prev, method }));
    setStep('amount');
  };

  const handleDestinationSelect = (destination: PaymentDestination) => {
    setPaymentDetails(prev => ({ ...prev, destination }));
    if (destination !== 'club') {
      setStep('amount');
    }
  };

  const handleClubSelect = (club: Club) => {
    setPaymentDetails(prev => ({ ...prev, club }));
    setStep('amount');
  };

  const handleAmountSubmit = () => {
    if (parseFloat(paymentDetails.amount) > 0) {
      setStep('summary');
    }
  };

  const handleBack = () => {
    if (step === 'summary') {
      setStep('amount');
    } else if (step === 'amount') {
      setStep('selection');
    }
  };

  const renderTopUpMethods = () => (
    <View style={styles.methodsContainer}>
      <TouchableOpacity
        style={[styles.methodCard, isDark && styles.methodCardDark]}
        onPress={() => handleMethodSelect('bank')}
      >
        <Bank size={32} color={isDark ? '#82B1FF' : '#4D9FFF'} />
        <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Bank Transfer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.methodCard, isDark && styles.methodCardDark]}
        onPress={() => handleMethodSelect('card')}
      >
        <CreditCard size={32} color={isDark ? '#82B1FF' : '#4D9FFF'} />
        <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Credit/Debit Card</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.methodCard, isDark && styles.methodCardDark]}
        onPress={() => handleMethodSelect('mobile')}
      >
        <Smartphone size={32} color={isDark ? '#82B1FF' : '#4D9FFF'} />
        <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Mobile Banking</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPaymentDestinations = () => (
    <View style={styles.methodsContainer}>
      <TouchableOpacity
        style={[styles.methodCard, isDark && styles.methodCardDark]}
        onPress={() => handleDestinationSelect('canteen')}
      >
        <Coffee size={32} color={isDark ? '#82B1FF' : '#4D9FFF'} />
        <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Canteen</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.methodCard, isDark && styles.methodCardDark]}
        onPress={() => handleDestinationSelect('library')}
      >
        <Book size={32} color={isDark ? '#82B1FF' : '#4D9FFF'} />
        <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Library</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.methodCard, isDark && styles.methodCardDark]}
        onPress={() => handleDestinationSelect('lab')}
      >
        <Beaker size={32} color={isDark ? '#82B1FF' : '#4D9FFF'} />
        <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Lab</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.methodCard, isDark && styles.methodCardDark]}
        onPress={() => handleDestinationSelect('club')}
      >
        <Users size={32} color={isDark ? '#82B1FF' : '#4D9FFF'} />
        <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Club</Text>
      </TouchableOpacity>
    </View>
  );

  const renderClubSelection = () => (
    <View style={styles.clubContainer}>
      <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Select Club</Text>
      <View style={styles.clubOptions}>
        {['Photography', 'Tech', 'Art', 'Sports', 'Music'].map((club, index) => (
          <TouchableOpacity
            key={club}
            style={[styles.clubOption, isDark && styles.clubOptionDark]}
            onPress={() => handleClubSelect(club.toLowerCase() as Club)}
          >
            <Text style={[styles.clubText, isDark && styles.clubTextDark]}>{club}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.detailsContainer}>
        <FormInput
          label="Additional Details"
          value={paymentDetails.details || ''}
          onChangeText={(text) => setPaymentDetails(prev => ({ ...prev, details: text }))}
          placeholder="Enter any additional information"
          style={styles.detailsInput}
        />
      </View>
    </View>
  );

  const renderContent = () => {
    if (step === 'selection') {
      return activeTab === 'topup' ? renderTopUpMethods() : renderPaymentDestinations();
    }

    if (step === 'amount') {
      return (
        <Animated.View 
          entering={FadeInDown.duration(300)} 
          style={styles.amountContainer}
        >
          <AmountInput
            value={paymentDetails.amount}
            onChange={(value) => setPaymentDetails(prev => ({ ...prev, amount: value }))}
          />
          <Button
            title="Continue"
            onPress={handleAmountSubmit}
            disabled={!paymentDetails.amount || parseFloat(paymentDetails.amount) <= 0}
          />
        </Animated.View>
      );
    }

    if (step === 'summary') {
      return (
        <Animated.View 
          entering={FadeInDown.duration(300)} 
          style={styles.summaryContainer}
        >
          <PaymentSummary
            amount={paymentDetails.amount}
            method={paymentDetails.method}
            destination={paymentDetails.destination}
            club={paymentDetails.club}
            details={paymentDetails.details}
          />
          <View style={styles.buttonContainer}>
            <Button
              title="Back"
              onPress={handleBack}
              variant="outline"
              style={styles.backButton}
            />
            <Button
              title="Confirm Payment"
              onPress={() => {}}
              style={styles.confirmButton}
            />
          </View>
        </Animated.View>
      );
    }
  };

  return (
    <ScrollView 
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, isDark && styles.titleDark]}>Transactions</Text>
      
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'topup' && styles.activeTab,
            isDark && styles.tabDark,
            activeTab === 'topup' && isDark && styles.activeTabDark
          ]}
          onPress={() => {
            setActiveTab('topup');
            setStep('selection');
            setPaymentDetails({ amount: '' });
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'topup' && styles.activeTabText,
              isDark && styles.tabTextDark,
              activeTab === 'topup' && isDark && styles.activeTabTextDark
            ]}
          >
            Top-Up
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'payment' && styles.activeTab,
            isDark && styles.tabDark,
            activeTab === 'payment' && isDark && styles.activeTabDark
          ]}
          onPress={() => {
            setActiveTab('payment');
            setStep('selection');
            setPaymentDetails({ amount: '' });
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'payment' && styles.activeTabText,
              isDark && styles.tabTextDark,
              activeTab === 'payment' && isDark && styles.activeTabTextDark
            ]}
          >
            Payment
          </Text>
        </TouchableOpacity>
      </View>

      {renderContent()}
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
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
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
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabDark: {
    backgroundColor: '#1E1E1E',
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
    color: '#6B7280',
  },
  tabTextDark: {
    color: '#A6A6A6',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  activeTabTextDark: {
    color: '#1E1E1E',
  },
  methodsContainer: {
    gap: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 16,
  },
  methodCardDark: {
    backgroundColor: '#1E1E1E',
  },
  methodText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#2C2C2C',
  },
  methodTextDark: {
    color: '#FFFFFF',
  },
  clubContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  clubOptions: {
    gap: 12,
  },
  clubOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  clubOptionDark: {
    backgroundColor: '#1E1E1E',
  },
  clubText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#2C2C2C',
  },
  clubTextDark: {
    color: '#FFFFFF',
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailsInput: {
    marginTop: 16,
  },
  amountContainer: {
    gap: 24,
  },
  summaryContainer: {
    gap: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 2,
  },
});