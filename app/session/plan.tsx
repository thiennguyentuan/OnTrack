import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { createSession } from '@/features/sessions/api';
import { Screen, ErrorMessage } from '@/components/ui/Screen';
import { ActionButton } from '@/components/ui/ActionButton';
import { colors } from '@/theme/colors';

export default function PlanSession() { const { taskId: initialTaskId } = useLocalSearchParams<{ taskId?: string }>(); const router = useRouter(); const [taskId, setTaskId] = useState(initialTaskId ?? ''); const [minutes, setMinutes] = useState('25'); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false); const submit = async () => { setLoading(true); setError(null); try { const session: any = await createSession({ task_id: taskId, planned_start_at: new Date().toISOString(), estimated_minutes: Number(minutes), focus_mode: 'NORMAL' }); router.replace(`/session/${session.id}` as any); } catch (e: any) { setError(e.message); } finally { setLoading(false); } }; return <Screen title="Plan Session" onBack={() => router.back()}><View style={styles.card}><Text style={styles.label}>Task ID</Text><TextInput value={taskId} onChangeText={setTaskId} placeholder="Paste task ID" style={styles.input} /><Text style={styles.label}>Duration (minutes)</Text><TextInput value={minutes} onChangeText={setMinutes} keyboardType="number-pad" style={styles.input} /><ErrorMessage message={error} /><ActionButton title="Create session" loading={loading} onPress={() => void submit()} /></View></Screen>; }
const styles = StyleSheet.create({ card: { backgroundColor: colors.surface, borderRadius: 24, padding: 24, gap: 12 }, label: { color: colors.muted, fontWeight: '600' }, input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.text } });
