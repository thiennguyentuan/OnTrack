import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { cancelSession, getSession, rescheduleSession, startSession } from '@/features/sessions/api';
import { Screen, ErrorMessage } from '@/components/ui/Screen';
import { ActionButton } from '@/components/ui/ActionButton';
import { colors } from '@/theme/colors';

const iso = (value: string) => new Date(value).toISOString();
const localValue = (value?: string) => value ? new Date(value).toISOString().slice(0, 16) : '';

export default function SessionDetail() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>(); const router = useRouter();
  const [session, setSession] = useState<any>(); const [plannedAt, setPlannedAt] = useState(''); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  const load = async () => { try { const data: any = await getSession(sessionId); setSession(data); setPlannedAt(localValue(data.planned_start_at)); } catch (e: any) { setError(e.message); } };
  useEffect(() => { void load(); }, [sessionId]);
  const start = async () => { setLoading(true); try { setSession(await startSession(sessionId)); } catch (e: any) { setError(e.message); } finally { setLoading(false); } };
  const reschedule = async () => { setLoading(true); try { setSession(await rescheduleSession(sessionId, iso(plannedAt))); } catch (e: any) { setError(e.message); } finally { setLoading(false); } };
  const cancel = () => Alert.alert('Cancel session?', 'The planned session will be removed.', [{ text: 'Keep', style: 'cancel' }, { text: 'Cancel session', style: 'destructive', onPress: async () => { try { await cancelSession(sessionId); router.back(); } catch (e: any) { setError(e.message); } } }]);
  return <Screen title="Session Detail" onBack={() => router.back()}><ErrorMessage message={error} />{session && <View style={styles.card}><Text style={styles.title}>Focus session</Text><Text style={styles.meta}>{session.estimated_minutes} minutes · {session.focus_mode}</Text><Text style={styles.status}>{session.status}</Text>{session.status === 'PLANNED' && <><TextInput value={plannedAt} onChangeText={setPlannedAt} style={styles.input} placeholder="Start date/time (YYYY-MM-DDTHH:mm)" /><ActionButton title="Reschedule" secondary loading={loading} onPress={() => void reschedule()} /><ActionButton title="Start session" loading={loading} onPress={() => void start()} /><ActionButton title="Cancel" secondary onPress={cancel} /></>}{['IN_PROGRESS', 'PAUSED'].includes(session.status) && <ActionButton title="Open focus mode" onPress={() => router.push(`/session/${sessionId}/focus` as any)} />}</View>}</Screen>;
}
const styles = StyleSheet.create({ card: { backgroundColor: colors.surface, borderRadius: 24, padding: 24, gap: 16 }, title: { color: colors.text, fontSize: 28, fontWeight: '800' }, meta: { color: colors.muted }, status: { color: colors.primary, fontWeight: '800', fontSize: 18 }, input: { height: 46, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, color: colors.text } });
