import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { completeSessionReview } from '@/features/dashboard/api';
import { getSession } from '@/features/sessions/api';
import { Screen, ErrorMessage } from '@/components/ui/Screen';
import { ActionButton } from '@/components/ui/ActionButton';
import { colors } from '@/theme/colors';
import { defaultReviewProgress, reviewProgressChoices } from '@/features/sessions/review-presentation';

export default function ReviewSession() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const [session, setSession] = useState<any>();
  const [progress, setProgress] = useState(40);
  const [minutes, setMinutes] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState<{ taskId?: string; canFollowUp: boolean } | null>(null);

  useEffect(() => {
    getSession(sessionId)
      .then((data: any) => {
        setSession(data);
        setProgress(defaultReviewProgress(Number(data.progress_before ?? 0)));
        setMinutes(String(data.actual_minutes ?? data.estimated_minutes ?? 45));
      })
      .catch((cause: any) => setError(cause?.message ?? 'Unable to load this session.'));
  }, [sessionId]);

  const previous = Number(session?.progress_before ?? 0);
  const choices = reviewProgressChoices(previous);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const result: any = await completeSessionReview({
        p_session_id: sessionId,
        p_progress_after: progress,
        p_actual_minutes: Number(minutes) || 0,
        p_result_note: note.trim() || null,
      });
      setCompleted({ taskId: result?.task?.id, canFollowUp: Boolean(result?.can_create_follow_up) });
    } catch (cause: any) {
      setError(cause?.message ?? 'Unable to save this review.');
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    const done = progress >= 100;
    return (
      <Screen title="Post-Session Review">
        <View style={styles.content}>
          <View style={[styles.success, done && styles.successDone]}><Text style={styles.check}>✓</Text></View>
          <Text style={styles.title}>{done ? 'Task Completed!' : 'Progress Saved'}</Text>
          <Text style={styles.subtitle}>
            {done
              ? `${session?.task_title ?? 'This task'} is now at 100%. Nice work.`
              : `${session?.task_title ?? 'This task'} moved from ${previous}% to ${progress}%.`}
          </Text>
          {completed.taskId && (
            <ActionButton title="Back to Task Detail" onPress={() => router.replace(`/task/${completed.taskId}` as any)} />
          )}
          {completed.canFollowUp && completed.taskId && (
            <ActionButton
              title="Plan Follow-up Session"
              secondary
              onPress={() => router.replace(`/session/plan?taskId=${completed.taskId}` as any)}
            />
          )}
          <ActionButton title="Back to Today" secondary onPress={() => router.replace('/(tabs)/today')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen title="Post-Session Review" onBack={() => router.back()}>
      <View style={styles.content}>
        <View style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <Text style={styles.label}>CURRENT TASK</Text>
            {!!session?.focus_mode && (
              <View style={[styles.badge, session.focus_mode === 'HIGH' && styles.badgeHigh]}>
                <Text style={[styles.badgeText, session.focus_mode === 'HIGH' && styles.badgeTextHigh]}>
                  {session.focus_mode === 'HIGH' ? 'High Focus' : 'Normal Focus'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.taskTitle}>{session?.task_title ?? 'Loading session…'}</Text>
          <Text style={styles.meta}>◷  {session?.estimated_minutes ?? '--'}m planned focus session</Text>
        </View>

        <Text style={styles.heading}>How far did you get?</Text>
        <Text style={styles.previous}>
          Progress before: <Text style={styles.previousValue}>{previous}%</Text>
        </Text>
        <View style={styles.track}><View style={[styles.fill, { width: `${progress}%` }]} /></View>
        <View style={styles.options}>
          {choices.map((value) => (
            <Pressable
              key={value}
              onPress={() => setProgress(value)}
              style={[styles.option, value === 100 && styles.optionWide, progress === value && styles.optionActive]}
            >
              <Text style={[styles.optionText, progress === value && styles.optionTextActive]}>{value}%</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>ACTUAL DURATION (MINUTES)</Text>
        <TextInput
          value={minutes}
          onChangeText={setMinutes}
          keyboardType="number-pad"
          style={styles.field}
          accessibilityLabel="Actual minutes"
        />

        <Text style={styles.label}>NOTE / RESULT</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          multiline
          style={styles.note}
          placeholder="What did you finish in this session?"
          placeholderTextColor={colors.muted}
        />

        <ErrorMessage message={error} />
        <ActionButton title="Save & Finish" loading={loading} disabled={!session} onPress={() => void submit()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 32 },
  success: { width: 80, height: 80, borderRadius: 40, alignSelf: 'center', backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  successDone: { backgroundColor: '#B7F3D8' },
  check: { color: '#08796D', fontSize: 48, fontWeight: '700' },
  title: { color: colors.text, fontSize: 32, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: colors.muted, fontSize: 17, textAlign: 'center', lineHeight: 25, marginBottom: 8 },
  taskCard: { backgroundColor: colors.surface, borderRadius: 26, padding: 22, gap: 8 },
  taskHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5, backgroundColor: '#E6EEFF' },
  badgeHigh: { backgroundColor: '#F0E4FF' },
  badgeText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  badgeTextHigh: { color: colors.tertiary },
  label: { color: '#364054', fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  taskTitle: { color: colors.text, fontSize: 24, fontWeight: '700' },
  meta: { color: colors.muted, fontSize: 16 },
  heading: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 8 },
  previous: { color: colors.muted, fontSize: 17 },
  previousValue: { color: colors.primary, fontWeight: '800' },
  track: { height: 12, backgroundColor: '#E3E6EA', borderRadius: 99, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: 99 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  option: { width: '31%', minHeight: 56, borderWidth: 1, borderColor: '#C0C7D4', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  optionWide: { width: '100%' },
  optionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { color: colors.text, fontSize: 17, fontWeight: '700' },
  optionTextActive: { color: '#FFF' },
  field: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, color: colors.text, backgroundColor: colors.surface, fontSize: 16 },
  note: { minHeight: 90, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, color: colors.text, backgroundColor: colors.surface, textAlignVertical: 'top' },
});
