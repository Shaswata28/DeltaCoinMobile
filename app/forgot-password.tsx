import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { FormInput } from '@/components/common/FormInput';
import { Button } from '@/components/common/Button';
import { validateEmail } from '@/utils/validation';
import { resetPassword } from '@/lib/auth';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const { error: resetError } = await resetPassword(email);
      
      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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

        <View style={styles.content}>
          <Text style={[styles.title, isDark && styles.titleDark]}>Reset Password</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            Enter your email address and we'll send you instructions to reset your password
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {success ? (
            <View style={styles.successContainer}>
              <Text style={styles.successTitle}>Check Your Email</Text>
              <Text style={styles.successText}>
                We've sent password reset instructions to {email}. Please check your inbox.
              </Text>
              <Button
                title="Back to Login"
                onPress={() => router.replace('/login')}
                style={styles.button}
              />
            </View>
          ) : (
            <View>
              <FormInput
                label="Email Address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError('');
                }}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={error}
                disabled={isLoading}
                leftIcon={<Mail size={20} color={isDark ? '#A6A6A6' : '#6B6B6B'} />}
              />

              <Button
                title="Send Reset Instructions"
                onPress={handleResetPassword}
                loading={isLoading}
                style={styles.button}
              />
            </View>
          )}
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
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B6B6B',
    marginBottom: 32,
  },
  subtitleDark: {
    color: '#A6A6A6',
  },
  button: {
    marginTop: 24,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4D4F',
  },
  errorText: {
    color: '#FF4D4F',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  successContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    marginTop: 24,
  },
  successTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#059669',
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#065F46',
    textAlign: 'center',
    marginBottom: 24,
  },
});