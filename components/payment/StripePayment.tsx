import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, useColorScheme, ActivityIndicator } from 'react-native';
import { CreditCard } from 'lucide-react-native';
import { Button } from '@/components/common/Button';
import { CardField, useConfirmPayment } from '@stripe/stripe-react-native';
import { initializeStripe, createPaymentIntent } from '../../supabase/stripe';

interface StripePaymentProps {
  amount: string;
  onSuccess: (paymentIntentId: string) => Promise<void>;
  onCancel: () => void;
}

export function StripePayment({ amount, onSuccess, onCancel }: StripePaymentProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(true);
  const submitting = useRef(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
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
    if (submitting.current) return;
    if (!clientSecret) {
      setError('Payment setup incomplete. Please try again.');
      return;
    }
    submitting.current = true;
    setProcessing(true);
    setError(null);
    try {
      const { paymentIntent, error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });
      if (error) throw error;
      if (!paymentIntent) throw new Error('Stripe did not return a payment.');
      await onSuccess(paymentIntent.id);
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      submitting.current = false;
      setProcessing(false);
    }
  };


  return (
    <View style={styles.checkout}>
      <View style={styles.total}>
        <Text style={styles.totalLabel}>Card top-up</Text>
        <Text style={styles.amount}>৳{Number(amount).toFixed(2)}</Text>
      </View>

      <View style={[styles.card, isDark && styles.cardDark]}>
        <View style={styles.cardHeader}>
          <CreditCard size={19} color={isDark ? '#FFD700' : '#725400'} />
          <Text style={[styles.title, isDark && styles.textDark]}>Card details</Text>
        </View>
        {loading ? (
          <ActivityIndicator accessibilityLabel="Preparing payment" color="#B88B00" style={styles.cardField} />
        ) : clientSecret ? (
          <CardField
            postalCodeEnabled={false}
            cardStyle={{
              backgroundColor: isDark ? '#2F2F2F' : '#F1F3F5',
              textColor: isDark ? '#FFFFFF' : '#1C1C1C',
              placeholderColor: isDark ? '#BBBBBB' : '#575F69',
            }}
            style={styles.cardField}
            onCardChange={({ complete }) => setCardComplete(complete)}
          />
        ) : null}
        {error && <Text accessibilityRole="alert" style={[styles.error, isDark && styles.errorDark]}>{error}</Text>}
        <Text style={[styles.provider, isDark && styles.textDark]}>Powered by Stripe</Text>
      </View>

      <Button title={'Pay ৳' + Number(amount).toFixed(2)} loading={processing} disabled={!cardComplete || !clientSecret} onPress={handlePayment} />
      <Button title="Back to review" variant="secondary" disabled={processing} onPress={onCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  checkout: { gap: 12 },
  total: { padding: 16, borderRadius: 18, gap: 5, backgroundColor: '#252117' },
  totalLabel: { fontSize: 13, color: '#F3D783', fontFamily: 'Inter-Medium' },
  amount: { fontSize: 29, color: '#FFFFFF', fontFamily: 'Inter-Bold', fontVariant: ['tabular-nums'] },
  card: { padding: 14, borderRadius: 16, gap: 10, backgroundColor: '#FFFFFF' },
  cardDark: { backgroundColor: '#1E1E1E' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 15, color: '#242424', fontFamily: 'Inter-SemiBold' },
  textDark: { color: '#DFDFDF' },
  provider: { fontSize: 12, color: '#5A6169' },
  cardField: { width: '100%', height: 48 },
  error: { fontSize: 13, color: '#A82020' },
  errorDark: { color: '#FF9B9B' },
});
