import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { getSessionHistory } from '@/features/dashboard/api';
import { getProfile } from '@/features/auth/api';
import { toHistoryTasks } from '@/features/dashboard/history-presentation';
import { Avatar } from '@/components/ui/Avatar';

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  email?: string;
}

export interface Task {
  id: string;
  title: string;
  current_progress: number;
  status?: string;
}

export interface Session {
  id: string;
  task_id: string;
  planned_start_at: string;
  estimated_minutes: number;
  focus_mode: 'NORMAL' | 'HIGH';
  status:
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'COMPLETED'
  | 'ENDED_EARLY'
  | 'SKIPPED'
  | 'CANCELLED';
  progress_before: number;
  progress_after: number | null;
  started_at: string | null;
  ended_at?: string | null;
  actual_minutes: number | null;
  result_note?: string | null;
  task_title?: string | null;
}

interface HistoryScreenProps {
  sessions?: Session[];
  tasks?: Task[];
  profile?: UserProfile;
  onBack?: () => void;
}

export default function HistoryScreen({
  sessions: suppliedSessions,
  tasks: suppliedTasks,
  profile: suppliedProfile,
  onBack,
}: HistoryScreenProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>(suppliedSessions ?? []);
  const [profile, setProfile] = useState<UserProfile>(suppliedProfile ?? { id: '', full_name: '', avatar_url: '' });
  const [isLoading, setIsLoading] = useState(!suppliedSessions);
  const [loadError, setLoadError] = useState('');
  const [activeFocusFilter, setActiveFocusFilter] = useState<'ALL' | 'HIGH' | 'NORMAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const tasks = suppliedTasks ?? toHistoryTasks(sessions);

  useEffect(() => {
    if (suppliedSessions) return;
    let active = true;
    Promise.all([getSessionHistory(), getProfile()])
      .then(([history, currentProfile]) => {
        if (!active) return;
        setSessions(history as Session[]);
        const user = currentProfile as { id: string; full_name: string; email?: string };
        setProfile({ id: user.id, full_name: user.full_name, email: user.email, avatar_url: '' });
      })
      .catch((error: Error) => active && setLoadError(error.message || 'Could not load session history.'))
      .finally(() => active && setIsLoading(false));
    return () => { active = false; };
  }, [suppliedSessions]);

  // Map tasks by ID for quick lookup
  const taskMap = useMemo(() => {
    return new Map(tasks.map((t) => [t.id, t]));
  }, [tasks]);

  // Filtered session list
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const linkedTask = taskMap.get(session.task_id);
      const taskTitle = linkedTask?.title || 'Untitled Task';

      const matchesSearch =
        taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (session.result_note &&
          session.result_note.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFocus =
        activeFocusFilter === 'ALL' || session.focus_mode === activeFocusFilter;

      return matchesSearch && matchesFocus;
    });
  }, [sessions, taskMap, searchQuery, activeFocusFilter]);

  // Aggregate statistics
  const totalMinutes = useMemo(() => {
    return filteredSessions.reduce(
      (acc, s) => acc + (s.actual_minutes || s.estimated_minutes || 0),
      0
    );
  }, [filteredSessions]);

  const avgFocus = useMemo(() => {
    if (filteredSessions.length === 0) return 'N/A';
    const highFocusCount = filteredSessions.filter((s) => s.focus_mode === 'HIGH').length;
    return highFocusCount >= filteredSessions.length / 2 ? 'High' : 'Normal';
  }, [filteredSessions]);

  const formatSessionTime = (isoString: string | null, plannedStart: string) => {
    const date = isoString ? new Date(isoString) : new Date(plannedStart);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    let dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (isToday) dayLabel = 'Today';
    if (isYesterday) dayLabel = 'Yesterday';

    return dayLabel;
  };

  const handleBack = () => {
    router.navigate('/(tabs)/me' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={24} color="#0058BE" />
          </TouchableOpacity>
          {!showSearchInput ? (
            <Text style={styles.headerTitle}>History</Text>
          ) : (
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search history..."
              placeholderTextColor="#727785"
              style={styles.searchInput}
              autoFocus
            />
          )}
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              setShowSearchInput(!showSearchInput);
              if (showSearchInput) setSearchQuery('');
            }}
          >
            <MaterialIcons
              name={showSearchInput ? 'close' : 'search'}
              size={24}
              color="#424754"
            />
          </TouchableOpacity>

          <Avatar name={profile.full_name} email={profile.email} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? <Text style={styles.loadState}>Loading your history…</Text> : null}
        {loadError ? <Text style={styles.errorState}>{loadError}</Text> : null}
        {/* Horizontal Filters Section */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <TouchableOpacity
            onPress={() => setActiveFocusFilter((prev) => (prev === 'HIGH' ? 'ALL' : 'HIGH'))}
            style={[
              styles.filterChip,
              activeFocusFilter === 'HIGH' && styles.filterChipActive,
            ]}
          >
            <MaterialIcons
              name="psychology"
              size={18}
              color={activeFocusFilter === 'HIGH' ? '#001D36' : '#424754'}
            />
            <Text
              style={[
                styles.filterChipText,
                activeFocusFilter === 'HIGH' && styles.filterChipTextActive,
              ]}
            >
              Focus: High
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveFocusFilter((prev) => (prev === 'NORMAL' ? 'ALL' : 'NORMAL'))}
            style={[
              styles.filterChip,
              activeFocusFilter === 'NORMAL' && styles.filterChipActive,
            ]}
          >
            <MaterialIcons
              name="center-focus-strong"
              size={18}
              color={activeFocusFilter === 'NORMAL' ? '#001D36' : '#424754'}
            />
            <Text
              style={[
                styles.filterChipText,
                activeFocusFilter === 'NORMAL' && styles.filterChipTextActive,
              ]}
            >
              Focus: Normal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveFocusFilter('ALL')}
            style={[
              styles.filterChip,
              styles.filterChipBorder,
              activeFocusFilter === 'ALL' && styles.filterChipActive,
            ]}
          >
            <MaterialIcons
              name="filter-list"
              size={18}
              color={activeFocusFilter === 'ALL' ? '#001D36' : '#424754'}
            />
            <Text
              style={[
                styles.filterChipText,
                activeFocusFilter === 'ALL' && styles.filterChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Summary Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>TOTAL TIME</Text>
            <Text style={styles.statValuePrimary}>{totalMinutes}m</Text>
          </View>

          <View style={[styles.statCard, styles.statCardTertiary]}>
            <Text style={styles.statLabel}>AVG FOCUS</Text>
            <Text style={styles.statValueTertiary}>{avgFocus}</Text>
          </View>
        </View>

        {/* History List */}
        <View style={styles.listContainer}>
          {filteredSessions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="event-busy" size={48} color="#C4C6D0" />
              <Text style={styles.emptyText}>No history entries found</Text>
            </View>
          ) : (
            filteredSessions.map((session) => {
              const linkedTask = taskMap.get(session.task_id);
              const taskTitle = linkedTask?.title || 'Focus Session';
              const duration = session.actual_minutes || session.estimated_minutes;
              const dateLabel = formatSessionTime(session.started_at, session.planned_start_at);

              const progressStart = session.progress_before;
              const progressEnd =
                session.progress_after ?? linkedTask?.current_progress ?? progressStart;

              const isCompleted = session.status === 'COMPLETED';
              const isHighFocus = session.focus_mode === 'HIGH';

              return (
                <View
                  key={session.id}
                  style={[
                    styles.sessionCard,
                    { borderLeftColor: isHighFocus ? '#0058BE' : '#565E71' },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.taskTitle}>{taskTitle}</Text>
                      <View style={styles.dateRow}>
                        <MaterialIcons
                          name={isCompleted ? 'history' : 'today'}
                          size={14}
                          color="#727785"
                        />
                        <Text style={styles.dateText}>
                          {dateLabel}, {duration}m session
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        isCompleted ? styles.badgeCompleted : styles.badgePlanned,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          isCompleted ? styles.statusTextCompleted : styles.statusTextPlanned,
                        ]}
                      >
                        {session.status.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardBody}>
                    <View style={styles.focusRow}>
                      <View style={styles.focusModeBadge}>
                        <MaterialIcons
                          name={isHighFocus ? 'bolt' : 'center-focus-strong'}
                          size={20}
                          color={isHighFocus ? '#6B38D4' : '#424754'}
                        />
                        <Text
                          style={[
                            styles.focusModeLabel,
                            { color: isHighFocus ? '#6B38D4' : '#424754' },
                          ]}
                        >
                          {isHighFocus ? 'High Focus' : 'Normal Focus'}
                        </Text>
                      </View>

                      <Text style={styles.progressRangeText}>
                        {progressStart}%{' '}
                        <Text style={{ color: isHighFocus ? '#0058BE' : '#565E71' }}>
                          →
                        </Text>{' '}
                        {progressEnd}%
                      </Text>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressBarTrack}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${Math.min(100, Math.max(0, progressEnd))}%`,
                            backgroundColor: isHighFocus ? '#0058BE' : '#565E71',
                          },
                        ]}
                      />
                    </View>

                    {session.result_note ? (
                      <Text style={styles.noteText}>"{session.result_note}"</Text>
                    ) : null}
                  </View>
                </View>
              );
            })
          )}

          <View style={styles.endListContainer}>
            <MaterialIcons name="event-available" size={48} color="#C4C6D0" />
            <Text style={styles.emptyText}>End of recent history</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
    backgroundColor: '#F9F9F9',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0058BE',
  },
  searchInput: {
    flex: 1,
    height: 38,
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1A1C1C',
  },
  iconBtn: {
    padding: 6,
    borderRadius: 20,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D8E2FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#C4C6D0',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0058BE',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  loadState: {
    color: '#64748B',
    textAlign: 'center',
    paddingTop: 16,
  },
  errorState: {
    color: '#B42318',
    textAlign: 'center',
    paddingTop: 16,
  },

  /* Filter Section */
  filterRow: {
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E2E2',
  },
  filterChipBorder: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#C4C6D0',
  },
  filterChipActive: {
    backgroundColor: '#D8E2FF',
  },
  filterChipText: {
    fontSize: 13,
    color: '#424754',
  },
  filterChipTextActive: {
    fontWeight: 'bold',
    color: '#001D36',
  },

  /* Stats Grid */
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  statCardTertiary: {
    borderLeftWidth: 4,
    borderLeftColor: '#E9DDFF',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#727785',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  statValuePrimary: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0058BE',
  },
  statValueTertiary: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B38D4',
  },

  /* Session List */
  listContainer: {
    gap: 12,
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 24,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1C1C',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#727785',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeCompleted: {
    backgroundColor: '#D7E3FF',
  },
  badgePlanned: {
    backgroundColor: '#E0E2EC',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  statusTextCompleted: {
    color: '#001B3E',
  },
  statusTextPlanned: {
    color: '#424754',
  },

  /* Card Body */
  cardBody: {
    gap: 8,
  },
  focusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  focusModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  focusModeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressRangeText: {
    fontSize: 12,
    color: '#727785',
  },
  progressBarTrack: {
    height: 8,
    width: '100%',
    backgroundColor: '#EEEEEE',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  noteText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#727785',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },

  /* Empty States */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 13,
    color: '#727785',
    marginTop: 8,
  },
  endListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    opacity: 0.4,
  },
});
