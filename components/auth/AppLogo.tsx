import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';
import { Coins } from 'lucide-react-native';

export function AppLogo() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(200).reduceMotion(ReduceMotion.System)} style={[styles.logoWrapper, isDark && styles.logoWrapperDark]}>
        <View style={[styles.logoBackground, isDark && styles.logoBackgroundDark]}>
          <Coins color="#FFD700" size={32} strokeWidth={2} />
        </View>
      </Animated.View>
      <Text style={[styles.appName, isDark && styles.appNameDark]}>Delta Coin</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoWrapperDark: {
    backgroundColor: '#1E1E1E',
    shadowOpacity: 0.2,
  },
  logoBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBackgroundDark: {
    backgroundColor: '#1E1E1E',
  },
  appName: {
    color: '#FFD700',
    fontSize: 25,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  appNameDark: {
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
  }
});