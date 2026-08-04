import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';

export default function TodayScreen() {
  const { user } = useAuthStore();
  const avatarLetter = user?.email ? user.email.charAt(0).toUpperCase() : 'A';

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
          <MaterialIcons name="notifications" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Good Morning, {avatarLetter === 'A' ? 'Alex' : avatarLetter}</Text>
          <Text style={styles.greetingSubtitle}>Tuesday, October 24</Text>

          <View style={styles.infoBanner}>
            <MaterialIcons name="info" size={20} color={colors.secondary} />
            <Text style={styles.infoText}>You need 2 sessions today to stay on track.</Text>
          </View>
        </View>

        {/* Risk Alert */}
        <TouchableOpacity style={styles.riskAlert}>
          <View style={styles.riskLeft}>
            <MaterialIcons name="warning" size={20} color={colors.danger} />
            <Text style={styles.riskText}>Mobile Project needs attention.</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={colors.danger} />
        </TouchableOpacity>

        {/* Next Session */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Next Session</Text>
            <Text style={styles.upNextText}>UP NEXT: 10:30 AM</Text>
          </View>

          <View style={styles.nextSessionCard}>
            <View style={styles.cardIndicator} />
            <View style={styles.cardHeader}>
              <View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>High Focus</Text>
                </View>
                <Text style={styles.cardTitle}>Design Dashboard</Text>
              </View>
              <View style={styles.durationContainer}>
                <MaterialIcons name="timer" size={16} color={colors.muted} />
                <Text style={styles.durationText}>45m</Text>
              </View>
            </View>

            <View style={styles.cardContext}>
              <MaterialIcons name="school" size={18} color={colors.muted} />
              <Text style={styles.contextText}>Mobile Final Project</Text>
            </View>

            <TouchableOpacity style={styles.startBtn}>
              <MaterialIcons name="play-arrow" size={24} color={colors.surface} />
              <Text style={styles.startBtnText}>Start Session</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Later Today */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Later Today</Text>

          <View style={styles.taskCard}>
            <View style={styles.taskLeft}>
              <View style={styles.taskIconBg}>
                <MaterialIcons name="edit-note" size={24} color={colors.muted} />
              </View>
              <View>
                <Text style={styles.taskTitle}>Write Literature Review</Text>
                <Text style={styles.taskMeta}>1:30 PM • 60m • Medium Focus</Text>
              </View>
            </View>
            <MaterialIcons name="more-vert" size={24} color={colors.muted} />
          </View>

          <View style={styles.taskCard}>
            <View style={styles.taskLeft}>
              <View style={styles.taskIconBg}>
                <MaterialIcons name="science" size={24} color={colors.muted} />
              </View>
              <View>
                <Text style={styles.taskTitle}>Lab Report Submission</Text>
                <Text style={styles.taskMeta}>4:00 PM • 30m • Deep Work</Text>
              </View>
            </View>
            <MaterialIcons name="more-vert" size={24} color={colors.muted} />
          </View>
        </View>

        {/* Completed Today */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Completed Today</Text>

          <View style={styles.completedCard}>
            <View style={styles.completedLeft}>
              <View style={styles.completedIconBg}>
                <MaterialIcons name="check-circle" size={16} color={colors.secondary} />
              </View>
              <Text style={styles.completedText}>Check group email</Text>
            </View>
            <Text style={styles.completedTime}>08:15 AM</Text>
          </View>

          <View style={styles.completedCard}>
            <View style={styles.completedLeft}>
              <View style={styles.completedIconBg}>
                <MaterialIcons name="check-circle" size={16} color={colors.secondary} />
              </View>
              <Text style={styles.completedText}>Prepare lecture notes</Text>
            </View>
            <Text style={styles.completedTime}>09:00 AM</Text>
          </View>
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
