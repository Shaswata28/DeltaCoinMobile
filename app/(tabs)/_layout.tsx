import { Tabs } from 'expo-router';
import { Home, Settings } from 'lucide-react-native';
import { useColorScheme, Platform } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#FFD700',
      tabBarInactiveTintColor: isDark ? '#A6A6A6' : '#6B6B6B',
      tabBarShowLabel: false,
      tabBarStyle: {
        borderTopColor: isDark ? '#2E2E2E' : '#E0E0E0',
        backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
        height: Platform.select({ ios: 60, android: 60, default: 60 }),
      },
      headerShown: false,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <Home size={28} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color }) => (
            <Settings size={28} color={color} strokeWidth={2.5} />
          ),
        }}
      />
    </Tabs>
  );
}