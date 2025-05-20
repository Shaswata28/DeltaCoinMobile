import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Fingerprint, Shield, Smartphone, Key } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SecuritySettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [devicePinEnabled, setDevicePinEnabled] = useState(true);

  return (
    <ScrollView 
      style={[styles.container, isDark && styles.containerDark]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
        </TouchableOpacity>
        <Text style={[styles.title, isDark && styles.titleDark]}>Security Settings</Text>
      </View>

      <View style={styles.content}>
        <Animated.View 
          entering={FadeInDown.delay(100).duration(400)}
          style={[styles.section, isDark && styles.sectionDark]}
        >
          <View style={styles.sectionHeader}>
            <Shield size={24} color={isDark ? '#82B1FF' : '#4D9FFF'} />
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Authentication
            </Text>
          </View>

          <TouchableOpacity style={[styles.option, isDark && styles.optionDark]}>
            <View style={styles.optionContent}>
              <Key size={20} color={isDark ? '#82B1FF' : '#4D9FFF'} />
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, isDark && styles.optionTitleDark]}>
                  Change Password
                </Text>
                <Text style={[styles.optionDescription, isDark && styles.optionDescriptionDark]}>
                  Update your account password
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={[styles.option, isDark && styles.optionDark]}>
            <View style={styles.optionContent}>
              <Fingerprint size={20} color={isDark ? '#82B1FF' : '#4D9FFF'} />
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, isDark && styles.optionTitleDark]}>
                  Biometric Login
                </Text>
                <Text style={[styles.optionDescription, isDark && styles.optionDescriptionDark]}>
                  Use fingerprint or face recognition
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: '#767577', true: isDark ? '#82B1FF' : '#4D9FFF' }}
                thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>

          <View style={[styles.option, isDark && styles.optionDark]}>
            <View style={styles.optionContent}>
              <Smartphone size={20} color={isDark ? '#82B1FF' : '#4D9FFF'} />
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, isDark && styles.optionTitleDark]}>
                  Two-Factor Authentication
                </Text>
                <Text style={[styles.optionDescription, isDark && styles.optionDescriptionDark]}>
                  Additional security layer
                </Text>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={setTwoFactorEnabled}
                trackColor={{ false: '#767577', true: isDark ? '#82B1FF' : '#4D9FFF' }}
                thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>

          <View style={[styles.option, isDark && styles.optionDark]}>
            <View style={styles.optionContent}>
              <Key size={20} color={isDark ? '#82B1FF' : '#4D9FFF'} />
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, isDark && styles.optionTitleDark]}>
                  Device PIN
                </Text>
                <Text style={[styles.optionDescription, isDark && styles.optionDescriptionDark]}>
                  Require PIN for transactions
                </Text>
              </View>
              <Switch
                value={devicePinEnabled}
                onValueChange={setDevicePinEnabled}
                trackColor={{ false: '#767577', true: isDark ? '#82B1FF' : '#4D9FFF' }}
                thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(200).duration(400)}
          style={[styles.infoCard, isDark && styles.infoCardDark]}
        >
          <Text style={[styles.infoTitle, isDark && styles.infoTitleDark]}>
            Security Tips
          </Text>
          <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
            • Use a strong, unique password{'\n'}
            • Enable two-factor authentication{'\n'}
            • Never share your PIN or password{'\n'}
            • Update your security settings regularly
          </Text>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  content: {
    padding: 20,
    gap: 24,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionDark: {
    backgroundColor: '#1E1E1E',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  option: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  optionDark: {
    backgroundColor: '#2E2E2E',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#2C2C2C',
    marginBottom: 2,
  },
  optionTitleDark: {
    color: '#FFFFFF',
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B6B6B',
  },
  optionDescriptionDark: {
    color: '#A6A6A6',
  },
  infoCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 20,
  },
  infoCardDark: {
    backgroundColor: '#1A2234',
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    marginBottom: 12,
  },
  infoTitleDark: {
    color: '#FFFFFF',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B6B6B',
    lineHeight: 24,
  },
  infoTextDark: {
    color: '#A6A6A6',
  },
});