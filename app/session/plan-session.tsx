import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form Validation Schema
const planSessionSchema = z.object({
  linkedTask: z.string().min(1, 'Task title is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  duration: z
    .number({ error: 'Duration must be a number' })
    .min(15, 'Minimum 15 mins')
    .max(480, 'Maximum 8 hours'),
  focusMode: z.enum(['normal', 'high']),
});

type PlanSessionFormValues = z.infer<typeof planSessionSchema>;

export default function PlanSessionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlanSessionFormValues>({
    resolver: zodResolver(planSessionSchema),
    defaultValues: {
      linkedTask: 'Design Dashboard',
      date: 'Today',
      time: '2:30 PM',
      duration: 45,
      focusMode: 'normal',
    },
  });

  const currentDuration = watch('duration');
  const currentFocusMode = watch('focusMode');

  // Handle counter adjustments
  const handleIncreaseDuration = () => {
    setValue('duration', currentDuration + 15, { shouldValidate: true });
  };

  const handleDecreaseDuration = () => {
    setValue('duration', Math.max(15, currentDuration - 15), { shouldValidate: true });
  };

  // Submit Handler
  const onSubmit = (data: PlanSessionFormValues) => {
    if (submitStatus !== 'idle') return;
    setSubmitStatus('loading');

    // Simulated API Call
    setTimeout(() => {
      console.log('Submitted Session Data:', data);
      setSubmitStatus('success');
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 2000);
    }, 1200);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleBack}>
            <MaterialIcons name="arrow-back" size={24} color="#1A1C1C" />
          </TouchableOpacity>
          <Text style={styles.brandTitle}>OnTrack</Text>
        </View>

        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCF37fy1RB1RpYNIXPTMvFGrVw2OhvoBEBhhB0oj0QMK8nWn2Qe4zOV26PGDBIBSS1NlL2dWYod-N81W47Fnnc_OaXu2Da5-b8qfdbcbcKUkBY1m0COOL1EW019D0YabWFWmFsyO7ZNmhCcB9eLd9jIfxI_JNlh-f8GKtykcbw4Q3eYIeAt7A7gSb_UZtF4_tVSczriJeE_zn81haYd2RvNd7EPNGo6SCbHnsv1wf_cp7eyRG8ZKDKMNA',
            }}
            style={styles.avatar}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 40 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Header */}
        <View style={styles.titleSection}>
          <Text style={styles.headline}>Plan Session</Text>
          <Text style={styles.subhead}>Organize your flow for the task ahead.</Text>
        </View>

        {/* Current Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>CURRENT PROGRESS</Text>
            <Text style={styles.progressValue}>40%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '40%' }]} />
          </View>
        </View>

        {/* Form Controls */}
        <View style={styles.form}>
          {/* Linked Task */}
          <Controller
            control={control}
            name="linkedTask"
            render={({ field: { value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>LINKED TASK</Text>
                <View style={[styles.inputContainer, styles.readOnlyInput]}>
                  <MaterialIcons name="assignment" size={22} color="#0058BE" />
                  <TextInput
                    style={[styles.inputText, { color: '#1A1C1C' }]}
                    value={value}
                    editable={false}
                  />
                </View>
              </View>
            )}
          />

          {/* Date & Time Grid */}
          <View style={styles.gridRow}>
            {/* Date Field */}
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>DATE</Text>
              <Controller
                control={control}
                name="date"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[styles.inputContainer, errors.date && styles.inputError]}>
                    <MaterialIcons name="calendar-today" size={20} color="#424754" />
                    <TextInput
                      style={styles.inputText}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Today"
                      placeholderTextColor="#727785"
                    />
                  </View>
                )}
              />
              {errors.date && <Text style={styles.errorText}>{errors.date.message}</Text>}
            </View>

            {/* Time Field */}
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>TIME</Text>
              <Controller
                control={control}
                name="time"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[styles.inputContainer, errors.time && styles.inputError]}>
                    <MaterialIcons name="schedule" size={20} color="#424754" />
                    <TextInput
                      style={styles.inputText}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="2:30 PM"
                      placeholderTextColor="#727785"
                    />
                  </View>
                )}
              />
              {errors.time && <Text style={styles.errorText}>{errors.time.message}</Text>}
            </View>
          </View>

          {/* Duration Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>DURATION</Text>
            <View style={[styles.inputContainer, styles.durationRow]}>
              <Text style={styles.durationText}>{currentDuration} minutes</Text>
              <View style={styles.durationCounter}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={handleDecreaseDuration}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="remove" size={18} color="#1A1C1C" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={handleIncreaseDuration}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="add" size={18} color="#1A1C1C" />
                </TouchableOpacity>
              </View>
            </View>
            {errors.duration && (
              <Text style={styles.errorText}>{errors.duration.message}</Text>
            )}
          </View>

          {/* Focus Mode Selection */}
          <Controller
            control={control}
            name="focusMode"
            render={({ field: { value, onChange } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>FOCUS MODE</Text>
                <View style={styles.gridRow}>
                  {/* Normal Focus */}
                  <TouchableOpacity
                    style={[
                      styles.focusCard,
                      value === 'normal' && styles.normalFocusActive,
                    ]}
                    onPress={() => onChange('normal')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
                      <MaterialIcons name="verified-user" size={24} color="#3B82F6" />
                    </View>
                    <Text style={styles.focusTitle}>Normal Focus</Text>
                    <Text style={styles.focusCaption}>Standard breaks and tracking</Text>
                  </TouchableOpacity>

                  {/* High Focus */}
                  <TouchableOpacity
                    style={[
                      styles.focusCard,
                      value === 'high' && styles.highFocusActive,
                    ]}
                    onPress={() => onChange('high')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
                      <MaterialIcons name="auto-awesome" size={24} color="#8B5CF6" />
                    </View>
                    <Text style={styles.focusTitle}>High Focus</Text>
                    <Text style={styles.focusCaption}>No notifications, deep work</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          {/* Primary Action Button */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                submitStatus === 'success' && styles.submitButtonSuccess,
              ]}
              onPress={handleSubmit(onSubmit)}
              activeOpacity={0.9}
              disabled={submitStatus !== 'idle'}
            >
              {submitStatus === 'loading' ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.submitButtonText}>Planning...</Text>
                </View>
              ) : submitStatus === 'success' ? (
                <View style={styles.buttonContent}>
                  <MaterialIcons name="check-circle" size={22} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Scheduled!</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Schedule Session</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Decorative Pulsing Timer Icon */}
        <View style={styles.decorativeContainer}>
          <View style={styles.outerPulseCircle}>
            <View style={styles.innerPulseCircle}>
              <MaterialIcons name="timer" size={24} color="#0058BE" />
            </View>
          </View>
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
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0058BE',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#E2E2E2',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },

  scrollContent: {
    paddingHorizontal: 20,
  },

  /* Title */
  titleSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  headline: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1C1C',
  },
  subhead: {
    fontSize: 14,
    color: '#424754',
    marginTop: 4,
  },

  /* Progress Card */
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#424754',
    letterSpacing: 0.5,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0058BE',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0058BE',
    borderRadius: 4,
  },

  /* Form */
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#424754',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },
  inputContainer: {
    height: 52,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    paddingHorizontal: 4,
  },
  readOnlyInput: {
    backgroundColor: '#F1F5F9',
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1C1C',
  },

  /* Grid Layout */
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },

  /* Duration */
  durationRow: {
    justifyContent: 'space-between',
  },
  durationText: {
    fontSize: 16,
    color: '#1A1C1C',
  },
  durationCounter: {
    flexDirection: 'row',
    gap: 8,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Focus Cards */
  focusCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  normalFocusActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#F0F7FF',
  },
  highFocusActive: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  focusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1C1C',
    marginBottom: 4,
    textAlign: 'center',
  },
  focusCaption: {
    fontSize: 12,
    color: '#424754',
    textAlign: 'center',
    lineHeight: 16,
  },

  /* Action Button */
  actionContainer: {
    paddingTop: 8,
  },
  submitButton: {
    height: 52,
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonSuccess: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  /* Decorative element */
  decorativeContainer: {
    marginTop: 48,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.4,
  },
  outerPulseCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0, 88, 190, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerPulseCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 88, 190, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});