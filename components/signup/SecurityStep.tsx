import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Keyboard } from 'react-native';
import { validateUsername, validatePassword, validatePasswordMatch } from '../../utils/validation';

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
  const [formData, setFormData] = useState<SecurityInfo>({
    username: initialData?.username || '',
    password: initialData?.password || '',
    confirmPassword: initialData?.confirmPassword || '',
  });

  const [errors, setErrors] = useState<Partial<SecurityInfo>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    number: false,
  });
  const [passwordMatchStatus, setPasswordMatchStatus] = useState<'matching' | 'not-matching' | 'empty'>('empty');

  useEffect(() => {
    if (!formData.confirmPassword) {
      setPasswordMatchStatus('empty');
    } else if (formData.password === formData.confirmPassword) {
      setPasswordMatchStatus('matching');
    } else {
      setPasswordMatchStatus('not-matching');
    }
  }, [formData.password, formData.confirmPassword]);

  const validateForm = (): boolean => {
    const newErrors: Partial<SecurityInfo> = {};

    if (!validateUsername(formData.username)) {
      newErrors.username = 'Username must be at least 4 characters and contain only letters, numbers, and underscores';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = 'Password does not meet requirements';
    }

    if (!validatePasswordMatch(formData.password, formData.confirmPassword)) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = (text: string) => {
    setFormData(prev => ({ ...prev, password: text }));
    const validation = validatePassword(text);
    setPasswordStrength(validation.strength);
    setPasswordCriteria(validation.criteria);
  };

  const handleNext = () => {
    if (validateForm()) {
      Keyboard.dismiss();
      onNext(formData);
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 1:
        return '#ff6b6b';
      case 2:
        return '#ffd93d';
      case 3:
        return '#6bff6b';
      default:
        return '#ddd';
    }
  };

  const getPasswordMatchColor = () => {
    switch (passwordMatchStatus) {
      case 'matching':
        return '#6bff6b';
      case 'not-matching':
        return '#ff6b6b';
      default:
        return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Username</Text>
      <TextInput
        style={[styles.input, errors.username && styles.inputError]}
        value={formData.username}
        onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
        placeholder="Choose a username"
        autoCapitalize="none"
      />
      {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={[styles.input, errors.password && styles.inputError]}
        value={formData.password}
        onChangeText={handlePasswordChange}
        placeholder="Create a password"
        secureTextEntry
        autoCapitalize="none"
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={[
          styles.input,
          errors.confirmPassword && styles.inputError,
          formData.confirmPassword && {
            borderColor: getPasswordMatchColor(),
          },
        ]}
        value={formData.confirmPassword}
        onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
        placeholder="Confirm your password"
        secureTextEntry
        autoCapitalize="none"
      />
      {formData.confirmPassword && (
        <Text style={[styles.matchText, { color: getPasswordMatchColor() }]}>
          {passwordMatchStatus === 'matching' ? '✓ Passwords match' : '✗ Passwords do not match'}
        </Text>
      )}
      {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

      <View style={styles.strengthContainer}>
        <View style={styles.strengthBar}>
          <View
            style={[
              styles.strengthIndicator,
              { width: `${(passwordStrength / 3) * 100}%`, backgroundColor: getStrengthColor() },
            ]}
          />
        </View>
        <View style={styles.criteriaContainer}>
          <Text style={[styles.criteria, passwordCriteria.length && styles.criteriaMet]}>
            • At least 8 characters
          </Text>
          <Text style={[styles.criteria, passwordCriteria.uppercase && styles.criteriaMet]}>
            • One uppercase letter
          </Text>
          <Text style={[styles.criteria, passwordCriteria.number && styles.criteriaMet]}>
            • One number
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Text style={styles.backButton} onPress={onBack}>
          Back
        </Text>
        <Text style={styles.nextButton} onPress={handleNext}>
          Next
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  inputError: {
    borderColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
  },
  matchText: {
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
  },
  strengthContainer: {
    marginBottom: 20,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    marginBottom: 12,
  },
  strengthIndicator: {
    height: '100%',
    borderRadius: 2,
  },
  criteriaContainer: {
    marginTop: 8,
  },
  criteria: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  criteriaMet: {
    color: '#6bff6b',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  nextButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});

export default SecurityStep; 