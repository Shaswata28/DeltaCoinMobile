import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, useColorScheme, ActivityIndicator } from 'react-native';
import { User, Shield, Bell, Wallet, ChevronRight, LogOut, CreditCard, Menu, CircleHelp as HelpCircle, Info } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { signOut, getCurrentUser, getCurrentUserProfile } from '@/supabase/auth';
import { getUserTransactionCount, getCategorySpending } from '@/supabase/db';
import type { User as UserType } from '@/supabase/client';
import { PROFILE_IMAGES } from '../../components/constants/images';

type SettingsRoute = '/account-settings/security' | '/account-settings/notifications' | '/account-settings/payment-methods';

interface MenuItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: SettingsRoute;
}

interface ProfileData {
  user: any; // Auth user
  profile: UserType | null; // User profile from database
  transactionCount: number;
  monthlySpent: number;
}

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    user: null,
    profile: null,
    transactionCount: 0,
    monthlySpent: 0,
  });

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

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get authenticated user
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Get user profile
      const profile = await getCurrentUserProfile();
      if (!profile) {
        throw new Error('User profile not found');
      }

      // Get transaction count
      const transactionCount = await getUserTransactionCount();

      // Get current month spending
      const currentDate = new Date();
      const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const categorySpending = await getCategorySpending(currentMonth);
      
      // Calculate total monthly spent
      const monthlySpent = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);

      setProfileData({
        user,
        profile,
        transactionCount,
        monthlySpent,
      });
    } catch (err: any) {
      console.error('Error fetching profile data:', err);
      setError(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleRetry = () => {
    fetchProfileData();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, isDark && styles.containerDark]}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={[styles.loadingText, isDark && styles.textDark]}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, isDark && styles.containerDark]}>
        <Text style={[styles.errorText, isDark && styles.errorTextDark]}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, isDark && styles.containerDark]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={[styles.avatarContainer, isDark && styles.avatarContainerDark]}>
            <Image
              source={{ uri: PROFILE_IMAGES.defaultAvatar }}
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
            <Text style={[styles.name, isDark && styles.textDark]}>
              {profileData.profile?.full_name || 'Loading...'}
            </Text>
            <Text style={[styles.studentId, isDark && styles.textLightDark]}>
              ID: {profileData.profile?.student_id || 'Loading...'}
            </Text>
            <Text style={[styles.email, isDark && styles.textLightDark]}>
              {profileData.user?.email || 'Loading...'}
            </Text>
          </View>
        </View>

        <View style={[styles.statsContainer, isDark && styles.statsContainerDark]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, isDark && styles.textDark]}>
              {profileData.transactionCount}
            </Text>
            <Text style={[styles.statLabel, isDark && styles.textLightDark]}>Transactions</Text>
          </View>
          <View style={[styles.statDivider, isDark && styles.statDividerDark]} />
          
          <View style={[styles.statDivider, isDark && styles.statDividerDark]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, isDark && styles.textDark]}>
              ৳{profileData.monthlySpent.toFixed(2)}
            </Text>
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#2C2C2C',
    marginTop: 16,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FF4D4F',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorTextDark: {
    color: '#FF7875',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFD700',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
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