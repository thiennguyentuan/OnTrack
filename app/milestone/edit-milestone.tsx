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

export type MilestoneStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';

export interface EditMilestoneFormData {
  id: string;
  title: string;
  description: string;
  target_at: Date;
  status: MilestoneStatus;
}

type MilestoneEditInputs = {
  title: string;
  targetDateInput: string;
  description: string;
  status: MilestoneStatus;
};

export default function EditMilestoneScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    milestoneId?: string;
    title?: string;
    targetAt?: string;
    description?: string;
    status?: MilestoneStatus;
    deadlineDueAt?: string;
  }>();

  const initialData = {
    id: params.milestoneId || 'm123-ui-design',
    title: params.title || '1. UI/UX Design System',
    targetAt: params.targetAt ? new Date(params.targetAt) : new Date(2026, 10, 20),
    description: params.description || 'Complete Wireframe and Design System on Figma.',
    status: (params.status as MilestoneStatus) || 'IN_PROGRESS',
    deadlineDueAt: params.deadlineDueAt ? new Date(params.deadlineDueAt) : new Date(2026, 11, 15),
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

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<MilestoneEditInputs>({
    defaultValues: {
      title: initialData.title,
      targetDateInput: formatDateString(initialData.targetAt),
      description: initialData.description,
      status: initialData.status,
    },
  });

  const watchTitle = watch('title');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
  };

  const onSubmit = (data: MilestoneEditInputs) => {
    const parsedDate = parseDateString(data.targetDateInput);
    if (!parsedDate) return;

    const updatedMilestone: EditMilestoneFormData = {
      id: initialData.id,
      title: data.title.trim(),
      description: data.description.trim(),
      target_at: parsedDate,
      status: data.status,
    };

    console.log('Updated Milestone Payload:', updatedMilestone);

    Alert.alert('Success', 'Milestone updated successfully!', [
      { text: 'OK', onPress: () => handleBack() },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this milestone?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          console.log('Deleted Milestone ID:', initialData.id);
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
          <Text style={styles.headerTitle}>Edit Milestone</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={handleDelete}>
            <MaterialIcons name="delete-outline" size={24} color="#BA1A1A" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.formSection}>
            {/* Title */}
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
                    placeholder="Enter milestone title..."
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

            {/* Target Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Target Date <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="targetDateInput"
                rules={{
                  validate: (val) => {
                    const parsed = parseDateString(val);
                    if (!parsed) return 'Invalid date (Format: DD/MM/YYYY)';
                    if (parsed > initialData.deadlineDueAt) {
                      return `Date must be before overall deadline (${formatDateString(initialData.deadlineDueAt)})`;
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
                      onChangeText={onChange}
                      keyboardType="numeric"
                      maxLength={10}
                    />
                  </View>
                )}
              />
              {errors.targetDateInput && <Text style={styles.errorText}>{errors.targetDateInput.message}</Text>}
            </View>

            {/* Status Selection */}
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
                        { key: 'OVERDUE', label: 'Overdue', icon: 'warning', color: '#BA1A1A' },
                      ] as const
                    ).map((statusItem) => (
                      <TouchableOpacity
                        key={statusItem.key}
                        style={[
                          styles.statusChip,
                          value === statusItem.key && { borderColor: statusItem.color, backgroundColor: `${statusItem.color}10` },
                        ]}
                        onPress={() => onChange(statusItem.key)}
                      >
                        <MaterialIcons
                          name={statusItem.icon}
                          size={18}
                          color={value === statusItem.key ? statusItem.color : '#727785'}
                        />
                        <Text style={[styles.statusText, value === statusItem.key && { color: statusItem.color, fontWeight: 'bold' }]}>
                          {statusItem.label}
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
                    placeholder="Detailed description of the milestone..."
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
  input: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#C2C6D6', paddingHorizontal: 16, paddingVertical: 14, fontSize: typography.sizes.base, color: '#1A1C1C' },
  inputError: { borderColor: '#BA1A1A' },
  textArea: { minHeight: 110 },
  errorText: { fontSize: typography.sizes.xs, color: '#BA1A1A', marginTop: 2 },
  dateInputWrapper: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#C2C6D6', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10, height: 52 },
  dateInput: { flex: 1, fontSize: typography.sizes.base, fontWeight: '600', color: '#1A1C1C' },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusChip: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#C2C6D6' },
  statusText: { fontSize: typography.sizes.xs, color: '#424754', fontWeight: '500' },
  footer: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#F9F9F9', borderTopWidth: 1, borderTopColor: '#EEEEEE' },
  submitBtn: { height: 52, backgroundColor: '#0058BE', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitBtnText: { color: '#FFFFFF', fontSize: typography.sizes.base, fontWeight: 'bold' },
});