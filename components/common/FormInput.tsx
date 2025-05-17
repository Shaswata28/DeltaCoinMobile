import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Platform, ViewStyle, TextStyle, useColorScheme, TextInputProps } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';

type FormInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  disabled?: boolean;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  autoComplete?: 'off' | 'email' | 'password' | 'name' | 'username';
  maxLength?: number;
}

export function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error,
  disabled = false,
  rightElement,
  style,
  inputStyle,
  autoComplete,
  maxLength,
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const animatedBorderStyle = useAnimatedStyle(() => {
    return {
      borderColor: withTiming(
        error
          ? isDark ? '#FF6B6B' : '#FF4D4F'
          : isFocused 
            ? isDark ? '#82B1FF' : '#4D9FFF'
            : isDark ? '#2E2E2E' : '#E0E0E0',
        { duration: 150 }
      ),
    };
  });
  
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
      
      <Animated.View style={[
        styles.inputContainer,
        isDark && styles.inputContainerDark,
        animatedBorderStyle
      ]}>
        <TextInput
          style={[
            styles.input,
            isDark && styles.inputDark,
            inputStyle
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#A6A6A6' : '#6B6B6B'}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete={autoComplete}
          maxLength={maxLength}
        />
        
        {rightElement}
      </Animated.View>
      
      {error ? (
        <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2C2C2C',
    marginBottom: 6,
  },
  labelDark: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    height: 48,
  },
  inputContainerDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2E2E2E',
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#2C2C2C',
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    ...Platform.select({
      web: { 
        outlineStyle: 'none',
        paddingTop: 14,
        paddingBottom: 14,
      }
    })
  },
  inputDark: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#FF4D4F',
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  errorTextDark: {
    color: '#FF6B6B',
  }
});