import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export type PlanFilterType = 'ALL' | 'ACTIVE' | 'AT_RISK' | 'COMPLETED';

export interface PlanItem {
  id: string;
  title: string;
  category: 'ACTIVE' | 'AT_RISK' | 'COMPLETED';
  statusLabel: string;
  statusColor: string;
  statusBg: string;
  borderColor: string;
  daysLeft?: number;
  daysLeftLabel?: string;
  progress: number;
}

const INITIAL_DEADLINES: PlanItem[] = [
  {
    id: 'dl1',
    title: 'Human-Computer Interaction Final',
    category: 'AT_RISK',
    statusLabel: 'AT RISK',
    statusColor: colors.danger,
    statusBg: colors.danger + '20',
    borderColor: colors.danger,
    daysLeft: 2,
    daysLeftLabel: 'days left',
    progress: 65,
  },
  {
    id: 'dl2',
    title: 'Machine Learning Lab Report',
    category: 'ACTIVE',
    statusLabel: 'ACTIVE',
    statusColor: colors.secondary,
    statusBg: colors.secondary + '20',
    borderColor: colors.primary,
    daysLeft: 5,
    daysLeftLabel: 'days left',
    progress: 30,
  },
  {
    id: 'dl3',
    title: 'Advanced Algorithms Quiz',
    category: 'ACTIVE',
    statusLabel: 'ACTIVE',
    statusColor: colors.muted,
    statusBg: '#F1F5F9',
    borderColor: colors.tertiary,
    daysLeft: 12,
    daysLeftLabel: 'days left',
    progress: 10,
  },
  {
    id: 'dl4',
    title: 'Database Systems Midterm Project',
    category: 'COMPLETED',
    statusLabel: 'COMPLETED',
    statusColor: colors.success,
    statusBg: colors.success + '20',
    borderColor: colors.success,
    daysLeft: 0,
    daysLeftLabel: 'completed',
    progress: 100,
  },
];

