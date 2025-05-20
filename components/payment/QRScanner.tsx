import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, useColorScheme } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { ArrowLeft } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface QRScannerProps {
  onClose: () => void;
  onScan: (data: string) => void;
}

export function QRScanner({ onClose, onScan }: QRScannerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanned) {
      setScanned(true);
      onScan(data);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Text style={[styles.text, isDark && styles.textDark]}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Text style={[styles.text, isDark && styles.textDark]}>No access to camera</Text>
        <TouchableOpacity 
          style={[styles.button, isDark && styles.buttonDark]} 
          onPress={onClose}
        >
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View 
      entering={FadeIn.duration(300)}
      style={[styles.container, isDark && styles.containerDark]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
        </TouchableOpacity>
        <Text style={[styles.title, isDark && styles.titleDark]}>Scan QR Code</Text>
        <View style={styles.closeButton} />
      </View>

      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.scanner}
        />
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
        </View>
      </View>

      <Text style={[styles.instructions, isDark && styles.instructionsDark]}>
        Position the QR code within the frame to scan
      </Text>

      {scanned && (
        <TouchableOpacity 
          style={[styles.button, isDark && styles.buttonDark]} 
          onPress={() => setScanned(false)}
        >
          <Text style={styles.buttonText}>Scan Again</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#2C2C2C',
    textAlign: 'center',
    marginTop: 20,
  },
  textDark: {
    color: '#FFFFFF',
  },
  instructions: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B6B6B',
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 40,
  },
  instructionsDark: {
    color: '#A6A6A6',
  },
  button: {
    backgroundColor: '#4D9FFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  buttonDark: {
    backgroundColor: '#82B1FF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
});