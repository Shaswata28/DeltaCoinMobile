import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, ShieldCheck, Check } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { FormInput } from '@/components/common/FormInput';
import { Button } from '@/components/common/Button';
import { validateEmail } from '@/utils/validation';

type ResetStep = 'email' | 'code' | 'newPassword';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [currentStep, setCurrentStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  });

  const steps = [
    { id: 'email', title: 'Email' },
    { id: 'code', title: 'Verification' },
    { id: 'newPassword', title: 'New Password' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const handleSendCode = async () => {
    if (!validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentStep('code');
    } catch (error) {
      setErrors(prev => ({ ...prev, email: 'Failed to send code. Please try again.' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      setErrors(prev => ({ ...prev, code: 'Please enter a valid 6-digit code' }));
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentStep('newPassword');
    } catch (error) {
      setErrors(prev => ({ ...prev, code: 'Invalid code. Please try again.' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.replace('/login');
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        newPassword: 'Failed to reset password. Please try again.' 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <View key={step.id} style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            index <= currentStepIndex && styles.stepCircleActive,
            isDark && styles.stepCircleDark,
            index <= currentStepIndex && isDark && styles.stepCircleActiveDark
          ]}>
            {index < currentStepIndex ? (
              <Check size={16} color="#FFFFFF" />
            ) : (
              <Text style={[
                styles.stepNumber,
                index <= currentStepIndex && styles.stepNumberActive,
                isDark && styles.stepNumberDark,
                index <= currentStepIndex && isDark && styles.stepNumberActiveDark
              ]}>
                {index + 1}
              </Text>
            )}
          </View>
          <Text style={[
            styles.stepText,
            index <= currentStepIndex && styles.stepTextActive,
            isDark && styles.stepTextDark,
            index <= currentStepIndex && isDark && styles.stepTextActiveDark
          ]}>
            {step.title}
          </Text>
          {index < steps.length - 1 && (
            <View style={[
              styles.stepLine,
              index < currentStepIndex && styles.stepLineActive,
              isDark && styles.stepLineDark,
              index < currentStepIndex && isDark && styles.stepLineActiveDark
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderEmailStep = () => (
    <Animated.View entering={FadeInDown.duration(300)}>
      <Text style={[styles.stepTitle, isDark && styles.stepTitleDark]}>
        Reset Password
      </Text>
      <Text style={[styles.stepDescription, isDark && styles.stepDescriptionDark]}>
        Enter your email address and we'll send you a code to reset your password
      </Text>

      <FormInput
        label="Email Address"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
        }}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
        disabled={isLoading}
        leftIcon={<Mail size={20} color={isDark ? '#A6A6A6' : '#6B6B6B'} />}
      />

      <Button
        title="Send Reset Code"
        onPress={handleSendCode}
        loading={isLoading}
        style={styles.button}
      />
    </Animated.View>
  );

  const renderCodeStep = () => (
    <Animated.View entering={FadeInDown.duration(300)}>
      <Text style={[styles.stepTitle, isDark && styles.stepTitleDark]}>
        Enter Reset Code
      </Text>
      <Text style={[styles.stepDescription, isDark && styles.stepDescriptionDark]}>
        We've sent a 6-digit code to {email}. Enter it below to continue.
      </Text>

      <FormInput
        label="Reset Code"
        value={code}
        onChangeText={(text) => {
          setCode(text.replace(/[^0-9]/g, ''));
          if (errors.code) setErrors(prev => ({ ...prev, code: '' }));
        }}
        placeholder="Enter 6-digit code"
        keyboardType="numeric"
        maxLength={6}
        error={errors.code}
        disabled={isLoading}
      />

      <Button
        title="Verify Code"
        onPress={handleVerifyCode}
        loading={isLoading}
        style={styles.button}
      />

      <TouchableOpacity 
        style={styles.resendContainer}
        onPress={handleSendCode}
        disabled={isLoading}
      >
        <Text style={[styles.resendText, isDark && styles.resendTextDark]}>
          Didn't receive the code?
        </Text>
        <Text style={styles.resendLink}>Resend</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderNewPasswordStep = () => (
    <Animated.View entering={FadeInDown.duration(300)}>
      <Text style={[styles.stepTitle, isDark && styles.stepTitleDark]}>
        Create New Password
      </Text>
      <Text style={[styles.stepDescription, isDark && styles.stepDescriptionDark]}>
        Choose a strong password that you haven't used before
      </Text>

      <FormInput
        label="New Password"
        value={newPassword}
        onChangeText={(text) => {
          setNewPassword(text);
          if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: '' }));
        }}
        placeholder="Enter new password"
        secureTextEntry
        error={errors.newPassword}
        disabled={isLoading}
        leftIcon={<ShieldCheck size={20} color={isDark ? '#A6A6A6' : '#6B6B6B'} />}
      />

      <FormInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
        }}
        placeholder="Confirm new password"
        secureTextEntry
        error={errors.confirmPassword}
        disabled={isLoading}
        leftIcon={<ShieldCheck size={20} color={isDark ? '#A6A6A6' : '#6B6B6B'} />}
      />

      <Button
        title="Reset Password"
        onPress={handleResetPassword}
        loading={isLoading}
        style={styles.button}
      />
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, isDark && styles.containerDark]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
        </TouchableOpacity>

        {renderStepIndicator()}

        <View style={styles.content}>
          {currentStep === 'email' && renderEmailStep()}
          {currentStep === 'code' && renderCodeStep()}
          {currentStep === 'newPassword' && renderNewPasswordStep()}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginTop: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleDark: {
    backgroundColor: '#2E2E2E',
  },
  stepCircleActive: {
    backgroundColor: '#4D9FFF',
  },
  stepCircleActiveDark: {
    backgroundColor: '#82B1FF',
  },
  stepNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  stepNumberDark: {
    color: '#A6A6A6',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepNumberActiveDark: {
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  stepTextDark: {
    color: '#A6A6A6',
  },
  stepTextActive: {
    color: '#4D9FFF',
  },
  stepTextActiveDark: {
    color: '#82B1FF',
  },
  stepLine: {
    position: 'absolute',
    top: 14,
    right: -50,
    width: 100,
    height: 2,
    backgroundColor: '#E5E7EB',
    zIndex: -1,
  },
  stepLineDark: {
    backgroundColor: '#2E2E2E',
  },
  stepLineActive: {
    backgroundColor: '#4D9FFF',
  },
  stepLineActiveDark: {
    backgroundColor: '#82B1FF',
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  stepTitleDark: {
    color: '#FFFFFF',
  },
  stepDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B6B6B',
    marginBottom: 32,
  },
  stepDescriptionDark: {
    color: '#A6A6A6',
  },
  button: {
    marginTop: 24,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 4,
  },
  resendText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B6B6B',
  },
  resendTextDark: {
    color: '#A6A6A6',
  },
  resendLink: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4D9FFF',
  },
});