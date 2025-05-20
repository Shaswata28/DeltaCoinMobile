import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings as SettingsIcon, ChevronRight, Moon, Bell, Shield, CreditCard, HelpCircle, Info, Languages, LogOut } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface SettingItem {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  route?: string;
  action?: () => void;
  toggle?: boolean;
}

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [darkMode, setDarkMode] = useState(isDark);

  const settingItems: SettingItem[] = [
    {
      id: '1',
      title: 'Dark Mode',
      description: 'Toggle dark theme',
      icon: <Moon size={24} color="#FFD700" />,
      toggle: true,
    },
    {
      id: '2',
      title: 'Notifications',
      description: 'Manage notification preferences',
      icon: <Bell size={24} color="#4D9FFF" />,
      route: '/account-settings/notifications',
    },
    {
      id: '3',
      title: 'Security',
      description: 'Password and authentication',
      icon: <Shield size={24} color="#10B981" />,
      route: '/account-settings/security',
    },
    {
      id: '4',
      title: 'Payment Methods',
      description: 'Manage your payment options',
      icon: <CreditCard size={24} color="#A78BFA" />,
      route: '/account-settings/payment-methods',
    },
    {
      id: '5',
      title: 'Language',
      description: 'Change app language',
      icon: <Languages size={24} color="#F59E0B" />,
      action: () => console.log('Language settings'),
    },
    {
      id: '6',
      title: 'Help & Support',
      description: 'Get help and contact support',
      icon: <HelpCircle size={24} color="#EC4899" />,
      route: '/help',
    },
    {
      id: '7',
      title: 'About',
      description: 'App information and legal',
      icon: <Info size={24} color="#6366F1" />,
      action: () => console.log('About section'),
    },
  ];

  const handleLogout = () => {
    // Implement logout logic
    console.log('Logging out...');
    router.replace('/login');
  };

  const handleSettingPress = (item: SettingItem) => {
    if (item.route) {
      router.push(item.route as any);
    } else if (item.action) {
      item.action();
    }
  };

  return (
    <ScrollView 
      style={[styles.container, isDark && styles.containerDark]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <SettingsIcon size={32} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
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
              onPress={() => handleSettingPress(item)}
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
              {item.toggle ? (
                <Switch
                  value={darkMode}
                  onValueChange={(value) => setDarkMode(value)}
                  trackColor={{ false: '#767577', true: '#FFD700' }}
                  thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
                />
              ) : (
                <ChevronRight size={20} color={isDark ? '#A6A6A6' : '#6B6B6B'} />
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}

        <Animated.View
          entering={FadeInDown.delay(settingItems.length * 100).duration(400)}
        >
          <TouchableOpacity
            style={[styles.logoutButton, isDark && styles.logoutButtonDark]}
            onPress={handleLogout}
          >
            <LogOut size={24} color="#FF4D4F" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={[styles.version, isDark && styles.versionDark]}>
          Version 1.0.0
        </Text>
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  logoutButtonDark: {
    backgroundColor: '#2C1F1F',
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF4D4F',
  },
  version: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B6B6B',
    textAlign: 'center',
    marginTop: 16,
  },
  versionDark: {
    color: '#A6A6A6',
  },
});