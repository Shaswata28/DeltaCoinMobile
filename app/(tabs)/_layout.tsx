import { Tabs } from 'expo-router';
import { Home, ArrowLeftRight, ChartBar as BarChart2, CircleHelp as HelpCircle, User } from 'lucide-react-native';
import { useColorScheme, Platform, Dimensions } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: isDark ? '#82B1FF' : '#4D9FFF',
      tabBarInactiveTintColor: isDark ? '#A6A6A6' : '#6B6B6B',
      tabBarShowLabel: true,
      tabBarLabelStyle: {
        fontFamily: 'Inter-Medium',
        fontSize: 12,
        marginTop: Platform.select({ ios: -6, android: 0, default: 0 }),
      },
      tabBarStyle: {
        borderTopColor: isDark ? '#2E2E2E' : '#E0E0E0',
        backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
        height: Platform.select({ ios: 88, android: 64, default: 60 }),
        paddingBottom: Platform.select({ ios: 28, android: 8, default: 8 }),
        paddingTop: Platform.select({ ios: 8, android: 8, default: 8 }),
      },
      tabBarIconStyle: {
        marginTop: Platform.select({ ios: 4, android: 0, default: 0 }),
      },
      headerShown: false,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Home 
              size={isSmallScreen ? 20 : 24} 
              color={color} 
              strokeWidth={2.5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <ArrowLeftRight 
              size={isSmallScreen ? 20 : 24} 
              color={color} 
              strokeWidth={2.5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => (
            <BarChart2 
              size={isSmallScreen ? 20 : 24} 
              color={color} 
              strokeWidth={2.5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: 'Help',
          tabBarIcon: ({ color }) => (
            <HelpCircle 
              size={isSmallScreen ? 20 : 24} 
              color={color} 
              strokeWidth={2.5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <User 
              size={isSmallScreen ? 20 : 24} 
              color={color} 
              strokeWidth={2.5}
            />
          ),
        }}
      />
    </Tabs>
  );
}