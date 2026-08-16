import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { typography } from '@/theme/typography';

export default function TaskDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    taskId?: string
  }>();

  // Mock data from Params or default design values
  const taskData = {
    id: 'task-101',
    category: 'UI DESIGN',
    title: 'Design Dashboard',
    projectName: 'Mobile Final Project',
    progress: 40,
    currentStage: 'Refining Mockups',
    nextSession: 'Tomorrow, 10:00 AM',
    lastSprint: {
      title: "Today's Sprint",
      duration: '45m High Focus',
      gainedProgress: '+40%',
      range: '0% → 40%',
    },
    resource: {
      title: 'Reference: Design Systems',
      subtitle: 'Material 3 Guidelines',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBuK6BFhPmd0cXq2lRzyERUSq-w7U5acIYqPZA1dYesBs9K2as4fpeNmo55yDwYHetG-jDDpUJKD-vqgpgqq68korKk6QneIHvl7d_2vVW6wRhuvqxbx2befbR7x8Fp7H1o7H6ck7T3vU0KT2i46dOqDSNXx1CkoKiOTV3T_jN916zN4JoLblEeprOuqMFqXag5HBsz8ptzrXHSZJFJPbtaR2z2n4c5bcPqD-57bTIKCL1AnUb8kN3r7Q',
    },
  };

  // Temporary button handler
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const handlePlanNextSession = (taskId: string) => {
    router.push({
      pathname: "/session/plan-session",
      params: {
        taskId: taskId
      }
    })
  };

  const handleMarkComplete = () => {
    Alert.alert('Confirmation', 'Mark this task as 100% completed?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => handleBack() },
    ]);
  };

  const handleOpenSessionDetail = () => {
    router.push("/session/detail-session")
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={handleBack}>
          <MaterialIcons name="arrow-back" size={24} color="#1A1C1C" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerCategory}>{taskData.category}</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {taskData.title}
          </Text>
        </View>

        <TouchableOpacity style={styles.headerIconBtn}>
          <MaterialIcons name="more-vert" size={24} color="#1A1C1C" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Context & Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.projectContextRow}>
            <MaterialIcons name="folder-open" size={18} color="#0058BE" />
            <Text style={styles.projectContextText}>{taskData.projectName}</Text>
          </View>
          <Text style={styles.mainTaskTitle}>{taskData.title}</Text>

          {/* Big Progress Card */}
          <View style={styles.progressCard}>
            {/* Center Progress Circle Badge */}
            <View style={styles.circleProgressContainer}>
              <View style={styles.circleOuter}>
                <Text style={styles.progressValueText}>{taskData.progress}%</Text>
                <Text style={styles.progressLabelText}>PROGRESS</Text>
              </View>
            </View>

            {/* Horizontal Stage Progress Bar */}
            <View style={styles.stageProgressWrapper}>
              <View style={styles.stageLabelRow}>
                <Text style={styles.stageTitle}>Current Stage</Text>
                <Text style={styles.stageSubtitle}>{taskData.currentStage}</Text>
              </View>

              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${taskData.progress}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Bento Grid Insights */}
        <View style={styles.bentoSection}>
          {/* Card 1: Next Planned Session */}
          <TouchableOpacity style={[styles.bentoCard, styles.nextSessionCard]} onPress={handleOpenSessionDetail}>
            <View style={styles.bentoCardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bentoTagText}>NEXT PLANNED SESSION</Text>
                <Text style={styles.bentoValueText}>{taskData.nextSession}</Text>
              </View>
              <View style={styles.iconBadgePrimary}>
                <MaterialIcons name="event-available" size={22} color="#0058BE" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 2: Focus Session History */}
          <View style={styles.bentoCard}>
            <Text style={styles.bentoTagText}>SESSION HISTORY</Text>
            <View style={styles.sessionHistoryRow}>
              <View style={styles.sessionHistoryLeft}>
                <View style={styles.boltIconBadge}>
                  <MaterialIcons name="bolt" size={22} color="#6B38D4" />
                </View>
                <View>
                  <Text style={styles.historyTitle}>{taskData.lastSprint.title}</Text>
                  <Text style={styles.historySubtext}>{taskData.lastSprint.duration}</Text>
                </View>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.progressGainText}>{taskData.lastSprint.gainedProgress}</Text>
                <Text style={styles.progressRangeText}>{taskData.lastSprint.range}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Resource Card */}
        <TouchableOpacity style={styles.resourceCard} activeOpacity={0.8}>
          <Image
            source={{ uri: taskData.resource.imageUrl }}
            style={styles.resourceImage}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.resourceTitle} numberOfLines={1}>
              {taskData.resource.title}
            </Text>
            <Text style={styles.resourceSubtitle}>
              {taskData.resource.subtitle}
            </Text>
          </View>
          <MaterialIcons name="open-in-new" size={20} color="#727785" />
        </TouchableOpacity>

        {/* Bottom Actions */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.8}
            onPress={() => handlePlanNextSession("task1")}
          >
            <MaterialIcons name="calendar-today" size={20} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Plan Next Session</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.8}
            onPress={handleMarkComplete}
          >
            <MaterialIcons name="check-circle" size={20} color="#006B5F" />
            <Text style={styles.secondaryBtnText}>Mark Complete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },

  /* Header */
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#F9F9F9',
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerCategory: {
    fontSize: typography.sizes.xs,
    fontWeight: 'bold',
    color: '#424754',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: typography.sizes.base,
    fontWeight: 'bold',
    color: '#0058BE',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 20,
  },

  /* Hero Section */
  heroSection: {
    marginTop: 8,
  },
  projectContextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  projectContextText: {
    fontSize: typography.sizes.sm,
    color: '#424754',
  },
  mainTaskTitle: {
    fontSize: typography.sizes['xxl'],
    fontWeight: 'bold',
    color: '#1A1C1C',
    marginBottom: 20,
  },

  /* Progress Visual Card */
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  circleProgressContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 10,
    borderColor: '#D8E2FF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  progressValueText: {
    fontSize: typography.sizes['xxl'],
    fontWeight: 'bold',
    color: '#0058BE',
  },
  progressLabelText: {
    fontSize: typography.sizes.xs,
    fontWeight: 'bold',
    color: '#424754',
    letterSpacing: 0.5,
  },

  /* Horizontal Progress Bar */
  stageProgressWrapper: {
    width: '100%',
    gap: 8,
  },
  stageLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  stageTitle: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: '#1A1C1C',
  },
  stageSubtitle: {
    fontSize: typography.sizes.sm,
    fontStyle: 'italic',
    color: '#424754',
  },
  progressBarTrack: {
    height: 16,
    width: '100%',
    backgroundColor: '#EEEEEE',
    borderRadius: 100,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0058BE',
    borderRadius: 100,
  },

  /* Bento Grid Insights */
  bentoSection: {
    gap: 12,
  },
  bentoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  nextSessionCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#0058BE',
  },
  bentoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bentoTagText: {
    fontSize: typography.sizes.xs,
    fontWeight: 'bold',
    color: '#727785',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bentoValueText: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: '#1A1C1C',
  },
  iconBadgePrimary: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#D8E2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sessionHistoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sessionHistoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  boltIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E9DDFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTitle: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: '#1A1C1C',
  },
  historySubtext: {
    fontSize: typography.sizes.sm,
    color: '#424754',
  },
  progressGainText: {
    fontSize: typography.sizes.base,
    fontWeight: 'bold',
    color: '#0058BE',
  },
  progressRangeText: {
    fontSize: typography.sizes.xs,
    color: '#727785',
  },

  /* Resource Card */
  resourceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  resourceImage: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  resourceTitle: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: '#1A1C1C',
  },
  resourceSubtitle: {
    fontSize: typography.sizes.sm,
    color: '#424754',
    marginTop: 2,
  },

  /* Actions Zone */
  actionSection: {
    gap: 12,
    paddingTop: 8,
  },
  primaryBtn: {
    height: 56,
    backgroundColor: '#0058BE',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0058BE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: typography.sizes.base,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    height: 56,
    backgroundColor: '#62FAE3',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryBtnText: {
    fontSize: typography.sizes.base,
    fontWeight: 'bold',
    color: '#00201C',
  },
});