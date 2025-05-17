import { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, Platform } from 'react-native';
import { ShieldAlert } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FormInput } from '@/components/common/FormInput';
import { TextNavigation } from '@/components/common/TextNavigation';
import { validatePin, validatePinMatch } from '@/utils/validation';

export interface PinInfo {
  pin: string;
  confirmPin: string;
}

interface PinStepProps {
  onSubmit: (data: PinInfo) => void;
  onBack: () => void;
  initialData?: PinInfo;
}

export default function PinStep({ onSubmit, onBack, initialData }: PinStepProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [formData, setFormData] = useState<PinInfo>({
    pin: initialData?.pin || '',
    confirmPin: initialData?.confirmPin || '',
  });

  const [errors, setErrors] = useState<Partial<PinInfo>>({});

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
      onSubmit(formData);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.step, isDark && styles.stepDark]}>Step 3 of 3</Text>
        <Text style={[styles.title, isDark && styles.titleDark]}>Payment PIN Setup</Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          Create a secure 5-digit PIN for transactions
        </Text>
      </View>

      <View style={[styles.warningBox, isDark && styles.warningBoxDark]}>
        <ShieldAlert size={24} color={isDark ? '#FFD700' : '#D97706'} />
        <Text style={[styles.warningText, isDark && styles.warningTextDark]}>
          This PIN will be required for all future transactions. Keep it secure and never share it with anyone.
        </Text>
      </View>

      <View style={styles.form}>
        <FormInput
          label="Payment PIN"
          value={formData.pin}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, pin: text }));
            if (errors.pin) setErrors(prev => ({ ...prev, pin: '' }));
          }}
          placeholder="Enter 5-digit PIN"
          keyboardType="numeric"
          maxLength={5}
          secureTextEntry
          error={errors.pin}
        />

        <FormInput
          label="Confirm PIN"
          value={formData.confirmPin}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, confirmPin: text }));
            if (errors.confirmPin) setErrors(prev => ({ ...prev, confirmPin: '' }));
          }}
          placeholder="Confirm 5-digit PIN"
          keyboardType="numeric"
          maxLength={5}
          secureTextEntry
          error={errors.confirmPin}
        />

        <TextNavigation 
          onBack={onBack}
          onNext={handleSubmit}
          backText="← Security"
          nextText="Complete →"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 32,
  },
  step: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFD700',
    marginBottom: 8,
  },
  stepDark: {
    color: '#FFD700',
  },
  title: {
    fontSize: 28,
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
  },
  subtitleDark: {
    color: '#A6A6A6',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    gap: 12,
  },
  warningBoxDark: {
    backgroundColor: '#292524',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#92400E',
  },
  warningTextDark: {
    color: '#FCD34D',
  },
  form: {
    gap: 20,
  }
});