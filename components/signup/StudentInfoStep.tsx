import { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { FormInput } from '@/components/common/FormInput';
import { Button } from '@/components/common/Button';
import { validateName, validateStudentId, validatePhone } from '@/utils/validation';

export interface StudentInfo {
  fullName: string;
  studentId: string;
  email: string;
  contactNumber: string;
}

interface StudentInfoStepProps {
  onNext: (data: StudentInfo) => void;
  initialData?: StudentInfo;
}

export default function StudentInfoStep({ onNext, initialData }: StudentInfoStepProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [formData, setFormData] = useState<StudentInfo>({
    fullName: initialData?.fullName || '',
    studentId: initialData?.studentId || '',
    email: initialData?.email || '',
    contactNumber: initialData?.contactNumber || '',
  });

  const [errors, setErrors] = useState<Partial<StudentInfo>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<StudentInfo> = {};

    if (!validateName(formData.fullName)) {
      newErrors.fullName = 'Please enter your full name (letters and spaces only)';
    }

    if (!validateStudentId(formData.studentId)) {
      newErrors.studentId = 'Please enter a valid student ID (YYYYNNNNN format)';
    }

    if (!validatePhone(formData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid Bangladesh phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext({
        ...formData,
        email: `${formData.studentId}@eastdelta.edu.bd`,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.step, isDark && styles.stepDark]}>Step 1 of 3</Text>
        <Text style={[styles.title, isDark && styles.titleDark]}>Student Information</Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          Please provide your basic information to get started
        </Text>
      </View>

      <View style={styles.form}>
        <FormInput
          label="Full Name"
          value={formData.fullName}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, fullName: text }));
            if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
          }}
          placeholder="Enter your full name"
          error={errors.fullName}
          autoComplete="name"
        />

        <FormInput
          label="Student ID"
          value={formData.studentId}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, studentId: text }));
            if (errors.studentId) setErrors(prev => ({ ...prev, studentId: '' }));
          }}
          placeholder="Enter your 9-digit student ID"
          keyboardType="numeric"
          maxLength={9}
          error={errors.studentId}
        />

        <FormInput
          label="University Email"
          value={formData.studentId ? `${formData.studentId}@eastdelta.edu.bd` : ''}
          placeholder="Will be generated from Student ID"
          disabled={true}
        />

        <FormInput
          label="Contact Number"
          value={formData.contactNumber}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, contactNumber: text }));
            if (errors.contactNumber) setErrors(prev => ({ ...prev, contactNumber: '' }));
          }}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          error={errors.contactNumber}
        />

        <Button
          title="Continue to Security Setup"
          onPress={handleNext}
          style={styles.button}
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
  form: {
    gap: 20,
  },
  button: {
    marginTop: 32,
  },
});