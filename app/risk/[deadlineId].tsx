import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getDeadlineRisk } from '@/features/dashboard/api';
import { Screen, ErrorMessage } from '@/components/ui/Screen';
import { ActionButton } from '@/components/ui/ActionButton';
import { colors } from '@/theme/colors';

const round = (value: unknown) => Math.round(Number(value ?? 0));

export default function RiskDetail() {
  const { deadlineId } = useLocalSearchParams<{ deadlineId: string }>();
  const router = useRouter();
  const [risk, setRisk] = useState<any>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDeadlineRisk(deadlineId).then(setRisk).catch((cause: any) => setError(cause.message));
  }, [deadlineId]);

  const daysLeft = risk?.due_at
    ? Math.ceil((new Date(risk.due_at).getTime() - Date.now()) / 86_400_000)
    : null;
  const gap = round(risk?.gap);

  return (
    <Screen title="Risk Detail" onBack={() => router.back()}>
      <ErrorMessage message={error} />
      {risk ? (
        <View style={styles.content}>
          <Text style={[styles.badge, risk.risk_level === 'ON_TRACK' && styles.badgeOk]}>
            {String(risk.risk_level ?? 'AT_RISK').replace('_', ' ')}
          </Text>
          <Text style={styles.title}>{risk.title ?? 'Deadline'}</Text>
          {risk.due_at && (
            <Text style={styles.due}>
              Due {new Date(risk.due_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
              {daysLeft != null && ` · ${daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}`}
            </Text>
          )}

          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Expected progress</Text>
              <Text style={styles.value}>{round(risk.expected_progress)}%</Text>
            </View>
            <View style={styles.track}><View style={[styles.fill, styles.expected, { width: `${round(risk.expected_progress)}%` }]} /></View>

            <View style={styles.row}>
              <Text style={styles.label}>Actual progress</Text>
              <Text style={styles.value}>{round(risk.actual_progress)}%</Text>
            </View>
            <View style={styles.track}><View style={[styles.fill, { width: `${round(risk.actual_progress)}%` }]} /></View>

            <View style={styles.row}>
              <Text style={styles.label}>Gap</Text>
              <Text style={[styles.gap, gap >= 0 && styles.gapOk]}>{gap > 0 ? `+${gap}` : gap}%</Text>
            </View>
          </View>

          <Text style={styles.heading}>What to do</Text>
          <Text style={styles.message}>{risk.next_action ?? 'Review the deadline and plan the next task.'}</Text>

          <ActionButton title="View Tasks" onPress={() => router.replace(`/deadline/${deadlineId}` as any)} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 32 },
  badge: { alignSelf: 'flex-start', color: colors.danger, backgroundColor: '#FFDDD8', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, fontWeight: '800', overflow: 'hidden' },
  badgeOk: { color: colors.secondary, backgroundColor: '#D8F3EE' },
  title: { color: colors.text, fontSize: 30, fontWeight: '800' },
  due: { color: colors.muted, fontSize: 15 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: colors.muted, fontSize: 14, fontWeight: '700' },
  value: { color: colors.text, fontSize: 22, fontWeight: '800' },
  track: { height: 10, borderRadius: 99, backgroundColor: '#E5E7EB', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: 99 },
  expected: { backgroundColor: '#A9C6F5' },
  gap: { color: colors.danger, fontWeight: '800', fontSize: 22 },
  gapOk: { color: colors.success },
  heading: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 6 },
  message: { color: colors.text, fontSize: 17, lineHeight: 24 },
});
