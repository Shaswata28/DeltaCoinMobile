import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/common/Button';
import { FormInput } from '@/components/common/FormInput';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { getCurrentUserProfile, updateUserProfile } from '@/supabase/auth';
import type { User } from '@/supabase/client';
import { validateName, validatePhone } from '@/utils/validation';

const emptyForm = { full_name: '', contact_number: '' };

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dark = useColorScheme() === 'dark';
  const [profile, setProfile] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);

  const loadProfile = useCallback(async () => {
    setError(null);
    try {
      const currentProfile = await getCurrentUserProfile();
      if (!currentProfile) throw new Error('Profile unavailable.');
      setProfile(currentProfile);
      setForm({ full_name: currentProfile.full_name, contact_number: currentProfile.contact_number });
    } catch {
      setError('We couldn’t load your profile. Please try again.');
    }
  }, []);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  const fullName = form.full_name.trim();
  const phone = form.contact_number.trim();
  const changed = !!profile && (fullName !== profile.full_name || phone !== profile.contact_number);

  const changeField = (field: keyof typeof emptyForm, value: string) => {
    setForm(previous => ({ ...previous, [field]: value }));
    setErrors(previous => ({ ...previous, [field]: '' }));
    setError(null);
  };

  const saveProfile = async () => {
    if (!changed || submitting.current) return;
    const nextErrors = {
      full_name: validateName(fullName) ? '' : 'Enter a valid full name.',
      contact_number: validatePhone(phone) ? '' : 'Enter a valid Bangladesh phone number.',
    };
    setErrors(nextErrors);
    if (nextErrors.full_name || nextErrors.contact_number) return;

    submitting.current = true;
    setSaving(true);
    setError(null);
    try {
      await updateUserProfile({ full_name: fullName, contact_number: phone });
      Alert.alert('Profile updated', 'Your changes have been saved.', [
        { text: 'OK', onPress: () => router.canGoBack() ? router.back() : router.replace('/profile') },
      ], { cancelable: false });
    } catch {
      setError('We couldn’t save your changes. Please try again.');
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.screen, dark && styles.screenDark]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 20 }}
      >
        <ScreenHeader title="Edit profile" />
        <View style={styles.content}>
          {error && <Text accessibilityRole="alert" style={[styles.error, dark && styles.errorDark]}>{error}</Text>}
          {!profile ? (
            error ? <Button title="Try again" onPress={loadProfile} /> : <ActivityIndicator accessibilityLabel="Loading profile" color="#B68A00" />
          ) : (
            <>
              <View style={[styles.card, dark && styles.cardDark]}>
                <Text style={[styles.heading, dark && styles.textDark]}>Personal details</Text>
                <FormInput label="Full name" value={form.full_name} onChangeText={text => changeField('full_name', text)}
                  placeholder="Enter your full name" autoCapitalize="words" error={errors.full_name} disabled={saving} />
                <FormInput label="Contact number" value={form.contact_number} onChangeText={text => changeField('contact_number', text)}
                  placeholder="Enter your contact number" keyboardType="phone-pad" error={errors.contact_number} disabled={saving} />
              </View>

              <View style={[styles.card, dark && styles.cardDark]}>
                <Text style={[styles.heading, dark && styles.textDark]}>University account</Text>
                {[
                  ['Student ID', profile.student_id],
                  ['University email', profile.student_id + '@eastdelta.edu.bd'],
                  ['Username', profile.username],
                ].map(([label, value]) => (
                  <View style={styles.detail} key={label}>
                    <Text style={[styles.label, dark && styles.labelDark]}>{label}</Text>
                    <Text selectable style={[styles.value, dark && styles.textDark]}>{value}</Text>
                  </View>
                ))}
              </View>

              <Button title="Save changes" onPress={saveProfile} disabled={!changed} loading={saving} variant="secondary" />
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F9FAFB' },
  screenDark: { backgroundColor: '#121212' },
  content: { paddingHorizontal: 20, gap: 14 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, gap: 8 },
  cardDark: { backgroundColor: '#1E1E1E' },
  heading: { fontSize: 15, fontFamily: 'Inter-SemiBold', color: '#252525', marginBottom: 4 },
  textDark: { color: '#F7F7F7' },
  detail: { paddingVertical: 5, gap: 3 },
  label: { fontSize: 12, color: '#5A626E', fontFamily: 'Inter-Medium' },
  labelDark: { color: '#ABABAB' },
  value: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#252525' },
  error: { fontSize: 13, color: '#A52C2C', fontFamily: 'Inter-Medium' },
  errorDark: { color: '#FF9B9B' },
});
