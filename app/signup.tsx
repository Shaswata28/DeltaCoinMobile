import { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, useColorScheme, TouchableOpacity, Text } from 'react-native';
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
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    setError(undefined);
    setFormData(prev => ({ ...prev, pinInfo: data }));
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
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
            error={error}
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
            error={error}
            isLoading={isLoading}
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
      <TouchableOpacity 
        style={styles.redirectButton} 
        onPress={() => router.push('/login')}
      >
        <Text style={[styles.redirectText, isDark && styles.redirectTextDark]}>
          Already have an account? <Text style={styles.loginText}>Login</Text> here
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF5',
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
    padding: 24,
  },
  redirectButton: {
    padding: 16,
    alignItems: 'center',
  },
  redirectText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B6B6B',
  },
  redirectTextDark: {
    color: '#A6A6A6',
  },
  loginText: {
    color: '#4D9FFF',
    fontFamily: 'Inter-Medium',
  },
});