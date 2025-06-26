import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Lock, CreditCard } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CardField, useConfirmPayment } from '@stripe/stripe-react-native';
import { initializeStripe, createPaymentIntent } from '../../supabase/stripe';

interface StripePaymentProps {
  amount: string;
  method: 'card';
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

export function StripePayment({ amount, method, onSuccess, onCancel }: StripePaymentProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState<any>(null);
  const { confirmPayment } = useConfirmPayment();

  useEffect(() => {
    const initStripe = async () => {
      try {
        await initializeStripe();
        const { clientSecret } = await createPaymentIntent(parseFloat(amount));
        setClientSecret(clientSecret);
        setLoading(false);
      } catch (err) {
        setError('Failed to initialize payment. Please try again.');
        setLoading(false);
      }
    };
    initStripe();
  }, [amount]);

  const handlePayment = async () => {
    if (!clientSecret) {
      setError('Payment setup incomplete. Please try again.');
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const { paymentIntent, error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });
      if (error) throw error;
      onSuccess(paymentIntent.id);
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.loadingContainer}>
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
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#635BFF" />
            <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
              Initializing secure payment...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.containerDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={styles.paymentContainer}
          >
            {/* Stripe Header */}
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

            {/* Card Payment Form */}
            <View style={[styles.paymentForm, isDark && styles.paymentFormDark]}>
              <View style={styles.methodHeader}>
                <View style={styles.methodIcon}>
                  <CreditCard size={24} color="#635BFF" />
                </View>
                <Text style={[styles.methodTitle, isDark && styles.methodTitleDark]}>
                  Card Information
                </Text>
              </View>
              <CardField
                postalCodeEnabled={false}
                placeholders={{ number: '4242 4242 4242 4242' }}
                cardStyle={{
                  backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                  textColor: isDark ? '#FFFFFF' : '#000000',
                }}
                style={{ width: '100%', height: 50, marginVertical: 30 }}
                onCardChange={setCardDetails}
              />
              
              {/* Security Info */}
              <View style={[styles.securityInfo, isDark && styles.securityInfoDark]}>
                <Lock size={16} color="#10B981" />
                <Text style={[styles.securityText, isDark && styles.securityTextDark]}>
                  Your payment information is encrypted and secure
                </Text>
              </View>
              {error && <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text>}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, isDark && styles.cancelButtonDark]}
                onPress={onCancel}
                disabled={processing}
              >
                <Text style={[styles.cancelButtonText, isDark && styles.cancelButtonTextDark]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.payButton,
                  isDark && styles.payButtonDark,
                  (!cardDetails?.complete || processing) && styles.payButtonDisabled
                ]}
                onPress={handlePayment}
                disabled={!cardDetails?.complete || processing}
              >
                {processing ? (
                  <View style={styles.processingContainer}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.payButtonText}>Processing...</Text>
                  </View>
                ) : (
                  <Text style={styles.payButtonText}>
                    Pay ৳{parseFloat(amount).toFixed(2)}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
                Powered by Stripe
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  containerDark: {
    backgroundColor: '#1E1E1E',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 16,
  },
  loadingTextDark: {
    color: '#9CA3AF',
  },
  paymentContainer: {
    flex: 1,
    
  },
  stripeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
  paymentForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  paymentFormDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  methodIcon: {
    marginRight: 12,
  },
  methodTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  methodTitleDark: {
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  inputLabelDark: {
    color: '#D1D5DB',
  },
  textInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  textInputDark: {
    color: '#FFFFFF',
    backgroundColor: '#374151',
    borderColor: '#4B5563',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    marginTop: 8,
  },
  securityInfoDark: {
    backgroundColor: '#064E3B',
  },
  securityText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
    flex: 1,
  },
  securityTextDark: {
    color: '#34D399',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonDark: {
    borderColor: '#4B5563',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  cancelButtonTextDark: {
    color: '#9CA3AF',
  },
  payButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#635BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDark: {
    backgroundColor: '#5B52FF',
  },
  payButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  payButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  footerTextDark: {
    color: '#6B7280',
  },
});