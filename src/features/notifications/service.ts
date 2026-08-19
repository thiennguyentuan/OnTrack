import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { settingsRepository, type NotificationPreferences } from '../settings/preferences';
import { getTodayDashboard } from '../dashboard/api';
import { listDeadlines } from '../plans/api';
import { buildNotificationPlan, type PlannedNotification, type SchedulableDeadline, type SchedulableSession } from './scheduling';

/** expo-notifications cannot schedule local notifications in the browser. */
const supported = Platform.OS === 'ios' || Platform.OS === 'android';

let handlerInstalled = false;

export function installNotificationHandler(preferences?: NotificationPreferences) {
  if (!supported || handlerInstalled) return;
  handlerInstalled = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: preferences?.soundEnabled ?? true,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidChannel(preferences: NotificationPreferences) {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('ontrack-reminders', {
    name: 'Session and deadline reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: preferences.vibrationEnabled ? [0, 250, 250, 250] : [0],
    sound: preferences.soundEnabled ? 'default' : undefined,
  });
}

/** Asks once. Returns false when the user declined, so callers can stay quiet. */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!supported) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}

async function schedule(planned: PlannedNotification, preferences: NotificationPreferences) {
  await Notifications.scheduleNotificationAsync({
    identifier: planned.key,
    content: {
      title: planned.title,
      body: planned.body,
      data: { route: planned.route },
      sound: preferences.soundEnabled,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: planned.fireAt,
      ...(Platform.OS === 'android' ? { channelId: 'ontrack-reminders' } : {}),
    },
  });
}

/**
 * Replaces every scheduled OnTrack notification with the plan for the current
 * data and preferences. Safe to call on every app start and after a settings save.
 * Returns how many notifications are now scheduled.
 */
export async function syncScheduledNotifications(input?: {
  sessions?: SchedulableSession[];
  deadlines?: SchedulableDeadline[];
  preferences?: NotificationPreferences;
}): Promise<number> {
  if (!supported) return 0;
  try {
    const preferences = input?.preferences ?? (await settingsRepository.loadNotifications());
    installNotificationHandler(preferences);

    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!preferences.allowAll) return 0;
    if (!(await ensureNotificationPermission())) return 0;
    await ensureAndroidChannel(preferences);

    const sessions = input?.sessions ?? ((await getTodayDashboard()) as { sessions?: SchedulableSession[] })?.sessions ?? [];
    const deadlines = input?.deadlines ?? ((await listDeadlines()) as unknown as SchedulableDeadline[]) ?? [];

    const plan = buildNotificationPlan({ sessions, deadlines, preferences });
    for (const planned of plan) {
      await schedule(planned, preferences);
    }
    return plan.length;
  } catch {
    // Notifications are a convenience; never let them break a screen.
    return 0;
  }
}

export async function cancelAllNotifications() {
  if (!supported) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    /* no-op */
  }
}

/** Subscribes to notification taps. Returns an unsubscribe function. */
export function onNotificationTapped(handler: (data: unknown) => void) {
  if (!supported) return () => undefined;
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    handler(response.notification.request.content.data);
  });
  return () => subscription.remove();
}

/** The notification that launched the app, if it was opened from one. */
export async function consumeLaunchNotification(): Promise<unknown | null> {
  if (!supported) return null;
  try {
    const response = await Notifications.getLastNotificationResponseAsync();
    return response?.notification.request.content.data ?? null;
  } catch {
    return null;
  }
}
