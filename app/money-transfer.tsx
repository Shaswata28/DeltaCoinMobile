import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AmountInput } from '../components/payment/AmountInput';
import { FormInput } from '../components/common/FormInput';
import { PinInput } from '../components/common/PinInput';
import { Button } from '../components/common/Button';
import { sendMoneyToFriend, sendMoneyRequest } from '../supabase/friends';
import { getCurrentUserProfile } from '../supabase/auth';
import { PROFILE_IMAGES } from '../components/constants/images';
import type { UserSearchResult } from '../supabase/friends';

export default function MoneyTransferScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Parse friend data and type from params
  const friend: UserSearchResult = params.friend ? JSON.parse(params.friend as string) : null;
  const type = params.type as 'send' | 'request';
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'pin' | 'success'>('details');
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
    
    // Redirect if no friend data
    if (!friend || !type) {
      router.back();
    }
  }, []);

  const getCurrentUser = async () => {
    try {
      const profile = await getCurrentUserProfile();
      if (profile) {
        setCurrentUserId(profile.id);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const validatePin = async (pinToCheck: string): Promise<boolean> => {
    try {
      const userProfile = await getCurrentUserProfile();
      if (!userProfile) return false;
      
      const userPin = String(userProfile.pin).trim();
      const enteredPin = String(pinToCheck).trim();
      
      return userPin === enteredPin;
    } catch (error) {
      return false;
    }
  };

  const handleContinue = () => {
    setError('');
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > 10000) {
      setError('Amount cannot exceed ৳10,000');
      return;
    }

    if (type === 'send') {
      setStep('pin');
    } else {
      handleSubmit();
    }
  };

  const handlePinSubmit = async (enteredPin: string) => {
    if (enteredPin.length !== 5) return;

    try {
      const isValidPin = await validatePin(enteredPin);
      if (isValidPin) {
        setPin(enteredPin);
        handleSubmit();
      } else {
        setError('Incorrect PIN. Please try again.');
        setPin('');
      }
    } catch (error) {
      setError('Failed to verify PIN. Please try again.');
      setPin('');
    }
  };

  const handleSubmit = async () => {
    if (!currentUserId) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const amountValue = parseFloat(amount);
      
      if (type === 'send') {
        await sendMoneyToFriend(
          currentUserId,
          friend.id,
          amountValue,
          description || `Money sent to ${friend.full_name}`
        );
      } else {
        await sendMoneyRequest(
          currentUserId,
          friend.id,
          amountValue,
          description || `Money request from ${friend.full_name}`
        );
      }

      setStep('success');
      
      // Auto-navigate back after success
      setTimeout(() => {
        router.back();
      }, 2500);
      
    } catch (error: any) {
      console.error(`Error ${type === 'send' ? 'sending' : 'requesting'} money:`, error);
      setError(error.message || `Failed to ${type} money. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'pin') {
      setStep('details');
      setPin('');
      setError('');
    } else {
      router.back();
    }
  };

  const renderDetailsStep = () => (
    <View style={styles.detailsStepContent}>
      <View style={styles.friendInfo}>
        <Image
          source={{
            uri: friend?.profile_picture_url || PROFILE_IMAGES.defaultAvatar
          }}
          style={styles.friendAvatar}
        />
        <Text style={[styles.actionTitle, isDark && styles.actionTitleDark]}>
          {type === 'send' ? 'Send Money to' : 'Request Money from'}
        </Text>
        <Text style={[styles.friendName, isDark && styles.friendNameDark]}>
          {friend?.full_name}
        </Text>
        <Text style={[styles.friendUsername, isDark && styles.friendUsernameDark]}>
          @{friend?.username}
        </Text>
      </View>

      <View style={styles.formSection}>
        <AmountInput
          value={amount}
          onChange={setAmount}
          error={error && error.includes('amount') ? error : undefined}
        />

        <FormInput
          label="Description (Optional)"
          value={description}
          onChangeText={setDescription}
          placeholder={`What's this ${type === 'send' ? 'payment' : 'request'} for?`}
          multiline
          numberOfLines={3}
          style={styles.descriptionInput}
        />

        {error && !error.includes('amount') && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          loading={loading}
          style={styles.continueButton}
          variant="secondary"
        />
      </View>
    </View>
  );

  const renderPinStep = () => (
    <View style={styles.pinStepContent}>
      <View style={styles.pinSection}>
        <Text style={[styles.pinTitle, isDark && styles.pinTitleDark]}>
          Confirm Payment
        </Text>
        <Text style={[styles.pinSubtitle, isDark && styles.pinSubtitleDark]}>
          Enter your 5-digit PIN to authorize this payment
        </Text>

        <View style={[styles.summaryCard, isDark && styles.summaryCardDark]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, isDark && styles.summaryLabelDark]}>
              To:
            </Text>
            <Text style={[styles.summaryValue, isDark && styles.summaryValueDark]}>
              {friend?.full_name}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, isDark && styles.summaryLabelDark]}>
              Amount:
            </Text>
            <Text style={[styles.summaryAmount, isDark && styles.summaryAmountDark]}>
              ৳{parseFloat(amount).toFixed(2)}
            </Text>
          </View>
          {description && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, isDark && styles.summaryLabelDark]}>
                Description:
              </Text>
              <Text style={[styles.summaryValue, isDark && styles.summaryValueDark]} numberOfLines={2}>
                {description}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.pinInputContainer}>
          <PinInput
            value={pin}
            onChange={(value) => {
              setPin(value);
              setError('');
              if (value.length === 5) {
                handlePinSubmit(value);
              }
            }}
            length={5}
            disabled={loading}
          />
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
              Processing payment...
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.successStepContent}>
      <View style={styles.successSection}>
        <View style={styles.successIcon}>
          {type === 'send' ? (
            <Send size={40} color="#10B981" />
          ) : (
            <MessageCircle size={40} color="#10B981" />
          )}
        </View>
        
        <Text style={[styles.successTitle, isDark && styles.successTitleDark]}>
          {type === 'send' ? 'Money Sent!' : 'Request Sent!'}
        </Text>
        
        <Text style={[styles.successMessage, isDark && styles.successMessageDark]}>
          {type === 'send' 
            ? `৳${parseFloat(amount).toFixed(2)} has been sent to ${friend?.full_name}`
            : `Your request for ৳${parseFloat(amount).toFixed(2)} has been sent to ${friend?.full_name}`
          }
        </Text>

        <View style={styles.successActions}>
          <Button
            title="Done"
            onPress={() => router.back()}
            style={styles.doneButton}
            variant="secondary"
          />
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (step) {
      case 'details':
        return renderDetailsStep();
      case 'pin':
        return renderPinStep();
      case 'success':
        return renderSuccessStep();
      default:
        return renderDetailsStep();
    }
  };

  if (!friend || !type) {
    return (
      <View style={[styles.container, styles.errorContainer, isDark && styles.containerDark]}>
        <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
          Invalid transfer data
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        {/* Header matching other pages */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            disabled={loading && step === 'pin'}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
            {type === 'send' ? 'Send Money' : 'Request Money'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            entering={FadeInDown.duration(200)}
          >
            {renderContent()}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
    flex: 1,
    textAlign: 'center',
  },
  headerTitleDark: {
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 100,
  },
  detailsStepContent: {
    justifyContent: 'space-between',
    minHeight: 400,
  },
  pinStepContent: {
    justifyContent: 'center',
    minHeight: 500,
  },
  successStepContent: {
    justifyContent: 'center',
    minHeight: 400,
  },
  friendInfo: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  friendAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  actionTitleDark: {
    color: '#A6A6A6',
  },
  friendName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
    marginBottom: 4,
    textAlign: 'center',
  },
  friendNameDark: {
    color: '#FFFFFF',
  },
  friendUsername: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  friendUsernameDark: {
    color: '#A6A6A6',
  },
  formSection: {
    marginBottom: 24,
  },
  descriptionInput: {
    marginTop: 16,
  },
  buttonContainer: {
    marginTop: 24,
  },
  continueButton: {
    width: '100%',
  },
  pinSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  pinTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
    marginBottom: 8,
    textAlign: 'center',
  },
  pinTitleDark: {
    color: '#FFFFFF',
  },
  pinSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  pinSubtitleDark: {
    color: '#A6A6A6',
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryCardDark: {
    backgroundColor: '#2E2E2E',
    borderColor: '#374151',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  summaryLabelDark: {
    color: '#A6A6A6',
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#2C2C2C',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  summaryValueDark: {
    color: '#FFFFFF',
  },
  summaryAmount: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#10B981',
  },
  summaryAmountDark: {
    color: '#34D399',
  },
  pinInputContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 12,
  },
  loadingTextDark: {
    color: '#A6A6A6',
  },
  successSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  successTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
    marginBottom: 12,
    textAlign: 'center',
  },
  successTitleDark: {
    color: '#FFFFFF',
  },
  successMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  successMessageDark: {
    color: '#A6A6A6',
  },
  successActions: {
    width: '100%',
  },
  doneButton: {
    width: '100%',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginTop: 8,
    textAlign: 'center',
  },
  errorTextDark: {
    color: '#FF6B6B',
  },
});