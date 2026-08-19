import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { useAuthStore } from '@/stores/authStore';
import { useScrollStore } from '@/stores/scrollStore';
import { authService } from '@/features/auth/authService';
import { logoutAndClear } from '@/features/auth/logout';
import { getProfile } from '@/features/auth/api';
import { getSessionHistory } from '@/features/dashboard/api';
import { listDeadlines } from '@/features/plans/api';
import { formatFocusDuration, summarizeSessionHistory, weeklyFocusSeries } from '@/features/dashboard/history-presentation';
import { Avatar } from '@/components/ui/Avatar';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function MeScreen() {
  const { user, setSession } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profile, setProfile] = useState(user);
  const [summary, setSummary] = useState({ completedSessions: 0, focusMinutes: 0, completedDeadlines: 0 });
  const [focusSeries, setFocusSeries] = useState(() => weeklyFocusSeries([]));
  const { meScrollY, setMeScrollY } = useScrollStore();

  useEffect(() => {
    let active = true;
    Promise.all([getProfile(), getSessionHistory(), listDeadlines()])
      .then(([currentProfile, sessions, deadlines]) => {
        if (!active) return;
        setProfile(currentProfile);
        setFocusSeries(weeklyFocusSeries(sessions as any[]));
        setSummary({
          ...summarizeSessionHistory(sessions as any[]),
          completedDeadlines: (deadlines as Array<{ status?: string }>).filter((deadline) => deadline.status === 'COMPLETED').length,
        });
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutAndClear({ logout: authService.signOut, clearSession: () => setSession(null) });
      router.replace('/(auth)/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.logoContainer}>
          <Avatar name={profile?.full_name} email={profile?.email} />
          <Text style={styles.logoText}>OnTrack</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/settings/notification-settings' as any)}>
          <MaterialIcons name="notifications" size={24} color={colors.muted} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentOffset={{ x: 0, y: meScrollY }}
        onMomentumScrollEnd={(e) => {
          setMeScrollY(e.nativeEvent.contentOffset.y);
        }}
        onScrollEndDrag={(e) => {
          setMeScrollY(e.nativeEvent.contentOffset.y);
        }}
      >
        {/* Profile Identity */}
        <View style={styles.profileSection}>
          <Text style={styles.profileName}>{profile?.full_name || 'Your profile'}</Text>
          <Text style={styles.profileSubtitle}>{profile?.email || 'Loading account details…'}</Text>
        </View>

        {/* Weekly Summary Bento */}
        <View style={styles.bentoGrid}>
          <View style={styles.bentoCard}>
            <MaterialIcons name="timer" size={32} color={colors.primary} />
            <View style={styles.bentoTextContainer}>
              <Text style={[styles.bentoValue, { color: colors.primary }]}>{summary.completedSessions}</Text>
              <Text style={styles.bentoLabel}>Sessions completed</Text>
            </View>
          </View>
          <View style={styles.bentoCard}>
            <MaterialIcons name="task-alt" size={32} color={colors.secondary} />
            <View style={styles.bentoTextContainer}>
              <Text style={[styles.bentoValue, { color: colors.secondary }]}>{summary.completedDeadlines}</Text>
              <Text style={styles.bentoLabel}>Deadlines finished</Text>
            </View>
          </View>
        </View>

        {/* Focus Visualization */}
        <View style={styles.focusCard}>
          <View style={styles.focusHeader}>
            <View>
              <Text style={styles.focusTitle}>Focus History</Text>
              <Text style={styles.focusSubtitle}>Last 7 days</Text>
            </View>
            <Text style={styles.focusValue}>{formatFocusDuration(summary.focusMinutes)}</Text>
          </View>

          <View style={styles.chartContainer}>
            {focusSeries.map((day, index) => (
              <View key={index} style={styles.barColumn}>
                <View style={[
                  styles.bar,
                  { height: `${day.height}%`, backgroundColor: day.isToday ? colors.primary : colors.border }
                ]} />
                <Text style={styles.barLabel}>{day.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Navigation Links */}
        <View style={styles.linksContainer}>
          <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/settings/account' as any)}>
            <View style={styles.linkLeft}>
              <View style={styles.linkIconBg}>
                <MaterialIcons name="person" size={24} color={colors.muted} />
              </View>
              <Text style={styles.linkText}>Account</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.border} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/settings/notification-settings' as any)}>
            <View style={styles.linkLeft}>
              <View style={styles.linkIconBg}>
                <MaterialIcons name="notifications-active" size={24} color={colors.muted} />
              </View>
              <Text style={styles.linkText}>Notifications</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.border} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/settings/focus-settings' as any)}>
            <View style={styles.linkLeft}>
              <View style={styles.linkIconBg}>
                <MaterialIcons name="center-focus-strong" size={24} color={colors.muted} />
              </View>
              <Text style={styles.linkText}>Focus Mode Settings</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.border} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/settings/appearance' as any)}>
            <View style={styles.linkLeft}>
              <View style={styles.linkIconBg}>
                <MaterialIcons name="palette" size={24} color={colors.muted} />
              </View>
              <Text style={styles.linkText}>Appearance</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.border} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} disabled={isLoggingOut}>
            <View style={styles.linkLeft}>
              <View style={styles.logoutIconBg}>
                <MaterialIcons name="logout" size={24} color={colors.danger} />
              </View>
              <Text style={styles.logoutText}>{isLoggingOut ? 'Logging out...' : 'Logout'}</Text>
            </View>
          </TouchableOpacity>
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
    borderColor: '#D4E2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMiniText: {
    color: colors.surface,
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: typography.sizes.base,
    color: colors.muted,
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  bentoCard: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  bentoTextContainer: {
    marginTop: 'auto',
  },
  bentoValue: {
    fontSize: 40,
    fontWeight: 'bold',
    lineHeight: 44,
  },
  bentoLabel: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    fontWeight: '600',
    marginTop: 4,
  },
  focusCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  focusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  focusTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  focusSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    marginTop: 4,
  },
  focusValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 128,
    gap: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  barLabel: {
    marginTop: 8,
    fontSize: typography.sizes.xs,
    color: colors.muted,
    fontWeight: '600',
  },
  linksContainer: {
    marginTop: 24,
    gap: 12,
  },
  linkCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  linkIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.text,
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEE2E2', // error-container
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
  },
  logoutIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: typography.sizes.base,
    fontWeight: 'bold',
    color: colors.danger,
  },
});
