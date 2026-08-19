import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { notificationDefaults, settingsRepository } from '@/features/settings/preferences';
import { syncScheduledNotifications } from '@/features/notifications/service';

export default function NotificationSettingsScreen() {
  const router = useRouter();

  // Notification toggles state
  const [allowAll, setAllowAll] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [upcomingDeadline, setUpcomingDeadline] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [riskAlerts, setRiskAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [sessionReminderMinutes, setSessionReminderMinutes] = useState(notificationDefaults.sessionReminderMinutes);
  const [deadlineAlertDays, setDeadlineAlertDays] = useState(notificationDefaults.deadlineAlertDays);
  const [dailyDigestHour, setDailyDigestHour] = useState(notificationDefaults.dailyDigestHour);
  const [scheduled, setScheduled] = useState<number | null>(null);

  useEffect(() => {
    settingsRepository.loadNotifications().then((preferences) => {
      setAllowAll(preferences.allowAll); setDailyDigest(preferences.dailyDigest); setUpcomingDeadline(preferences.upcomingDeadline);
      setSessionReminders(preferences.sessionReminders); setRiskAlerts(preferences.riskAlerts); setWeeklyReport(preferences.weeklyReport);
      setSoundEnabled(preferences.soundEnabled); setVibrationEnabled(preferences.vibrationEnabled);
      setSessionReminderMinutes(preferences.sessionReminderMinutes); setDeadlineAlertDays(preferences.deadlineAlertDays);
      setDailyDigestHour(preferences.dailyDigestHour);
    }).catch(() => undefined);
  }, []);

  const handleBack = () => {
    router.navigate('/(tabs)/me' as any);
  };

  const handleSave = async () => {
    const preferences = {
      allowAll, dailyDigest, upcomingDeadline, sessionReminders, riskAlerts, weeklyReport,
      soundEnabled, vibrationEnabled, sessionReminderMinutes, deadlineAlertDays, dailyDigestHour,
    };
    await settingsRepository.saveNotifications(preferences);
    const count = await syncScheduledNotifications({ preferences });
    setScheduled(count);
    Alert.alert(
      'Notifications updated',
      allowAll
        ? `${count} reminder${count === 1 ? '' : 's'} scheduled.`
        : 'All reminders are switched off.',
      [{ text: 'OK', onPress: handleBack }],
    );
  };

  const stepper = (
    label: string,
    value: string,
    onDown: () => void,
    onUp: () => void,
  ) => (
    <View style={styles.stepperRow}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepper}>
        <TouchableOpacity disabled={!allowAll} style={styles.stepBtn} onPress={onDown}>
          <MaterialIcons name="remove" size={18} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.stepperValue}>{value}</Text>
        <TouchableOpacity disabled={!allowAll} style={styles.stepBtn} onPress={onUp}>
          <MaterialIcons name="add" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={handleBack}
        >
          <MaterialIcons name="arrow-back-ios-new" size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Master Switch Card */}
        <View style={styles.masterCard}>
          <View style={styles.masterLeft}>
            <View style={styles.masterIconBg}>
              <MaterialIcons name="notifications-active" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.masterTitle}>Allow Notifications</Text>
              <Text style={styles.masterSubtitle}>Enable all push and in-app alerts</Text>
            </View>
          </View>
          <Switch
            value={allowAll}
            onValueChange={setAllowAll}
            trackColor={{ false: '#E2E8F0', true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Reminders & Alerts Section */}
        <View style={[styles.section, !allowAll && styles.sectionDisabled]}>
          <Text style={styles.sectionHeader}>STUDY & DEADLINE ALERTS</Text>

          <View style={styles.card}>
            {/* Daily Digest */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.rowIconBg, { backgroundColor: '#E0F2FE' }]}>
                  <MaterialIcons name="wb-sunny" size={20} color="#0284C7" />
                </View>
                <View style={styles.rowTextContainer}>
                  <Text style={styles.rowTitle}>Daily Morning Digest</Text>
                  <Text style={styles.rowDesc}>A recap of your day at {String(dailyDigestHour).padStart(2, '0')}:00</Text>
                </View>
              </View>
              <Switch
                disabled={!allowAll}
                value={dailyDigest}
                onValueChange={setDailyDigest}
                trackColor={{ false: '#E2E8F0', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            {/* Upcoming Deadline */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.rowIconBg, { backgroundColor: '#FEF3C7' }]}>
                  <MaterialIcons name="alarm" size={20} color="#D97706" />
                </View>
                <View style={styles.rowTextContainer}>
                  <Text style={styles.rowTitle}>Upcoming Deadlines</Text>
                  <Text style={styles.rowDesc}>{deadlineAlertDays} day{deadlineAlertDays === 1 ? '' : 's'} before each due date</Text>
                </View>
              </View>
              <Switch
                disabled={!allowAll}
                value={upcomingDeadline}
                onValueChange={setUpcomingDeadline}
                trackColor={{ false: '#E2E8F0', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            {/* Session Reminders */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.rowIconBg, { backgroundColor: '#DCFCE7' }]}>
                  <MaterialIcons name="timer" size={20} color="#16A34A" />
                </View>
                <View style={styles.rowTextContainer}>
                  <Text style={styles.rowTitle}>Focus Session Starts</Text>
                  <Text style={styles.rowDesc}>{sessionReminderMinutes} minutes before each planned session</Text>
                </View>
              </View>
              <Switch
                disabled={!allowAll}
                value={sessionReminders}
                onValueChange={setSessionReminders}
                trackColor={{ false: '#E2E8F0', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            {/* Risk Warnings */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.rowIconBg, { backgroundColor: '#FEE2E2' }]}>
                  <MaterialIcons name="warning-amber" size={20} color="#DC2626" />
                </View>
                <View style={styles.rowTextContainer}>
                  <Text style={styles.rowTitle}>At-Risk Warnings</Text>
                  <Text style={styles.rowDesc}>A morning alert when a deadline falls behind pace</Text>
                </View>
              </View>
              <Switch
                disabled={!allowAll}
                value={riskAlerts}
                onValueChange={setRiskAlerts}
                trackColor={{ false: '#E2E8F0', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Timing */}
        <View style={[styles.section, !allowAll && styles.sectionDisabled]}>
          <Text style={styles.sectionHeader}>WHEN TO NOTIFY</Text>
          <View style={styles.card}>
            {stepper(
              'Session reminder',
              `${sessionReminderMinutes} min before`,
              () => setSessionReminderMinutes((value) => Math.max(5, value - 5)),
              () => setSessionReminderMinutes((value) => Math.min(120, value + 5)),
            )}
            <View style={styles.divider} />
            {stepper(
              'Deadline alert',
              `${deadlineAlertDays} day${deadlineAlertDays === 1 ? '' : 's'} before`,
              () => setDeadlineAlertDays((value) => Math.max(1, value - 1)),
              () => setDeadlineAlertDays((value) => Math.min(14, value + 1)),
            )}
            <View style={styles.divider} />
            {stepper(
              'Daily summary',
              `${String(dailyDigestHour).padStart(2, '0')}:00`,
              () => setDailyDigestHour((value) => (value + 23) % 24),
              () => setDailyDigestHour((value) => (value + 1) % 24),
            )}
          </View>
          {scheduled !== null && (
            <Text style={styles.scheduledNote}>{scheduled} reminder{scheduled === 1 ? '' : 's'} currently scheduled.</Text>
          )}
        </View>

        {/* Sound & Vibration */}
        <View style={[styles.section, !allowAll && styles.sectionDisabled]}>
          <Text style={styles.sectionHeader}>SOUND & VIBRATION</Text>

          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.rowIconBg, { backgroundColor: '#F1F5F9' }]}>
                  <MaterialIcons name="volume-up" size={20} color="#475569" />
                </View>
                <View style={styles.rowTextContainer}>
                  <Text style={styles.rowTitle}>In-App Sounds</Text>
                  <Text style={styles.rowDesc}>Play chime when timers and alerts trigger</Text>
                </View>
              </View>
              <Switch
                disabled={!allowAll}
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: '#E2E8F0', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.rowIconBg, { backgroundColor: '#F1F5F9' }]}>
                  <MaterialIcons name="vibration" size={20} color="#475569" />
                </View>
                <View style={styles.rowTextContainer}>
                  <Text style={styles.rowTitle}>Haptic Feedback</Text>
                  <Text style={styles.rowDesc}>Vibrate on actions & timer completion</Text>
                </View>
              </View>
              <Switch
                disabled={!allowAll}
                value={vibrationEnabled}
                onValueChange={setVibrationEnabled}
                trackColor={{ false: '#E2E8F0', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Weekly Report */}
        <View style={[styles.section, !allowAll && styles.sectionDisabled]}>
          <Text style={styles.sectionHeader}>SUMMARY & REPORTS</Text>

          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.rowIconBg, { backgroundColor: '#F3E8FF' }]}>
                  <MaterialIcons name="insights" size={20} color="#9333EA" />
                </View>
                <View style={styles.rowTextContainer}>
                  <Text style={styles.rowTitle}>Weekly Productivity Report</Text>
                  <Text style={styles.rowDesc}>A weekly recap every Monday at {String(dailyDigestHour).padStart(2, '0')}:00</Text>
                </View>
              </View>
              <Switch
                disabled={!allowAll}
                value={weeklyReport}
                onValueChange={setWeeklyReport}
                trackColor={{ false: '#E2E8F0', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={handleSave}>
          <MaterialIcons name="check" size={20} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Save Preferences</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16 },
  stepperLabel: { color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF1FD' },
  stepperValue: { color: colors.text, fontSize: 14, fontWeight: '700', minWidth: 96, textAlign: 'center' },
  scheduledNote: { color: colors.muted, fontSize: 13, marginTop: 8, marginLeft: 4 },
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#F9F9F9',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: 'bold',
    color: '#0058BE',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  masterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  masterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  masterIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#D8E2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  masterTitle: {
    fontSize: typography.sizes.base,
    fontWeight: 'bold',
    color: colors.text,
  },
  masterSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionDisabled: {
    opacity: 0.4,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 12,
  },
  rowIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextContainer: {
    flex: 1,
  },
  rowTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  rowDesc: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 66,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F9F9F9',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  saveBtn: {
    height: 52,
    backgroundColor: '#0058BE',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.base,
    fontWeight: 'bold',
  },
});
