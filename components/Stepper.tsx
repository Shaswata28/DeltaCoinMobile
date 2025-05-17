import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface StepperProps {
  currentStep: number;
  steps: string[];
}

const Stepper: React.FC<StepperProps> = ({ currentStep, steps }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  
  // Calculate dynamic spacing based on screen width
  const horizontalPadding = Math.min(20, width * 0.05);
  
  // Calculate top padding considering safe area and platform
  const topPadding = Platform.select({
    ios: Math.max(insets.top, 44), // Account for notch
    android: Math.max(insets.top, 24), // Account for status bar
    default: 16, // Web default
  });

  return (
    <View style={[
      styles.container,
      {
        paddingTop: topPadding,
        paddingHorizontal: horizontalPadding,
      }
    ]}>
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <View style={[
            styles.stepContainer,
            index === 0 && styles.firstStep,
            index === steps.length - 1 && styles.lastStep,
          ]}>
            <View
              style={[
                styles.circle,
                currentStep >= index ? styles.activeCircle : styles.inactiveCircle,
                Platform.OS === 'web' && styles.webCircleShadow,
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
                Platform.OS === 'web' && styles.webStepText,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    minHeight: 80,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 12,
  },
  firstStep: {
    alignItems: 'flex-start',
  },
  lastStep: {
    alignItems: 'flex-end',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  webCircleShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activeCircle: {
    backgroundColor: '#FFD700',
  },
  inactiveCircle: {
    backgroundColor: '#E0E0E0',
  },
  stepNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  stepText: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
    maxWidth: 100,
  },
  webStepText: {
    fontSize: 13,
    maxWidth: 120,
  },
  activeText: {
    color: '#000',
  },
  inactiveText: {
    color: '#757575',
  },
  lineContainer: {
    flex: 0.5,
    height: 2,
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: -20,
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