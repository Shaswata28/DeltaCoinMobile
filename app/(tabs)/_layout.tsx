import { Tabs } from 'expo-router';
import { Chrome as Home, ArrowLeftRight, ChartBar as BarChart2, CircleHelp as HelpCircle, User } from 'lucide-react-native';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: isDark ? '#82B1FF' : '#4D9FFF',
      tabBarInactiveTintColor: isDark ? '#A6A6A6' : '#6B6B6B',
      tabBarLabelStyle: {
        fontFamily: 'Inter-Medium',
        fontSize: 12,
        marginBottom: 8,
      },
      tabBarStyle: {
        borderTopColor: isDark ? '#2E2E2E' : '#E0E0E0',
        backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
        height: 64,
        paddingTop: 8,
        paddingBottom: 8,
      },
      tabBarIconStyle: {
        marginTop: 8,
      },
      headerShown: false,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, size }) => <ArrowLeftRight size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => <BarChart2 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: 'Help',
          tabBarIcon: ({ color, size }) => <HelpCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}