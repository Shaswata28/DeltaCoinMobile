import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

export function ScreenHeader({ title, action }: { title: string; action?: ReactNode }) {
  const router = useRouter();
  const dark = useColorScheme() === 'dark';

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={[styles.back, dark && styles.backDark]}
        onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
      >
        <ArrowLeft size={19} color={dark ? '#FFFFFF' : '#252525'} />
      </Pressable>
      <Text accessibilityRole="header" style={[styles.title, dark && styles.titleDark]}>{title}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 44, marginHorizontal: 20, marginTop: 8, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  backDark: { backgroundColor: '#1E1E1E' },
  title: { flex: 1, fontSize: 22, color: '#252525', fontFamily: 'Inter-Bold' },
  titleDark: { color: '#FFFFFF' },
});
