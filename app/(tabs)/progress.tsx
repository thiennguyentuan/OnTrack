import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getSessionHistory } from '@/features/dashboard/api';
import { listDeadlines } from '@/features/plans/api';
import { formatFocusDuration, weeklyFocusSeries } from '@/features/dashboard/history-presentation';
import { toPlanItem } from '@/features/plans/presentation';
import { Screen, ErrorMessage } from '@/components/ui/Screen';
import { colors } from '@/theme/colors';

export default function ProgressDashboard() {
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    let active = true;
    Promise.all([getSessionHistory(), listDeadlines()])
      .then(([history, plans]: any[]) => {
        if (!active) return;
        setSessions(history ?? []);
        setDeadlines((plans ?? []).map((plan: any) => toPlanItem(plan)));
      })
      .catch((cause: any) => active && setError(cause?.message ?? 'Unable to load progress.'));
    return () => { active = false; };
  }, []));

  const series = useMemo(() => weeklyFocusSeries(sessions), [sessions]);
  const weekMinutes = useMemo(() => series.reduce((total, day) => total + day.minutes, 0), [series]);

  const onTrack = useMemo(() => {
    const open = deadlines.filter((item) => item.category !== 'COMPLETED');
    if (!open.length) return deadlines.length ? 100 : 0;
    return Math.round((open.filter((item) => item.category === 'ACTIVE').length / open.length) * 100);
  }, [deadlines]);

  return (
    <Screen title="Progress">
      <ErrorMessage message={error} />

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.label}>FOCUS TIME (7 DAYS)</Text>
          <Text style={styles.value}>{formatFocusDuration(weekMinutes)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>SESSIONS COMPLETED</Text>
          <Text style={styles.value}>{sessions.length}</Text>
        </View>
      </View>

      <Text style={styles.heading}>Momentum</Text>
      <View style={styles.chart}>
        {series.map((day, index) => (
          <View key={index} style={styles.column}>
            <Text style={styles.barValue}>{day.minutes ? `${day.minutes}m` : ''}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.bar, { height: `${day.height}%`, backgroundColor: day.isToday ? colors.primary : '#C7D8F5' }]} />
            </View>
            <Text style={styles.barLabel}>{day.label}</Text>
          </View>
        ))}
      </View>
      {!weekMinutes && <Text style={styles.empty}>No focus time recorded in the last 7 days yet.</Text>}

      <Text style={styles.heading}>Deadlines</Text>
      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.label}>ON TRACK</Text>
          <Text style={styles.value}>{onTrack}%</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>AT RISK</Text>
          <Text style={[styles.value, styles.risk]}>{deadlines.filter((item) => item.category === 'AT_RISK').length}</Text>
        </View>
      </View>

      {deadlines.map((item) => (
        <Pressable key={item.id} style={styles.row} onPress={() => router.push(`/deadline/${item.id}` as any)}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>{item.title}</Text>
            <Text style={styles.rowMeta}>
              {item.statusLabel} · {item.category === 'COMPLETED' ? 'Finished' : `${item.daysLeft} ${item.daysLeftLabel}`}
            </Text>
          </View>
          <Text style={[styles.rowValue, { color: item.statusColor }]}>{item.progress}%</Text>
        </Pressable>
      ))}

      <Pressable style={styles.link} onPress={() => router.push('/history/history' as any)}>
        <Text style={styles.linkText}>View Session History →</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: 12 },
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: 20, padding: 18 },
  label: { color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  value: { color: colors.primary, fontSize: 28, fontWeight: '800', marginTop: 6 },
  risk: { color: colors.danger },
  heading: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: 12 },
  chart: { height: 190, backgroundColor: colors.surface, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around' },
  column: { flex: 1, alignItems: 'center', height: '100%' },
  barValue: { color: colors.muted, fontSize: 10, fontWeight: '700', height: 14 },
  barTrack: { flex: 1, width: 26, justifyContent: 'flex-end' },
  bar: { width: 26, borderRadius: 8, minHeight: 2 },
  barLabel: { color: colors.muted, fontSize: 12, fontWeight: '700', marginTop: 6 },
  empty: { color: colors.muted, textAlign: 'center' },
  row: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowText: { flex: 1, paddingRight: 12 },
  rowTitle: { color: colors.text, fontWeight: '700', fontSize: 16 },
  rowMeta: { color: colors.muted, fontSize: 13, marginTop: 2 },
  rowValue: { fontWeight: '800', fontSize: 18 },
  link: { padding: 16, alignItems: 'center' },
  linkText: { color: colors.primary, fontWeight: '800' },
});
