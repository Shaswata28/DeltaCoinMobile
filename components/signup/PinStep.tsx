import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Keyboard } from 'react-native';
import { validatePin, validatePinMatch } from '../../utils/validation';

interface PinStepProps {
  onSubmit: (data: PinInfo) => void;
  onBack: () => void;
  initialData?: PinInfo;
}

export interface PinInfo {
  pin: string;
  confirmPin: string;
}

const PinStep: React.FC<PinStepProps> = ({ onSubmit, onBack, initialData }) => {
  const [formData, setFormData] = useState<PinInfo>({
    pin: initialData?.pin || '',
    confirmPin: initialData?.confirmPin || '',
  });

  const [errors, setErrors] = useState<Partial<PinInfo>>({});
  const [pinMatchStatus, setPinMatchStatus] = useState<'matching' | 'not-matching' | 'empty'>('empty');

  useEffect(() => {
    if (!formData.confirmPin) {
      setPinMatchStatus('empty');
    } else if (formData.pin === formData.confirmPin) {
      setPinMatchStatus('matching');
    } else {
      setPinMatchStatus('not-matching');
    }
  }, [formData.pin, formData.confirmPin]);

  const validateForm = (): boolean => {
    const newErrors: Partial<PinInfo> = {};

    if (!validatePin(formData.pin)) {
      newErrors.pin = 'PIN must be exactly 5 digits';
    }

    if (!validatePinMatch(formData.pin, formData.confirmPin)) {
      newErrors.confirmPin = 'PINs do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      Keyboard.dismiss();
      onSubmit(formData);
    }
  };

  const getPinMatchColor = () => {
    switch (pinMatchStatus) {
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
      <Text style={styles.label}>Create 5-digit PIN</Text>
      <TextInput
        style={[styles.input, errors.pin && styles.inputError]}
        value={formData.pin}
        onChangeText={(text) => setFormData(prev => ({ ...prev, pin: text }))}
        placeholder="Enter 5-digit PIN"
        keyboardType="numeric"
        maxLength={5}
        secureTextEntry
      />
      {errors.pin && <Text style={styles.errorText}>{errors.pin}</Text>}

      <Text style={styles.label}>Confirm PIN</Text>
      <TextInput
        style={[
          styles.input,
          errors.confirmPin && styles.inputError,
          formData.confirmPin && {
            borderColor: getPinMatchColor(),
          },
        ]}
        value={formData.confirmPin}
        onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPin: text }))}
        placeholder="Confirm 5-digit PIN"
        keyboardType="numeric"
        maxLength={5}
        secureTextEntry
      />
      {formData.confirmPin && (
        <Text style={[styles.matchText, { color: getPinMatchColor() }]}>
          {pinMatchStatus === 'matching' ? '✓ PINs match' : '✗ PINs do not match'}
        </Text>
      )}
      {errors.confirmPin && <Text style={styles.errorText}>{errors.confirmPin}</Text>}

      <View style={styles.buttonContainer}>
        <Text style={styles.backButton} onPress={onBack}>
          Back
        </Text>
        <Text style={styles.submitButton} onPress={handleSubmit}>
          Complete Signup
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
  submitButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});

export default PinStep; 