import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getMilestone, updateMilestone } from '@/features/plans/api';
import { Screen, ErrorMessage } from '@/components/ui/Screen';
import { ActionButton } from '@/components/ui/ActionButton';
import { colors } from '@/theme/colors';

const dayValue = (date: Date) => date.toISOString().slice(0, 10);
const displayDay = (date: Date) => date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

export default function EditMilestone() {
  const { milestoneId, deadlineId } = useLocalSearchParams<{ milestoneId: string; deadlineId?: string }>();
  const router = useRouter();
  const [milestone, setMilestone] = useState<any>();
  const [title, setTitle] = useState('');
  const [targetAt, setTargetAt] = useState(() => new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMilestone(milestoneId)
      .then((value: any) => {
        setMilestone(value);
        setTitle(value.title ?? '');
        if (value.target_at) {
          const parsed = new Date(value.target_at);
          if (!Number.isNaN(parsed.getTime())) setTargetAt(parsed);
        }
      })
      .catch((cause: any) => setError(cause.message));
  }, [milestoneId]);

  const submit = async () => {
    if (!milestone) return;
    if (!title.trim()) return setError('Milestone title is required.');
    setLoading(true);
    setError(null);
    try {
      await updateMilestone(milestoneId, {
        deadline_id: milestone.deadline_id,
        title: title.trim(),
        target_at: new Date(`${dayValue(targetAt)}T23:59:59`).toISOString(),
      });
      const target = deadlineId ? `/milestone/${milestoneId}?deadlineId=${deadlineId}` : `/milestone/${milestoneId}`;
      router.replace(target as any);
    } catch (cause: any) {
      setError(cause.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Edit Milestone" onBack={() => router.back()}>
      <Text style={styles.label}>MILESTONE TITLE</Text>
      <TextInput value={title} onChangeText={setTitle} style={styles.input} />
      <Text style={styles.label}>TARGET DATE</Text>
      {Platform.OS === 'web' ? (
        <TextInput
          value={dayValue(targetAt)}
          onChangeText={(value) => { const next = new Date(value); if (!Number.isNaN(next.getTime())) setTargetAt(next); }}
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.muted}
        />
      ) : (
        <Pressable style={styles.input} onPress={() => setShowPicker(true)}>
          <Text style={styles.inputText}>{displayDay(targetAt)}</Text>
        </Pressable>
      )}
      {showPicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={targetAt}
          mode="date"
          display="default"
          onChange={(_, date) => { setShowPicker(false); if (date) setTargetAt(date); }}
        />
      )}
      <ErrorMessage message={error} />
      <ActionButton title="Save Milestone" loading={loading} disabled={!milestone} onPress={() => void submit()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.muted, fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, justifyContent: 'center', color: colors.text, backgroundColor: colors.surface },
  inputText: { color: colors.text, fontSize: 16 },
});
