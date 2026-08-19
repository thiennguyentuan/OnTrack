import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, ErrorMessage } from '@/components/ui/Screen';
import { ActionButton } from '@/components/ui/ActionButton';
import { colors } from '@/theme/colors';
import { changePassword } from '@/features/auth/api';
import { passwordStrength, STRENGTH_LABELS, validateChangePassword } from '@/features/auth/change-password';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const strength = passwordStrength(newPassword);

  const submit = async () => {
    const problem = validateChangePassword({ currentPassword, newPassword, confirmation });
    if (problem) return setError(problem);
    setLoading(true);
    setError(null);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert('Password changed', 'Use your new password the next time you sign in.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (cause: any) {
      setError(cause?.message ?? 'Could not change your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Change Password" onBack={() => router.back()}>
      <Text style={styles.intro}>Choose a password you do not use anywhere else.</Text>

      <Text style={styles.label}>CURRENT PASSWORD</Text>
      <TextInput
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
        autoCapitalize="none"
        style={styles.input}
        placeholder="Current password"
        placeholderTextColor={colors.muted}
      />

      <Text style={styles.label}>NEW PASSWORD</Text>
      <TextInput
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        autoCapitalize="none"
        style={styles.input}
        placeholder="At least 8 characters"
        placeholderTextColor={colors.muted}
      />
      {!!newPassword && (
        <View style={styles.strength}>
          <View style={styles.meter}>
            {[0, 1, 2, 3].map((step) => (
              <View
                key={step}
                style={[
                  styles.segment,
                  step < strength && (strength >= 4 ? styles.segmentStrong : strength >= 3 ? styles.segmentGood : styles.segmentWeak),
                ]}
              />
            ))}
          </View>
          <Text style={styles.strengthLabel}>{STRENGTH_LABELS[strength]}</Text>
        </View>
      )}

      <Text style={styles.label}>CONFIRM NEW PASSWORD</Text>
      <TextInput
        value={confirmation}
        onChangeText={setConfirmation}
        secureTextEntry
        autoCapitalize="none"
        style={styles.input}
        placeholder="Repeat the new password"
        placeholderTextColor={colors.muted}
      />

      <ErrorMessage message={error} />
      <ActionButton title="Update Password" loading={loading} onPress={() => void submit()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { color: colors.muted, fontSize: 16, lineHeight: 23 },
  label: { color: colors.muted, fontWeight: '800', fontSize: 12, letterSpacing: 0.5, marginTop: 6 },
  input: { height: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, color: colors.text, backgroundColor: colors.surface },
  strength: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: -6 },
  meter: { flexDirection: 'row', gap: 5, flex: 1 },
  segment: { flex: 1, height: 5, borderRadius: 99, backgroundColor: '#E1E6EF' },
  segmentWeak: { backgroundColor: colors.danger },
  segmentGood: { backgroundColor: colors.warning },
  segmentStrong: { backgroundColor: colors.success },
  strengthLabel: { color: colors.muted, fontSize: 12, fontWeight: '700', minWidth: 62, textAlign: 'right' },
});
