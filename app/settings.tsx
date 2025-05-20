import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Moon, Bell, Languages, Wallet, CircleHelp as HelpCircle, Info, Smartphone, ArrowLeft } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface SettingItem {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  action?: () => void;
  toggle?: boolean;
  value?: boolean;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [settings, setSettings] = useState({
    darkMode: isDark,
    notifications: true,
    biometrics: false,
    autoTopup: false,
  });

  const handleSettingToggle = (key: keyof typeof settings) => (value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const settingItems: SettingItem[] = [
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Dark mode',
      icon: <Moon size={24} color="#FFD700" />,
      toggle: true,
      value: settings.darkMode,
      onToggle: handleSettingToggle('darkMode'),
    },
    {
      id: 'notifications',
      title: 'Push Notifications',
      description: 'Transaction alerts and updates',
      icon: <Bell size={24} color="#4D9FFF" />,
      toggle: true,
      value: settings.notifications,
      onToggle: handleSettingToggle('notifications'),
    },
    {
      id: 'biometrics',
      title: 'Quick Authentication',
      description: 'Use biometrics for faster access',
      icon: <Smartphone size={24} color="#10B981" />,
      toggle: true,
      value: settings.biometrics,
      onToggle: handleSettingToggle('biometrics'),
    },
    {
      id: 'autoTopup',
      title: 'Auto Top-up',
      description: 'Automatically add funds when balance is low',
      icon: <Wallet size={24} color="#A78BFA" />,
      toggle: true,
      value: settings.autoTopup,
      onToggle: handleSettingToggle('autoTopup'),
    },
    {
      id: 'language',
      title: 'Language',
      description: 'English (US)',
      icon: <Languages size={24} color="#F59E0B" />,
      action: () => console.log('Language settings'),
    },
    {
      id: 'help',
      title: 'Help Center',
      description: 'FAQs and support',
      icon: <HelpCircle size={24} color="#EC4899" />,
      action: () => router.push('/help'),
    },
    {
      id: 'about',
      title: 'About DeltaCoin',
      description: 'Version 1.0.0',
      icon: <Info size={24} color="#6366F1" />,
      action: () => console.log('About section'),
    },
  ];

  return (
    <ScrollView 
      style={[styles.container, isDark && styles.containerDark]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
        </TouchableOpacity>
        <Text style={[styles.title, isDark && styles.titleDark]}>Settings</Text>
      </View>

      <View style={styles.content}>
        {settingItems.map((item, index) => (
          <Animated.View
            key={item.id}
            entering={FadeInDown.delay(index * 100).duration(400)}
          >
            <TouchableOpacity
              style={[styles.settingItem, isDark && styles.settingItemDark]}
              onPress={item.action}
              disabled={item.toggle}
            >
              {item.icon}
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, isDark && styles.settingTitleDark]}>
                  {item.title}
                </Text>
                <Text style={[styles.settingDescription, isDark && styles.settingDescriptionDark]}>
                  {item.description}
                </Text>
              </View>
              {item.toggle && item.onToggle ? (
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{ false: '#767577', true: item.id === 'appearance' ? '#FFD700' : '#4D9FFF' }}
                  thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
                />
              ) : item.action && (
                <View style={[styles.badge, isDark && styles.badgeDark]}>
                  <Text style={[styles.badgeText, isDark && styles.badgeTextDark]}>
                    {item.id === 'language' ? 'EN' : '>'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
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
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  content: {
    padding: 20,
    gap: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  settingItemDark: {
    backgroundColor: '#1E1E1E',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    marginBottom: 2,
  },
  settingTitleDark: {
    color: '#FFFFFF',
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B6B6B',
  },
  settingDescriptionDark: {
    color: '#A6A6A6',
  },
  badge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeDark: {
    backgroundColor: '#2E2E2E',
  },
  badgeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B6B6B',
  },
  badgeTextDark: {
    color: '#A6A6A6',
  },
});