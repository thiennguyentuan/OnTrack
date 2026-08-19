import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getTask, updateTask, type Priority } from '@/features/plans/api';
import { Screen, ErrorMessage } from '@/components/ui/Screen';
import { ActionButton } from '@/components/ui/ActionButton';
import { colors } from '@/theme/colors';

const priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];

export default function EditTask() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const router = useRouter();
  const [task, setTask] = useState<any>();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTask(taskId)
      .then((value: any) => { setTask(value); setTitle(value.title); setPriority(value.priority ?? 'MEDIUM'); })
      .catch((cause: any) => setError(cause.message));
  }, [taskId]);

  const submit = async () => {
    if (!task) return;
    if (!title.trim()) return setError('Task title is required.');
    setLoading(true);
    setError(null);
    try {
      await updateTask(taskId, { milestone_id: task.milestone_id, title: title.trim(), priority });
      router.replace(`/task/${taskId}` as any);
    } catch (cause: any) {
      setError(cause.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Edit Task" onBack={() => router.back()}>
      <Text style={styles.label}>TASK TITLE</Text>
      <TextInput value={title} onChangeText={setTitle} style={styles.input} />
      <Text style={styles.label}>PRIORITY</Text>
      <View style={styles.row}>
        {priorities.map((value) => (
          <Pressable
            key={value}
            onPress={() => setPriority(value)}
            style={[styles.option, priority === value && styles.optionActive]}
          >
            <Text style={[styles.optionText, priority === value && styles.optionTextActive]}>{value}</Text>
          </Pressable>
        ))}
      </View>
      <ErrorMessage message={error} />
      <ActionButton title="Save Task" loading={loading} disabled={!task} onPress={() => void submit()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.muted, fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  input: { height: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, color: colors.text, backgroundColor: colors.surface },
  row: { flexDirection: 'row', gap: 10 },
  option: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.surface },
  optionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { color: colors.text, fontWeight: '700' },
  optionTextActive: { color: '#FFF' },
});
