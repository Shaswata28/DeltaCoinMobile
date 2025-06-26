import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, useWindowDimensions, Modal, TextInput, Alert } from 'react-native';
import { Building2, CreditCard, Smartphone, Book, Coffee, Beaker, Users, ArrowLeft, MoveHorizontal as MoreHorizontal, X, Check } from 'lucide-react-native';
import Animated, { 
  FadeInDown,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { 
  Gesture,
  GestureDetector,
  GestureHandlerRootView
} from 'react-native-gesture-handler';
import { AmountInput } from '@/components/payment/AmountInput';
import { PaymentSummary } from '@/components/payment/PaymentSummary';
import { StripePayment } from '@/components/payment/StripePayment';
import { FormInput } from '@/components/common/FormInput';
import { Button } from '../../components/common/Button';
import { PinInput } from '../../components/common/PinInput';

type PaymentMethod = 'bank' | 'card' | 'mobile';
type PaymentDestination = 'Canteen' | 'Library' | 'Lab' | 'Club' | 'Other';
type Club = 'photography' | 'tech' | 'art' | 'sports' | 'music';

interface PaymentDetails {
  method?: PaymentMethod;
  destination?: PaymentDestination;
  club?: Club;
  amount: string;
  details?: string;
}

import { getCurrentUserProfile } from '../../supabase/auth';
import { updateWalletBalance, createTransaction } from '../../supabase/db';

const verifyPin = async (pin: string): Promise<boolean> => {
  try {
    const userProfile = await getCurrentUserProfile();
    if (!userProfile) {
      console.error('User profile not found');
      return false;
    }
    
    // Ensure both PINs are strings and trim any whitespace
    const userPin = String(userProfile.pin).trim();
    const enteredPin = String(pin).trim();
    
    return userPin === enteredPin;
  } catch (error) {
    console.error('PIN verification error:', error);
    return false;
  }
};

const processPayment = async (details: PaymentDetails): Promise<void> => {
  try {
    // Create transaction record
    await createTransaction({
      amount: parseFloat(details.amount),
      type: 'expense',
      category: details.destination || 'other',
      description: details.details || `Payment to ${details.destination}`,
    });
    
    // Remove this line - wallet balance is already updated by createTransaction
    // await updateWalletBalance(parseFloat(details.amount), 'subtract');
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
};

const processTopup = async (details: PaymentDetails, paymentIntentId?: string): Promise<void> => {
  try {
    // Create transaction record with Stripe payment intent ID if provided
    await createTransaction({
      amount: parseFloat(details.amount),
      type: 'income',
      category: 'topup',
      description: `Top-up via ${details.method}`,
      stripe_payment_intent_id: paymentIntentId,
    });
  } catch (error) {
    console.error('Top-up processing error:', error);
    throw error;
  }
};

export default function TransactionsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width: windowWidth } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  
  const [activeTab, setActiveTab] = useState<'topup' | 'payment'>('topup');
  const [step, setStep] = useState<'selection' | 'amount' | 'summary' | 'club' | 'pin' | 'stripe' | 'success' | 'error'>('selection');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    amount: '',
  });
  // Update these state variables at the top of your component
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  const translateX = useSharedValue(0);
  const context = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      context.value = translateX.value;
    })
    .onUpdate((event) => {
      translateX.value = context.value + event.translationX;
    })
    .onEnd((event) => {
      const velocity = event.velocityX;
      const shouldSwitch = 
        Math.abs(translateX.value) > windowWidth * 0.2 || 
        Math.abs(velocity) > 500;

      if (shouldSwitch) {
        const newTab = translateX.value > 0 ? 'topup' : 'payment';
        translateX.value = withSpring(0, {
          velocity: velocity,
          stiffness: 90,
          damping: 15
        });
        runOnJS(setActiveTab)(newTab);
        runOnJS(setStep)('selection');
        runOnJS(setPaymentDetails)({ amount: '' });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleMethodSelect = (method: PaymentMethod) => {
    setPaymentDetails(prev => ({ ...prev, method }));
    setStep('amount');
  };

  const handleDestinationSelect = (destination: PaymentDestination) => {
    setPaymentDetails(prev => ({ ...prev, destination }));
    if (destination === 'Club') {
      setStep('club');
    } else {
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
    switch (step) {
      case 'stripe':
        setStep('summary');
        break;
      case 'summary':
        setStep('amount');
        break;
      case 'amount':
        if (paymentDetails.destination === 'Club') {
          setStep('club');
        } else {
          setStep('selection');
        }
        break;
      case 'club':
        setStep('selection');
        break;
      default:
        setStep('selection');
    }
  };

  const handleConfirmPayment = async () => {
    if (activeTab === 'payment') {
      // For payments, show PIN modal
      setPinModalVisible(true);
      setPin('');
      setPinError(false);
    } else {
      // For top-up, only use Stripe for card payments
      if (paymentDetails.method === 'card') {
        setStep('stripe');
      } else {
        // For bank and mobile banking, proceed directly to success
        try {
          setPinLoading(true);
          await processTopup(paymentDetails);
          setStep('success');
        } catch (error) {
          console.error('Top-up processing failed:', error);
          setStep('error');
        } finally {
          setPinLoading(false);
        }
      }
    }
  };

  const handleStripeSuccess = async (paymentIntentId: string) => {
    try {
      await processTopup(paymentDetails, paymentIntentId);
      setStep('success');
    } catch (error) {
      console.error('Top-up processing failed:', error);
      setStep('error');
    }
  };

  const handleStripeCancel = () => {
    setStep('summary');
  };

  const handlePinSubmit = async () => {
    try {
      setPinLoading(true);
      const isValidPin = await verifyPin(pin);
      console.log('PIN verification result:', { isValidPin });
      
      if (isValidPin) {
        setPinModalVisible(false);
        try {
          await processPayment(paymentDetails);
          setStep('success');
        } catch (error) {
          console.error('Payment processing failed:', error);
          setStep('error');
        }
      } else {
        setPinError(true);
        setPin('');
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      setPinError(true);
      setPin('');
    } finally {
      setPinLoading(false);
    }
  };

  const handlePinChange = (value: string) => {
    console.log('PIN Input:', {
      value: value,
      length: value.length,
      type: typeof value
    });
    setPin(value);
    setPinError(false);
    if (value.length === 6) {
      handlePinSubmit();
    }
  };

  const handleClosePinModal = () => {
    setPinModalVisible(false);
    setPin('');
    setPinError(false);
  };

  const renderTopUpMethods = () => (
    <Animated.View 
      entering={FadeInDown.duration(300)} 
      style={styles.methodsContainer}
    >
      <TouchableOpacity
        style={[styles.methodCard, isDark && styles.methodCardDark]}
        onPress={() => handleMethodSelect('bank')}
      >
        <Building2 size={32} color={isDark ? '#FFD700' : '#FFB800'} />
        <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Bank Transfer</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.methodCard, isDark && styles.methodCardDark]}
        onPress={() => handleMethodSelect('card')}
      >
        <CreditCard size={32} color={isDark ? '#4D9FFF' : '#0066CC'} />
        <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Credit/Debit Card</Text>
        <Text style={[styles.methodSubtext, isDark && styles.methodSubtextDark]}>via Stripe</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.methodCard, isDark && styles.methodCardDark]}
        onPress={() => handleMethodSelect('mobile')}
      >
        <Smartphone size={32} color={isDark ? '#10B981' : '#059669'} />
        <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Mobile Banking</Text>
        
      </TouchableOpacity>
    </Animated.View>
  );

  const renderPaymentDestinations = () => (
    <Animated.View 
      entering={FadeInDown.duration(300)} 
      style={styles.methodsContainer}
    >
      <TouchableOpacity
        style={[styles.methodCard, isDark && styles.methodCardDark]}
        onPress={() => handleDestinationSelect('Canteen')}
      >
        <Coffee size={32} color={isDark ? '#4D9FFF' : '#0066CC'} />
        <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Canteen</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.methodCard, isDark && styles.methodCardDark]}
        onPress={() => handleDestinationSelect('Library')}
      >
        <Book size={32} color={isDark ? '#FF6B6B' : '#DC2626'} />
        <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Library</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.methodCard, isDark && styles.methodCardDark]}
        onPress={() => handleDestinationSelect('Lab')}
      >
        <Beaker size={32} color={isDark ? '#10B981' : '#059669'} />
        <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Lab</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.methodCard, isDark && styles.methodCardDark]}
        onPress={() => handleDestinationSelect('Club')}
      >
        <Users size={32} color={isDark ? '#A78BFA' : '#7C3AED'} />
        <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Club</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.methodCard, isDark && styles.methodCardDark]}
        onPress={() => handleDestinationSelect('Other')}
      >
        <MoreHorizontal size={32} color={isDark ? '#6B7280' : '#4B5563'} />
        <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Other</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderClubSelection = () => (
    <Animated.View 
      entering={FadeInDown.duration(300)} 
      style={styles.clubContainer}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
        >
          <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
        </TouchableOpacity>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Select Club</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.clubOptions}>
        {['Photography', 'Social', 'Computer', 'Sports', 'Women Empowerment','Film & Comedy'].map((club) => (
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
    </Animated.View>
  );

  // Replace the existing renderPinModal function with this improved version
  const renderPinModal = () => (
    <Modal
      visible={pinModalVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClosePinModal}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          entering={FadeInDown.duration(200)}
          style={[styles.modalContent, isDark && styles.modalContentDark]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
              Confirm Payment
            </Text>
            <TouchableOpacity
              onPress={handleClosePinModal}
              style={styles.closeButton}
            >
              <X size={24} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>

          <View style={styles.pinContainer}>
            <Text style={[styles.pinInstructions, isDark && styles.pinInstructionsDark]}>
              Please enter your 5-digit PIN to authorize this payment
            </Text>
            
            <PinInput
              value={pin}
              onChange={handlePinChange}
              length={5}
              disabled={pinLoading}
            />
            
            {pinError && (
              <Text style={styles.errorText}>
                Incorrect PIN. Please try again.
              </Text>
            )}

            <View style={[styles.pinAmountContainer, { backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6' }]}>
              <Text style={[styles.pinAmountLabel, isDark && styles.pinAmountLabelDark]}>Amount:</Text>
              <Text style={[styles.pinAmount, isDark && styles.pinAmountDark]}>
                ৳{parseFloat(paymentDetails.amount).toFixed(2)}
              </Text>
            </View>

            <Button
              title={pinLoading ? "Verifying..." : "Confirm"}
              onPress={handlePinSubmit}
              disabled={pin.length !== 5 || pinLoading}
              style={styles.pinConfirmButton}
              variant="secondary"
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  const renderStripePayment = () => (
    <Animated.View 
      entering={FadeInDown.duration(300)} 
      style={styles.stripeContainer}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
        >
          <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
        </TouchableOpacity>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Payment Details</Text>
        <View style={styles.backButton} />
      </View>
      <StripePayment
        amount={paymentDetails.amount}
        method={'card'}
        onSuccess={handleStripeSuccess}
        onCancel={handleStripeCancel}
      />
    </Animated.View>
  );

  const renderSuccess = () => (
    <Animated.View 
      entering={FadeInDown.duration(300)} 
      style={styles.successContainer}
    >
      <View style={styles.successIcon}>
        <Check size={48} color="#10B981" />
      </View>
      <Text style={[styles.successTitle, isDark && styles.successTitleDark]}>
        {activeTab === 'topup' ? 'Top-Up Successful' : 'Payment Successful'}
      </Text>
      <Text style={[styles.successMessage, isDark && styles.successMessageDark]}>
        {activeTab === 'topup' 
          ? 'Your account has been topped up successfully.'
          : 'Your payment has been processed successfully.'}
      </Text>
      <Button
        title="Done"
        onPress={() => {
          setStep('selection');
          setPaymentDetails({ amount: '' });
        }}
        style={styles.doneButton}
        variant="secondary"
      />
    </Animated.View>
  );

  const renderError = () => (
    <Animated.View 
      entering={FadeInDown.duration(300)} 
      style={styles.errorContainer}
    >
      <View style={styles.errorIcon}>
        <X size={48} color="#EF4444" />
      </View>
      <Text style={[styles.errorTitle, isDark && styles.errorTitleDark]}>
        {activeTab === 'topup' ? 'Top-Up Failed' : 'Payment Failed'}
      </Text>
      <Text style={[styles.errorMessage, isDark && styles.errorMessageDark]}>
        Please try again or contact support if the problem persists.
      </Text>
      <Button
        title="Try Again"
        onPress={() => {
          setStep('summary');
          setPinError(false);
          setPin('');
        }}
        style={styles.retryButton}
        variant="secondary"
      />
    </Animated.View>
  );

  const renderContent = () => {
    switch (step) {
      case 'selection':
        return (
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.contentContainer, animatedStyle]}>
              {activeTab === 'topup' ? renderTopUpMethods() : renderPaymentDestinations()}
            </Animated.View>
          </GestureDetector>
        );
      case 'club':
        return renderClubSelection();
      case 'amount':
        return (
          <Animated.View 
            entering={FadeInDown.duration(300)} 
            style={styles.amountContainer}
          >
            <View style={styles.headerRow}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={handleBack}
              >
                <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
              </TouchableOpacity>
              <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                Enter Amount
              </Text>
              <View style={styles.backButton} />
            </View>
            <AmountInput
              value={paymentDetails.amount}
              onChange={(value) => setPaymentDetails(prev => ({ ...prev, amount: value }))}
            />
            <Button
              title="Continue"
              onPress={handleAmountSubmit}
              disabled={!paymentDetails.amount || parseFloat(paymentDetails.amount) <= 0}
              variant="secondary"
            />
          </Animated.View>
        );
      case 'summary':
        return (
          <Animated.View 
            entering={FadeInDown.duration(300)} 
            style={styles.summaryContainer}
          >
            <View style={styles.headerRow}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={handleBack}
              >
                <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
              </TouchableOpacity>
              <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                {activeTab === 'topup' ? 'Top-Up Summary' : 'Payment Summary'}
              </Text>
              <View style={styles.backButton} />
            </View>
            <PaymentSummary
              amount={paymentDetails.amount}
              method={paymentDetails.method}
              destination={paymentDetails.destination}
              club={paymentDetails.club}
              details={paymentDetails.details}
            />
            <Button
              title={activeTab === 'topup' ? "Confirm Top-up" : "Confirm Payment"}
              onPress={handleConfirmPayment}
              variant="secondary"
            />
          </Animated.View>
        );
      case 'stripe':
        return renderStripePayment();
      case 'pin':
        return renderPinModal();
      case 'success':
        return renderSuccess();
      case 'error':
        return renderError();
      default:
        return null;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView 
        ref={scrollRef}
        style={[styles.container, isDark && styles.containerDark]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.titleDark]}>Transactions</Text>
          
          <View style={[styles.tabs, isDark && styles.tabsDark]}>
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
        </View>

        {renderContent()}
        {renderPinModal()}
      </ScrollView>
    </GestureHandlerRootView>
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
    paddingTop: 40,
    paddingBottom: 85,
  },
  header: {
    marginBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
    marginBottom: 24,
    textAlign: 'left',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  contentContainer: {
    width: '100%',
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
    flex: 1,
  },
  methodTextDark: {
    color: '#FFFFFF',
  },
  methodSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 'auto',
  },
  methodSubtextDark: {
    color: '#A6A6A6',
  },
  clubContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    textAlign: 'center',
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
  stripeContainer: {
    gap: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  confirmButton: {
    flex: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20, // Add padding to prevent edge touching
  },
  modalContent: {
    width: '90%', // Increased from 85% for better proportion
    maxWidth: 400, // Add max width to prevent it from being too wide on larger screens
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24, // Increased padding
    // Add shadow for better visibility in light mode
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContentDark: {
    backgroundColor: '#1E1E1E',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
  },
  modalTitleDark: {
    color: '#FFFFFF',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
  },
  successContainer: {
    alignItems: 'center',
    padding: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  successTitleDark: {
    color: '#FFFFFF',
  },
  successMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  successMessageDark: {
    color: '#A6A6A6',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  errorTitleDark: {
    color: '#FFFFFF',
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorMessageDark: {
    color: '#A6A6A6',
  },
  doneButton: {
    width: '100%',
  },
  retryButton: {
    width: '100%',
    backgroundColor: '#EF4444',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  pinContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  pinInstructions: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
  },
  pinInstructionsDark: {
    color: '#9CA3AF',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginTop: 12,
    textAlign: 'center',
  },
  pinAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    width: '100%',
    justifyContent: 'center',
  },
  pinAmountLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
    marginRight: 8,
  },
  pinAmountLabelDark: {
    color: '#9CA3AF',
  },
  pinAmount: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
  },
  pinAmountDark: {
    color: '#FFFFFF',
  },
  pinConfirmButton: {
    width: '100%',
    marginTop: 16,
  },
});