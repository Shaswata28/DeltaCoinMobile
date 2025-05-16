import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });
  
  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 100 });
  };
  
  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };
  
  const getButtonStyles = () => {
    const buttonStyles = [styles.button, styles[`${size}Button`]];
    
    if (variant === 'primary') {
      buttonStyles.push(styles.primaryButton);
    } else if (variant === 'secondary') {
      buttonStyles.push(styles.secondaryButton);
    } else if (variant === 'outline') {
      buttonStyles.push(styles.outlineButton);
    }
    
    if (disabled || loading) {
      buttonStyles.push(styles.disabledButton);
    }
    
    return buttonStyles;
  };
  
  const getTextStyles = () => {
    const textStyles = [styles.text, styles[`${size}Text`]];
    
    if (variant === 'primary') {
      textStyles.push(styles.primaryText);
    } else if (variant === 'secondary') {
      textStyles.push(styles.secondaryText);
    } else if (variant === 'outline') {
      textStyles.push(styles.outlineText);
    }
    
    if (disabled || loading) {
      textStyles.push(styles.disabledText);
    }
    
    return textStyles;
  };
  
  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        style={getButtonStyles()}
        onPress={loading || disabled ? undefined : onPress}
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {loading ? (
          <ActivityIndicator 
            color={variant === 'outline' ? '#3466F6' : '#FFF'} 
            size="small" 
          />
        ) : (
          <Text style={getTextStyles()}>{title}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallButton: {
    height: 36,
    paddingHorizontal: 16,
  },
  mediumButton: {
    height: 48,
    paddingHorizontal: 24,
  },
  largeButton: {
    height: 56,
    paddingHorizontal: 32,
  },
  primaryButton: {
    backgroundColor: '#3466F6',
  },
  secondaryButton: {
    backgroundColor: '#8A33FD',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3466F6',
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
    borderColor: '#E5E7EB',
  },
  text: {
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  primaryText: {
    color: '#FFF',
  },
  secondaryText: {
    color: '#FFF',
  },
  outlineText: {
    color: '#3466F6',
  },
  disabledText: {
    color: '#9CA3AF',
  }
});