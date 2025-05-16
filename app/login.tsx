import { useCallback, useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, KeyboardAvoidingView, ScrollView, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';

import { AppLogo } from '@/components/auth/AppLogo';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpLink } from '@/components/auth/SignUpLink';

export default function LoginScreen() {
  const router = useRouter();
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Set status bar to light on iOS for better visibility against the gradient
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'ios') {
        StatusBar.setStyle('light');
      }
      return () => {
        if (Platform.OS === 'ios') {
          StatusBar.setStyle('auto');
        }
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
       <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <SafeAreaView style={styles.safeArea}>
              <Animated.View 
                entering={FadeInUp.duration(800).springify()} 
                style={styles.logoContainer}
              >
                <AppLogo />
              </Animated.View>
              <Animated.View 
                entering={FadeInDown.delay(300).duration(800).springify()}
                style={styles.formContainer}
              > 
                <LoginForm />
              </Animated.View>
              <SignUpLink />
            </SafeAreaView>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginBottom: 24,
    backdropFilter: 'blur(10px)',
  }
});