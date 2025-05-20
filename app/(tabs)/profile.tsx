import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { User, Shield, Bell, Wallet, ChevronRight, LogOut, CreditCard } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

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

  const handleLogout = () => {
    // Implement logout logic
    console.log('Logging out...');
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
              source={{ uri: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg' }}
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
          <View style={styles.statItem}>
            <Text style={[styles.statValue, isDark && styles.textDark]}>4</Text>
            <Text style={[styles.statLabel, isDark && styles.textLightDark]}>Active Clubs</Text>
          </View>
          <View style={[styles.statDivider, isDark && styles.statDividerDark]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, isDark && styles.textDark]}>$520</Text>
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
});