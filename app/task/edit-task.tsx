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
export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface EditTaskFormData {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  current_progress: number;
}

type TaskEditInputs = {
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  currentProgress: number;
  description: string;
};

export default function EditTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    taskId?: string;
    title?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    progress?: string;
    description?: string;
  }>();

  const initialData = {
    id: params.taskId || 't101',
    title: params.title || 'Design Dashboard Screen',
    priority: (params.priority as TaskPriority) || 'HIGH',
    status: (params.status as TaskStatus) || 'IN_PROGRESS',
    currentProgress: params.progress ? parseInt(params.progress, 10) : 40,
    description: params.description || 'Draft wireframe and UI components for the main Dashboard page.',
  };

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskEditInputs>({
    defaultValues: {
      title: initialData.title,
      priority: initialData.priority,
      status: initialData.status,
      currentProgress: initialData.currentProgress,
      description: initialData.description,
    },
  });

  const watchTitle = watch('title');
  const currentProgress = watch('currentProgress');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
  };

  const handleProgressQuickSet = (percent: number) => {
    setValue('currentProgress', percent);
    if (percent === 100) setValue('status', 'COMPLETED');
    else if (percent > 0 && percent < 100) setValue('status', 'IN_PROGRESS');
    else if (percent === 0) setValue('status', 'NOT_STARTED');
  };

  const onSubmit = (data: TaskEditInputs) => {
    const updatedTask: EditTaskFormData = {
      id: initialData.id,
      title: data.title.trim(),
      description: data.description.trim(),
      priority: data.priority,
      status: data.status,
      current_progress: Number(data.currentProgress),
    };

    console.log('Updated Task Payload:', updatedTask);

    Alert.alert('Success', 'Task updated successfully!', [
      { text: 'OK', onPress: () => handleBack() },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          console.log('Deleted Task ID:', initialData.id);
          handleBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleBack}>
            <MaterialIcons name="arrow-back" size={24} color="#0058BE" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Task</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={handleDelete}>
            <MaterialIcons name="delete-outline" size={24} color="#BA1A1A" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.formSection}>
            {/* Task Title */}
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
                    placeholder="Enter task title..."
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

            {/* Progress Quick Control */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Progress (%)</Text>
                <Text style={styles.progressPercentText}>{currentProgress}%</Text>
              </View>
              <View style={styles.quickProgressRow}>
                {[0, 25, 50, 75, 100].map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[styles.progressChip, currentProgress === val && styles.progressChipActive]}
                    onPress={() => handleProgressQuickSet(val)}
                  >
                    <Text style={[styles.progressChipText, currentProgress === val && styles.progressChipTextActive]}>
                      {val}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Priority Selector */}
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

            {/* Status Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              <Controller
                control={control}
                name="status"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.statusGrid}>
                    {(
                      [
                        { key: 'NOT_STARTED', label: 'Not Started', icon: 'radio-button-unchecked', color: '#727785' },
                        { key: 'IN_PROGRESS', label: 'In Progress', icon: 'hourglass-top', color: '#0058BE' },
                        { key: 'COMPLETED', label: 'Completed', icon: 'check-circle-outline', color: '#2E7D32' },
                        { key: 'CANCELLED', label: 'Cancelled', icon: 'cancel', color: '#BA1A1A' },
                      ] as const
                    ).map((st) => (
                      <TouchableOpacity
                        key={st.key}
                        style={[
                          styles.statusChip,
                          value === st.key && { borderColor: st.color, backgroundColor: `${st.color}10` },
                        ]}
                        onPress={() => onChange(st.key)}
                      >
                        <MaterialIcons name={st.icon} size={18} color={value === st.key ? st.color : '#727785'} />
                        <Text style={[styles.statusText, value === st.key && { color: st.color, fontWeight: 'bold' }]}>
                          {st.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Task description..."
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
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitBtn} activeOpacity={0.8} onPress={handleSubmit(onSubmit)}>
            <MaterialIcons name="save" size={20} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>Save Changes</Text>
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
  headerTitle: { fontSize: typography.sizes.lg, fontWeight: 'bold', color: '#1A1C1C' },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 16 },
  formSection: { gap: 20 },
  inputGroup: { gap: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: typography.sizes.sm, fontWeight: '600', color: '#1A1C1C' },
  required: { color: '#BA1A1A' },
  charCount: { fontSize: typography.sizes.xs, color: '#727785' },
  progressPercentText: { fontSize: typography.sizes.sm, fontWeight: 'bold', color: '#0058BE' },
  input: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#C2C6D6', paddingHorizontal: 16, paddingVertical: 14, fontSize: typography.sizes.base, color: '#1A1C1C' },
  inputError: { borderColor: '#BA1A1A' },
  textArea: { minHeight: 110 },
  errorText: { fontSize: typography.sizes.xs, color: '#BA1A1A', marginTop: 2 },
  quickProgressRow: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  progressChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#C2C6D6' },
  progressChipActive: { backgroundColor: '#D8E2FF', borderColor: '#0058BE' },
  progressChipText: { fontSize: typography.sizes.xs, fontWeight: '600', color: '#424754' },
  progressChipTextActive: { color: '#0058BE' },
  priorityRow: { flexDirection: 'row', gap: 10 },
  priorityChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#C2C6D6' },
  priorityText: { fontSize: typography.sizes.sm, fontWeight: '600', color: '#424754' },
  priorityLowActive: { backgroundColor: '#E8F5E9', borderColor: '#2E7D32' },
  priorityLowText: { color: '#2E7D32' },
  priorityMediumActive: { backgroundColor: '#FFF3E0', borderColor: '#E65100' },
  priorityMediumText: { color: '#E65100' },
  priorityHighActive: { backgroundColor: '#FFDAD6', borderColor: '#BA1A1A' },
  priorityHighText: { color: '#BA1A1A' },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusChip: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#C2C6D6' },
  statusText: { fontSize: typography.sizes.xs, color: '#424754', fontWeight: '500' },
  footer: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#F9F9F9', borderTopWidth: 1, borderTopColor: '#EEEEEE' },
  submitBtn: { height: 52, backgroundColor: '#0058BE', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitBtnText: { color: '#FFFFFF', fontSize: typography.sizes.base, fontWeight: 'bold' },
});