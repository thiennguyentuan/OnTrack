import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/features/auth/authService';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';

export default function MeScreen() {
  const { user } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            const { error } = await authService.signOut();
            setIsLoggingOut(false);
            
            if (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const AVATAR_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuDxixReZkqmWkJxc-4B70efIhlWaQDll6XkGWlMu0UpGTqHYW1tou5Egp8XDLud3ue847yuotMRoggBs9XjSgCjSqWZoZKQXoVJZXyOHnwDMcR1H0e0bUGCTiE-hg9RT9EvXJ_gM-WpouRTh89OFNXZHwfUvqJb7PQs7y26xlv4ru0NMWRhHceBPn0vTiROZ_RaHAYSYGBVjXlKCEQsmi_nhE1wSTza7uo1SHzTTkDFwCCHv4OAdcQokA";

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.logoContainer}>
          <Image source={{ uri: AVATAR_URL }} style={styles.avatarMini} />
          <Text style={styles.logoText}>OnTrack</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialIcons name="notifications" size={24} color={colors.muted} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Identity */}
        <View style={styles.profileSection}>
          <Text style={styles.profileName}>Alex Rivers</Text>
          <Text style={styles.profileSubtitle}>Computer Science Junior</Text>
        </View>

        {/* Weekly Summary Bento */}
        <View style={styles.bentoGrid}>
          <View style={styles.bentoCard}>
            <MaterialIcons name="timer" size={32} color={colors.primary} />
            <View style={styles.bentoTextContainer}>
              <Text style={[styles.bentoValue, { color: colors.primary }]}>8</Text>
              <Text style={styles.bentoLabel}>Sessions completed</Text>
            </View>
          </View>
          <View style={styles.bentoCard}>
            <MaterialIcons name="task-alt" size={32} color={colors.secondary} />
            <View style={styles.bentoTextContainer}>
              <Text style={[styles.bentoValue, { color: colors.secondary }]}>2</Text>
              <Text style={styles.bentoLabel}>Deadlines finished</Text>
            </View>
          </View>
        </View>

        {/* Focus Visualization */}
        <View style={styles.focusCard}>
          <View style={styles.focusHeader}>
            <View>
              <Text style={styles.focusTitle}>Weekly Focus</Text>
              <Text style={styles.focusSubtitle}>Hours spent in deep work</Text>
            </View>
            <Text style={styles.focusValue}>24.5h</Text>
          </View>
          
          {/* Simple Bar Chart Placeholder */}
          <View style={styles.chartContainer}>
            {[40, 65, 90, 55, 80, 30, 20].map((height, index) => {
              const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
              const isToday = index === 2; // W
              return (
                <View key={index} style={styles.barColumn}>
                  <View style={[
                    styles.bar, 
                    { height: `${height}%`, backgroundColor: isToday ? colors.primary : colors.border }
                  ]} />
                  <Text style={styles.barLabel}>{days[index]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Navigation Links */}
        <View style={styles.linksContainer}>
          <TouchableOpacity style={styles.linkCard}>
            <View style={styles.linkLeft}>
              <View style={styles.linkIconBg}>
                <MaterialIcons name="history" size={24} color={colors.muted} />
              </View>
              <Text style={styles.linkText}>History</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.border} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkCard}>
            <View style={styles.linkLeft}>
              <View style={styles.linkIconBg}>
                <MaterialIcons name="notifications-active" size={24} color={colors.muted} />
              </View>
              <Text style={styles.linkText}>Notification Settings</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.border} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkCard}>
            <View style={styles.linkLeft}>
              <View style={styles.linkIconBg}>
                <MaterialIcons name="center-focus-strong" size={24} color={colors.muted} />
              </View>
              <Text style={styles.linkText}>Focus Settings</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.border} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkCard}>
            <View style={styles.linkLeft}>
              <View style={styles.linkIconBg}>
                <MaterialIcons name="person" size={24} color={colors.muted} />
              </View>
              <Text style={styles.linkText}>Account</Text>
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
    </View>
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
    backgroundColor: colors.primary,
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