export default function PlansScreen() {
  const AVATAR_URL =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDxixReZkqmWkJxc-4B70efIhlWaQDll6XkGWlMu0UpGTqHYW1tou5Egp8XDLud3ue847yuotMRoggBs9XjSgCjSqWZoZKQXoVJZXyOHnwDMcR1H0e0bUGCTiE-hg9RT9EvXJ_gM-WpouRTh89OFNXZHwfUvqJb7PQs7y26xlv4ru0NMWRhHceBPn0vTiROZ_RaHAYSYGBVjXlKCEQsmi_nhE1wSTza7uo1SHzTTkDFwCCHv4OAdcQokA';
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<PlanFilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const handleOpenDetailDeadline = (deadlineId: string) => {
    router.push({
      pathname: '/deadline/detail-deadline',
      params: {
        deadlineId: deadlineId,
      },
    });
  };

  const counts = useMemo(() => {
    return {
      ALL: INITIAL_DEADLINES.length,
      ACTIVE: INITIAL_DEADLINES.filter((i) => i.category === 'ACTIVE').length,
      AT_RISK: INITIAL_DEADLINES.filter((i) => i.category === 'AT_RISK').length,
      COMPLETED: INITIAL_DEADLINES.filter((i) => i.category === 'COMPLETED').length,
    };
  }, []);

  const filteredDeadlines = useMemo(() => {
    return INITIAL_DEADLINES.filter((item) => {
      const matchFilter = selectedFilter === 'ALL' || item.category === selectedFilter;
      const matchSearch =
        searchQuery.trim() === '' || item.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [selectedFilter, searchQuery]);

  const filterOptions: {
    key: PlanFilterType;
    label: string;
    description: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    color: string;
  }[] = [
    {
      key: 'ALL',
      label: 'All Plans',
      description: 'Show all active, at risk & completed goals',
      icon: 'view-list',
      color: colors.primary,
    },
    {
      key: 'ACTIVE',
      label: 'Active',
      description: 'Goals currently on track and in progress',
      icon: 'trending-up',
      color: colors.secondary,
    },
    {
      key: 'AT_RISK',
      label: 'At Risk',
      description: 'Urgent goals falling behind expected pace',
      icon: 'warning-amber',
      color: colors.danger,
    },
    {
      key: 'COMPLETED',
      label: 'Completed',
      description: 'Successfully finished projects & milestones',
      icon: 'check-circle-outline',
      color: colors.success,
    },
  ];

  const currentFilterObj = filterOptions.find((f) => f.key === selectedFilter) || filterOptions[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
        {/* Page Title */}
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>Plans</Text>

          {/* Search Bar & Filter Button Row */}
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={20} color={colors.muted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search your goals..."
                placeholderTextColor={colors.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                  <MaterialIcons name="close" size={18} color={colors.muted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Trigger Button */}
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter !== 'ALL' && styles.filterButtonActive]}
              activeOpacity={0.8}
              onPress={() => setIsFilterModalVisible(true)}
            >
              <MaterialIcons
                name="tune"
                size={20}
                color={selectedFilter !== 'ALL' ? '#FFFFFF' : '#475569'}
              />
              {selectedFilter !== 'ALL' && <View style={styles.filterDot} />}
            </TouchableOpacity>
          </View>

          {/* Active Filter Indicator Tag */}
          <View style={styles.activeFilterBar}>
            <View style={styles.activeFilterLeft}>
              <Text style={styles.showingText}>Showing: </Text>
              <View style={styles.activeFilterTag}>
                <MaterialIcons name={currentFilterObj.icon} size={14} color={currentFilterObj.color} />
                <Text style={[styles.activeFilterTagText, { color: currentFilterObj.color }]}>
                  {currentFilterObj.label} ({filteredDeadlines.length})
                </Text>
              </View>
            </View>

            {selectedFilter !== 'ALL' && (
              <TouchableOpacity onPress={() => setSelectedFilter('ALL')}>
                <Text style={styles.resetFilterText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Deadline List */}
        <View style={styles.listContainer}>
          {filteredDeadlines.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="assignment-late" size={48} color={colors.muted} />
              <Text style={styles.emptyTitle}>No plans found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Try searching with different keywords.'
                  : `There are no ${selectedFilter.toLowerCase().replace('_', ' ')} deadlines right now.`}
              </Text>
            </View>
          ) : (
            filteredDeadlines.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.deadlineCard, { borderLeftColor: item.borderColor }]}
                activeOpacity={0.7}
                onPress={() => handleOpenDetailDeadline(item.id)}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardTopLeft}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: item.statusBg }]}>
                      <Text style={[styles.statusText, { color: item.statusColor }]}>
                        {item.statusLabel}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardTopRight}>
                    <Text
                      style={[
                        styles.daysLeft,
                        item.category === 'AT_RISK' && { color: colors.danger },
                        item.category === 'COMPLETED' && { color: colors.success, fontSize: 22 },
                      ]}
                    >
                      {item.daysLeft}
                    </Text>
                    <Text style={styles.daysLabel}>{item.daysLeftLabel}</Text>
                  </View>
                </View>

                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Overall Progress</Text>
                    <Text style={[styles.progressValue, { color: item.borderColor }]}>
                      {item.progress}%
                    </Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${item.progress}%`, backgroundColor: item.borderColor },
                      ]}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Filter Bottom Sheet Modal */}
      <Modal
        visible={isFilterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsFilterModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalSheet}>
                {/* Drag handle */}
                <View style={styles.dragHandle} />

                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>Filter Deadlines</Text>
                    <Text style={styles.modalSubtitle}>Select which deadlines to display</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setIsFilterModalVisible(false)}
                  >
                    <MaterialIcons name="close" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalOptions}>
                  {filterOptions.map((opt) => {
                    const isSelected = selectedFilter === opt.key;
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        style={[styles.modalOptionCard, isSelected && styles.modalOptionCardSelected]}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSelectedFilter(opt.key);
                          setIsFilterModalVisible(false);
                        }}
                      >
                        <View
                          style={[styles.modalOptionIconBg, { backgroundColor: opt.color + '15' }]}
                        >
                          <MaterialIcons name={opt.icon} size={22} color={opt.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.modalOptionTitleRow}>
                            <Text
                              style={[
                                styles.modalOptionTitle,
                                isSelected && { color: colors.primary },
                              ]}
                            >
                              {opt.label}
                            </Text>
                            <View style={styles.modalCountBadge}>
                              <Text style={styles.modalCountText}>{counts[opt.key]}</Text>
                            </View>
                          </View>
                          <Text style={styles.modalOptionDesc}>{opt.description}</Text>
                        </View>
                        <View
                          style={[styles.radioButton, isSelected && styles.radioButtonSelected]}
                        >
                          {isSelected && <View style={styles.radioButtonDot} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Add Deadline Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => router.push('/deadline/create-deadline' as any)}
      >
        <MaterialIcons name="add" size={24} color={colors.surface} />
        <Text style={styles.fabText}>Add Deadline</Text>
      </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingBottom: 90,
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  clearSearchBtn: {
    padding: 4,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5252',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  activeFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 8,
  },
  activeFilterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showingText: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    marginRight: 4,
  },
  activeFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  activeFilterTagText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  resetFilterText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOptions: {
    gap: 12,
  },
  modalOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FAFAFA',
    gap: 14,
  },
  modalOptionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F0F7FF',
  },
  modalOptionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOptionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  modalOptionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: '700',
    color: colors.text,
  },
  modalCountBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 10,
  },
  modalCountText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
  },
  modalOptionDesc: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    lineHeight: 16,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
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
    backgroundColor: '#F1F5F9',
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
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: typography.sizes.base,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
