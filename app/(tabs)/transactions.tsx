import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, useWindowDimensions } from 'react-native';
import { Building2, CreditCard, Smartphone, Book, Coffee, Beaker, Users, ArrowLeft, MoveHorizontal as MoreHorizontal, QrCode } from 'lucide-react-native';
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
import { FormInput } from '@/components/common/FormInput';
import { Button } from '@/components/common/Button';
import { QRScanner } from '@/components/payment/QRScanner';

type PaymentMethod = 'bank' | 'card' | 'mobile';
type PaymentDestination = 'canteen' | 'library' | 'lab' | 'club' | 'other';
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
  const { width: windowWidth } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  
  const [activeTab, setActiveTab] = useState<'topup' | 'payment'>('topup');
  const [step, setStep] = useState<'selection' | 'amount' | 'summary' | 'club'>('selection');
  const [showScanner, setShowScanner] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    amount: '',
  });

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
    if (destination === 'club') {
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
      case 'summary':
        setStep('amount');
        break;
      case 'amount':
        if (paymentDetails.destination === 'club') {
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

  const handleScan = (data: string) => {
    try {
      const scannedData = JSON.parse(data);
      if (scannedData.amount && scannedData.recipient) {
        setPaymentDetails(prev => ({
          ...prev,
          amount: scannedData.amount.toString(),
          destination: scannedData.destination || 'other',
          details: scannedData.details || `Payment to ${scannedData.recipient}`,
        }));
        setStep('summary');
      }
    } catch (error) {
      console.error('Invalid QR code data:', error);
    }
    setShowScanner(false);
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
        <Building2 size={32} color="#FFD700" />
        <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Bank Transfer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.methodCard, isDark && styles.methodCardDark]}
        onPress={() => handleMethodSelect('card')}
      >
        <CreditCard size={32} color="#4D9FFF" />
        <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Credit/Debit Card</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.methodCard, isDark && styles.methodCardDark]}
        onPress={() => handleMethodSelect('mobile')}
      >
        <Smartphone size={32} color="#10B981" />
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
        onPress={() => setShowScanner(true)}
      >
        <QrCode size={32} color="#FFD700" />
        <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Scan QR Code</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.methodCard, isDark && styles.methodCardDark]}
        onPress={() => handleDestinationSelect('canteen')}
      >
        <Coffee size={32} color="#4D9FFF" />
        <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Canteen</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.methodCard, isDark && styles.methodCardDark]}
        onPress={() => handleDestinationSelect('library')}
      >
        <Book size={32} color="#FF6B6B" />
        <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Library</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.methodCard, isDark && styles.methodCardDark]}
        onPress={() => handleDestinationSelect('lab')}
      >
        <Beaker size={32} color="#10B981" />
        <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Lab</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.methodCard, isDark && styles.methodCardDark]}
        onPress={() => handleDestinationSelect('club')}
      >
        <Users size={32} color="#A78BFA" />
        <Text style={[styles.methodText, isDark && styles.methodTextDark]}>Club</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.methodCard, isDark && styles.methodCardDark]}
        onPress={() => handleDestinationSelect('other')}
      >
        <MoreHorizontal size={32} color="#A78BFA" />
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
        {['Photography', 'Tech', 'Art', 'Sports', 'Music'].map((club) => (
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
                Payment Summary
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
              title="Confirm Payment"
              onPress={() => {}}
            />
          </Animated.View>
        );
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {showScanner ? (
        <QRScanner onClose={() => setShowScanner(false)} onScan={handleScan} />
      ) : (
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
        </ScrollView>
      )}
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
  },
  methodTextDark: {
    color: '#FFFFFF',
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
});