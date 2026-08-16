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

export interface MilestoneFormData {
  deadline_id: string;
  title: string;
  description: string;
  target_at: Date;
  position: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  progress: number;
}

type MilestoneInputs = {
  title: string;
  targetDateInput: string;
  description: string;
  selectedPreset: '7days' | '14days' | 'due' | 'custom';
};

export default function CreateMilestoneScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ deadlineId?: string; deadlineTitle?: string; deadlineDueAt?: string }>();

  const parentDeadline = {
    id: params.deadlineId || 'd123-mobile-project',
    title: params.deadlineTitle || 'Mobile Final Project',
    dueAt: params.deadlineDueAt ? new Date(params.deadlineDueAt) : new Date(2026, 11, 15),
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
    const date = new Date(year, month, day);
    return isNaN(date.getTime()) ? null : date;
  };

  const defaultTargetDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MilestoneInputs>({
    defaultValues: {
      title: '',
      targetDateInput: formatDateString(defaultTargetDate),
      description: '',
      selectedPreset: '7days',
    },
  });

  const watchTitle = watch('title');
  const selectedPreset = watch('selectedPreset');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
  };

  const handleSelectPreset = (type: '7days' | '14days' | 'due') => {
    let newDate = new Date();
    if (type === '7days') {
      newDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else if (type === '14days') {
      newDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    } else if (type === 'due') {
      newDate = new Date(parentDeadline.dueAt);
    }

    if (newDate > parentDeadline.dueAt) {
      newDate = new Date(parentDeadline.dueAt);
    }

    setValue('selectedPreset', type);
    setValue('targetDateInput', formatDateString(newDate), { shouldValidate: true });
  };

  const onSubmit = (data: MilestoneInputs) => {
    const parsedDate = parseDateString(data.targetDateInput);
    if (!parsedDate) return;

    const newMilestone: MilestoneFormData = {
      deadline_id: parentDeadline.id,
      title: data.title.trim(),
      description: data.description.trim(),
      target_at: parsedDate,
      position: 1,
      status: 'NOT_STARTED',
      progress: 0,
    };

    console.log('Creating Milestone Payload:', newMilestone);

    Alert.alert('Success', 'New milestone created successfully!', [
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
          <Text style={styles.headerTitle}>Add Milestone</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.parentCard}>
            <View style={styles.parentBadge}>
              <MaterialIcons name="folder" size={16} color="#0058BE" />
              <Text style={styles.parentBadgeText}>DEADLINE / PROJECT</Text>
            </View>
            <Text style={styles.parentTitle}>{parentDeadline.title}</Text>
            <Text style={styles.parentSubtext}>Project Deadline: {formatDateString(parentDeadline.dueAt)}</Text>
          </View>

          <View style={styles.formSection}>
            {/* Title Field */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>
                  Milestone Title <Text style={styles.required}>*</Text>
                </Text>
                <Text style={styles.charCount}>{(watchTitle || '').length}/150</Text>
              </View>
              <Controller
                control={control}
                name="title"
                rules={{
                  required: 'Milestone title cannot be empty',
                  maxLength: { value: 150, message: 'Milestone title must not exceed 150 characters' },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.title && styles.inputError]}
                    placeholder="Enter milestone title (e.g., UI Design, Backend API...)"
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

            {/* Target Date Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Target Date <Text style={styles.required}>*</Text>
              </Text>

              <View style={styles.presetContainer}>
                {(['7days', '14days', 'due'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.chip, selectedPreset === type && styles.chipActive]}
                    onPress={() => handleSelectPreset(type)}
                  >
                    <Text style={[styles.chipText, selectedPreset === type && styles.chipTextActive]}>
                      {type === '7days' ? '+1 Week' : type === '14days' ? '+2 Weeks' : 'Same as Due Date'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Controller
                control={control}
                name="targetDateInput"
                rules={{
                  validate: (val) => {
                    const parsed = parseDateString(val);
                    if (!parsed) return 'Invalid date (Format: DD/MM/YYYY)';
                    if (parsed > parentDeadline.dueAt) {
                      return `Date must be on or before project deadline (${formatDateString(parentDeadline.dueAt)})`;
                    }
                    return true;
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[styles.dateInputWrapper, errors.targetDateInput && styles.inputError]}>
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
              {errors.targetDateInput && <Text style={styles.errorText}>{errors.targetDateInput.message}</Text>}
              <Text style={styles.hintText}>
                * Ensure target date is on or before project deadline ({formatDateString(parentDeadline.dueAt)}).
              </Text>
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
                    placeholder="Describe specific goals or scope of work..."
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
              <MaterialIcons name="info-outline" size={20} color="#0058BE" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.ruleTitle}>Automatic Progress Calculation</Text>
                <Text style={styles.ruleText}>
                  New milestone will initialize with <Text style={styles.boldText}>NOT_STARTED (0%)</Text> status.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitBtn} activeOpacity={0.8} onPress={handleSubmit(onSubmit)}>
            <MaterialIcons name="check" size={20} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>Create Milestone</Text>
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
  hintText: { fontSize: typography.sizes.xs, color: '#727785', marginTop: 2 },
  presetContainer: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#EAEFEF', borderWidth: 1, borderColor: 'transparent' },
  chipActive: { backgroundColor: '#D8E2FF', borderColor: '#0058BE' },
  chipText: { fontSize: typography.sizes.xs, fontWeight: '600', color: '#424754' },
  chipTextActive: { color: '#0058BE' },
  dateInputWrapper: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#C2C6D6', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10, height: 52 },
  dateInput: { flex: 1, fontSize: typography.sizes.base, fontWeight: '600', color: '#1A1C1C' },
  ruleCard: { backgroundColor: '#D8E2FF', borderRadius: 16, padding: 16, flexDirection: 'row', gap: 12, marginTop: 8 },
  ruleTitle: { fontSize: typography.sizes.sm, fontWeight: 'bold', color: '#001A42', marginBottom: 2 },
  ruleText: { fontSize: typography.sizes.xs, color: '#004395', lineHeight: 18 },
  boldText: { fontWeight: 'bold' },
  footer: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#F9F9F9', borderTopWidth: 1, borderTopColor: '#EEEEEE' },
  submitBtn: { height: 52, backgroundColor: '#0058BE', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitBtnText: { color: '#FFFFFF', fontSize: typography.sizes.base, fontWeight: 'bold' },
});