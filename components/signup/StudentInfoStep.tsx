import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Keyboard } from 'react-native';
import { validateName, validateStudentId, validateEmail, validatePhone } from '../../utils/validation';

interface StudentInfoStepProps {
  onNext: (data: StudentInfo) => void;
  initialData?: StudentInfo;
}

export interface StudentInfo {
  fullName: string;
  studentId: string;
  email: string;
  contactNumber: string;
}

const StudentInfoStep: React.FC<StudentInfoStepProps> = ({ onNext, initialData }) => {
  const [formData, setFormData] = useState<StudentInfo>({
    fullName: initialData?.fullName || '',
    studentId: initialData?.studentId || '',
    email: initialData?.email || '',
    contactNumber: initialData?.contactNumber || '',
  });

  const [errors, setErrors] = useState<Partial<StudentInfo>>({});

  useEffect(() => {
    if (formData.studentId) {
      setFormData(prev => ({
        ...prev,
        email: `${formData.studentId}@eastdelta.edu.bd`,
      }));
    }
  }, [formData.studentId]);

  const validateForm = (): boolean => {
    const newErrors: Partial<StudentInfo> = {};

    if (!validateName(formData.fullName)) {
      newErrors.fullName = 'Please enter your full name';
    }

    if (!validateStudentId(formData.studentId)) {
      newErrors.studentId = 'Please enter a valid 9-digit student ID';
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!validatePhone(formData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid phone number';
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

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={[styles.input, errors.fullName && styles.inputError]}
        value={formData.fullName}
        onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
        placeholder="Enter your full name"
      />
      {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

      <Text style={styles.label}>Student ID</Text>
      <TextInput
        style={[styles.input, errors.studentId && styles.inputError]}
        value={formData.studentId}
        onChangeText={(text) => setFormData(prev => ({ ...prev, studentId: text }))}
        placeholder="Enter your student ID"
        keyboardType="numeric"
        maxLength={9}
      />
      {errors.studentId && <Text style={styles.errorText}>Please enter a valid 9-digit student ID</Text>}

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        value={formData.email}
        onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <Text style={styles.label}>Contact Number</Text>
      <TextInput
        style={[styles.input, errors.contactNumber && styles.inputError]}
        value={formData.contactNumber}
        onChangeText={(text) => setFormData(prev => ({ ...prev, contactNumber: text }))}
        placeholder="Enter your contact number"
        keyboardType="phone-pad"
      />
      {errors.contactNumber && <Text style={styles.errorText}>{errors.contactNumber}</Text>}

      <View style={styles.buttonContainer}>
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
  buttonContainer: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  nextButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    overflow: 'hidden',
  },
});

export default StudentInfoStep; 