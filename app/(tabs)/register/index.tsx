import { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera } from 'lucide-react-native';
import { Button } from '@/components/common/Button';
import { FormInput } from '@/components/common/FormInput';

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    department: '',
  });

  const handleScanPress = () => {
    router.push('/register/scan');
  };

  const generateEmail = (studentId: string) => {
    return studentId ? `${studentId}@eastdelta.edu.bd` : '';
  };

  return (
    <ScrollView 
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.titleDark]}>
          Student Registration
        </Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          Scan your student ID card to auto-fill the form
        </Text>
      </View>

      <View style={[styles.card, isDark && styles.cardDark]}>
        <Button
          title="Scan Student ID"
          onPress={handleScanPress}
          variant="secondary"
          style={styles.scanButton}
          leftIcon={<Camera size={24} color="#2C2C2C" />}
        />

        <View style={styles.form}>
          <FormInput
            label="Full Name"
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholder="Enter your full name"
            autoCapitalize="words"
          />

          <FormInput
            label="Student ID"
            value={formData.studentId}
            onChangeText={(text) => {
              setFormData(prev => ({
                ...prev,
                studentId: text,
                email: generateEmail(text)
              }));
            }}
            placeholder="Enter your student ID"
            keyboardType="numeric"
          />

          <FormInput
            label="University Email"
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
            placeholder="Your university email"
            editable={false}
            style={styles.emailInput}
          />

          <FormInput
            label="Department"
            value={formData.department}
            onChangeText={(text) => setFormData(prev => ({ ...prev, department: text }))}
            placeholder="Enter your department"
          />

          <Button
            title="Register"
            onPress={() => {}}
            style={styles.registerButton}
            disabled={!formData.name || !formData.studentId || !formData.department}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF5',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardDark: {
    backgroundColor: '#1E1E1E',
  },
  scanButton: {
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  emailInput: {
    opacity: 0.8,
  },
  registerButton: {
    marginTop: 8,
  },
});