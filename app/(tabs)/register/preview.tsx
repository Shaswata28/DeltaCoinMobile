import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/common/Button';
import { FormInput } from '@/components/common/FormInput';

export default function PreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleConfirm = () => {
    // Handle form submission
    router.push({
      pathname: '/register',
      params: {
        name: params.name,
        studentId: params.studentId,
        department: params.department,
      },
    });
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.titleDark]}>
          Confirm Details
        </Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          Please verify the extracted information
        </Text>
      </View>

      <View style={[styles.card, isDark && styles.cardDark]}>
        <FormInput
          label="Full Name"
          value={params.name as string}
          onChangeText={() => {}}
          editable={false}
        />

        <FormInput
          label="Student ID"
          value={params.studentId as string}
          onChangeText={() => {}}
          editable={false}
        />

        <FormInput
          label="Department"
          value={params.department as string}
          onChangeText={() => {}}
          editable={false}
        />

        <FormInput
          label="University Email"
          value={`${params.studentId}@eastdelta.edu.bd`}
          onChangeText={() => {}}
          editable={false}
        />

        <View style={styles.buttonGroup}>
          <Button
            title="Scan Again"
            onPress={() => router.back()}
            variant="outline"
            style={styles.button}
          />
          <Button
            title="Confirm"
            onPress={handleConfirm}
            variant="secondary"
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF5',
    padding: 20,
    paddingTop: 60,
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B6B6B',
  },
  subtitleDark: {
    color: '#A6A6A6',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 16,
  },
  cardDark: {
    backgroundColor: '#1E1E1E',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
});