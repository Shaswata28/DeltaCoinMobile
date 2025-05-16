import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

export function SocialLoginButtons() {
  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.line} />
      </View>
      
      <View style={styles.buttonContainer}>
        <Animated.View entering={FadeInRight.delay(100).duration(500)} style={styles.buttonWrapper}>
          <TouchableOpacity style={styles.socialButton}>
            <View style={styles.socialIconGoogle} />
            <Text style={styles.socialButtonText}>Google</Text>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View entering={FadeInRight.delay(200).duration(500)} style={styles.buttonWrapper}>
          <TouchableOpacity style={styles.socialButton}>
            <View style={styles.socialIconApple} />
            <Text style={styles.socialButtonText}>Apple</Text>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View entering={FadeInRight.delay(300).duration(500)} style={styles.buttonWrapper}>
          <TouchableOpacity style={styles.socialButton}>
            <View style={styles.socialIconFacebook} />
            <Text style={styles.socialButtonText}>Facebook</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    marginBottom: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  buttonWrapper: {
    flex: 1,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 8,
  },
  socialButtonText: {
    color: '#1F2937',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 8,
    ...Platform.select({
      ios: {
        fontSize: 13,
      }
    })
  },
  socialIconGoogle: {
    width: 18,
    height: 18,
    backgroundColor: '#EA4335',
    borderRadius: 9,
  },
  socialIconApple: {
    width: 18,
    height: 18,
    backgroundColor: '#000',
    borderRadius: 9,
  },
  socialIconFacebook: {
    width: 18,
    height: 18,
    backgroundColor: '#1877F2',
    borderRadius: 9,
  }
});