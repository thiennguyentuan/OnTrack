import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { cancelSession, getSession, rescheduleSession, startSession } from '@/features/sessions/api';
import { Screen, ErrorMessage } from '@/components/ui/Screen';
import { ActionButton } from '@/components/ui/ActionButton';
import { colors } from '@/theme/colors';

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '--';
const formatTime = (value?: string) =>
  value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';

export default function SessionDetail() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const [session, setSession] = useState<any>();
  const [plannedAt, setPlannedAt] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const data: any = await getSession(sessionId);
      setSession(data);
      if (data.planned_start_at) setPlannedAt(new Date(data.planned_start_at));
    } catch (cause: any) { setError(cause.message); }
  };
  useEffect(() => { void load(); }, [sessionId]);

  const start = async () => {
    setLoading(true);
    try {
      await startSession(sessionId);
      router.replace(`/session/${sessionId}/focus` as any);
    } catch (cause: any) { setError(cause.message); setLoading(false); }
  };

  const reschedule = async () => {
    setLoading(true);
    try {
      setSession(await rescheduleSession(sessionId, plannedAt.toISOString()));
      setRescheduling(false);
    } catch (cause: any) { setError(cause.message); } finally { setLoading(false); }
  };

  const cancel = () => Alert.alert('Cancel session?', 'The planned session will be removed.', [
    { text: 'Keep', style: 'cancel' },
    { text: 'Cancel session', style: 'destructive', onPress: async () => {
      try { await cancelSession(sessionId); router.back(); } catch (cause: any) { setError(cause.message); }
    } },
  ]);

  const isPlanned = session?.status === 'PLANNED';
  const isActive = ['IN_PROGRESS', 'PAUSED'].includes(session?.status);
  const isReviewable = ['COMPLETED', 'ENDED_EARLY'].includes(session?.status);

  return (
    <Screen title="Session Detail" onBack={() => router.back()}>
      <ErrorMessage message={error} />
      {session && (
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={[styles.badge, session.focus_mode === 'HIGH' && styles.badgeHigh]}>
              <Text style={[styles.badgeText, session.focus_mode === 'HIGH' && styles.badgeTextHigh]}>
                {session.focus_mode === 'HIGH' ? 'High Focus' : 'Normal Focus'}
              </Text>
            </View>
            <Text style={styles.status}>{String(session.status).replace('_', ' ')}</Text>
          </View>

          <Text style={styles.title}>{session.task_title ?? 'Focus session'}</Text>

          <View style={styles.card}>
            <View style={styles.row}><Text style={styles.label}>Date</Text><Text style={styles.value}>{formatDate(session.planned_start_at)}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Time</Text><Text style={styles.value}>{formatTime(session.planned_start_at)}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Duration</Text><Text style={styles.value}>{session.estimated_minutes} min</Text></View>
            <View style={styles.row}><Text style={styles.label}>Progress at start</Text><Text style={styles.value}>{Number(session.progress_before ?? 0)}%</Text></View>
            {session.actual_minutes != null && (
              <View style={styles.row}><Text style={styles.label}>Actual duration</Text><Text style={styles.value}>{session.actual_minutes} min</Text></View>
            )}
          </View>

          {isPlanned && <ActionButton title="Start Session" loading={loading} onPress={() => void start()} />}
          {isActive && <ActionButton title="Open focus mode" onPress={() => router.push(`/session/${sessionId}/focus` as any)} />}
          {isReviewable && session.progress_after == null && (
            <ActionButton title="Review this session" onPress={() => router.push(`/session/${sessionId}/review` as any)} />
          )}

          {isPlanned && !rescheduling && <ActionButton title="Reschedule" secondary onPress={() => setRescheduling(true)} />}
          {isPlanned && rescheduling && (
            <View style={styles.card}>
              <Text style={styles.label}>NEW START</Text>
              {Platform.OS === 'web' ? (
                <TextInput
                  style={styles.input}
                  value={plannedAt.toISOString().slice(0, 16)}
                  onChangeText={(value) => { const next = new Date(value); if (!Number.isNaN(next.getTime())) setPlannedAt(next); }}
                  placeholder="YYYY-MM-DDTHH:mm"
                  placeholderTextColor={colors.muted}
                />
              ) : (
                <Pressable style={styles.input} onPress={() => setShowPicker(true)}>
                  <Text style={styles.value}>{formatDate(plannedAt.toISOString())} · {formatTime(plannedAt.toISOString())}</Text>
                </Pressable>
              )}
              {showPicker && Platform.OS !== 'web' && (
                <DateTimePicker
                  value={plannedAt}
                  mode="datetime"
                  display="default"
                  onChange={(_, date) => { setShowPicker(false); if (date) setPlannedAt(date); }}
                />
              )}
              <ActionButton title="Save new time" loading={loading} onPress={() => void reschedule()} />
            </View>
          )}
          {isPlanned && <ActionButton title="Cancel session" secondary onPress={cancel} />}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#E6EEFF' },
  badgeHigh: { backgroundColor: '#F0E4FF' },
  badgeText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  badgeTextHigh: { color: colors.tertiary },
  status: { color: colors.muted, fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800' },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 20, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: colors.muted, fontSize: 14, fontWeight: '700' },
  value: { color: colors.text, fontSize: 16, fontWeight: '700' },
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, justifyContent: 'center', color: colors.text },
});
