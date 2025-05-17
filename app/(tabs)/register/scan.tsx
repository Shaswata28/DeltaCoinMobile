import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView } from 'expo-camera';
import { manipulateAsync } from 'expo-image-manipulator';
import * as Vision from 'expo-vision';
import { Button } from '@/components/common/Button';
import { Camera, X } from 'lucide-react-native';

export default function ScanScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await CameraView.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleClose = () => {
    router.back();
  };

  const handleCapture = async () => {
    if (scanning) return;
    setScanning(true);

    try {
      const photo = await camera.current?.takePictureAsync();
      if (!photo?.uri) return;

      // Process the image
      const processedImage = await manipulateAsync(
        photo.uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.8, format: 'jpeg' }
      );

      // Perform OCR
      const result = await Vision.scanText(processedImage.uri);
      
      // Extract student information
      const studentInfo = parseStudentInfo(result.text);
      
      // Navigate to preview screen with extracted data
      router.push({
        pathname: '/register/preview',
        params: studentInfo
      });
    } catch (error) {
      console.error('Error capturing image:', error);
    } finally {
      setScanning(false);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Text style={[styles.text, isDark && styles.textDark]}>
          No access to camera
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <CameraView style={styles.camera}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Button
              variant="outline"
              size="small"
              onPress={handleClose}
              style={styles.closeButton}
              icon={<X size={24} color={isDark ? '#FFFFFF' : '#2C2C2C'} />}
            />
          </View>

          <View style={styles.scanArea}>
            <View style={styles.cardOutline} />
            <Text style={[styles.instructions, isDark && styles.instructionsDark]}>
              Position your student ID card within the frame
            </Text>
          </View>

          <View style={styles.footer}>
            <Button
              title="Capture"
              onPress={handleCapture}
              loading={scanning}
              variant="secondary"
              icon={<Camera size={24} color="#2C2C2C" />}
            />
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  containerDark: {
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 40,
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardOutline: {
    width: 320,
    height: 200,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 12,
    marginBottom: 20,
  },
  instructions: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginTop: 16,
  },
  instructionsDark: {
    color: '#FFFFFF',
  },
  footer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  text: {
    color: '#2C2C2C',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  textDark: {
    color: '#FFFFFF',
  },
});