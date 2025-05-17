import { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import StudentInfoStep, { StudentInfo } from '@/components/signup/StudentInfoStep';
import SecurityStep, { SecurityInfo } from '@/components/signup/SecurityStep';
import PinStep, { PinInfo } from '@/components/signup/PinStep';

interface FormData {
  studentInfo: Partial<StudentInfo>;
  securityInfo: Partial<SecurityInfo>;
  pinInfo: Partial<PinInfo>;
}

export default function SignupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    studentInfo: {},
    securityInfo: {},
    pinInfo: {},
  });

  const handleStudentInfoNext = (data: StudentInfo) => {
    setFormData(prev => ({ ...prev, studentInfo: data }));
    setCurrentStep(1);
  };

  const handleSecurityNext = (data: SecurityInfo) => {
    setFormData(prev => ({ ...prev, securityInfo: data }));
    setCurrentStep(2);
  };

  const handleSecurityBack = () => {
    setCurrentStep(0);
  };

  const handlePinSubmit = async (data: PinInfo) => {
    setFormData(prev => ({ ...prev, pinInfo: data }));
    // Here you would typically submit the complete form data
    console.log('Complete form data:', { ...formData, pinInfo: data });
    router.replace('/(tabs)');
  };

  const handlePinBack = () => {
    setCurrentStep(1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StudentInfoStep
            onNext={handleStudentInfoNext}
            initialData={formData.studentInfo as StudentInfo}
          />
        );
      case 1:
        return (
          <SecurityStep
            onNext={handleSecurityNext}
            onBack={handleSecurityBack}
            initialData={formData.securityInfo as SecurityInfo}
          />
        );
      case 2:
        return (
          <PinStep
            onSubmit={handlePinSubmit}
            onBack={handlePinBack}
            initialData={formData.pinInfo as PinInfo}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            entering={FadeInDown.duration(300)}
            style={styles.stepContainer}
          >
            {renderStep()}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
});