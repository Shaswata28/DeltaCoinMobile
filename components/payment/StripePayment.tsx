import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, useColorScheme, ActivityIndicator } from 'react-native';
import { Lock } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { 
  StripeProvider,
  usePaymentSheet
} from '@stripe/stripe-react-native';
import { supabase } from '../../supabase/client';

interface StripePaymentProps {
  amount: string;
  method: 'bank' | 'card';
  onSuccess: () => void;
  onCancel: () => void;
}

// Stripe Payment Component with Official Payment Sheet
function StripePaymentContent({ amount, method, onSuccess, onCancel }: StripePaymentProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Initializing payment...');
  
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();

  // Fetch payment intent from Supabase Edge Function
  const fetchPaymentSheetParams = async () => {
    try {
      setStatus('Creating payment intent...');
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: parseFloat(amount),
          currency: 'usd', // Change to 'bdt' if you want Bangladesh Taka
          payment_method_types: method === 'bank' ? ['us_bank_account'] : ['card'],
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to create payment intent');
      }

      if (!data) {
        throw new Error('No data returned from payment intent creation');
      }

      return data;
    } catch (error) {
      console.error('Error fetching payment sheet params:', error);
      throw error;
    }
  };

  const initializePaymentSheet = async () => {
    try {
      setStatus('Preparing payment...');
      
      const { paymentIntent, ephemeralKey, customer, publishableKey } = await fetchPaymentSheetParams();

      if (!paymentIntent || !ephemeralKey || !customer) {
        throw new Error('Invalid payment parameters received');
      }

      const { error } = await initPaymentSheet({
        merchantDisplayName: 'DeltaCoin',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: method === 'bank',
        defaultBillingDetails: {
          name: 'DeltaCoin User',
        },
        appearance: {
          colors: {
            primary: '#FFD700',
            background: isDark ? '#1E1E1E' : '#FFFFFF',
            componentBackground: isDark ? '#2E2E2E' : '#F9FAFB',
            componentBorder: isDark ? '#374151' : '#E5E7EB',
            componentDivider: isDark ? '#374151' : '#E5E7EB',
            primaryText: isDark ? '#FFFFFF' : '#1F2937',
            secondaryText: isDark ? '#A6A6A6' : '#6B7280',
            componentText: isDark ? '#FFFFFF' : '#1F2937',
            placeholderText: isDark ? '#9CA3AF' : '#6B7280',
          },
          shapes: {
            borderRadius: 12,
            borderWidth: 1,
          },
          primaryButton: {
            colors: {
              background: '#FFD700',
              text: '#000000',
            },
            shapes: {
              borderRadius: 8,
            },
          },
        },
        returnURL: 'deltacoin://payment-return',
      });

      if (error) {
        console.error('Payment sheet initialization error:', error);
        Alert.alert(
          'Payment Setup Failed',
          'Unable to initialize payment. Please try again.',
          [{ text: 'OK', onPress: onCancel }]
        );
        return;
      }

      // Automatically present the payment sheet after initialization
      setStatus('Opening payment sheet...');
      await handlePresentPaymentSheet();

    } catch (error) {
      console.error('Payment initialization error:', error);
      Alert.alert(
        'Payment Error',
        error instanceof Error ? error.message : 'Failed to initialize payment. Please try again.',
        [{ text: 'OK', onPress: onCancel }]
      );
    }
  };

  const handlePresentPaymentSheet = async () => {
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        if (error.code === 'Canceled') {
          // User canceled the payment sheet
          console.log('Payment canceled by user');
          onCancel();
          return;
        }
        
        console.error('Payment sheet error:', error);
        Alert.alert(
          'Payment Failed',
          error.message || 'Payment could not be processed. Please try again.',
          [{ text: 'OK', onPress: onCancel }]
        );
        return;
      }

      // Payment successful
      console.log('Payment successful');
      onSuccess();

    } catch (error) {
      console.error('Payment presentation error:', error);
      Alert.alert(
        'Payment Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK', onPress: onCancel }]
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Animated.View 
        entering={FadeInDown.duration(400)}
        style={styles.loadingContainer}
      >
        {/* Stripe Branding Header */}
        <View style={[styles.stripeHeader, isDark && styles.stripeHeaderDark]}>
          <View style={styles.stripeLogo}>
            <Text style={styles.stripeLogoText}>stripe</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.merchantName, isDark && styles.merchantNameDark]}>
              DeltaCoin
            </Text>
            <Text style={[styles.paymentAmount, isDark && styles.paymentAmountDark]}>
              ৳{parseFloat(amount).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Loading Content */}
        <View style={styles.loadingContent}>
          <View style={[styles.loadingIcon, isDark && styles.loadingIconDark]}>
            <ActivityIndicator size="large" color="#FFD700" />
          </View>
          
          <Text style={[styles.loadingTitle, isDark && styles.loadingTitleDark]}>
            {method === 'card' ? 'Preparing Card Payment' : 'Preparing Bank Transfer'}
          </Text>
          
          <Text style={[styles.loadingStatus, isDark && styles.loadingStatusDark]}>
            {status}
          </Text>

          <View style={[styles.securityBadge, isDark && styles.securityBadgeDark]}>
            <Lock size={14} color="#10B981" />
            <Text style={[styles.securityText, isDark && styles.securityTextDark]}>
              Secured by Stripe
            </Text>
          </View>
        </View>

        {/* Payment Method Info */}
        <View style={[styles.methodInfo, isDark && styles.methodInfoDark]}>
          <Text style={[styles.methodTitle, isDark && styles.methodTitleDark]}>
            {method === 'card' ? 'Credit/Debit Card' : 'Bank Transfer'}
          </Text>
          <Text style={[styles.methodDescription, isDark && styles.methodDescriptionDark]}>
            {method === 'card' 
              ? 'Secure card payment processing via Stripe'
              : 'Direct bank account connection via Stripe'
            }
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

