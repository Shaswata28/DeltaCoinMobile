import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Stepper from '../components/Stepper';
import StudentInfoStep, { StudentInfo } from '../components/signup/StudentInfoStep';
import SecurityStep, { SecurityInfo } from '../components/signup/SecurityStep';
import PinStep, { PinInfo } from '../components/signup/PinStep';

const steps = ['Student Info', 'Security', 'PIN'];

const SignupScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    studentInfo: {} as StudentInfo,
    securityInfo: {} as SecurityInfo,
    pinInfo: {} as PinInfo,
  });

  const handleStudentInfoNext = (data: StudentInfo) => {
    setFormData(prev => ({ ...prev, studentInfo: data }));
    setCurrentStep(1);
  };

  const handleSecurityNext = (data: SecurityInfo) => {
    setFormData(prev => ({ ...prev, securityInfo: data }));
    setCurrentStep(2);
  };

  const handleSecurityBack = () => {
    setCurrentStep(0);
  };

  const handlePinSubmit = (data: PinInfo) => {
    setFormData(prev => ({ ...prev, pinInfo: data }));
    // Here you would typically submit the complete form data to your backend
    console.log('Complete form data:', { ...formData, pinInfo: data });
  };

  const handlePinBack = () => {
    setCurrentStep(1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StudentInfoStep
            onNext={handleStudentInfoNext}
            initialData={formData.studentInfo}
          />
        );
      case 1:
        return (
          <SecurityStep
            onNext={handleSecurityNext}
            onBack={handleSecurityBack}
            initialData={formData.securityInfo}
          />
        );
      case 2:
        return (
          <PinStep
            onSubmit={handlePinSubmit}
            onBack={handlePinBack}
            initialData={formData.pinInfo}
          />
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Stepper currentStep={currentStep} steps={steps} />
        {renderStep()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default SignupScreen; 