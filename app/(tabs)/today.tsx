import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { useAuthStore } from '@/stores/authStore';
import { getTodayDashboard } from '@/features/dashboard/api';
import {
  filterTodaySessions,
  formatSessionTime,
  groupTodaySessions,
  TODAY_FILTERS,
  todayFilterCounts,
  type TodayFilter,
  type TodaySession,
} from '@/features/dashboard/today-presentation';
import { Avatar } from '@/components/ui/Avatar';

const focusLabel = (mode?: string | null) => (mode === 'HIGH' ? 'High Focus' : 'Normal Focus');

export default function TodayScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [sessions, setSessions] = useState<TodaySession[]>([]);
  const [filter, setFilter] = useState<TodayFilter>('ALL');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const dashboard: any = await getTodayDashboard();
      setSessions(dashboard?.sessions ?? []);
      setError(null);
    } catch (cause: any) {
      setError(cause?.message ?? 'Unable to load today.');
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const counts = useMemo(() => todayFilterCounts(sessions), [sessions]);
  const groups = useMemo(() => groupTodaySessions(sessions), [sessions]);
  const filtered = useMemo(() => filterTodaySessions(sessions, filter), [sessions, filter]);

  const open = (session: TodaySession) => router.push(`/session/${session.id}` as any);

  const renderCard = (session: TodaySession, action?: { label: string; icon: keyof typeof MaterialIcons.glyphMap }) => (
    <TouchableOpacity key={session.id} style={styles.card} onPress={() => open(session)}>
      <View style={styles.cardLeft}>
        <View style={[styles.dot, session.focus_mode === 'HIGH' && styles.dotHigh]} />
        <View style={styles.flex}>
          <Text style={styles.cardTitle}>{session.task_title ?? 'Focus session'}</Text>
          <Text style={styles.cardMeta}>
            {formatSessionTime(session.planned_start_at)} · {session.estimated_minutes}m · {focusLabel(session.focus_mode)}
          </Text>
        </View>
      </View>
      {action ? (
        <View style={styles.action}>
          <MaterialIcons name={action.icon} size={16} color={colors.surface} />
          <Text style={styles.actionText}>{action.label}</Text>
        </View>
      ) : (
        <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
      )}
    </TouchableOpacity>
  );

  const renderDone = (session: TodaySession) => (
    <View key={session.id} style={styles.doneCard}>
      <View style={styles.cardLeft}>
        <MaterialIcons name="check-circle" size={20} color={colors.secondary} />
        <Text style={styles.doneTitle}>{session.task_title ?? 'Focus session'}</Text>
      </View>
      <Text style={styles.doneTime}>
        {session.ended_at ? formatSessionTime(session.ended_at) : String(session.status).replace('_', ' ')}
      </Text>
    </View>
  );

  const section = (title: string, items: TodaySession[], action?: { label: string; icon: keyof typeof MaterialIcons.glyphMap }) =>
    items.length > 0 && (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {items.map((item) => renderCard(item, action))}
      </View>
    );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.appBar}>
        <View style={styles.logoContainer}>
          <Avatar name={user?.full_name} email={user?.email} />
          <Text style={styles.logoText}>Today</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/settings/notification-settings' as any)}>
          <MaterialIcons name="notifications" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {TODAY_FILTERS.map((option) => {
          const active = filter === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setFilter(option.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                {option.label}
              </Text>
              <Text style={[styles.chipCount, active && styles.chipCountActive]}>{counts[option.key]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />}
      >
        <Text style={styles.date}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        {!!error && <Text style={styles.subtle}>{error}</Text>}

        {filter === 'ALL' ? (
          <>
            {section('In Progress', groups.inProgress, { label: 'Resume', icon: 'play-arrow' })}
            {section('Next', groups.next, { label: 'Start', icon: 'play-arrow' })}
            {section('Later Today', groups.later)}
            {groups.done.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Done</Text>
                {groups.done.map(renderDone)}
              </View>
            )}
          </>
        ) : (
          <View style={styles.section}>
            {filtered.map((item) => (filter === 'DONE' ? renderDone(item) : renderCard(item)))}
          </View>
        )}

        {!filtered.length && (
          <View style={styles.empty}>
            <MaterialIcons name="event-available" size={30} color={colors.muted} />
            <Text style={styles.subtle}>
              {filter === 'ALL' ? 'Nothing planned for today yet.' : 'No sessions in this view.'}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/session/plan' as any)}>
          <MaterialIcons name="add" size={20} color={colors.primary} />
          <Text style={styles.addBtnText}>Add Session</Text>
        </TouchableOpacity>
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

  filterRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 24, paddingBottom: 12 },
  chip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    paddingVertical: 9, paddingHorizontal: 6, borderRadius: 99,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: colors.surface },
  chipCount: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  chipCountActive: { color: '#D6E4FF' },

  scrollContent: { paddingHorizontal: 24, paddingBottom: 48, gap: 20 },
  date: { color: colors.muted, fontSize: 15 },
  subtle: { color: colors.muted, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  flex: { flex: 1 },

  section: { gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, backgroundColor: colors.surface, borderRadius: 18, padding: 16 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  dotHigh: { backgroundColor: colors.tertiary },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  cardMeta: { color: colors.muted, fontSize: 13, marginTop: 2 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 7 },
  actionText: { color: colors.surface, fontSize: 13, fontWeight: '800' },

  doneCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, backgroundColor: '#EEF6F4', borderRadius: 16, padding: 14 },
  doneTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  doneTime: { color: colors.secondary, fontSize: 13, fontWeight: '700' },

  empty: { alignItems: 'center', gap: 10, paddingVertical: 28 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 16, paddingVertical: 15, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.primary },
  addBtnText: { color: colors.primary, fontWeight: '800', fontSize: 15 },
});
