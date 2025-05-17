import { Tabs } from 'expo-router';
import { Chrome as Home, ChartLine as LineChart, CircleHelp as HelpCircle, Settings, History, User } from 'lucide-react-native';
import { Platform, useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs screenOptions={{
      tabBarShowLabel: false,
      tabBarActiveTintColor: '#FFD700',
      tabBarInactiveTintColor: isDark ? '#A6A6A6' : '#808080',
      tabBarStyle: {
        backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
        height: Platform.OS === 'ios' ? '8%' : 64,
        paddingBottom: 10,
        borderTopWidth: 0,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      headerShown: false,
      tabBarIconStyle: {
        marginTop: Platform.OS === 'ios' ? 10 : 0,
      },
      tabBarAdaptive: true,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <Home size={24} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          tabBarIcon: ({ color }) => (
            <History size={24} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          tabBarIcon: ({ color }) => (
            <LineChart size={24} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          tabBarIcon: ({ color }) => (
            <HelpCircle size={24} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => (
            <User size={24} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color }) => (
            <Settings size={24} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}