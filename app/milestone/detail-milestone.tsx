import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { typography } from '@/theme/typography';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface TaskItem {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  current_progress: number;
}

export default function MilestoneDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    milestoneId?: string;
  }>();

  const milestone = {
    id: params.milestoneId || 'm123-ui-design',
    title: '1. UI/UX Design System',
    targetAt: '20/11/2026',
    description:
      'Complete all Wireframes, User Flow, and Design System on Figma before transitioning to the frontend development phase.',
    status: 'IN_PROGRESS',
    parentDeadlineTitle: 'Mobile Final Project',
  };

  const [tasks] = useState<TaskItem[]>([
    {
      id: 't101',
      title: 'Design main Dashboard screen',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      current_progress: 60,
    },
    {
      id: 't102',
      title: 'Build UI Component Library',
      priority: 'MEDIUM',
      status: 'COMPLETED',
      current_progress: 100,
    },
    {
      id: 't103',
      title: 'Usability testing & user feedback',
      priority: 'LOW',
      status: 'NOT_STARTED',
      current_progress: 0,
    },
  ]);

  const calculateOverallProgress = () => {
    if (tasks.length === 0) return 0;
    const total = tasks.reduce((sum, task) => sum + task.current_progress, 0);
    return Math.round(total / tasks.length);
  };

  const overallProgress = calculateOverallProgress();

  const handleBack = () => {
    if (router.canGoBack()) router.back();
  };

  const handleEditMilestone = () => {
    router.push({
      pathname: '/milestone/edit-milestone',
      params: {
        milestoneId: milestone.id,
        title: milestone.title,
        targetAt: milestone.targetAt,
        description: milestone.description,
        status: milestone.status,
      },
    } as any);
  };

  const handleAddTask = () => {
    router.push({
      pathname: '/task/create-task',
      params: {
        milestoneId: milestone.id,
        milestoneTitle: milestone.title,
        deadlineTitle: milestone.parentDeadlineTitle,
      },
    } as any);
  };

  const handleEditTask = (task: TaskItem) => {
    router.push({
      pathname: `/task/edit-task`,
      params: {
        taskId: task.id,
      },
    } as any);
  };

  const handlePlanNextSession = (task: TaskItem) => {
    router.push({
      pathname: "/session/plan-session",
      params: {
        taskId: task.id
      }
    } as any)
  }

  const handleOpenTaskDetail = (task: TaskItem) => {
    router.push({
      pathname: "/task/detail-task",
      params: {
        taskId: task.id
      }
    } as any)
  }

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'HIGH':
        return { bg: '#FFDAD6', text: '#BA1A1A' };
      case 'MEDIUM':
        return { bg: '#FFF3E0', text: '#E65100' };
      case 'LOW':
        return { bg: '#E8F5E9', text: '#2E7D32' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar Navigation */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={handleBack}>
          <MaterialIcons name="arrow-back" size={24} color="#1A1C1C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Milestone Detail</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={handleEditMilestone}>
          <MaterialIcons name="edit" size={22} color="#0058BE" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Milestone Overview Card */}
        <View style={styles.milestoneCard}>
          <View style={styles.parentBadge}>
            <MaterialIcons name="folder" size={16} color="#0058BE" />
            <Text style={styles.parentBadgeText}>{milestone.parentDeadlineTitle.toUpperCase()}</Text>
          </View>

          <Text style={styles.milestoneTitle}>{milestone.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialIcons name="event" size={16} color="#727785" />
              <Text style={styles.metaText}>Target: {milestone.targetAt}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{milestone.status}</Text>
            </View>
          </View>

          {/* Combined Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Overall Progress</Text>
              <Text style={styles.progressValue}>{overallProgress}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${overallProgress}%` }]} />
            </View>
          </View>

          {milestone.description ? (
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{milestone.description}</Text>
            </View>
          ) : null}
        </View>

        {/* Task List Header */}
        <View style={styles.tasksHeader}>
          <View style={styles.tasksHeaderLeft}>
            <Text style={styles.sectionTitle}>Task List</Text>
            <View style={styles.taskCountBadge}>
              <Text style={styles.taskCountText}>{tasks.length}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.addTaskBtn} onPress={handleAddTask} activeOpacity={0.8}>
            <MaterialIcons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addTaskBtnText}>Add Task</Text>
          </TouchableOpacity>
        </View>

        {/* Task Cards */}
        <View style={styles.taskList}>
          {tasks.map((task) => {
            const priorityStyle = getPriorityColor(task.priority);
            return (
              <TouchableOpacity key={task.id} style={styles.taskCard} onPress={() => handleOpenTaskDetail(task)}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle} numberOfLines={2}>
                    {task.title}
                  </Text>
                </View>

                <View style={styles.taskBadgesRow}>
                  <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
                    <Text style={[styles.priorityBadgeText, { color: priorityStyle.text }]}>
                      {task.priority}
                    </Text>
                  </View>

                  <View style={styles.taskStatusBadge}>
                    <MaterialIcons
                      name={
                        task.status === 'COMPLETED'
                          ? 'check-circle'
                          : task.status === 'IN_PROGRESS'
                            ? 'hourglass-top'
                            : 'radio-button-unchecked'
                      }
                      size={14}
                      color={task.status === 'COMPLETED' ? '#2E7D32' : '#727785'}
                    />
                    <Text style={styles.taskStatusText}>{task.status}</Text>
                  </View>
                </View>

                <View style={styles.taskProgressRow}>
                  <View style={styles.taskProgressTrack}>
                    <View style={[styles.taskProgressFill, { width: `${task.current_progress}%` }]} />
                  </View>
                  <Text style={styles.taskProgressText}>{task.current_progress}%</Text>
                </View>

                {/* Quick Action Buttons */}
                <View style={styles.taskActionsRow}>
                  <TouchableOpacity
                    style={styles.planSessionBtn}
                    activeOpacity={0.7}
                    onPress={() => { handlePlanNextSession(task) }}
                  >
                    <MaterialIcons name="timer" size={16} color="#0058BE" />
                    <Text style={styles.planSessionBtnText}>Plan Session</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.editTaskIconBtn}
                    onPress={() => handleEditTask(task)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="edit" size={16} color="#424754" />
                    <Text style={styles.editTaskIconBtnText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, backgroundColor: '#F9F9F9' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: typography.sizes.lg, fontWeight: 'bold', color: '#1A1C1C' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  milestoneCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E2E2', marginTop: 8, marginBottom: 24 },
  parentBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  parentBadgeText: { fontSize: typography.sizes.xs, fontWeight: 'bold', color: '#0058BE', letterSpacing: 0.5 },
  milestoneTitle: { fontSize: typography.sizes.xl, fontWeight: 'bold', color: '#1A1C1C', marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: typography.sizes.xs, color: '#424754', fontWeight: '500' },
  statusBadge: { backgroundColor: '#D8E2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { fontSize: typography.sizes.xs, fontWeight: 'bold', color: '#0058BE' },
  progressSection: { gap: 6, marginBottom: 16 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: typography.sizes.xs, color: '#727785', fontWeight: '600' },
  progressValue: { fontSize: typography.sizes.sm, fontWeight: 'bold', color: '#0058BE' },
  progressTrack: { height: 8, backgroundColor: '#EAEFEF', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#0058BE', borderRadius: 4 },
  descriptionBox: { paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  descriptionTitle: { fontSize: typography.sizes.xs, fontWeight: 'bold', color: '#424754', marginBottom: 4 },
  descriptionText: { fontSize: typography.sizes.sm, color: '#1A1C1C', lineHeight: 20 },
  tasksHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  tasksHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: typography.sizes.lg, fontWeight: 'bold', color: '#1A1C1C' },
  taskCountBadge: { backgroundColor: '#E2E2E2', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  taskCountText: { fontSize: typography.sizes.xs, fontWeight: 'bold', color: '#424754' },
  addTaskBtn: { backgroundColor: '#0058BE', borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8 },
  addTaskBtnText: { color: '#FFFFFF', fontSize: typography.sizes.xs, fontWeight: 'bold' },
  taskList: { gap: 12 },
  taskCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E2E2' },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  taskTitle: { flex: 1, fontSize: typography.sizes.base, fontWeight: '600', color: '#1A1C1C', lineHeight: 22 },
  taskMenuBtn: { padding: 2 },
  taskBadgesRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 12 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  priorityBadgeText: { fontSize: typography.sizes.xs, fontWeight: 'bold' },
  taskStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  taskStatusText: { fontSize: typography.sizes.xs, color: '#727785', fontWeight: '500' },
  taskProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  taskProgressTrack: { flex: 1, height: 6, backgroundColor: '#EAEFEF', borderRadius: 3, overflow: 'hidden' },
  taskProgressFill: { height: '100%', backgroundColor: '#0058BE', borderRadius: 3 },
  taskProgressText: { fontSize: typography.sizes.xs, fontWeight: '600', color: '#424754', width: 32 },
  taskActionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  planSessionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  planSessionBtnText: { fontSize: typography.sizes.xs, fontWeight: 'bold', color: '#0058BE' },
  editTaskIconBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
  editTaskIconBtnText: { fontSize: typography.sizes.xs, color: '#424754', fontWeight: '500' },
});