// Main component wrapped with StripeProvider
export function StripePayment(props: StripePaymentProps) {
  // Get publishable key from environment or use default
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || 
    'pk_test_51QdQNm4F0S1g4Op0K2sq2qibZzjfE26kcpqjVYjachazX3zlkzCW3OH8lBrVIxy0MvOhwk2OHdMIn0hW2Uamhskh00OjXiGCFR';

  return (
    <StripeProvider
      publishableKey={publishableKey}
      merchantIdentifier="merchant.deltacoin.app"
    >
      <StripePaymentContent {...props} />
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#1E1E1E',
  },
  loadingContainer: {
    flex: 1,
    padding: 20,
  },
  stripeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FAFBFC',
    borderRadius: 12,
    marginBottom: 24,
  },
  stripeHeaderDark: {
    borderBottomColor: '#374151',
    backgroundColor: '#111827',
  },
  stripeLogo: {
    backgroundColor: '#635BFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 16,
  },
  stripeLogoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.5,
  },
  headerInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  merchantNameDark: {
    color: '#FFFFFF',
  },
  paymentAmount: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#635BFF',
  },
  paymentAmountDark: {
    color: '#818CF8',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingIconDark: {
    backgroundColor: '#2D3748',
  },
  loadingTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingTitleDark: {
    color: '#FFFFFF',
  },
  loadingStatus: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  loadingStatusDark: {
    color: '#9CA3AF',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  securityBadgeDark: {
    backgroundColor: '#064E3B',
  },
  securityText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
  securityTextDark: {
    color: '#34D399',
  },
  methodInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  methodInfoDark: {
    backgroundColor: '#111827',
  },
  methodTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  methodTitleDark: {
    color: '#FFFFFF',
  },
  methodDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  methodDescriptionDark: {
    color: '#9CA3AF',
  },
});