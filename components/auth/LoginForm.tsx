import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { FormInput } from '@/components/common/FormInput';
import { Button } from '@/components/common/Button';
import { CheckBox } from '@/components/common/CheckBox';
import { validateEmail } from '@/utils/validation';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });

  const handleLogin = async () => {
    setErrors({ email: '', password: '', general: '' });
    
    let isValid = true;
    const newErrors = { email: '', password: '', general: '' };
    
    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
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
      router.replace('/(tabs)');
    } catch (error) {
      setErrors({ 
        ...newErrors, 
        general: 'Invalid email or password. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>
      
      {errors.general ? (
        <Animated.View 
          entering={FadeInLeft.duration(300)}
          style={styles.errorContainer}
        >
          <Text style={styles.errorText}>{errors.general}</Text>
        </Animated.View>
      ) : null}
      
      <View style={styles.form}>
        <FormInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          disabled={isLoading}
          autoComplete="email"
        />
        
        <FormInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
          error={errors.password}
          disabled={isLoading}
          autoComplete="password"
          rightElement={
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {showPassword ? 
                <EyeOff size={20} color="#6B7280" /> : 
                <Eye size={20} color="#6B7280" />
              }
            </TouchableOpacity>
          }
        />
        
        <View style={styles.actionsRow}>
          <CheckBox
            label="Remember me"
            checked={rememberMe}
            onToggle={() => setRememberMe(!rememberMe)}
            disabled={isLoading}
          />
          
          <TouchableOpacity 
            onPress={handleForgotPassword}
            disabled={isLoading}
          >
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        
        <Button 
          title="Sign In" 
          onPress={handleLogin} 
          loading={isLoading}
          style={styles.loginButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  forgotPassword: {
    color: '#3466F6',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  loginButton: {
    marginTop: 8,
  },
  eyeIcon: {
    padding: 8,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#B91C1C',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  }
});