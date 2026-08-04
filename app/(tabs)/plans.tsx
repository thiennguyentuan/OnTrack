import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { MaterialIcons } from '@expo/vector-icons';

export default function PlansScreen() {
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
        {/* Page Title & Search */}
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>Plans</Text>

          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color={colors.muted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your goals..."
              placeholderTextColor={colors.muted}
            />
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
          <TouchableOpacity style={[styles.chip, styles.chipActive]}>
            <Text style={[styles.chipText, styles.chipTextActive]}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip}>
            <Text style={styles.chipText}>At Risk</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip}>
            <Text style={styles.chipText}>Completed</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Deadline List */}
        <View style={styles.listContainer}>

          {/* Card 1: At Risk */}
          <TouchableOpacity style={[styles.deadlineCard, { borderLeftColor: colors.danger }]}>
            <View style={styles.cardTop}>
              <View style={styles.cardTopLeft}>
                <Text style={styles.cardTitle}>Human-Computer Interaction Final</Text>
                <View style={[styles.statusBadge, { backgroundColor: colors.danger + '20' }]}>
                  <Text style={[styles.statusText, { color: colors.danger }]}>AT RISK</Text>
                </View>
              </View>
              <View style={styles.cardTopRight}>
                <Text style={[styles.daysLeft, { color: colors.danger }]}>2</Text>
                <Text style={styles.daysLabel}>days left</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Overall Progress</Text>
                <Text style={styles.progressValue}>65%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '65%' }]} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 2: Active (Primary) */}
          <TouchableOpacity style={[styles.deadlineCard, { borderLeftColor: colors.primary }]}>
            <View style={styles.cardTop}>
              <View style={styles.cardTopLeft}>
                <Text style={styles.cardTitle}>Machine Learning Lab Report</Text>
                <View style={[styles.statusBadge, { backgroundColor: colors.secondary + '20' }]}>
                  <Text style={[styles.statusText, { color: colors.secondary }]}>ACTIVE</Text>
                </View>
              </View>
              <View style={styles.cardTopRight}>
                <Text style={styles.daysLeft}>5</Text>
                <Text style={styles.daysLabel}>days left</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Overall Progress</Text>
                <Text style={styles.progressValue}>30%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '30%' }]} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 3: Active (Tertiary) */}
          <TouchableOpacity style={[styles.deadlineCard, { borderLeftColor: colors.tertiary }]}>
            <View style={styles.cardTop}>
              <View style={styles.cardTopLeft}>
                <Text style={styles.cardTitle}>Advanced Algorithms Quiz</Text>
                <View style={[styles.statusBadge, { backgroundColor: '#F1F5F9' }]}>
                  <Text style={[styles.statusText, { color: colors.muted }]}>ACTIVE</Text>
                </View>
              </View>
              <View style={styles.cardTopRight}>
                <Text style={styles.daysLeft}>12</Text>
                <Text style={styles.daysLabel}>days left</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Overall Progress</Text>
                <Text style={styles.progressValue}>10%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '10%' }]} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Add Deadline Button (FAB) */}
      <TouchableOpacity style={styles.fab}>
        <MaterialIcons name="add" size={24} color={colors.surface} />
        <Text style={styles.fabText}>Add Deadline</Text>
      </TouchableOpacity>
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
    borderColor: '#D4E2FF',
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
    paddingBottom: 120, // space for FAB and bottom nav
  },
  headerSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9', // surface-container-low
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  chipsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  chip: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: '#F1F5F9', // surface-container-high
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.muted,
  },
  chipTextActive: {
    color: colors.surface,
  },
  listContainer: {
    gap: 16,
  },
  deadlineCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderLeftWidth: 4,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTopLeft: {
    flex: 1,
    paddingRight: 16,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cardTopRight: {
    alignItems: 'flex-end',
  },
  daysLeft: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    lineHeight: 32,
  },
  daysLabel: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
  },
  progressValue: {
    fontSize: typography.sizes.xs,
    fontWeight: 'bold',
    color: colors.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9', // surface-container
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    height: 56,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    gap: 12,
  },
  fabText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: typography.sizes.sm,
  }
});
