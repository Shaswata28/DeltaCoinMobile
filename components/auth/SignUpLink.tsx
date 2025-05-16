import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export function SignUpLink() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Don't have an account?</Text>
      <TouchableOpacity 
        onPress={() => router.push('/signup')}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.link}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 4,
  },
  text: {
    fontFamily: 'Inter-Regular',
    fontSize: 17,
    color: 'rgba(0, 0, 0)',
  },
  link: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 17,
    color: '#3466F6',
  }
});