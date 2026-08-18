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
import { colors } from '@/theme/colors';

export type DeadlinePriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type DeadlineStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';

export interface EditDeadlineFormData {
  id: string;
  title: string;
  description: string;
  due_at: Date;
  priority: DeadlinePriority;
  status: DeadlineStatus;
}

type DeadlineEditInputs = {
  title: string;
  dueDateInput: string;
  description: string;
  priority: DeadlinePriority;
  status: DeadlineStatus;
  selectedPreset: '7days' | '14days' | '30days' | 'custom';
};

export default function EditDeadlineScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    deadlineId?: string;
    title?: string;
    dueAt?: string;
    description?: string;
    priority?: DeadlinePriority;
    status?: DeadlineStatus;
  }>();

  const initialData = {
    id: params.deadlineId || 'dl1',
    title: params.title || 'Mobile Final Project',
    dueAt: params.dueAt ? new Date(params.dueAt) : new Date(2026, 11, 15),
    description: params.description || 'Final capstone mobile application project with high focus and milestone checkpoints.',
    priority: (params.priority as DeadlinePriority) || 'HIGH',
    status: (params.status as DeadlineStatus) || 'IN_PROGRESS',
  };

  const formatDateString = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDateString = (str: string): Date | null => {
    const parts = str.split('/');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    const date = new Date(year, month, day, 23, 59, 59);
    return isNaN(date.getTime()) ? null : date;
  };

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DeadlineEditInputs>({
    defaultValues: {
      title: initialData.title,
      dueDateInput: formatDateString(initialData.dueAt),
      description: initialData.description,
      priority: initialData.priority,
      status: initialData.status,
      selectedPreset: 'custom',
    },
  });

  const watchTitle = watch('title');
  const selectedPreset = watch('selectedPreset');
  const selectedPriority = watch('priority');
  const selectedStatus = watch('status');

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate('/(tabs)/plans' as any);
    }
  };

  const handleSelectPreset = (type: '7days' | '14days' | '30days') => {
    let daysToAdd = 7;
    if (type === '14days') daysToAdd = 14;
    if (type === '30days') daysToAdd = 30;

    const newDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);
    setValue('selectedPreset', type);
    setValue('dueDateInput', formatDateString(newDate), { shouldValidate: true });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Deadline',
      'Are you sure you want to delete this deadline and all associated milestones?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Deleted', 'Deadline deleted successfully.', [
              { text: 'OK', onPress: () => router.navigate('/(tabs)/plans' as any) },
            ]);
          },
        },
      ]
    );
  };

  const onSubmit = (data: DeadlineEditInputs) => {
    const parsedDate = parseDateString(data.dueDateInput);
    if (!parsedDate) return;

    const payload: EditDeadlineFormData = {
      id: initialData.id,
      title: data.title.trim(),
      description: data.description.trim(),
      due_at: parsedDate,
      priority: data.priority,
      status: data.status,
    };

    console.log('Update Deadline Payload:', payload);

    Alert.alert('Success', 'Deadline updated successfully!', [
      { text: 'OK', onPress: () => handleBack() },
    ]);
  };

  const statusOptions: { key: DeadlineStatus; label: string; color: string; bg: string }[] = [
    { key: 'NOT_STARTED', label: 'Not Started', color: '#64748B', bg: '#F1F5F9' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: '#0058BE', bg: '#D8E2FF' },
    { key: 'COMPLETED', label: 'Completed', color: '#007165', bg: '#CCE8E4' },
    { key: 'OVERDUE', label: 'Overdue', color: '#BA1A1A', bg: '#FFDAD6' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleBack}>
            <MaterialIcons name="arrow-back" size={24} color="#0058BE" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Deadline</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={handleDelete}>
            <MaterialIcons name="delete-outline" size={24} color="#BA1A1A" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formSection}>
            {/* Title Field */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>
                  Deadline Title <Text style={styles.required}>*</Text>
                </Text>
                <Text style={styles.charCount}>{(watchTitle || '').length}/150</Text>
              </View>
              <Controller
                control={control}
                name="title"
                rules={{
                  required: 'Deadline title cannot be empty',
                  maxLength: { value: 150, message: 'Title must not exceed 150 characters' },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.title && styles.inputError]}
                    placeholder="Enter deadline title..."
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

            {/* Status Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.statusGrid}>
                {statusOptions.map((opt) => {
                  const isSelected = selectedStatus === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[
                        styles.statusCard,
                        isSelected && { borderColor: opt.color, backgroundColor: opt.bg },
                      ]}
                      onPress={() => setValue('status', opt.key)}
                    >
                      <Text
                        style={[
                          styles.statusCardText,
                          isSelected && { color: opt.color, fontWeight: 'bold' },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Due Date Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Due Date <Text style={styles.required}>*</Text>
              </Text>

              {/* Presets */}
              <View style={styles.presetContainer}>
                {(['7days', '14days', '30days'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.chip, selectedPreset === type && styles.chipActive]}
                    onPress={() => handleSelectPreset(type)}
                  >
                    <Text style={[styles.chipText, selectedPreset === type && styles.chipTextActive]}>
                      {type === '7days' ? '+1 Week' : type === '14days' ? '+2 Weeks' : '+1 Month'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Controller
                control={control}
                name="dueDateInput"
                rules={{
                  validate: (val) => {
                    const parsed = parseDateString(val);
                    if (!parsed) return 'Invalid date (Format: DD/MM/YYYY)';
                    return true;
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={[
                      styles.dateInputWrapper,
                      errors.dueDateInput && styles.inputError,
                    ]}
                  >
                    <MaterialIcons name="event" size={20} color="#0058BE" />
                    <TextInput
                      style={styles.dateInput}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor="#A0A5B1"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={(text) => {
                        setValue('selectedPreset', 'custom');
                        onChange(text);
                      }}
                      keyboardType="numeric"
                      maxLength={10}
                    />
                  </View>
                )}
              />
              {errors.dueDateInput && (
                <Text style={styles.errorText}>{errors.dueDateInput.message}</Text>
              )}
            </View>

            {/* Priority Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityContainer}>
                {(
                  [
                    { key: 'HIGH', label: 'High', color: '#BA1A1A', bg: '#FFDAD6', icon: 'priority-high' },
                    { key: 'MEDIUM', label: 'Medium', color: '#F59E0B', bg: '#FEF3C7', icon: 'remove' },
                    { key: 'LOW', label: 'Low', color: '#18A66A', bg: '#D1FAE5', icon: 'arrow-downward' },
                  ] as const
                ).map((item) => {
                  const isSelected = selectedPriority === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.priorityOption,
                        isSelected && { borderColor: item.color, backgroundColor: item.bg },
                      ]}
                      onPress={() => setValue('priority', item.key)}
                    >
                      <MaterialIcons
                        name={item.icon as any}
                        size={18}
                        color={isSelected ? item.color : '#727785'}
                      />
                      <Text
                        style={[
                          styles.priorityText,
                          isSelected && { color: item.color, fontWeight: 'bold' },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Description Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe scope, objectives or notes..."
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

        {/* Footer CTA */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.85}
            onPress={handleSubmit(onSubmit)}
          >
            <MaterialIcons name="check" size={20} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#F9F9F9',
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
    paddingTop: 12,
    paddingBottom: 24,
  },
  formSection: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: '#1A1C1C',
  },
  required: {
    color: '#BA1A1A',
  },
  charCount: {
    fontSize: typography.sizes.xs,
    color: '#727785',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C2C6D6',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: typography.sizes.base,
    color: '#1A1C1C',
  },
  inputError: {
    borderColor: '#BA1A1A',
  },
  textArea: {
    minHeight: 100,
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: '#BA1A1A',
    marginTop: 2,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  statusCardText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: '#475569',
  },
  presetContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EAEFEF',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: '#D8E2FF',
    borderColor: '#0058BE',
  },
  chipText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: '#424754',
  },
  chipTextActive: {
    color: '#0058BE',
  },
  dateInputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C2C6D6',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
  },
  dateInput: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: '#1A1C1C',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E2E2',
  },
  priorityText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: '#424754',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F9F9F9',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  submitBtn: {
    height: 52,
    backgroundColor: '#0058BE',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.base,
    fontWeight: 'bold',
  },
});
