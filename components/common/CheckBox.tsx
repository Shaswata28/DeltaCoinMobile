import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';
import { Check } from 'lucide-react-native';

type CheckBoxProps = {
  label: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function CheckBox({
  label,
  checked,
  onToggle,
  disabled = false,
  style,
}: CheckBoxProps) {
  const checkmarkOpacity = useSharedValue(checked ? 1 : 0);
  const backgroundColorValue = useSharedValue(checked ? 1 : 0);
  
  const animatedCheckStyle = useAnimatedStyle(() => {
    checkmarkOpacity.value = withTiming(checked ? 1 : 0, { duration: 150 });
    return {
      opacity: checkmarkOpacity.value,
    };
  });
  
  const animatedBoxStyle = useAnimatedStyle(() => {
    backgroundColorValue.value = withTiming(checked ? 1 : 0, { duration: 150 });
    return {
      backgroundColor: interpolateColor(
        backgroundColorValue.value,
        [0, 1],
        ['transparent', '#3466F6']
      ),
      borderColor: interpolateColor(
        backgroundColorValue.value,
        [0, 1],
        ['#D1D5DB', '#3466F6']
      ),
    };
  });
  
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={disabled ? undefined : onToggle}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Animated.View style={[styles.checkbox, animatedBoxStyle]}>
        <Animated.View style={animatedCheckStyle}>
          <Check size={14} color="#FFF" strokeWidth={3} />
        </Animated.View>
      </Animated.View>
      
      <Text style={[
        styles.label,
        disabled && styles.disabledLabel
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
  },
  disabledLabel: {
    color: '#9CA3AF',
  }
});