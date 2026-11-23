import { SegmentedTabs } from '@/components/common/SegmentedTabs';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, useWindowDimensions, Modal, TextInput, Alert } from 'react-native';
import { Building2, CreditCard, Smartphone, Book, Coffee, Beaker, Handshake, ArrowLeft, MoveHorizontal as MoreHorizontal, X, Check, Scan } from 'lucide-react-native';
import Animated, { 
  FadeInDown, ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
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
import { QRScanner, PaymentQRData } from '@/components/payment/QRScanner';

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
      return false;
    }
    
    const userPin = String(userProfile.pin).trim();
    const enteredPin = String(pin).trim();
    
    return userPin === enteredPin;
  } catch (error) {
    return false;
  }
};

const processPayment = async (details: PaymentDetails): Promise<void> => {
  try {
    await createTransaction({
      amount: parseFloat(details.amount),
      type: 'expense',
      category: details.destination || 'other',
      description: details.details || `Payment to ${details.destination}`,
    });
  } catch (error) {
    throw error;
  }
};

const processTopup = async (details: PaymentDetails, paymentIntentId?: string): Promise<void> => {
  try {
    await createTransaction({
      amount: parseFloat(details.amount),
      type: 'income',
      category: 'topup',
      description: `Top-up via ${details.method}`,
      stripe_payment_intent_id: paymentIntentId,
    });
  } catch (error) {
    throw error;
  }
};

