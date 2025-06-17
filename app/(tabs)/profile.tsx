import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { User, Shield, Bell, Wallet, ChevronRight, LogOut, CreditCard, Menu, HelpCircle, Info } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { signOut } from '@/supabase/auth';

type SettingsRoute = '/account-settings/security' | '/account-settings/notifications' | '/account-settings/payment-methods';

interface MenuItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: SettingsRoute;
}

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isEditing, setIsEditing] = useState(false);

  const menuItems: MenuItem[] = [
    {
      id: '1',
      title: 'Security',
      description: 'Password, biometrics, and 2FA',
      icon: <Shield size={24} color="#FFD700" />,
      route: '/account-settings/security',
    },
    {
      id: '2',
      title: 'Notifications',
      description: 'Push, email, and SMS alerts',
      icon: <Bell size={24} color="#4D9FFF" />,
      route: '/account-settings/notifications',
    },
    {
      id: '3',
      title: 'Payment Methods',
      description: 'Cards and bank accounts',
      icon: <CreditCard size={24} color="#10B981" />,
      route: '/account-settings/payment-methods',
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, isDark && styles.containerDark]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={[styles.avatarContainer, isDark && styles.avatarContainerDark]}>
            <Image
              source={{ uri: 'data:image/png;base64,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' }}
              style={styles.avatar}
            />
            <TouchableOpacity 
              style={[styles.editButton, isDark && styles.editButtonDark]}
              onPress={() => setIsEditing(true)}
            >
              <User size={16} color={isDark ? '#FFFFFF' : '#2C2C2C'} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.name, isDark && styles.textDark]}>Alex Johnson</Text>
            <Text style={[styles.studentId, isDark && styles.textLightDark]}>ID: 202312345</Text>
            <Text style={[styles.email, isDark && styles.textLightDark]}>
              alex.johnson@eastdelta.edu.bd
            </Text>
          </View>
        </View>

        <View style={[styles.statsContainer, isDark && styles.statsContainerDark]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, isDark && styles.textDark]}>24</Text>
            <Text style={[styles.statLabel, isDark && styles.textLightDark]}>Transactions</Text>
          </View>
          <View style={[styles.statDivider, isDark && styles.statDividerDark]} />
          
          <View style={[styles.statDivider, isDark && styles.statDividerDark]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, isDark && styles.textDark]}>৳520</Text>
            <Text style={[styles.statLabel, isDark && styles.textLightDark]}>This Month</Text>
          </View>
        </View>
      </View>

      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <Animated.View
            key={item.id}
            entering={FadeInDown.delay(index * 100).duration(400)}
          >
            <TouchableOpacity
              style={[styles.menuItem, isDark && styles.menuItemDark]}
              onPress={() => router.push(item.route)}
            >
              {item.icon}
              <View style={styles.menuItemContent}>
                <Text style={[styles.menuItemTitle, isDark && styles.textDark]}>
                  {item.title}
                </Text>
                <Text style={[styles.menuItemSubtitle, isDark && styles.textLightDark]}>
                  {item.description}
                </Text>
              </View>
              <ChevronRight size={20} color={isDark ? '#A6A6A6' : '#6B6B6B'} />
            </TouchableOpacity>
          </Animated.View>
        ))}
        <Animated.View entering={FadeInDown.delay(menuItems.length * 100).duration(400)}>
          <TouchableOpacity
            style={[styles.menuItem, isDark && styles.menuItemDark]}
            onPress={() => router.push('/help')}
          >
            <HelpCircle size={24} color="#EC4899" />
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemTitle, isDark && styles.textDark]}>Help Center</Text>
              <Text style={[styles.menuItemSubtitle, isDark && styles.textLightDark]}>FAQs and support</Text>
            </View>
            <ChevronRight size={20} color={isDark ? '#A6A6A6' : '#6B6B6B'} />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay((menuItems.length + 1) * 100).duration(400)}>
          <TouchableOpacity
            style={[styles.menuItem, isDark && styles.menuItemDark]}
            onPress={() => console.log('About section')}
          >
            <Info size={24} color="#6366F1" />
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemTitle, isDark && styles.textDark]}>About DeltaCoin</Text>
              <Text style={[styles.menuItemSubtitle, isDark && styles.textLightDark]}>Version 1.0.0</Text>
            </View>
            <ChevronRight size={20} color={isDark ? '#A6A6A6' : '#6B6B6B'} />
          </TouchableOpacity>
        </Animated.View>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, isDark && styles.logoutButtonDark]}
        onPress={handleLogout}
      >
        <LogOut size={20} color="#FF4D4F" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={[styles.version, isDark && styles.textLightDark]}>
        Version 1.0.0
      </Text>
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
    padding: 20,
    paddingTop: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainerDark: {
    backgroundColor: '#1E1E1E',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editButtonDark: {
    backgroundColor: '#2E2E2E',
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  studentId: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B6B6B',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B6B6B',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsContainerDark: {
    backgroundColor: '#1E1E1E',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B6B6B',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  statDividerDark: {
    backgroundColor: '#2E2E2E',
  },
  menuSection: {
    padding: 20,
    gap: 12,
  },
  menuItem: {
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
  },
  menuItemDark: {
    backgroundColor: '#1E1E1E',
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B6B6B',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
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
    marginBottom: 20,
  },
  textDark: {
    color: '#FFFFFF',
  },
  textLightDark: {
    color: '#A6A6A6',
  },
  settingsButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 1,
  },
  settingsButtonDark: {
    backgroundColor: '#2E2E2E',
  },
});