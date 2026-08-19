import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { useAuthStore } from '@/stores/authStore';
import { getSessionHistory, getTodayDashboard } from '@/features/dashboard/api';
import { listDeadlines } from '@/features/plans/api';
import { toPlanItem } from '@/features/plans/presentation';
import { formatFocusDuration, weeklyFocusSeries } from '@/features/dashboard/history-presentation';
import { flowRoutes } from '@/features/navigation/flow';
import { Avatar } from '@/components/ui/Avatar';

const greetingFor = (hour: number) =>
  hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>();
  const [history, setHistory] = useState<any[]>([]);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [today, sessions, plans] = await Promise.all([getTodayDashboard(), getSessionHistory(), listDeadlines()]);
      setDashboard(today);
      setHistory((sessions as any[]) ?? []);
      setDeadlines(((plans as any[]) ?? []).map((plan) => toPlanItem(plan)));
      setError(null);
    } catch (cause: any) {
      setError(cause?.message ?? 'Unable to load your dashboard.');
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const series = useMemo(() => weeklyFocusSeries(history), [history]);
  const todayMinutes = series[series.length - 1]?.minutes ?? 0;
  const nextSession = dashboard?.next_session;
  const atRisk = useMemo(() => deadlines.filter((item) => item.category === 'AT_RISK'), [deadlines]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.appBar}>
        <View style={styles.logoContainer}>
          <Avatar name={user?.full_name} email={user?.email} />
          <Text style={styles.logoText}>OnTrack</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/settings/notification-settings' as any)}>
          <MaterialIcons name="notifications" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />}
      >
        <Text style={styles.greeting}>{greetingFor(new Date().getHours())}, {user?.full_name ?? 'there'} 👋</Text>
        {!!error && <Text style={styles.subtle}>{error}</Text>}

        {/* Today Focus */}
        <View style={styles.focusCard}>
          <View style={styles.focusHeader}>
            <View>
              <Text style={styles.focusLabel}>TODAY FOCUS</Text>
              <Text style={styles.focusValue}>{formatFocusDuration(todayMinutes)}</Text>
            </View>
            <View style={styles.chart}>
              {series.map((day, index) => (
                <View key={index} style={styles.column}>
                  <View style={styles.barTrack}>
                    <View style={[styles.bar, { height: `${day.height}%`, backgroundColor: day.isToday ? colors.primary : '#C7D8F5' }]} />
                  </View>
                  <Text style={styles.barLabel}>{day.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Next Session */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Next Session</Text>
            <Text style={styles.sectionMeta}>
              {nextSession
                ? new Date(nextSession.planned_start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'NOTHING PLANNED'}
            </Text>
          </View>

          {nextSession ? (
            <View style={styles.sessionCard}>
              <View style={styles.sessionTop}>
                <View style={[styles.badge, nextSession.focus_mode === 'HIGH' && styles.badgeHigh]}>
                  <Text style={[styles.badgeText, nextSession.focus_mode === 'HIGH' && styles.badgeTextHigh]}>
                    {nextSession.focus_mode === 'HIGH' ? 'High Focus' : 'Normal Focus'}
                  </Text>
                </View>
                <View style={styles.duration}>
                  <MaterialIcons name="timer" size={15} color={colors.muted} />
                  <Text style={styles.durationText}>{nextSession.estimated_minutes}m</Text>
                </View>
              </View>
              <Text style={styles.sessionTitle}>{nextSession.task_title}</Text>
              <TouchableOpacity style={styles.startBtn} onPress={() => router.push(`/session/${nextSession.id}` as any)}>
                <MaterialIcons name="play-arrow" size={22} color={colors.surface} />
                <Text style={styles.startBtnText}>Start Session</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.emptyCard} onPress={() => router.push('/(tabs)/plans' as any)}>
              <Text style={styles.subtle}>No session planned. Open a task to schedule one.</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* At Risk Deadlines */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>At Risk Deadlines</Text>
            {atRisk.length > 0 && <Text style={styles.riskCount}>{atRisk.length}</Text>}
          </View>

          {atRisk.length === 0 ? (
            <View style={styles.okCard}>
              <MaterialIcons name="check-circle" size={20} color={colors.secondary} />
              <Text style={styles.okText}>Every deadline is on pace.</Text>
            </View>
          ) : (
            atRisk.map((item) => (
              <TouchableOpacity key={item.id} style={styles.riskCard} onPress={() => router.push(flowRoutes.risk(item.id) as any)}>
                <View style={styles.riskLeft}>
                  <MaterialIcons name="warning" size={20} color={colors.danger} />
                  <View style={styles.flex}>
                    <Text style={styles.riskTitle}>{item.title}</Text>
                    <Text style={styles.riskMeta}>
                      {item.progress}% done · {item.daysLeft} {item.daysLeftLabel}
                    </Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={colors.danger} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  appBar: { height: 72, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoText: { fontSize: typography.sizes.xl, fontWeight: 'bold', color: colors.primary },
  iconBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 48, gap: 22 },
  greeting: { fontSize: 26, fontWeight: 'bold', color: colors.text },
  subtle: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  flex: { flex: 1 },

  focusCard: { backgroundColor: colors.surface, borderRadius: 22, padding: 20 },
  focusHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 },
  focusLabel: { color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  focusValue: { color: colors.primary, fontSize: 34, fontWeight: '800', marginTop: 4 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 74, flex: 1, maxWidth: 190 },
  column: { flex: 1, alignItems: 'center', height: '100%' },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4, minHeight: 2 },
  barLabel: { color: colors.muted, fontSize: 9, fontWeight: '700', marginTop: 4 },

  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 19, fontWeight: 'bold', color: colors.text },
  sectionMeta: { color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  riskCount: { color: colors.danger, backgroundColor: '#FFDDD8', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 99, fontWeight: '800', fontSize: 13, overflow: 'hidden' },

  sessionCard: { backgroundColor: colors.surface, borderRadius: 22, padding: 20, gap: 12 },
  sessionTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { borderRadius: 99, paddingHorizontal: 11, paddingVertical: 5, backgroundColor: '#E6EEFF' },
  badgeHigh: { backgroundColor: '#F0E4FF' },
  badgeText: { color: colors.primary, fontSize: 11, fontWeight: '800' },
  badgeTextHigh: { color: colors.tertiary },
  duration: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  durationText: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  sessionTitle: { color: colors.text, fontSize: 21, fontWeight: '700' },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 13 },
  startBtnText: { color: colors.surface, fontWeight: '800', fontSize: 15 },
  emptyCard: { backgroundColor: colors.surface, borderRadius: 18, padding: 20 },

  okCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#E4F5F1', borderRadius: 16, padding: 16 },
  okText: { color: colors.secondary, fontWeight: '700', fontSize: 15 },
  riskCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, backgroundColor: '#FFF1EF', borderRadius: 16, padding: 16 },
  riskLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  riskTitle: { color: colors.text, fontWeight: '700', fontSize: 15 },
  riskMeta: { color: colors.danger, fontSize: 13, marginTop: 2 },
});