export default function TransactionsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width: windowWidth } = useWindowDimensions();
  
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: 'topup' | 'payment' }>();
  const [activeTab, setActiveTab] = useState<'topup' | 'payment'>(mode === 'payment' ? 'payment' : 'topup');
  const [step, setStep] = useState<'selection' | 'amount' | 'summary' | 'club' | 'pin' | 'stripe' | 'success' | 'error'>('selection');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    amount: '',
  });
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const pending = useRef(false);
  const [processing, setProcessing] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);

  useFocusEffect(useCallback(() => {
    if (mode === 'topup' || mode === 'payment') {
      setActiveTab(mode);
      setStep('selection');
      setPaymentDetails({ amount: '' });
    }
  }, [mode]));

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
    if (pending.current) return;
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
          // Reset payment details when going back to selection
          setPaymentDetails({ amount: '' });
        }
        break;
      case 'club':
        setStep('selection');
        // Reset payment details when going back to selection
        setPaymentDetails({ amount: '' });
        break;
      default:
        setStep('selection');
        // Reset payment details when going back to selection
        setPaymentDetails({ amount: '' });
    }
  };

  const handleQRScanSuccess = (qrData: PaymentQRData) => {
    // Update payment details with QR data
    const updatedDetails: PaymentDetails = { ...paymentDetails };
    
    if (qrData.amount) {
      updatedDetails.amount = qrData.amount.toString();
    }
    
    if (qrData.destination) {
      updatedDetails.destination = qrData.destination as PaymentDestination;
    }
    
    if (qrData.club) {
      updatedDetails.club = qrData.club as Club;
    }
    
    if (qrData.description) {
      updatedDetails.details = qrData.description;
    }

    setPaymentDetails(updatedDetails);
    
    // Navigate to appropriate step
    if (qrData.destination === 'Club' && !qrData.club) {
      setStep('club');
    } else if (!qrData.amount) {
      setStep('amount');
    } else {
      setStep('summary');
    }
    
    setShowQrScanner(false);
  };

  const handleQRScanError = (error: string) => {
    Alert.alert('QR Scan Error', error);
    setShowQrScanner(false);
  };

  const submitPayment = async (action: () => Promise<void>, pinToCheck?: string) => {
    if (pending.current) return;
    pending.current = true;
    setProcessing(true);
    try {
      if (pinToCheck !== undefined) {
        if (!(await verifyPin(pinToCheck))) {
          setPinError(true);
          setPin('');
          return;
        }
        setPinModalVisible(false);
      }
      await action();
      setStep('success');
    } catch {
      setStep('error');
    } finally {
      pending.current = false;
      setProcessing(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (activeTab === 'payment') {
      // Show PIN modal for payment
      setPinModalVisible(true);
      setPin('');
      setPinError(false);
    } else {
      // Handle top-up
      if (paymentDetails.method === 'card') {
        setStep('stripe');
      } else {
        await submitPayment(() => processTopup(paymentDetails));
      }
    }
  };

  const handleStripeSuccess = (paymentIntentId: string) =>
    submitPayment(() => processTopup(paymentDetails, paymentIntentId));

  const handleStripeCancel = () => {
    if (pending.current) return;
    setStep('summary');
  };

  const handlePinChange = (value: string) => {
    setPin(value);
    setPinError(false);
   
  };
  
  const handlePinSubmit = (pinToCheck: string) =>
    submitPayment(() => processPayment(paymentDetails), pinToCheck);

  const handleClosePinModal = () => {
    if (pending.current) return;
    setPinModalVisible(false);
    setPin('');
    setPinError(false);
  };

  const handleTabSwitch = (tab: 'topup' | 'payment') => {
    setActiveTab(tab);
    setStep('selection');
    setPaymentDetails({ amount: '' });
  };

  const renderTopUpMethods = () => (
    <Animated.View 
      style={styles.methodsContainer}
    >
      <Animated.View>
        <TouchableOpacity
          style={[styles.methodCard, isDark && styles.methodCardDark]}
          onPress={() => handleMethodSelect('bank')}
        >
          <Building2 size={21} color={isDark ? '#FFD700' : '#FFB800'} />
          <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Bank transfer</Text><Text style={[styles.methodSubtext, isDark && styles.methodSubtextDark]}>Demo</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View>
        <TouchableOpacity
          style={[styles.methodCard, isDark && styles.methodCardDark]}
          onPress={() => handleMethodSelect('card')}
        >
          <CreditCard size={32} color={isDark ? '#4D9FFF' : '#0066CC'} />
          <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Credit or debit card</Text>
          <Text style={[styles.methodSubtext, isDark && styles.methodSubtextDark]}>Stripe</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View>
        <TouchableOpacity
          style={[styles.methodCard, isDark && styles.methodCardDark]}
          onPress={() => handleMethodSelect('mobile')}
        >
          <Smartphone size={32} color={isDark ? '#10B981' : '#059669'} />
          <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Mobile banking</Text><Text style={[styles.methodSubtext, isDark && styles.methodSubtextDark]}>Demo</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );

  const renderPaymentDestinations = () => (
    <View style={styles.methodsContainer}>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => setShowQrScanner(true)}
        style={styles.scanCard}
        activeOpacity={0.8}
      >
        <View style={styles.scanIcon}><Scan size={22} color="#6B5000" /></View>
        <View style={styles.methodBody}>
          <Text style={styles.scanTitle}>Scan QR code</Text>
          <Text style={styles.scanCaption}>Use a DeltaCoin payment code</Text>
        </View>
      </TouchableOpacity>
      <Text style={[styles.groupLabel, isDark && styles.methodSubtextDark]}>Pay by category</Text>
      <View style={styles.destinationGrid}>
        {([
          ['Canteen', Coffee], ['Library', Book], ['Lab', Beaker],
          ['Club', Handshake], ['Other', MoreHorizontal],
        ] as const).map(([destination, Icon]) => (
          <TouchableOpacity
            key={destination}
            accessibilityRole="button"
            onPress={() => handleDestinationSelect(destination)}
            style={[styles.destinationTile, isDark && styles.methodCardDark]}
            activeOpacity={0.75}
          >
            <Icon size={20} color={isDark ? '#FFD700' : '#725400'} />
            <Text style={[styles.methodText, isDark && styles.methodTextDark]}>{destination}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderClubSelection = () => (
    <Animated.View 
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
        {['Photography', 'Social', 'Computer', 'Sports', 'Women Empowerment','Film & Comedy'].map((club, index) => (
          <Animated.View key={club}>
            <TouchableOpacity
              style={[styles.clubOption, isDark && styles.clubOptionDark]}
              onPress={() => handleClubSelect(club.toLowerCase() as Club)}
            >
              <Text style={[styles.clubText, isDark && styles.clubTextDark]}>{club}</Text>
            </TouchableOpacity>
          </Animated.View>
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

  const renderPinModal = () => (
    <Modal
      visible={pinModalVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClosePinModal}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
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
              title="Confirm"
              onPress={() => handlePinSubmit(pin)}
              loading={processing}
              disabled={pin.length !== 5}
              style={styles.pinConfirmButton}
              variant="secondary"
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  const renderStripePayment = () => (
    <StripePayment amount={paymentDetails.amount} onSuccess={handleStripeSuccess} onCancel={handleStripeCancel} />
  );

  const renderSuccess = () => {
    const isTopUp = activeTab === 'topup';
    const reset = () => {
      setStep('selection');
      setPaymentDetails({ amount: '' });
    };

    return (
      <View style={styles.successContainer}>
        <View style={[styles.receiptCard, isDark && styles.receiptCardDark]}>
          <View style={[styles.successIcon, isDark && styles.successIconDark]}>
            <Check size={24} color={isDark ? '#65D7A4' : '#16764B'} />
          </View>
          <Text style={[styles.successTitle, isDark && styles.titleDark]}>
            {isTopUp ? 'Top-up successful' : 'Payment successful'}
          </Text>
          <Text style={[styles.receiptAmount, isDark && styles.titleDark]}>
            {isTopUp ? '+' : '−'}৳{Number(paymentDetails.amount).toLocaleString('en-BD', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <Text style={[styles.successMessage, isDark && styles.successMessageDark]}>
            {isTopUp ? 'Added to your wallet' : paymentDetails.destination || 'Wallet payment'}
          </Text>
        </View>

        <Button title="Done" onPress={reset} variant="secondary" />
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.historyLink}
          onPress={() => {
            reset();
            router.navigate('/history');
          }}
        >
          <Text style={[styles.historyLinkText, isDark && styles.historyLinkTextDark]}>View in History</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderError = () => (
    <Animated.View 
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
          <Animated.View style={styles.contentContainer}>
            {activeTab === 'topup' ? renderTopUpMethods() : renderPaymentDestinations()}
          </Animated.View>
        );
      case 'club':
        return renderClubSelection();
      case 'amount':
        return (
          <Animated.View 
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
              title={`${activeTab === 'topup' ? 'Add' : 'Pay'} ৳${Number(paymentDetails.amount).toFixed(2)}`}
              loading={processing}
              onPress={handleConfirmPayment}
              variant="secondary"
            />
          </Animated.View>
        );
      case 'stripe':
        return renderStripePayment();
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
        style={[styles.container, isDark && styles.containerDark]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.titleDark]}>Wallet</Text>
          
          {step === 'selection' && (
            <SegmentedTabs
              value={activeTab}
              onChange={handleTabSwitch}
              options={[{ value: 'topup', label: 'Top up' }, { value: 'payment', label: 'Pay' }]}
            />
          )}
        </View>

        <Animated.View key={step + activeTab} entering={FadeInDown.duration(200).reduceMotion(ReduceMotion.System)}>
          {renderContent()}
        </Animated.View>
      </ScrollView>

      {renderPinModal()}
      
      <QRScanner
        visible={showQrScanner}
        onClose={() => setShowQrScanner(false)}
        onScanSuccess={handleQRScanSuccess}
        onScanError={handleQRScanError}
        timeout={30000}
        allowedFormats={['deltacoin']} // Only DeltaCoin format
      />
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
    paddingTop: 14,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
    marginBottom: 14,
    textAlign: 'left',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  contentContainer: {
    width: '100%',
  },
  scanCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18, backgroundColor: '#FFF0B8' },
  scanIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFDF70' },
  scanTitle: { color: '#271E00', fontFamily: 'Inter-SemiBold', fontSize: 16 },
  scanCaption: { color: '#5E4C16', fontSize: 12, marginTop: 3 },
  methodBody: { flex: 1 },
  groupLabel: { color: '#515965', fontFamily: 'Inter-SemiBold', fontSize: 13, marginTop: 5 },
  destinationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  destinationTile: { width: '48%', minHeight: 54, borderRadius: 14, padding: 12, gap: 10, alignItems: 'center', flexDirection: 'row', backgroundColor: '#FFFFFF' },
  receiptAmount: { fontSize: 30, fontFamily: 'Inter-Bold', color: '#222222', textAlign: 'center' },
  methodsContainer: {
    gap: 10,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 13,
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
    fontSize: 14,
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
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
  successContainer: { gap: 12 },
  receiptCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E7E8EA',
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 24,
    gap: 8,
    marginBottom: 4,
  },
  receiptCardDark: { backgroundColor: '#1E1E1E', borderColor: '#353535' },
  successIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#E4F5EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  successIconDark: { backgroundColor: '#20392D' },
  successTitle: { fontSize: 17, fontFamily: 'Inter-SemiBold', color: '#252525', textAlign: 'center' },
  successMessage: { fontSize: 14, color: '#58616D', textAlign: 'center' },
  successMessageDark: { color: '#B8B8B8' },
  historyLink: { minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  historyLinkText: { fontSize: 14, fontFamily: 'Inter-SemiBold', color: '#5A4600', textAlign: 'center' },
  historyLinkTextDark: { color: '#F3D783' },
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
    marginBottom: 14,
  },
  errorMessageDark: {
    color: '#A6A6A6',
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
    marginBottom: 14,
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
