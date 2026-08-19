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
import { settingsRepository } from '@/features/settings/preferences';

const FOCUS_DURATIONS = [25, 45, 60, 90];
const BREAK_DURATIONS = [5, 10, 15];

export default function FocusSettingsScreen() {
  const router = useRouter();

  // Focus configuration states
  const [selectedFocusDuration, setSelectedFocusDuration] = useState(45);
  const [selectedBreakDuration, setSelectedBreakDuration] = useState(10);
  const [autoStartBreak, setAutoStartBreak] = useState(false);
  const [autoStartNextSession, setAutoStartNextSession] = useState(false);
  const [doNotDisturb, setDoNotDisturb] = useState(true);
  const [blockDistractions, setBlockDistractions] = useState(true);
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'whitenoise' | 'cafe'>('whitenoise');

  useEffect(() => {
    settingsRepository.loadFocus().then((preferences) => {
      setSelectedFocusDuration(preferences.focusMinutes); setSelectedBreakDuration(preferences.breakMinutes);
      setAutoStartBreak(preferences.autoStartBreak); setAutoStartNextSession(preferences.autoStartNextSession);
      setDoNotDisturb(preferences.doNotDisturb); setBlockDistractions(preferences.blockDistractions);
      setAmbientSound(preferences.ambientSound);
    }).catch(() => undefined);
  }, []);

  const handleBack = () => {
    router.navigate('/(tabs)/me' as any);
  };

  const handleSave = async () => {
    await settingsRepository.saveFocus({
      focusMinutes: selectedFocusDuration, breakMinutes: selectedBreakDuration, autoStartBreak, autoStartNextSession,
      doNotDisturb, blockDistractions, ambientSound,
    });
    Alert.alert('Success', 'Focus session preferences saved successfully!', [
      { text: 'OK', onPress: handleBack },
    ]);
  };

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
        <Text style={styles.headerTitle}>Focus Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Info */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerIconWrapper}>
            <MaterialIcons name="center-focus-strong" size={24} color="#0058BE" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Custom Deep Work Engine</Text>
            <Text style={styles.bannerSubtext}>
              Configure your default session timing, breaks, and distraction blockers.
            </Text>
          </View>
        </View>

        {/* Focus Duration Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>DEFAULT FOCUS SESSION LENGTH</Text>
          <View style={styles.durationsGrid}>
            {FOCUS_DURATIONS.map((dur) => {
              const isSelected = selectedFocusDuration === dur;
              return (
                <TouchableOpacity
                  key={dur}
                  style={[styles.durationCard, isSelected && styles.durationCardActive]}
                  onPress={() => setSelectedFocusDuration(dur)}
                >
                  <Text style={[styles.durationNumber, isSelected && styles.durationNumberActive]}>
                    {dur}
                  </Text>
                  <Text style={[styles.durationUnit, isSelected && styles.durationUnitActive]}>
                    minutes
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Break Duration Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>SHORT BREAK DURATION</Text>
          <View style={styles.durationsGrid}>
            {BREAK_DURATIONS.map((dur) => {
              const isSelected = selectedBreakDuration === dur;
              return (
                <TouchableOpacity
                  key={dur}
                  style={[styles.durationCard, isSelected && styles.durationCardActive]}
                  onPress={() => setSelectedBreakDuration(dur)}
                >
                  <Text style={[styles.durationNumber, isSelected && styles.durationNumberActive]}>
                    {dur}
                  </Text>
                  <Text style={[styles.durationUnit, isSelected && styles.durationUnitActive]}>
                    minutes
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Flow & Automation Options */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>SESSION AUTOMATION & FLOW</Text>

          <View style={styles.card}>
            {/* Auto-start Break */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.rowIconBg, { backgroundColor: '#E0F2FE' }]}>
                  <MaterialIcons name="free-breakfast" size={20} color="#0284C7" />
                </View>
                <View style={styles.rowTextContainer}>
                  <Text style={styles.rowTitle}>Auto-Start Breaks</Text>
                  <Text style={styles.rowDesc}>Begin countdown immediately when focus session finishes</Text>
                </View>
              </View>
              <Switch
                value={autoStartBreak}
                onValueChange={setAutoStartBreak}
                trackColor={{ false: '#E2E8F0', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            {/* Auto-start Next Session */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.rowIconBg, { backgroundColor: '#DCFCE7' }]}>
                  <MaterialIcons name="replay" size={20} color="#16A34A" />
                </View>
                <View style={styles.rowTextContainer}>
                  <Text style={styles.rowTitle}>Auto-Start Next Session</Text>
                  <Text style={styles.rowDesc}>Chain multiple focus blocks back-to-back</Text>
                </View>
              </View>
              <Switch
                value={autoStartNextSession}
                onValueChange={setAutoStartNextSession}
                trackColor={{ false: '#E2E8F0', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Distraction Prevention */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>DISTRACTION SHIELD</Text>

          <View style={styles.card}>
            {/* Strict Focus Mode */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.rowIconBg, { backgroundColor: '#FEE2E2' }]}>
                  <MaterialIcons name="do-not-disturb-on" size={20} color="#DC2626" />
                </View>
                <View style={styles.rowTextContainer}>
                  <Text style={styles.rowTitle}>Do Not Disturb</Text>
                  <Text style={styles.rowDesc}>Silence system alerts while timer is running</Text>
                </View>
              </View>
              <Switch
                value={doNotDisturb}
                onValueChange={setDoNotDisturb}
                trackColor={{ false: '#E2E8F0', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            {/* In-App Block */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.rowIconBg, { backgroundColor: '#FEF3C7' }]}>
                  <MaterialIcons name="security" size={20} color="#D97706" />
                </View>
                <View style={styles.rowTextContainer}>
                  <Text style={styles.rowTitle}>Block App Switcher</Text>
                  <Text style={styles.rowDesc}>Show friendly reminder if you leave during a session</Text>
                </View>
              </View>
              <Switch
                value={blockDistractions}
                onValueChange={setBlockDistractions}
                trackColor={{ false: '#E2E8F0', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Background Sounds */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>BACKGROUND AMBIENT SOUND</Text>
          <View style={styles.ambientGrid}>
            {[
              { key: 'none', label: 'Silent', icon: 'volume-off' },
              { key: 'whitenoise', label: 'White Noise', icon: 'graphic-eq' },
              { key: 'rain', label: 'Rain Drops', icon: 'water-drop' },
              { key: 'cafe', label: 'Cozy Cafe', icon: 'local-cafe' },
            ].map((sound) => {
              const isSelected = ambientSound === sound.key;
              return (
                <TouchableOpacity
                  key={sound.key}
                  style={[styles.ambientOption, isSelected && styles.ambientOptionActive]}
                  onPress={() => setAmbientSound(sound.key as any)}
                >
                  <MaterialIcons
                    name={sound.icon as any}
                    size={22}
                    color={isSelected ? '#0058BE' : '#64748B'}
                  />
                  <Text style={[styles.ambientLabel, isSelected && styles.ambientLabelActive]}>
                    {sound.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={handleSave}>
          <MaterialIcons name="check" size={20} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Save Focus Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  bannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  bannerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#D8E2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: typography.sizes.base,
    fontWeight: 'bold',
    color: '#1A1C1C',
  },
  bannerSubtext: {
    fontSize: typography.sizes.xs,
    color: '#424754',
    marginTop: 2,
    lineHeight: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  durationsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  durationCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#F0F7FF',
  },
  durationNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  durationNumberActive: {
    color: colors.primary,
  },
  durationUnit: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  durationUnitActive: {
    color: colors.primary,
    fontWeight: '600',
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
  ambientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  ambientOption: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ambientOptionActive: {
    borderColor: colors.primary,
    backgroundColor: '#F0F7FF',
  },
  ambientLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: '#475569',
  },
  ambientLabelActive: {
    color: '#0058BE',
    fontWeight: 'bold',
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
