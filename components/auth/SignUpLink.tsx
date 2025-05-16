import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

export function SignUpLink() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <View style={styles.container}>
      <Text style={[styles.text, isDark && styles.textDark]}>Don't have an account?</Text>
      <TouchableOpacity 
        onPress={() => router.push('signup' as any)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={[styles.link, isDark && styles.linkDark]}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  text: {
    fontFamily: 'Inter-Regular',
    fontSize: 17,
    color: '#6B6B6B',
  },
  textDark: {
    color: '#FFFFFF',
  },
  link: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 17,
    color: '#4D9FFF',
  },
  linkDark: {
    color: '#82B1FF',
  }
});