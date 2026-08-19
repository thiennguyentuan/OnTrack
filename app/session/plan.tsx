import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, ErrorMessage } from '@/components/ui/Screen';
import { ActionButton } from '@/components/ui/ActionButton';
import { getTask, listTasks, type TaskOption } from '@/features/plans/api';
import { toPlanSessionView } from '@/features/sessions/plan-presentation';
import { createSession } from '@/features/sessions/api';
import { syncScheduledNotifications } from '@/features/notifications/service';
import { colors } from '@/theme/colors';

const isoLocal = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const displayDate = (date: Date) =>
  date.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export default function PlanSession() {
  const { taskId: initialTaskId } = useLocalSearchParams<{ taskId?: string }>();
  const router = useRouter();
  const [taskId, setTaskId] = useState<string | undefined>(initialTaskId);
  const [task, setTask] = useState<any>();
  const [options, setOptions] = useState<TaskOption[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [minutes, setMinutes] = useState(45);
  const [focusMode, setFocusMode] = useState<'NORMAL' | 'HIGH'>('NORMAL');
  const [plannedAt, setPlannedAt] = useState(() => new Date(Date.now() + 30 * 60_000));
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Opened without a task (the "Add Session" button) — offer everything still open.
  useEffect(() => {
    if (initialTaskId) return;
    listTasks()
      .then((all) => { setOptions(all); setPickerOpen(true); })
      .catch((cause: any) => setError(cause?.message ?? 'Unable to load your tasks.'));
  }, [initialTaskId]);

  useEffect(() => {
    if (!taskId) return;
    getTask(taskId).then(setTask).catch((cause: any) => setError(cause?.message ?? 'Unable to load task.'));
  }, [taskId]);

  const submit = async () => {
    if (!taskId) return setError('Choose the task this session works on.');
    setLoading(true);
    setError(null);
    try {
      const session: any = await createSession({
        task_id: taskId,
        planned_start_at: isoLocal(plannedAt),
        estimated_minutes: minutes,
        focus_mode: focusMode,
      });
      void syncScheduledNotifications();
      router.replace(`/session/${session.id}` as any);
    } catch (cause: any) {
      setError(cause?.message ?? 'Unable to schedule session.');
    } finally {
      setLoading(false);
    }
  };

  const view = task ? toPlanSessionView(task) : null;
  const grouped = useMemo(() => {
    const map = new Map<string, TaskOption[]>();
    for (const option of options) {
      const list = map.get(option.deadline_title) ?? [];
      list.push(option);
      map.set(option.deadline_title, list);
    }
    return [...map.entries()];
  }, [options]);

  const dateField = Platform.OS === 'web'
    ? <TextInput
        style={styles.field}
        value={isoLocal(plannedAt)}
        onChangeText={(value) => { const next = new Date(value); if (!Number.isNaN(next.getTime())) setPlannedAt(next); }}
        placeholder="YYYY-MM-DDTHH:mm"
        placeholderTextColor={colors.muted}
      />
    : <Pressable style={styles.field} onPress={() => setShowPicker(true)}>
        <Text style={styles.fieldText}>{displayDate(plannedAt)}</Text>
      </Pressable>;

  return (
    <Screen title="Plan Session" onBack={() => router.back()}>
      <View style={styles.content}>
        <Text style={styles.subtitle}>Organize your flow for the task ahead.</Text>

        <Text style={styles.label}>TASK</Text>
        <Pressable style={styles.taskCard} onPress={() => { setPickerOpen((open) => !open); if (!options.length) void listTasks().then(setOptions).catch(() => undefined); }}>
          <MaterialIcons name="checklist" size={24} color={colors.primary} />
          <View style={styles.flex}>
            <Text style={styles.taskTitle}>{view?.title ?? (taskId ? 'Loading task…' : 'Choose a task')}</Text>
            {!!task?.milestone_title && <Text style={styles.taskMeta}>{task.milestone_title}</Text>}
          </View>
          <MaterialIcons name={pickerOpen ? 'expand-less' : 'expand-more'} size={24} color={colors.muted} />
        </Pressable>

        {pickerOpen && (
          <ScrollView style={styles.picker} nestedScrollEnabled>
            {!grouped.length && <Text style={styles.pickerEmpty}>No open tasks. Create a deadline, milestone and task first.</Text>}
            {grouped.map(([deadlineTitle, items]) => (
              <View key={deadlineTitle}>
                <Text style={styles.pickerGroup}>{deadlineTitle}</Text>
                {items.map((option) => (
                  <Pressable
                    key={option.id}
                    style={[styles.pickerRow, option.id === taskId && styles.pickerRowActive]}
                    onPress={() => { setTaskId(option.id); setPickerOpen(false); }}
                  >
                    <Text style={styles.pickerTitle}>{option.title}</Text>
                    <Text style={styles.pickerMeta}>{option.current_progress}%</Text>
                  </Pressable>
                ))}
              </View>
            ))}
          </ScrollView>
        )}

        {view && (
          <View style={styles.progressCard}>
            <View style={styles.row}>
              <Text style={styles.label}>CURRENT PROGRESS</Text>
              <Text style={styles.progressValue}>{view.progress}%</Text>
            </View>
            <View style={styles.progress}><View style={[styles.fill, { width: `${view.progress}%` }]} /></View>
          </View>
        )}

        <Text style={styles.label}>DATE & TIME</Text>
        {dateField}
        {showPicker && Platform.OS !== 'web' && (
          <DateTimePicker
            value={plannedAt}
            mode="datetime"
            display="default"
            onChange={(_, date) => { setShowPicker(false); if (date) setPlannedAt(date); }}
          />
        )}

        <Text style={styles.label}>DURATION</Text>
        <View style={styles.duration}>
          <Pressable onPress={() => setMinutes((value) => Math.max(15, value - 15))} style={styles.step}>
            <MaterialIcons name="remove" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.durationText}>{minutes} minutes</Text>
          <Pressable onPress={() => setMinutes((value) => Math.min(180, value + 15))} style={styles.step}>
            <MaterialIcons name="add" size={20} color={colors.text} />
          </Pressable>
        </View>

        <Text style={styles.label}>FOCUS MODE</Text>
        <View style={styles.modeRow}>
          <Pressable onPress={() => setFocusMode('NORMAL')} style={[styles.mode, focusMode === 'NORMAL' && styles.modeActive]}>
            <MaterialIcons name="wb-sunny" size={26} color={colors.primary} />
            <Text style={styles.modeTitle}>Normal Focus</Text>
            <Text style={styles.modeMeta}>Standard breaks and tracking</Text>
          </Pressable>
          <Pressable onPress={() => setFocusMode('HIGH')} style={[styles.mode, focusMode === 'HIGH' && styles.modeHighActive]}>
            <MaterialIcons name="bolt" size={26} color={colors.tertiary} />
            <Text style={styles.modeTitle}>High Focus</Text>
            <Text style={styles.modeMeta}>No notifications, deep work</Text>
          </Pressable>
        </View>

        <ErrorMessage message={error} />
        <ActionButton title="Schedule Session" loading={loading} disabled={!taskId} onPress={() => void submit()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 32 },
  flex: { flex: 1 },
  subtitle: { color: colors.muted, fontSize: 17, marginBottom: 4 },
  label: { color: colors.text, fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressCard: { backgroundColor: colors.surface, borderRadius: 24, padding: 20, gap: 12 },
  progressValue: { color: colors.primary, fontSize: 26, fontWeight: '800' },
  progress: { height: 10, borderRadius: 99, backgroundColor: '#E5E7EB', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: 99 },
  taskCard: { backgroundColor: '#F0F4FA', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  taskTitle: { color: colors.text, fontSize: 18, fontWeight: '600' },
  taskMeta: { color: colors.muted, fontSize: 13, marginTop: 2 },
  picker: { maxHeight: 260, backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border },
  pickerEmpty: { color: colors.muted, padding: 18, textAlign: 'center' },
  pickerGroup: { color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  pickerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 13 },
  pickerRowActive: { backgroundColor: '#EAF1FD' },
  pickerTitle: { color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 },
  pickerMeta: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  field: { backgroundColor: '#F0F4FA', borderRadius: 18, padding: 18, color: colors.text, fontSize: 16 },
  fieldText: { color: colors.text, fontSize: 16 },
  duration: { backgroundColor: '#F0F4FA', borderRadius: 18, padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  durationText: { color: colors.text, fontSize: 18 },
  step: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  modeRow: { flexDirection: 'row', gap: 12 },
  mode: { flex: 1, backgroundColor: colors.surface, borderRadius: 22, padding: 16, minHeight: 140, borderWidth: 1, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center', gap: 6 },
  modeActive: { borderColor: '#8FB3FF', backgroundColor: '#F5F8FF' },
  modeHighActive: { borderColor: colors.tertiary, backgroundColor: '#FBF7FF' },
  modeTitle: { color: colors.text, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  modeMeta: { color: colors.muted, fontSize: 12, textAlign: 'center' },
});
