import React, { useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, useColorScheme } from 'react-native';
import type { TextInputInstance } from 'react-native';

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  length: number;
  disabled?: boolean;
}

export const PinInput: React.FC<PinInputProps> = ({
  value,
  onChange,
  length,
  disabled = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const inputRef = useRef<TextInputInstance>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        {Array.from({ length }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              isDark && styles.dotDark,
              value.length > index && styles.dotFilled,
            ]}
          />
        ))}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChange}
        maxLength={length}
        keyboardType="numeric"
        style={styles.input}
        secureTextEntry
        editable={!disabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  dotDark: {
    borderColor: '#FFD700',
  },
  dotFilled: {
    backgroundColor: '#FFD700',
  },
  input: {
    position: 'absolute',
    opacity: 0,
  },
});
