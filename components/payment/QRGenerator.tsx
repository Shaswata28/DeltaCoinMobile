import React from 'react';
import { View, Text, StyleSheet, useColorScheme, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { PaymentQRData } from './QRScanner';

export interface QRGeneratorProps {
  data: PaymentQRData;
  size?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  logo?: string;
}

export function QRGenerator({
  data,
  size = 200,
  backgroundColor = '#FFFFFF',
  foregroundColor = '#000000',
  logo
}: QRGeneratorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const generateQRString = (paymentData: PaymentQRData): string => {
    console.log('QRGenerator: Input data for QR string generation:', paymentData);
    
    // Generate DeltaCoin format QR code
    const params = new URLSearchParams();
    
    if (paymentData.amount) {
      params.append('amount', paymentData.amount.toString());
      console.log('QRGenerator: Added amount parameter:', paymentData.amount.toString());
    }
    
    if (paymentData.destination) {
      params.append('destination', paymentData.destination.toLowerCase());
      console.log('QRGenerator: Added destination parameter:', paymentData.destination.toLowerCase());
    }
    
    if (paymentData.club) {
      params.append('club', paymentData.club.toLowerCase());
      console.log('QRGenerator: Added club parameter:', paymentData.club.toLowerCase());
    }
    
    if (paymentData.description) {
      params.append('description', paymentData.description);
      console.log('QRGenerator: Added description parameter:', paymentData.description);
    }

    if (paymentData.reference) {
      params.append('ref', paymentData.reference);
      console.log('QRGenerator: Added reference parameter:', paymentData.reference);
    }

    const qrValue = `deltacoin://pay?${params.toString()}`;
    console.log('QRGenerator: Generated QR string:', qrValue);
    console.log('QRGenerator: URL parameters string:', params.toString());
    
    return qrValue;
  };

  const qrValue = generateQRString(data);

  if (!qrValue || qrValue === 'deltacoin://pay?') {
    console.log('QRGenerator: Invalid QR value generated:', qrValue);
    return (
      <View style={[styles.errorContainer, isDark && styles.errorContainerDark]}>
        <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
          Invalid payment data for QR generation
        </Text>
      </View>
    );
  }

  console.log('QRGenerator: Rendering QR code with final value:', qrValue);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={[styles.qrContainer, { backgroundColor }]}>
        <QRCode
          value={qrValue}
          size={size}
          color={foregroundColor}
          backgroundColor={backgroundColor}
          logo={logo ? { uri: logo } : undefined}
          logoSize={size * 0.2}
          logoBackgroundColor={backgroundColor}
          logoMargin={2}
          logoBorderRadius={4}
        />
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={[styles.infoTitle, isDark && styles.infoTitleDark]}>
          Payment QR Code
        </Text>
        {data.amount && (
          <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
            Amount: ৳{data.amount.toFixed(2)}
          </Text>
        )}
        {data.destination && (
          <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
            Destination: {data.destination}
          </Text>
        )}
        {data.description && (
          <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
            Description: {data.description}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  containerDark: {
    backgroundColor: '#1E1E1E',
  },
  qrContainer: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  infoTitleDark: {
    color: '#FFFFFF',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  infoTextDark: {
    color: '#A6A6A6',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorContainerDark: {
    backgroundColor: '#2D1B1B',
    borderColor: '#7F1D1D',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#DC2626',
    textAlign: 'center',
  },
  errorTextDark: {
    color: '#F87171',
  },
});