import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function SessionDetailScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId?: string; }>();
  // This function is temporary
  const handleBackBtn = () => {
    router.back();
  }

  //This function is temporary
  const handleStartSession = () => {
    router.push({
      pathname: "/session/focus",
      params: {
        sessionId: sessionId
      }
    } as any);
  }
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => handleBackBtn()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session Detail</Text>
        <TouchableOpacity style={styles.moreBtn}>
          <MaterialIcons name="more-vert" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Info Card */}
        <View style={styles.card}>
          <View style={styles.badge}>
            <MaterialIcons name="local-fire-department" size={14} color={colors.tertiary} />
            <Text style={styles.badgeText}>HIGH FOCUS</Text>
          </View>
          <Text style={styles.taskTitle}>Design Dashboard</Text>
          <Text style={styles.projectSubtitle}>Mobile Final Project</Text>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialIcons name="event" size={20} color={colors.muted} />
              <View>
                <Text style={styles.metaLabel}>Date</Text>
                <Text style={styles.metaValue}>Today, Oct 24</Text>
              </View>
            </View>

            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={20} color={colors.muted} />
              <View>
                <Text style={styles.metaLabel}>Planned Time</Text>
                <Text style={styles.metaValue}>10:30 AM</Text>
              </View>
            </View>
          </View>

          <View style={[styles.metaRow, { marginTop: 16 }]}>
            <View style={styles.metaItem}>
              <MaterialIcons name="timer" size={20} color={colors.muted} />
              <View>
                <Text style={styles.metaLabel}>Duration</Text>
                <Text style={styles.metaValue}>45 minutes</Text>
              </View>
            </View>

            <View style={styles.metaItem}>
              <MaterialIcons name="trending-up" size={20} color={colors.muted} />
              <View>
                <Text style={styles.metaLabel}>Progress Start</Text>
                <Text style={styles.metaValue}>40%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Note Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Session Note</Text>
          <Text style={styles.noteText}>
            Focus on completing the wireframes for Today and Focus Session screens. Avoid distractions!
          </Text>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.startBtn} onPress={() => handleStartSession()}>
          <MaterialIcons name="play-arrow" size={24} color={colors.surface} />
          <Text style={styles.startBtnText}>Start Session</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: typography.sizes.base, fontWeight: 'bold', color: colors.text },
  moreBtn: { padding: 8 },
  content: { padding: 20, gap: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.tertiary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeText: { fontSize: typography.sizes.xs, color: colors.tertiary, fontWeight: 'bold' },
  taskTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  projectSubtitle: { fontSize: typography.sizes.sm, color: colors.muted },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  metaLabel: { fontSize: typography.sizes.xs, color: colors.muted },
  metaValue: { fontSize: typography.sizes.sm, fontWeight: '600', color: colors.text, marginTop: 2 },
  sectionTitle: { fontSize: typography.sizes.sm, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  noteText: { fontSize: typography.sizes.sm, color: colors.muted, lineHeight: 20 },
  bottomBar: { padding: 20, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  startBtn: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startBtnText: { color: colors.surface, fontWeight: 'bold', fontSize: typography.sizes.base },
});
