import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Platform, ViewStyle, TextStyle } from 'react-native';
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
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  const animatedBorderStyle = useAnimatedStyle(() => {
    return {
      borderColor: withTiming(
        error
          ? '#EF4444' 
          : isFocused 
            ? '#3466F6' 
            : '#E5E7EB',
        { duration: 150 }
      ),
    };
  });
  
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      
      <Animated.View style={[styles.inputContainer, animatedBorderStyle]}>
        <TextInput
          style={[styles.input, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#9CA3AF"
          autoComplete={autoComplete}
        />
        
        {rightElement}
      </Animated.View>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
    color: '#374151',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#1F2937',
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    ...Platform.select({
      web: { 
        outlineStyle: 'none',
        paddingTop: 14, // Fix for web vertical alignment
        paddingBottom: 14,
      }
    })
  },
  errorText: {
    color: '#EF4444',
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  }
});