import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Keyboard, useColorScheme } from 'react-native';
import { validateUsername, validatePassword, validatePasswordMatch, getPasswordStrengthText } from '@/utils/validation';
import { Button } from '@/components/common/Button';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface SecurityStepProps {
  onNext: (data: SecurityInfo) => void;
  onBack: () => void;
  initialData?: SecurityInfo;
}

export interface SecurityInfo {
  username: string;
  password: string;
  confirmPassword: string;
}

const SecurityStep: React.FC<SecurityStepProps> = ({ onNext, onBack, initialData }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [formData, setFormData] = useState<SecurityInfo>({
    username: initialData?.username || '',
    password: initialData?.password || '',
    confirmPassword: initialData?.confirmPassword || '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<SecurityInfo>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false,
  });

  useEffect(() => {
    const validation = validatePassword(formData.password);
    setPasswordStrength(validation.strength);
    setPasswordCriteria(validation.criteria);
  }, [formData.password]);

  const validateForm = (): boolean => {
    const newErrors: Partial<SecurityInfo> = {};

    if (!validateUsername(formData.username)) {
      newErrors.username = 'Username must be 4-30 characters, start with a letter, and contain only letters, numbers, and underscores';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = 'Password does not meet security requirements';
    }

    if (!validatePasswordMatch(formData.password, formData.confirmPassword)) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      Keyboard.dismiss();
      onNext(formData);
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
        return '#ff4d4f';
      case 1:
        return '#ffa940';
      case 2:
        return '#fadb14';
      case 3:
        return '#73d13d';
      case 4:
      case 5:
        return '#52c41a';
      default:
        return '#d9d9d9';
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.title, isDark && styles.titleDark]}>Security Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.label, isDark && styles.labelDark]}>Username</Text>
        <TextInput
          style={[
            styles.input,
            isDark && styles.inputDark,
            errors.username && styles.inputError
          ]}
          value={formData.username}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, username: text }));
            if (errors.username) setErrors(prev => ({ ...prev, username: '' }));
          }}
          placeholder="Choose a username"
          placeholderTextColor={isDark ? '#A6A6A6' : '#6B6B6B'}
          autoCapitalize="none"
          autoComplete="username"
        />
        {errors.username && (
          <Animated.Text 
            entering={FadeInDown.duration(200)}
            style={styles.errorText}
          >
            {errors.username}
          </Animated.Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, isDark && styles.labelDark]}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.passwordInput,
              isDark && styles.inputDark,
              errors.password && styles.inputError
            ]}
            value={formData.password}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, password: text }));
              if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
            }}
            placeholder="Create a strong password"
            placeholderTextColor={isDark ? '#A6A6A6' : '#6B6B6B'}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="new-password"
          />
          <Button
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
            variant="outline"
          >
            {showPassword ? (
              <EyeOff size={20} color={isDark ? '#A6A6A6' : '#6B6B6B'} />
            ) : (
              <Eye size={20} color={isDark ? '#A6A6A6' : '#6B6B6B'} />
            )}
          </Button>
        </View>
        
        <View style={styles.strengthIndicator}>
          <View style={styles.strengthBar}>
            <Animated.View
              style={[
                styles.strengthFill,
                { width: `${(passwordStrength / 5) * 100}%`, backgroundColor: getStrengthColor() }
              ]}
            />
          </View>
          <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
            {getPasswordStrengthText(passwordStrength)}
          </Text>
        </View>

        <View style={styles.criteriaContainer}>
          {Object.entries(passwordCriteria).map(([key, met]) => (
            <View key={key} style={styles.criteriaRow}>
              {met ? (
                <CheckCircle2 size={16} color="#52c41a" />
              ) : (
                <AlertCircle size={16} color="#ff4d4f" />
              )}
              <Text style={[styles.criteriaText, met && styles.criteriaMet]}>
                {key === 'length' ? '12+ characters' :
                 key === 'uppercase' ? 'One uppercase letter' :
                 key === 'lowercase' ? 'One lowercase letter' :
                 key === 'number' ? 'One number' :
                 'One special character'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, isDark && styles.labelDark]}>Confirm Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.passwordInput,
              isDark && styles.inputDark,
              errors.confirmPassword && styles.inputError
            ]}
            value={formData.confirmPassword}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, confirmPassword: text }));
              if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
            }}
            placeholder="Confirm your password"
            placeholderTextColor={isDark ? '#A6A6A6' : '#6B6B6B'}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoComplete="new-password"
          />
          <Button
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeButton}
            variant="outline"
          >
            {showConfirmPassword ? (
              <EyeOff size={20} color={isDark ? '#A6A6A6' : '#6B6B6B'} />
            ) : (
              <Eye size={20} color={isDark ? '#A6A6A6' : '#6B6B6B'} />
            )}
          </Button>
        </View>
        {errors.confirmPassword && (
          <Animated.Text 
            entering={FadeInDown.duration(200)}
            style={styles.errorText}
          >
            {errors.confirmPassword}
          </Animated.Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Back"
          onPress={onBack}
          variant="outline"
          style={styles.button}
        />
        <Button
          title="Next"
          onPress={handleNext}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
    marginBottom: 24,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  labelDark: {
    color: '#FFFFFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#F9FAFB',
    color: '#2C2C2C',
  },
  inputDark: {
    borderColor: '#2E2E2E',
    backgroundColor: '#1E1E1E',
    color: '#FFFFFF',
  },
  inputError: {
    borderColor: '#ff4d4f',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#F9FAFB',
    color: '#2C2C2C',
  },
  eyeButton: {
    marginLeft: 8,
    padding: 8,
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  strengthIndicator: {
    marginTop: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
  criteriaContainer: {
    marginTop: 12,
  },
  criteriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  criteriaText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B6B6B',
    marginLeft: 8,
  },
  criteriaMet: {
    color: '#52c41a',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default SecurityStep;