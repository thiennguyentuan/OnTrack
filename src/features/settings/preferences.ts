import AsyncStorage from '@react-native-async-storage/async-storage';

type Storage = Pick<typeof AsyncStorage, 'getItem' | 'setItem'>;
export type AccountDetails = { major: string; graduationYear: string };
export type FocusPreferences = {
  focusMinutes: number; breakMinutes: number; autoStartBreak: boolean; autoStartNextSession: boolean;
  doNotDisturb: boolean; blockDistractions: boolean; ambientSound: 'none' | 'rain' | 'whitenoise' | 'cafe';
};
export type NotificationPreferences = {
  allowAll: boolean; dailyDigest: boolean; upcomingDeadline: boolean; sessionReminders: boolean;
  riskAlerts: boolean; weeklyReport: boolean; soundEnabled: boolean; vibrationEnabled: boolean;
  /** Lead times the scheduler uses. Shown on the settings screen. */
  sessionReminderMinutes: number; deadlineAlertDays: number; dailyDigestHour: number;
};
export type ThemeChoice = 'system' | 'light' | 'dark';
export type AppearancePreferences = { theme: ThemeChoice };

const ACCOUNT_KEY = 'ontrack-account-details';
const FOCUS_KEY = 'ontrack-focus-preferences';
const NOTIFICATIONS_KEY = 'ontrack-notification-preferences';
const APPEARANCE_KEY = 'ontrack-appearance-preferences';
const defaults = {
  account: { major: '', graduationYear: '' },
  focus: { focusMinutes: 45, breakMinutes: 10, autoStartBreak: false, autoStartNextSession: false, doNotDisturb: true, blockDistractions: true, ambientSound: 'whitenoise' as const },
  notifications: { allowAll: true, dailyDigest: true, upcomingDeadline: true, sessionReminders: true, riskAlerts: true, weeklyReport: false, soundEnabled: true, vibrationEnabled: true, sessionReminderMinutes: 15, deadlineAlertDays: 3, dailyDigestHour: 20 },
  appearance: { theme: 'system' as const },
};

async function load<T>(storage: Storage, key: string, fallback: T): Promise<T> {
  const value = await storage.getItem(key);
  if (!value) return fallback;
  try { return { ...fallback, ...JSON.parse(value) }; } catch { return fallback; }
}

export function createSettingsRepository(storage: Storage = AsyncStorage) {
  return {
    loadAccountDetails: () => load<AccountDetails>(storage, ACCOUNT_KEY, defaults.account),
    saveAccountDetails: (value: AccountDetails) => storage.setItem(ACCOUNT_KEY, JSON.stringify(value)),
    loadFocus: () => load<FocusPreferences>(storage, FOCUS_KEY, defaults.focus),
    saveFocus: (value: FocusPreferences) => storage.setItem(FOCUS_KEY, JSON.stringify(value)),
    loadNotifications: () => load<NotificationPreferences>(storage, NOTIFICATIONS_KEY, defaults.notifications),
    saveNotifications: (value: NotificationPreferences) => storage.setItem(NOTIFICATIONS_KEY, JSON.stringify(value)),
    loadAppearance: () => load<AppearancePreferences>(storage, APPEARANCE_KEY, defaults.appearance),
    saveAppearance: (value: AppearancePreferences) => storage.setItem(APPEARANCE_KEY, JSON.stringify(value)),
  };
}

export const notificationDefaults = defaults.notifications;

export const settingsRepository = createSettingsRepository();
