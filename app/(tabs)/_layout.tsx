import { Tabs } from 'expo-router';
import { Chrome as Home, Settings } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarShowLabel: false,
      tabBarActiveTintColor: '#FFD700',
      tabBarInactiveTintColor: '#808080',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
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