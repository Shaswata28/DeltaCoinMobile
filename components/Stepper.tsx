import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StepperProps {
  currentStep: number;
  steps: string[];
}

const Stepper: React.FC<StepperProps> = ({ currentStep, steps }) => {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <View style={styles.stepContainer}>
            <View
              style={[
                styles.circle,
                currentStep >= index ? styles.activeCircle : styles.inactiveCircle,
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  currentStep >= index ? styles.activeText : styles.inactiveText,
                ]}
              >
                {index + 1}
              </Text>
            </View>
            <Text
              style={[
                styles.stepText,
                currentStep >= index ? styles.activeText : styles.inactiveText,
              ]}
            >
              {step}
            </Text>
          </View>
          {index < steps.length - 1 && (
            <View style={styles.lineContainer}>
              <View
                style={[
                  styles.line,
                  currentStep > index ? styles.activeLine : styles.inactiveLine,
                ]}
              />
            </View>
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  activeCircle: {
    backgroundColor: '#FFD700',
  },
  inactiveCircle: {
    backgroundColor: '#E0E0E0',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 12,
    textAlign: 'center',
  },
  activeText: {
    color: '#000',
  },
  inactiveText: {
    color: '#757575',
  },
  lineContainer: {
    flex: 1,
    height: 2,
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  line: {
    height: 2,
    width: '100%',
  },
  activeLine: {
    backgroundColor: '#FFD700',
  },
  inactiveLine: {
    backgroundColor: '#E0E0E0',
  },
});

export default Stepper; 