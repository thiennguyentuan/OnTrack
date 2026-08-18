import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'expo-router';
import { getTodayDashboard } from '@/features/dashboard/api';

export default function TodayScreen() {
  const { user } = useAuthStore();
  const avatarLetter = user?.email ? user.email.charAt(0).toUpperCase() : 'A';
  const router = useRouter();
  const AVATAR_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuDxixReZkqmWkJxc-4B70efIhlWaQDll6XkGWlMu0UpGTqHYW1tou5Egp8XDLud3ue847yuotMRoggBs9XjSgCjSqWZoZKQXoVJZXyOHnwDMcR1H0e0bUGCTiE-hg9RT9EvXJ_gM-WpouRTh89OFNXZHwfUvqJb7PQs7y26xlv4ru0NMWRhHceBPn0vTiROZ_RaHAYSYGBVjXlKCEQsmi_nhE1wSTza7uo1SHzTTkDFwCCHv4OAdcQokA";
  const [dashboard, setDashboard] = useState<any>();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    getTodayDashboard().then(setDashboard).catch((cause: any) => setError(cause?.message ?? 'Unable to load today.'));
  }, []);
  const sessions = dashboard?.sessions ?? [];
  const nextSession = dashboard?.next_session ?? sessions.find((item: any) => ['PLANNED', 'IN_PROGRESS', 'PAUSED'].includes(item.status));
  const laterSessions = sessions.filter((item: any) => item.id !== nextSession?.id && !['COMPLETED', 'ENDED_EARLY'].includes(item.status));
  const completedSessions = sessions.filter((item: any) => ['COMPLETED', 'ENDED_EARLY'].includes(item.status));

  const handleStartSession = (sessionId: string) => {
    router.push(`/session/${sessionId}` as any)
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.logoContainer}>
          <Image source={{ uri: AVATAR_URL }} style={styles.avatarMini} />
          <Text style={styles.logoText}>OnTrack</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialIcons name="notifications" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Good Morning, {user?.full_name ?? avatarLetter}</Text>
          <Text style={styles.greetingSubtitle}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>

          <View style={styles.infoBanner}>
            <MaterialIcons name="info" size={20} color={colors.secondary} />
            <Text style={styles.infoText}>{sessions.length ? `${sessions.length} session${sessions.length === 1 ? '' : 's'} planned today.` : 'No sessions planned today.'}</Text>
          </View>
        </View>

        {/* Risk Alert */}
        {!!dashboard?.risk_card && <TouchableOpacity style={styles.riskAlert}>
          <View style={styles.riskLeft}>
            <MaterialIcons name="warning" size={20} color={colors.danger} />
            <Text style={styles.riskText}>{dashboard.risk_card.message ?? `${dashboard.risk_card.title} needs attention.`}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={colors.danger} />
        </TouchableOpacity>}
        {!!error && <Text style={styles.greetingSubtitle}>{error}</Text>}

        {/* Next Session */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Next Session</Text>
            <Text style={styles.upNextText}>{nextSession ? `UP NEXT: ${new Date(nextSession.planned_start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'NO UPCOMING SESSION'}</Text>
          </View>

          {nextSession ? <View style={styles.nextSessionCard}>
            <View style={styles.cardIndicator} />
            <View style={styles.cardHeader}>
              <View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{nextSession.focus_mode === 'HIGH' ? 'High Focus' : 'Normal Focus'}</Text>
                </View>
                <Text style={styles.cardTitle}>{nextSession.task_title}</Text>
              </View>
              <View style={styles.durationContainer}>
                <MaterialIcons name="timer" size={16} color={colors.muted} />
                <Text style={styles.durationText}>{nextSession.estimated_minutes}m</Text>
              </View>
            </View>

            <View style={styles.cardContext}>
              <MaterialIcons name="school" size={18} color={colors.muted} />
              <Text style={styles.contextText}>{nextSession.status.replace('_', ' ')}</Text>
            </View>

            <TouchableOpacity style={styles.startBtn} onPress={() => handleStartSession(nextSession.id)}>
              <MaterialIcons name="play-arrow" size={24} color={colors.surface} />
              <Text style={styles.startBtnText}>Start Session</Text>
            </TouchableOpacity>
          </View> : <Text style={styles.greetingSubtitle}>Plan a session from a task to see it here.</Text>}
        </View>

        {/* Later Today */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Later Today</Text>

          {laterSessions.map((session: any) => <TouchableOpacity key={session.id} style={styles.taskCard} onPress={() => handleStartSession(session.id)}>
            <View style={styles.taskLeft}>
              <View style={styles.taskIconBg}>
                <MaterialIcons name="edit-note" size={24} color={colors.muted} />
              </View>
              <View>
                <Text style={styles.taskTitle}>{session.task_title}</Text>
                <Text style={styles.taskMeta}>{new Date(session.planned_start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.estimated_minutes}m • {session.focus_mode} Focus</Text>
              </View>
            </View>
            <MaterialIcons name="more-vert" size={24} color={colors.muted} />
          </TouchableOpacity>)}
        </View>

        {/* Completed Today */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Completed Today</Text>

          {completedSessions.map((session: any) => <View key={session.id} style={styles.completedCard}>
            <View style={styles.completedLeft}>
              <View style={styles.completedIconBg}>
                <MaterialIcons name="check-circle" size={16} color={colors.secondary} />
              </View>
              <Text style={styles.completedText}>{session.task_title}</Text>
            </View>
            <Text style={styles.completedTime}>{session.ended_at ? new Date(session.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Completed'}</Text>
          </View>)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  appBar: {
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarMini: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: '#D4E2FF', // primary-container
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMiniText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  logoText: {
    fontSize: typography.sizes.xl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  greetingSection: {
    marginTop: 16,
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  greetingSubtitle: {
    fontSize: typography.sizes.base,
    color: colors.muted,
    marginTop: 4,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.secondary + '15',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.secondary + '30',
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.secondary,
    fontWeight: '600',
  },
  riskAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.danger + '15',
    padding: 16,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
    marginTop: 24,
  },
  riskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  riskText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.danger,
  },
  sectionContainer: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  upNextText: {
    fontSize: typography.sizes.xs,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  nextSessionCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  cardIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.tertiary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: colors.tertiary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    color: colors.tertiary,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    fontWeight: '600',
  },
  cardContext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  contextText: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
  },
  startBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    gap: 8,
  },
  startBtnText: {
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: typography.sizes.base,
  },
  taskCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  taskIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: typography.sizes.base,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  taskMeta: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
  },
  completedCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F950', // low opacity
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    opacity: 0.7,
  },
  completedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  completedIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  completedTime: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
  },
});
