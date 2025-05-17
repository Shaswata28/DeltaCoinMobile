import { Redirect } from 'expo-router';

export default function Root() {
  // This redirects to the tabs layout when the app starts
  return <Redirect href="/login" />;
}