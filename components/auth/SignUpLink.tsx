import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { FormInput } from '@/components/common/FormInput';
import { Button } from '@/components/common/Button';
import { CheckBox } from '@/components/common/CheckBox';
import { validateUsername } from '@/utils/validation';

export function LoginForm() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    general: ''
  });

  const handleLogin = async () => {
    setErrors({ username: '', password: '', general: '' });
    
    let isValid = true;
    const newErrors = { username: '', password: '', general: '' };
    
    if (!username) {
      newErrors.username = 'Username is required';
      isValid = false;
    } else if (!validateUsername(username)) {
      newErrors.username = 'Please enter a valid username';
      isValid = false;
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    if (!isValid) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.replace('/(tabs)');
    } catch (error: any) {
      setErrors({ 
        ...newErrors, 
        general: 'An unexpected error occurred. Please try again.' 
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
      <Text style={[styles.title, isDark && styles.titleDark]}>Welcome Back</Text>
      <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>Sign in to continue</Text>
      
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
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="Enter your username"
          autoCapitalize="none"
          error={errors.username}
          disabled={isLoading}
          autoComplete="username"
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
                <EyeOff size={20} color={isDark ? '#A6A6A6' : '#6B6B6B'} /> : 
                <Eye size={20} color={isDark ? '#A6A6A6' : '#6B6B6B'} />
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
            <Text style={[styles.forgotPassword, isDark && styles.forgotPasswordDark]}>
              Forgot Password?
            </Text>
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
    color: '#2C2C2C',
    marginBottom: 8,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B6B6B',
    marginBottom: 24,
  },
  subtitleDark: {
    color: '#A6A6A6',
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
    color: '#4D9FFF',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  forgotPasswordDark: {
    color: '#82B1FF',
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
    borderLeftColor: '#FF4D4F',
  },
  errorText: {
    color: '#FF4D4F',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  }
});