import { Tabs } from 'expo-router';
import { PlatformPressable } from 'expo-router/react-navigation';
import { ArrowLeftRight, ChartNoAxesColumn, History, House } from 'lucide-react-native';
import { useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from 'react-native-reanimated';

const tabs = [
  { name: 'index', title: 'Home', Icon: House },
  { name: 'transactions', title: 'Wallet', Icon: ArrowLeftRight },
  { name: 'history', title: 'History', Icon: History },
  { name: 'analytics', title: 'Insights', Icon: ChartNoAxesColumn },
] as const;

export default function TabLayout() {
  const dark = useColorScheme() === 'dark';
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const canvas = dark ? '#121212' : '#F9FAFB';
  const line = dark ? '#353535' : '#E7E8EA';

  return (
    <View style={{ flex: 1, backgroundColor: canvas }}>
      <Tabs backBehavior="history" screenOptions={{
        headerShown: false,
        animation: reduceMotion ? 'none' : 'shift',
        transitionSpec: reduceMotion ? undefined : { animation: 'timing', config: { duration: 240 } },
        sceneStyle: { backgroundColor: canvas, paddingTop: insets.top },
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: dark ? '#ACACAC' : '#515965',
        tabBarShowLabel: false,
        tabBarItemStyle: { flex: 1 },
        tabBarButton: ({ style, ...props }) => (
          <PlatformPressable {...props} style={[style, {
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            borderRadius: 999,
            overflow: 'hidden',
          }]} />
        ),
        tabBarStyle: {
          backgroundColor: dark ? '#1E1E1E' : '#FFFFFF',
          borderColor: line,
          borderWidth: 1,
          borderRadius: 999,
          height: 54,
          width: 232,
          alignSelf: 'center',
          marginTop: 4,
          marginBottom: insets.bottom + 12,
          paddingHorizontal: 15,
          paddingBottom: 0,
          elevation: 5,
          shadowColor: '#171717',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
      }}>
        {tabs.map(({ name, title, Icon }) => (
          <Tabs.Screen key={name} name={name} options={{
            title,
            tabBarAccessibilityLabel: title,
            tabBarIcon: ({ color }) => <Icon color={color} size={26} strokeWidth={2} />,
          }} />
        ))}
        <Tabs.Screen name="friends" options={{ href: null }} />
      </Tabs>
    </View>
  );
}
