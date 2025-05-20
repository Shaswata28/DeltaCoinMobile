// Update the imports at the top of the file
import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, useWindowDimensions } from 'react-native';
import { Building2, CreditCard, Smartphone, Book, Coffee, Beaker, Users, ArrowLeft, MoveHorizontal as MoreHorizontal, QrCode } from 'lucide-react-native';
import { QRScanner } from '@/components/payment/QRScanner';

// Add showScanner state and handleScan function inside the component
const [showScanner, setShowScanner] = useState(false);

const handleScan = (data: string) => {
  try {
    const paymentData = JSON.parse(data);
    if (paymentData.amount && paymentData.recipient) {
      setPaymentDetails(prev => ({
        ...prev,
        amount: paymentData.amount.toString(),
        destination: paymentData.destination || 'other',
        details: paymentData.details || '',
      }));
      setStep('summary');
    }
  } catch (error) {
    console.error('Invalid QR code data:', error);
  }
  setShowScanner(false);
};

// Add QR scanner button to quick actions
<TouchableOpacity 
  style={[styles.actionButton, isDark && styles.actionButtonDark]}
  onPress={() => setShowScanner(true)}
>
  <QrCode size={24} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
  <Text style={[styles.actionText, isDark && styles.actionTextDark]}>
    Scan QR
  </Text>
</TouchableOpacity>

// Add QR scanner component
{showScanner && (
  <QRScanner
    onClose={() => setShowScanner(false)}
    onScan={handleScan}
  />
)}