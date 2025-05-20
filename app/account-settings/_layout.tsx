import { Stack } from 'expo-router';

export default function AccountSettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="security" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="payment-methods" />
    </Stack>
  );
}