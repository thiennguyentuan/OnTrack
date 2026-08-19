import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getSession, pauseSession, resumeSession, endSession } from '@/features/sessions/api';
import { formatFocusTimer } from '@/features/sessions/focus-presentation';

export default function FocusSession() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const [session, setSession] = useState<any>();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    getSession(sessionId).then(setSession).catch((cause: any) => setError(cause.message));
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [sessionId]);

  const act = async (fn: (id: string) => Promise<any>) => {
    setBusy(true);
    try { setSession(await fn(sessionId)); } catch (cause: any) { setError(cause.message); } finally { setBusy(false); }
  };

  const finish = async (endedEarly: boolean) => {
    setBusy(true);
    try {
      await endSession(sessionId, endedEarly);
      router.replace(`/session/${sessionId}/review` as any);
    } catch (cause: any) {
      setError(cause.message);
      setBusy(false);
    }
  };

  const isPaused = session?.status === 'PAUSED';
  const totalSeconds = (session?.estimated_minutes ?? 45) * 60;
  // While paused the countdown freezes, so measure from paused_at instead of the wall clock.
  const reference = isPaused && session?.paused_at ? Date.parse(session.paused_at) : now;
  const remaining = session?.expected_end_at
    ? Math.max(0, Math.ceil((Date.parse(session.expected_end_at) - reference) / 1000))
    : totalSeconds;
  const elapsedPercent = totalSeconds
    ? Math.min(100, Math.max(0, ((totalSeconds - remaining) / totalSeconds) * 100))
    : 0;
  const isActive = session?.status === 'IN_PROGRESS' || isPaused;
  const timeUp = isActive && remaining === 0;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.top}>
        <Pressable onPress={() => router.back()}><Text style={styles.close}>×</Text></Pressable>
        {session?.focus_mode === 'HIGH' && (
          <View style={styles.dnd}><Text style={styles.dndText}>◉  DO NOT DISTURB</Text></View>
        )}
      </View>

      <View style={styles.center}>
        <Text style={styles.kicker}>FOCUS SESSION</Text>
        <Text style={styles.title}>{session?.task_title ?? session?.task?.title ?? 'Deep work'}</Text>
        <Text style={styles.timer}>{formatFocusTimer(remaining)}</Text>
        <Text style={styles.status}>
          {!session ? 'Loading session…' : timeUp ? 'Time is up' : isPaused ? 'Paused' : session.status === 'IN_PROGRESS' ? 'In progress' : session.status}
        </Text>
        <View style={styles.track}><View style={[styles.fill, { width: `${elapsedPercent}%` }]} /></View>
        <Text style={styles.progressText}>{Math.round(elapsedPercent)}% of {session?.estimated_minutes ?? '--'} min</Text>
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>

      <View style={styles.actions}>
        {timeUp ? (
          <Pressable style={styles.primary} disabled={busy} onPress={() => void finish(false)}>
            <Text style={styles.primaryText}>Finish & Review</Text>
          </Pressable>
        ) : (
          isActive && (
            <Pressable style={styles.primary} disabled={busy} onPress={() => void act(isPaused ? resumeSession : pauseSession)}>
              <Text style={styles.primaryText}>{isPaused ? 'Resume session' : 'Pause session'}</Text>
            </Pressable>
          )
        )}
        {isActive && !timeUp && (
          <Pressable style={styles.secondary} disabled={busy} onPress={() => void finish(true)}>
            <Text style={styles.secondaryText}>End early</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#1B0B32', padding: 24, justifyContent: 'space-between' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  close: { color: '#FFF', fontSize: 34, fontWeight: '300' },
  dnd: { borderRadius: 99, borderWidth: 1, borderColor: '#6E548D', paddingHorizontal: 14, paddingVertical: 8 },
  dndText: { color: '#D8C7EA', fontSize: 11, letterSpacing: 1, fontWeight: '700' },
  center: { alignItems: 'center', gap: 14 },
  kicker: { color: '#CBA9EF', fontWeight: '800', letterSpacing: 2 },
  title: { color: '#FFF', fontSize: 26, fontWeight: '800', textAlign: 'center' },
  timer: { color: '#FFF', fontSize: 82, fontWeight: '800', letterSpacing: 2 },
  status: { color: '#D8C7EA', fontSize: 16 },
  track: { width: '100%', maxWidth: 420, height: 8, backgroundColor: '#3C2754', borderRadius: 99, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#C47CFF', borderRadius: 99 },
  progressText: { color: '#9C82B8', fontSize: 13, fontWeight: '600' },
  error: { color: '#FF9FAD', textAlign: 'center' },
  actions: { gap: 12 },
  primary: { backgroundColor: '#C47CFF', borderRadius: 18, padding: 18, alignItems: 'center' },
  primaryText: { color: '#1B0B32', fontSize: 17, fontWeight: '800' },
  secondary: { borderWidth: 1, borderColor: '#6E548D', borderRadius: 18, padding: 17, alignItems: 'center' },
  secondaryText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
