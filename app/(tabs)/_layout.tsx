import { Tabs } from 'expo-router';
import { Chrome as Home, User, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#3466F6',
      tabBarInactiveTintColor: '#6B7280',
      tabBarLabelStyle: {
        fontFamily: 'Inter-Medium',
        fontSize: 12,
      },
      tabBarStyle: {
        borderTopColor: '#E5E7EB',
        height: 60,
      }
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}