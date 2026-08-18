import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { typography } from '@/theme/typography';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface TaskFormData {
  milestone_id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  current_progress: number;
  position: number;
}

type TaskInputs = {
  title: string;
  priority: TaskPriority;
  description: string;
};

export default function CreateTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    milestoneId?: string;
    milestoneTitle?: string;
    deadlineTitle?: string;
  }>();

  const parentContext = {
    milestoneId: params.milestoneId || 'm123-ui-design',
    milestoneTitle: params.milestoneTitle || '1. UI/UX Design System',
    deadlineTitle: params.deadlineTitle || 'Mobile Final Project',
  };

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TaskInputs>({
    defaultValues: {
      title: '',
      priority: 'MEDIUM',
      description: '',
    },
  });

  const watchTitle = watch('title');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
  };

  const onSubmit = (data: TaskInputs) => {
    const newTask: TaskFormData = {
      milestone_id: parentContext.milestoneId,
      title: data.title.trim(),
      description: data.description.trim(),
      priority: data.priority,
      status: 'NOT_STARTED',
      current_progress: 0,
      position: 1,
    };

    console.log('Creating Task Payload:', newTask);

    Alert.alert('Success', 'New task added to milestone successfully!', [
      { text: 'OK', onPress: () => handleBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleBack}>
            <MaterialIcons name="close" size={24} color="#0058BE" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Task</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.parentCard}>
            <View style={styles.parentBadge}>
              <MaterialIcons name="flag" size={16} color="#0058BE" />
              <Text style={styles.parentBadgeText}>MILESTONE</Text>
            </View>
            <Text style={styles.parentTitle}>{parentContext.milestoneTitle}</Text>
            <Text style={styles.parentSubtext}>Belongs to project: {parentContext.deadlineTitle}</Text>
          </View>

          <View style={styles.formSection}>
            {/* Task Title Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>
                  Task Title <Text style={styles.required}>*</Text>
                </Text>
                <Text style={styles.charCount}>{(watchTitle || '').length}/150</Text>
              </View>
              <Controller
                control={control}
                name="title"
                rules={{
                  required: 'Task title cannot be empty',
                  maxLength: { value: 150, message: 'Task title must not exceed 150 characters' },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.title && styles.inputError]}
                    placeholder="Enter task title (e.g., Design Login screen...)"
                    placeholderTextColor="#A0A5B1"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    maxLength={150}
                  />
                )}
              />
              {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
            </View>

            {/* Priority Chip Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Priority Level</Text>
              <Controller
                control={control}
                name="priority"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.priorityRow}>
                    <TouchableOpacity
                      style={[styles.priorityChip, value === 'LOW' && styles.priorityLowActive]}
                      onPress={() => onChange('LOW')}
                    >
                      <MaterialIcons name="arrow-downward" size={16} color={value === 'LOW' ? '#2E7D32' : '#727785'} />
                      <Text style={[styles.priorityText, value === 'LOW' && styles.priorityLowText]}>Low</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.priorityChip, value === 'MEDIUM' && styles.priorityMediumActive]}
                      onPress={() => onChange('MEDIUM')}
                    >
                      <MaterialIcons name="remove" size={16} color={value === 'MEDIUM' ? '#E65100' : '#727785'} />
                      <Text style={[styles.priorityText, value === 'MEDIUM' && styles.priorityMediumText]}>Medium</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.priorityChip, value === 'HIGH' && styles.priorityHighActive]}
                      onPress={() => onChange('HIGH')}
                    >
                      <MaterialIcons name="arrow-upward" size={16} color={value === 'HIGH' ? '#BA1A1A' : '#727785'} />
                      <Text style={[styles.priorityText, value === 'HIGH' && styles.priorityHighText]}>High</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Add detailed description of steps to perform..."
                    placeholderTextColor="#A0A5B1"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                )}
              />
            </View>

            <View style={styles.ruleCard}>
              <MaterialIcons name="timer" size={20} color="#0058BE" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.ruleTitle}>Progress Update Mechanism</Text>
                <Text style={styles.ruleText}>
                  New task will start with progress <Text style={styles.boldText}>0% (NOT_STARTED)</Text>.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitBtn} activeOpacity={0.8} onPress={handleSubmit(onSubmit)}>
            <MaterialIcons name="check" size={20} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>Create Task</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, backgroundColor: '#F9F9F9' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: typography.sizes.lg, fontWeight: 'bold', color: '#0058BE' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  parentCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginTop: 8, marginBottom: 20, borderWidth: 1, borderColor: '#E2E2E2' },
  parentBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  parentBadgeText: { fontSize: typography.sizes.xs, fontWeight: 'bold', color: '#0058BE', letterSpacing: 0.5 },
  parentTitle: { fontSize: typography.sizes.base, fontWeight: 'bold', color: '#1A1C1C' },
  parentSubtext: { fontSize: typography.sizes.xs, color: '#424754', marginTop: 4 },
  formSection: { gap: 20 },
  inputGroup: { gap: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: typography.sizes.sm, fontWeight: '600', color: '#1A1C1C' },
  required: { color: '#BA1A1A' },
  charCount: { fontSize: typography.sizes.xs, color: '#727785' },
  input: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#C2C6D6', paddingHorizontal: 16, paddingVertical: 14, fontSize: typography.sizes.base, color: '#1A1C1C' },
  inputError: { borderColor: '#BA1A1A' },
  textArea: { minHeight: 110 },
  errorText: { fontSize: typography.sizes.xs, color: '#BA1A1A', marginTop: 2 },
  priorityRow: { flexDirection: 'row', gap: 10 },
  priorityChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#C2C6D6' },
  priorityText: { fontSize: typography.sizes.sm, fontWeight: '600', color: '#424754' },
  priorityLowActive: { backgroundColor: '#E8F5E9', borderColor: '#2E7D32' },
  priorityLowText: { color: '#2E7D32' },
  priorityMediumActive: { backgroundColor: '#FFF3E0', borderColor: '#E65100' },
  priorityMediumText: { color: '#E65100' },
  priorityHighActive: { backgroundColor: '#FFDAD6', borderColor: '#BA1A1A' },
  priorityHighText: { color: '#BA1A1A' },
  ruleCard: { backgroundColor: '#D8E2FF', borderRadius: 16, padding: 16, flexDirection: 'row', gap: 12, marginTop: 8 },
  ruleTitle: { fontSize: typography.sizes.sm, fontWeight: 'bold', color: '#001A42', marginBottom: 2 },
  ruleText: { fontSize: typography.sizes.xs, color: '#004395', lineHeight: 18 },
  boldText: { fontWeight: 'bold' },
  footer: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#F9F9F9', borderTopWidth: 1, borderTopColor: '#EEEEEE' },
  submitBtn: { height: 52, backgroundColor: '#0058BE', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitBtnText: { color: '#FFFFFF', fontSize: typography.sizes.base, fontWeight: 'bold' },
});