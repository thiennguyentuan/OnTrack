import { describe, expect, it } from 'vitest';
import { createSettingsRepository } from '../../src/features/settings/preferences';

const storage = () => {
  const values = new Map<string, string>();
  return {
    getItem: async (key: string) => values.get(key) ?? null,
    setItem: async (key: string, value: string) => { values.set(key, value); },
  };
};

describe('settings preferences', () => {
  it('persists and reloads account-only and focus choices without a backend schema', async () => {
    const repository = createSettingsRepository(storage());
    await repository.saveAccountDetails({ major: 'Software Engineering', graduationYear: '2027' });
    await repository.saveFocus({ focusMinutes: 60, breakMinutes: 10, autoStartBreak: true, autoStartNextSession: false, doNotDisturb: true, blockDistractions: false, ambientSound: 'rain' });

    expect(await repository.loadAccountDetails()).toEqual({ major: 'Software Engineering', graduationYear: '2027' });
    expect(await repository.loadFocus()).toMatchObject({ focusMinutes: 60, breakMinutes: 10, ambientSound: 'rain', blockDistractions: false });
  });

  it('persists and reloads notification choices including the lead times', async () => {
    const repository = createSettingsRepository(storage());
    await repository.saveNotifications({
      allowAll: false, dailyDigest: false, upcomingDeadline: true, sessionReminders: false,
      riskAlerts: true, weeklyReport: true, soundEnabled: false, vibrationEnabled: true,
      sessionReminderMinutes: 30, deadlineAlertDays: 7, dailyDigestHour: 8,
    });

    expect(await repository.loadNotifications()).toMatchObject({
      allowAll: false, dailyDigest: false, weeklyReport: true, soundEnabled: false,
      sessionReminderMinutes: 30, deadlineAlertDays: 7, dailyDigestHour: 8,
    });
  });

  it('fills in the lead times for preferences saved before they existed', async () => {
    const store = storage();
    // Simulate an install from an earlier build: only the original toggles were stored.
    await store.setItem('ontrack-notification-preferences', JSON.stringify({ allowAll: true, dailyDigest: false }));

    expect(await createSettingsRepository(store).loadNotifications()).toMatchObject({
      dailyDigest: false, sessionReminderMinutes: 15, deadlineAlertDays: 3, dailyDigestHour: 20,
    });
  });

  it('defaults appearance to following the system', async () => {
    const repository = createSettingsRepository(storage());
    expect(await repository.loadAppearance()).toEqual({ theme: 'system' });
    await repository.saveAppearance({ theme: 'light' });
    expect(await repository.loadAppearance()).toEqual({ theme: 'light' });
  });
});
