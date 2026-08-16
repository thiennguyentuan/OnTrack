import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { typography } from '@/theme/typography';

export interface Task {
  id: string;
  title: string;
  progress: number;
  completed: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  status: string;
  progress: number;
  icon: keyof typeof MaterialIcons.glyphMap;
  type: 'completed' | 'in_progress' | 'planning';
  description?: string;
  tasks?: Task[];
}

export default function DeadlineDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { deadlineId } = useLocalSearchParams<{ deadlineId: string }>();

  // Danh sách 3 Milestones chuẩn
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: 'm1',
      title: 'Research & Discovery',
      status: 'Completed',
      progress: 100,
      icon: 'check',
      type: 'completed',
      description: 'Analyze competitors, conduct user surveys, and finalize requirements.',
      tasks: [
        { id: 't1_1', title: 'User Interviews', progress: 100, completed: true },
        { id: 't1_2', title: 'Competitor Analysis', progress: 100, completed: true },
      ],
    },
    {
      id: 'm2',
      title: 'UI Design',
      status: 'In Progress',
      progress: 70,
      icon: 'edit',
      type: 'in_progress',
      description: 'Design Wireframes and High-fidelity Mockups in Figma.',
      tasks: [
        { id: 't2_1', title: 'Design Login & Auth', progress: 100, completed: true },
        { id: 't2_2', title: 'Design Dashboard Screens', progress: 40, completed: false },
        { id: 't2_3', title: 'Design System Tokens', progress: 70, completed: false },
      ],
    },
    {
      id: 'm3',
      title: 'Implementation',
      status: 'Planning',
      progress: 10,
      icon: 'code',
      type: 'planning',
      description: 'Initialize the Expo Router project, set up state management, and integrate APIs.',
      tasks: [
        { id: 't3_1', title: 'Setup Navigation Stack', progress: 30, completed: false },
        { id: 't3_2', title: 'Integrate Auth API', progress: 0, completed: false },
      ],
    },
  ]);

  // Mặc định mở Milestone UI Design (m2)
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>('m2');

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push(`/(tabs)/plans`);
    }
  };

  const toggleMilestone = (id: string) => {
    setExpandedMilestoneId((prev) => (prev === id ? null : id));
  };

  const toggleTaskComplete = (milestoneId: string, taskId: string) => {
    setMilestones((prev) =>
      prev.map((ms) => {
        if (ms.id !== milestoneId || !ms.tasks) return ms;

        const updatedTasks = ms.tasks.map((task) => {
          if (task.id === taskId) {
            const nextCompleted = !task.completed;
            return {
              ...task,
              completed: nextCompleted,
              progress: nextCompleted ? 100 : 0,
            };
          }
          return task;
        });

        const completedCount = updatedTasks.filter((t) => t.completed).length;
        const calcProgress = Math.round((completedCount / updatedTasks.length) * 100);

        return {
          ...ms,
          tasks: updatedTasks,
          progress: calcProgress,
          status: calcProgress === 100 ? 'Completed' : calcProgress > 0 ? 'In Progress' : 'Planning',
          type: calcProgress === 100 ? 'completed' : calcProgress > 0 ? 'in_progress' : 'planning',
        };
      })
    );
  };

  // These function is temporary
  const handleAddTaskOpen = (milestoneId: string) => {
    router.push({
      pathname: "/task/create-task",
      params: {
        milestoneId: milestoneId
      }
    });
  };

  const handleGoDetail = (milestoneId: string) => {
    router.push({
      pathname: "/milestone/detail-milestone",
      params: {
        milestoneId: milestoneId
      }
    })
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={handleBack}>
          <MaterialIcons name="arrow-back" size={24} color="#0058BE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialIcons name="more-vert" size={24} color="#424754" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 110 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>AT RISK</Text>
          </View>

          <Text style={styles.projectTitle}>Mobile Final Project</Text>

          <View style={styles.dueDateRow}>
            <MaterialIcons name="event" size={16} color="#424754" />
            <Text style={styles.dueDateText}>Due Dec 15, 2026</Text>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>OVERALL PROGRESS</Text>
              <Text style={styles.progressValue}>60%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '60%' }]} />
            </View>
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Milestones</Text>
          <TouchableOpacity style={styles.addMilestoneBtn}>
            <MaterialIcons name="add-circle-outline" size={18} color="#0058BE" />
            <Text style={styles.addMilestoneText}>Add Milestone</Text>
          </TouchableOpacity>
        </View>

        {/* Milestones List */}
        <View style={styles.milestonesList}>
          {milestones.map((item) => {
            const isExpanded = expandedMilestoneId === item.id;

            return (
              <View
                key={item.id}
                style={[
                  styles.milestoneCard,
                  isExpanded && item.type === 'in_progress' && styles.expandedRing,
                ]}
              >
                {/* Milestone Header */}
                <TouchableOpacity
                  style={styles.milestoneHeader}
                  activeOpacity={0.7}
                  onPress={() => toggleMilestone(item.id)}
                >
                  <View style={styles.milestoneInfo}>
                    <View
                      style={[
                        styles.milestoneIconBg,
                        item.type === 'completed' && styles.iconBgCompleted,
                        item.type === 'in_progress' && styles.iconBgInProgress,
                        item.type === 'planning' && styles.iconBgPlanning,
                      ]}
                    >
                      <MaterialIcons
                        name={item.icon}
                        size={20}
                        color={
                          item.type === 'completed'
                            ? '#007165'
                            : item.type === 'in_progress'
                              ? '#0058BE'
                              : '#424754'
                        }
                      />
                    </View>
                    <View>
                      <Text style={styles.milestoneTitle}>{item.title}</Text>
                      <Text
                        style={[
                          styles.milestoneStatus,
                          item.type === 'completed' && { color: '#006B5F' },
                          item.type === 'in_progress' && { color: '#0058BE' },
                          item.type === 'planning' && { color: '#424754' },
                        ]}
                      >
                        {item.status} • {item.progress}%
                      </Text>
                    </View>
                  </View>

                  <MaterialIcons
                    name={isExpanded ? 'expand-less' : 'expand-more'}
                    size={24}
                    color="#424754"
                  />
                </TouchableOpacity>

                {/* Milestone Body */}
                {isExpanded && (
                  <View style={styles.milestoneBody}>
                    <View style={styles.divider} />

                    {item.description ? (
                      <Text style={styles.descriptionText}>{item.description}</Text>
                    ) : null}

                    {item.tasks && item.tasks.length > 0 ? (
                      <View style={styles.taskList}>
                        {item.tasks.map((task) => (
                          <TouchableOpacity
                            key={task.id}
                            style={styles.taskItem}
                            activeOpacity={0.7}
                            onPress={() => toggleTaskComplete(item.id, task.id)}
                          >
                            {task.completed ? (
                              <View style={styles.checkedBox}>
                                <MaterialIcons name="check" size={14} color="#FFFFFF" />
                              </View>
                            ) : (
                              <View style={styles.uncheckedBox} />
                            )}

                            <View style={styles.taskDetails}>
                              <View style={styles.taskTitleRow}>
                                <Text
                                  style={[
                                    styles.taskTitleText,
                                    task.completed && styles.completedTaskText,
                                  ]}
                                >
                                  {task.title}
                                </Text>
                                <Text
                                  style={[
                                    styles.taskProgressText,
                                    !task.completed && { color: '#0058BE' },
                                  ]}
                                >
                                  {task.progress}%
                                </Text>
                              </View>

                              {!task.completed && (
                                <View style={styles.taskBarBg}>
                                  <View
                                    style={[
                                      styles.taskBarFill,
                                      { width: `${task.progress}%` },
                                    ]}
                                  />
                                </View>
                              )}
                            </View>
                          </TouchableOpacity>
                        ))}

                        {/* Hàng chứa 2 nút Action: Add Task & Go Detail */}
                        <View style={styles.taskActionRow}>
                          <TouchableOpacity
                            style={styles.addTaskBtn}
                            onPress={() => handleAddTaskOpen(item.id)}
                          >
                            <MaterialIcons name="add" size={18} color="#424754" />
                            <Text style={styles.addTaskText}>Add Task</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.goDetailBtn}
                            onPress={() => handleGoDetail(item.id)}
                          >
                            <MaterialIcons name="visibility" size={18} color="#0058BE" />
                            <Text style={styles.goDetailText}>Go Detail</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : null}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Action Zone */}
      <View
        style={[
          styles.floatingActionZone,
          { bottom: 16 + insets.bottom },
        ]}
      >
        <TouchableOpacity style={styles.updateProgressBtn}>
          <Text style={styles.updateBtnText}>Update Progress</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.chatBtn}>
          <MaterialIcons name="chat" size={24} color="#007165" />
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

  /* Header */
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
  },

  /* Hero Card */
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginTop: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#BA1A1A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  heroBadge: {
    backgroundColor: '#FFDAD6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  heroBadgeText: {
    color: '#93000A',
    fontSize: typography.sizes.xs,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  projectTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1C1C',
    marginTop: 12,
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  dueDateText: {
    fontSize: typography.sizes.sm,
    color: '#424754',
  },
  progressSection: {
    marginTop: 20,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: 'bold',
    color: '#424754',
    letterSpacing: 0.5,
  },
  progressValue: {
    fontSize: typography.sizes.base,
    fontWeight: 'bold',
    color: '#0058BE',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E2E2E2',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0058BE',
    borderRadius: 4,
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: 'bold',
    color: '#1A1C1C',
  },
  addMilestoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addMilestoneText: {
    color: '#0058BE',
    fontSize: typography.sizes.xs,
    fontWeight: 'bold',
  },

  /* Milestones Accordion */
  milestonesList: {
    gap: 16,
  },
  milestoneCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  expandedRing: {
    borderColor: '#D8E2FF',
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  milestoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  milestoneIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBgCompleted: { backgroundColor: '#62FAE3' },
  iconBgInProgress: { backgroundColor: '#D8E2FF' },
  iconBgPlanning: { backgroundColor: '#EEEEEE' },

  milestoneTitle: {
    fontSize: typography.sizes.base,
    fontWeight: 'bold',
    color: '#1A1C1C',
  },
  milestoneStatus: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },

  milestoneBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#C2C6D6',
    opacity: 0.3,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: typography.sizes.sm,
    color: '#424754',
    lineHeight: 20,
    marginBottom: 12,
  },

  /* Tasks inside Milestone */
  taskList: {
    gap: 14,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkedBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#0058BE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  uncheckedBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#0058BE',
    marginTop: 2,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitleText: {
    fontSize: typography.sizes.base,
    color: '#1A1C1C',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  taskProgressText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: '#424754',
  },
  taskBarBg: {
    height: 6,
    backgroundColor: '#E8E8E8',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 6,
  },
  taskBarFill: {
    height: '100%',
    backgroundColor: '#0058BE',
    borderRadius: 3,
  },

  /* Action Buttons Row (Add Task & Go Detail) */
  taskActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  addTaskBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C2C6D6',
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addTaskText: {
    fontSize: typography.sizes.xs,
    fontWeight: 'bold',
    color: '#424754',
  },
  goDetailBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0058BE',
    backgroundColor: '#EFF4FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  goDetailText: {
    fontSize: typography.sizes.xs,
    fontWeight: 'bold',
    color: '#0058BE',
  },

  /* Floating Actions */
  floatingActionZone: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  updateProgressBtn: {
    flex: 1,
    height: 52,
    backgroundColor: '#0058BE',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  updateBtnText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.base,
    fontWeight: 'bold',
  },
  chatBtn: {
    width: 52,
    height: 52,
    backgroundColor: '#62FAE3',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
});