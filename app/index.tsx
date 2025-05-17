import { Redirect } from 'expo-router';

export default function Root() {
  // This redirects to the login screen when the app starts
  return <Redirect href="/(tabs)" />;
}