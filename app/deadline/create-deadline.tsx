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
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { typography } from '@/theme/typography';
import { colors } from '@/theme/colors';

export interface DeadlineFormData {
  title: string;
  description: string;
  due_at: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  progress: number;
}

type DeadlineInputs = {
  title: string;
  dueDateInput: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  selectedPreset: '7days' | '14days' | '30days' | 'custom';
};

export default function CreateDeadlineScreen() {
  const router = useRouter();

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

  // Default: +14 days from now
  const defaultDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DeadlineInputs>({
    defaultValues: {
      title: '',
      dueDateInput: formatDateString(defaultDueDate),
      description: '',
      priority: 'HIGH',
      selectedPreset: '14days',
    },
  });

  const watchTitle = watch('title');
  const selectedPreset = watch('selectedPreset');
  const selectedPriority = watch('priority');

  const handleBack = () => {
    router.navigate('/(tabs)/plans' as any);
  };

  const handleSelectPreset = (type: '7days' | '14days' | '30days') => {
    let daysToAdd = 7;
    if (type === '14days') daysToAdd = 14;
    if (type === '30days') daysToAdd = 30;

    const newDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);
    setValue('selectedPreset', type);
    setValue('dueDateInput', formatDateString(newDate), { shouldValidate: true });
  };

  const onSubmit = (data: DeadlineInputs) => {
    const parsedDate = parseDateString(data.dueDateInput);
    if (!parsedDate) return;

    const newDeadline: DeadlineFormData = {
      title: data.title.trim(),
      description: data.description.trim(),
      due_at: parsedDate,
      priority: data.priority,
      status: 'NOT_STARTED',
      progress: 0,
    };

    console.log('Creating Deadline Payload:', newDeadline);

    Alert.alert('Thành công', 'Đã tạo Deadline mới thành công!', [
      { text: 'OK', onPress: () => handleBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleBack}>
            <MaterialIcons name="close" size={24} color="#0058BE" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Deadline</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Intro Card */}
          <View style={styles.bannerCard}>
            <View style={styles.bannerIconWrapper}>
              <MaterialIcons name="flag" size={22} color="#0058BE" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Set a Goal or Milestone Target</Text>
              <Text style={styles.bannerSubtext}>
                Break down your major commitments into milestones and trackable tasks.
              </Text>
            </View>
          </View>

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
                  maxLength: {
                    value: 150,
                    message: 'Deadline title must not exceed 150 characters',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.title && styles.inputError]}
                    placeholder="Enter deadline title (e.g., HCI Final Project...)"
                    placeholderTextColor="#A0A5B1"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    maxLength={150}
                  />
                )}
              />
              {errors.title && (
                <Text style={styles.errorText}>{errors.title.message}</Text>
              )}
            </View>

            {/* Due Date Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Due Date <Text style={styles.required}>*</Text>
              </Text>

              {/* Preset Quick Chips */}
              <View style={styles.presetContainer}>
                {(['7days', '14days', '30days'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.chip,
                      selectedPreset === type && styles.chipActive,
                    ]}
                    onPress={() => handleSelectPreset(type)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedPreset === type && styles.chipTextActive,
                      ]}
                    >
                      {type === '7days'
                        ? '+1 Week'
                        : type === '14days'
                        ? '+2 Weeks'
                        : '+1 Month'}
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
                    if (!parsed) return 'Invalid date format (DD/MM/YYYY)';
                    const startOfToday = new Date();
                    startOfToday.setHours(0, 0, 0, 0);
                    if (parsed < startOfToday) {
                      return 'Due date cannot be in the past';
                    }
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
              <Text style={styles.label}>Description (Optional)</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe overall objectives, requirements or resources..."
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

            {/* Helpful info box */}
            <View style={styles.ruleCard}>
              <MaterialIcons
                name="lightbulb-outline"
                size={20}
                color="#0058BE"
                style={{ marginTop: 2 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.ruleTitle}>Pro-tip for Deadlines</Text>
                <Text style={styles.ruleText}>
                  After adding a deadline, you can break it into smaller <Text style={styles.boldText}>Milestones</Text> and focus sessions to keep your momentum.
                </Text>
              </View>
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
            <Text style={styles.submitBtnText}>Create Deadline</Text>
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
    paddingBottom: 24,
  },
  bannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bannerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#D8E2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: typography.sizes.base,
    fontWeight: 'bold',
    color: '#1A1C1C',
  },
  bannerSubtext: {
    fontSize: typography.sizes.xs,
    color: '#424754',
    marginTop: 2,
    lineHeight: 16,
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
  ruleCard: {
    backgroundColor: '#D8E2FF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  ruleTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: 'bold',
    color: '#001A42',
    marginBottom: 2,
  },
  ruleText: {
    fontSize: typography.sizes.xs,
    color: '#004395',
    lineHeight: 18,
  },
  boldText: {
    fontWeight: 'bold',
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
