import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { deleteTask, getTask, updateTask, type Priority } from '@/features/plans/api';
import { Screen, ErrorMessage } from '@/components/ui/Screen';
import { ActionButton } from '@/components/ui/ActionButton';
import { colors } from '@/theme/colors';

export default function TaskDetail() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>(); const router = useRouter();
  const [task, setTask] = useState<any>(); const [title, setTitle] = useState(''); const [priority, setPriority] = useState<Priority>('MEDIUM'); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  const load = async () => { try { const data: any = await getTask(taskId); setTask(data); setTitle(data.title); setPriority(data.priority ?? 'MEDIUM'); } catch (e: any) { setError(e.message); } };
  useEffect(() => { void load(); }, [taskId]);
  const save = async () => { setLoading(true); try { await updateTask(taskId, { milestone_id: task.milestone_id, title, priority }); await load(); } catch (e: any) { setError(e.message); } finally { setLoading(false); } };
  const remove = () => Alert.alert('Delete task?', 'This also removes planned sessions.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { try { await deleteTask(taskId); router.back(); } catch (e: any) { setError(e.message); } } }]);
  return <Screen title="Task Detail" onBack={() => router.back()}><ErrorMessage message={error} />{task && <><View style={styles.hero}><Text style={styles.title}>{task.title}</Text><Text style={styles.meta}>{task.milestone_title} · {task.current_progress}% complete</Text><TextInput value={title} onChangeText={setTitle} style={styles.input} placeholder="Task title" /><TextInput value={priority} onChangeText={(v) => setPriority(v.toUpperCase() as Priority)} style={styles.input} placeholder="Priority" /><View style={styles.actions}><ActionButton title="Save task" loading={loading} onPress={() => void save()} /><ActionButton title="Delete task" secondary onPress={remove} /></View></View><Text style={styles.section}>Session history</Text>{task.sessions?.map((s: any) => <View key={s.id} style={styles.card}><Text style={styles.cardTitle}>{s.status}</Text><Text style={styles.meta}>{s.estimated_minutes} minutes · {new Date(s.planned_start_at).toLocaleString()}</Text></View>)}<ActionButton title="Plan next session" onPress={() => router.push(`/session/plan?taskId=${taskId}` as any)} /></>}</Screen>;
}
const styles = StyleSheet.create({ hero: { backgroundColor: colors.surface, borderRadius: 24, padding: 24, gap: 10 }, title: { fontSize: 28, fontWeight: '800', color: colors.text }, meta: { color: colors.muted }, input: { height: 44, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, color: colors.text }, section: { color: colors.text, fontSize: 20, fontWeight: '800' }, card: { backgroundColor: colors.surface, borderRadius: 18, padding: 16, gap: 8 }, cardTitle: { color: colors.text, fontWeight: '700' }, actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' } });
