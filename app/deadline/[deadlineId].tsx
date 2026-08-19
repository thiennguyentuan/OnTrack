import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { createMilestone, createTask, deleteDeadline, deleteMilestone, getDeadline, updateDeadline, type Priority } from '@/features/plans/api';
import { DEADLINE_TABS, toDeadlineDetailView, type DeadlineTab } from '@/features/plans/deadline-detail-presentation';
import { Screen, ErrorMessage } from '@/components/ui/Screen';
import { ActionButton } from '@/components/ui/ActionButton';
import { colors } from '@/theme/colors';
import { flowRoutes } from '@/features/navigation/flow';

const iso = (date: string) => new Date(`${date}T23:59:59`).toISOString();
const dateOnly = (date?: string) => date ? new Date(date).toISOString().slice(0, 10) : '';
const formatDate = (date: string) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const datePickerValue = (date: string) => { const parsed = date ? new Date(`${date}T12:00:00`) : new Date(); return Number.isNaN(parsed.getTime()) ? new Date() : parsed; };
const formatPickerDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export default function DeadlineDetail() {
  const { deadlineId } = useLocalSearchParams<{ deadlineId: string }>();
  const router = useRouter();
  const [deadline, setDeadline] = useState<any>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [tab, setTab] = useState<DeadlineTab>('MILESTONES');
  const [showEdit, setShowEdit] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [showMilestoneDatePicker, setShowMilestoneDatePicker] = useState(false);
  const [taskMilestoneId, setTaskMilestoneId] = useState<string | null>(null);
  const [deadlineTitle, setDeadlineTitle] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlinePriority, setDeadlinePriority] = useState<Priority>('MEDIUM');
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDate, setMilestoneDate] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority] = useState<Priority>('MEDIUM');

  const load = async () => {
    try {
      setError(null);
      const data: any = await getDeadline(deadlineId);
      setDeadline(data);
      setDeadlineTitle(data.title);
      setDeadlineDate(dateOnly(data.due_at));
      setDeadlinePriority(data.priority ?? 'MEDIUM');
      if (!expanded.length && data.milestones?.[0]?.id) setExpanded([data.milestones[0].id]);
    } catch (cause: any) { setError(cause?.message ?? 'Unable to load deadline.'); }
  };

  useEffect(() => { void load(); }, [deadlineId]);
  const view = useMemo(() => deadline ? toDeadlineDetailView(deadline) : null, [deadline]);
  const firstTaskId = view?.milestones.flatMap((milestone) => milestone.tasks)[0]?.id;
  const run = async (operation: () => Promise<unknown>) => {
    setLoading(true); setError(null);
    try { await operation(); await load(); } catch (cause: any) { setError(cause?.message ?? 'Unable to save changes.'); } finally { setLoading(false); }
  };
  const saveDeadline = () => run(() => updateDeadline(deadlineId, { title: deadlineTitle, due_at: iso(deadlineDate), priority: deadlinePriority }));
  const saveMilestone = () => run(async () => { await createMilestone({ deadline_id: deadlineId, title: milestoneTitle, target_at: iso(milestoneDate) }); setMilestoneTitle(''); setMilestoneDate(''); setShowMilestoneForm(false); });
  const saveTask = (milestoneId: string) => run(async () => { await createTask({ milestone_id: milestoneId, title: taskTitle, priority: taskPriority }); setTaskTitle(''); setTaskMilestoneId(null); });
  const confirmDelete = (label: string, onDelete: () => Promise<void>) => Alert.alert(`Delete ${label}?`, 'This action cannot be undone.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => void onDelete().catch((cause: any) => setError(cause?.message)) }]);

  if (!view) return <Screen title="Details" onBack={() => router.back()}><ErrorMessage message={error} /></Screen>;
  return <Screen title="Details" onBack={() => router.back()}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ErrorMessage message={error} />
      <View style={[styles.hero, view.statusLabel === 'AT RISK' && styles.heroRisk]}>
        <View style={styles.statusRow}><Text style={[styles.status, view.statusLabel === 'AT RISK' && styles.statusRisk]}>{view.statusLabel}</Text><Pressable onPress={() => setShowEdit((current) => !current)} hitSlop={12}><MaterialIcons name="more-vert" size={24} color={colors.muted} /></Pressable></View>
        <Text style={styles.title}>{view.title}</Text>
        <View style={styles.dateRow}><MaterialIcons name="calendar-today" size={20} color={colors.text} /><Text style={styles.date}>Due {formatDate(view.dueAt)}</Text></View>
        <View style={styles.progressHeader}><Text style={styles.progressLabel}>OVERALL PROGRESS</Text><Text style={styles.progressValue}>{view.progress}%</Text></View>
        <View style={styles.progress}><View style={[styles.fill, { width: `${view.progress}%` }]} /></View>
      </View>
      {showEdit && <View style={styles.editCard}><Text style={styles.editTitle}>Edit deadline</Text><TextInput value={deadlineTitle} onChangeText={setDeadlineTitle} style={styles.input} placeholder="Deadline title" /><TextInput value={deadlineDate} onChangeText={setDeadlineDate} style={styles.input} placeholder="Due date (YYYY-MM-DD)" /><TextInput value={deadlinePriority} onChangeText={(value) => setDeadlinePriority(value.toUpperCase() as Priority)} style={styles.input} placeholder="Priority" /><View style={styles.buttonRow}><ActionButton title="Save" loading={loading} onPress={saveDeadline} /><ActionButton title="Delete" secondary onPress={() => confirmDelete('deadline', async () => { await deleteDeadline(deadlineId); router.back(); })} /></View></View>}
      <View style={styles.tabBar}>
        {DEADLINE_TABS.map((option) => (
          <Pressable
            key={option}
            style={[styles.tab, tab === option && styles.tabActive]}
            onPress={() => setTab(option)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === option }}
          >
            <Text style={[styles.tabText, tab === option && styles.tabTextActive]}>
              {option.charAt(0) + option.slice(1).toLowerCase()}
            </Text>
            <Text style={[styles.tabCount, tab === option && styles.tabCountActive]}>
              {option === 'MILESTONES' ? view.counts.milestones : option === 'TASKS' ? view.counts.tasks : view.counts.sessions}
            </Text>
          </Pressable>
        ))}
      </View>
      {tab === 'MILESTONES' && <>
      <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Milestones</Text><Pressable onPress={() => router.push(`/milestone/create-milestone?deadlineId=${deadlineId}` as any)} style={styles.addLink}><MaterialIcons name="add-circle-outline" size={22} color={colors.primary} /><Text style={styles.addLinkText}>Add Milestone</Text></Pressable></View>
      {showMilestoneForm && <View style={styles.formCard}><TextInput value={milestoneTitle} onChangeText={setMilestoneTitle} style={styles.input} placeholder="Milestone title" /><Pressable style={styles.dateField} onPress={() => setShowMilestoneDatePicker(true)}><MaterialIcons name="calendar-today" size={20} color={colors.primary} /><Text style={[styles.dateFieldText, !milestoneDate && styles.placeholder]}>{milestoneDate || 'Target date'}</Text></Pressable>{Platform.OS === 'web' && <TextInput value={milestoneDate} onChangeText={setMilestoneDate} style={styles.webDateInput} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" />}{showMilestoneDatePicker && Platform.OS !== 'web' && <DateTimePicker value={datePickerValue(milestoneDate)} mode="date" display="default" onChange={(_, selectedDate) => { setShowMilestoneDatePicker(false); if (selectedDate) setMilestoneDate(formatPickerDate(selectedDate)); }} />}<ActionButton title="Add Milestone" loading={loading} onPress={saveMilestone} /></View>}
      {view.milestones.map((milestone) => { const isExpanded = expanded.includes(milestone.id); return <View key={milestone.id} style={[styles.milestoneCard, isExpanded && styles.milestoneExpanded]}>
        <Pressable style={styles.milestoneHeader} onPress={() => router.push(`${flowRoutes.milestoneDetail(milestone.id)}?deadlineId=${deadlineId}` as any)}><View style={[styles.milestoneIcon, milestone.progress >= 100 && styles.milestoneIconDone]}><MaterialIcons name={milestone.progress >= 100 ? 'check' : 'code'} size={24} color={milestone.progress >= 100 ? colors.secondary : colors.primary} /></View><View style={styles.flex}><Text style={styles.milestoneTitle}>{milestone.title}</Text><Text style={styles.milestoneMeta}>{milestone.statusLabel} · {milestone.progress}%</Text></View><Pressable hitSlop={10} onPress={() => setExpanded((current) => current.includes(milestone.id) ? current.filter((id) => id !== milestone.id) : [...current, milestone.id])}><MaterialIcons name={isExpanded ? 'expand-less' : 'expand-more'} size={26} color={colors.text} /></Pressable><MaterialIcons name="chevron-right" size={26} color={colors.text} /></Pressable>
        {isExpanded && <View style={styles.milestoneBody}>{milestone.tasks.map((task) => <Pressable key={task.id} style={styles.taskRow} onPress={() => router.push(`/task/${task.id}` as any)}><View style={[styles.checkbox, task.completed && styles.checkboxDone]}>{task.completed && <MaterialIcons name="check" size={16} color={colors.surface} />}</View><Text style={[styles.taskTitle, task.completed && styles.taskCompleted]}>{task.title}</Text><Text style={styles.taskProgress}>{task.progress}%</Text></Pressable>)}{taskMilestoneId === milestone.id ? <View style={styles.taskForm}><TextInput value={taskTitle} onChangeText={setTaskTitle} style={styles.input} placeholder="Task title" /><ActionButton title="Add Task" loading={loading} onPress={() => saveTask(milestone.id)} /></View> : <Pressable style={styles.addTask} onPress={() => setTaskMilestoneId(milestone.id)}><MaterialIcons name="add" size={22} color={colors.muted} /><Text style={styles.addTaskText}>Add Task</Text></Pressable>}<View style={styles.inlineActions}><Pressable onPress={() => confirmDelete('milestone', () => deleteMilestone(milestone.id).then(load))}><Text style={styles.deleteText}>Delete milestone</Text></Pressable></View></View>}
      </View>; })}
      </>}
      {tab === 'TASKS' && <View style={styles.panel}>
        {!view.tasks.length && <Text style={styles.emptyText}>No tasks yet. Add a milestone first, then add tasks to it.</Text>}
        {view.tasks.map((task) => <Pressable key={task.id} style={styles.panelRow} onPress={() => router.push(`/task/${task.id}` as any)}>
          <View style={[styles.checkbox, task.completed && styles.checkboxDone]}>{task.completed && <MaterialIcons name="check" size={16} color={colors.surface} />}</View>
          <View style={styles.panelText}>
            <Text style={[styles.panelTitle, task.completed && styles.taskCompleted]}>{task.title}</Text>
            <Text style={styles.panelMeta}>{task.milestoneTitle}</Text>
          </View>
          <Text style={styles.panelValue}>{task.progress}%</Text>
        </Pressable>)}
      </View>}
      {tab === 'SESSIONS' && <View style={styles.panel}>
        {!view.sessions.length && <Text style={styles.emptyText}>No sessions planned for this deadline yet.</Text>}
        {view.sessions.map((session) => <Pressable key={session.id} style={styles.panelRow} onPress={() => router.push(`/session/${session.id}` as any)}>
          <MaterialIcons name={session.status === 'PLANNED' ? 'schedule' : 'check-circle'} size={22} color={session.status === 'PLANNED' ? colors.primary : colors.secondary} />
          <View style={styles.panelText}>
            <Text style={styles.panelTitle}>{session.taskTitle}</Text>
            <Text style={styles.panelMeta}>{formatDate(session.plannedStartAt)} · {session.minutes}m · {session.focusMode === 'HIGH' ? 'High Focus' : 'Normal Focus'}</Text>
          </View>
          <Text style={styles.panelValue}>{session.progressAfter == null ? session.statusLabel : `${session.progressBefore}→${session.progressAfter}%`}</Text>
        </Pressable>)}
      </View>}
      <View style={styles.bottomActions}><ActionButton title="Update Progress" onPress={() => firstTaskId ? router.push(`/task/${firstTaskId}` as any) : setShowMilestoneForm(true)} /><ActionButton title="Plan Next Session" secondary onPress={() => router.push('/session/plan' as any)} /></View>
    </ScrollView>
  </Screen>;
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32, gap: 16 },
  tabBar: { flexDirection: 'row', gap: 6, backgroundColor: '#EDF1F8', borderRadius: 99, padding: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: 99 },
  tabActive: { backgroundColor: colors.surface, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  tabText: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  tabTextActive: { color: colors.primary },
  tabCount: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  tabCountActive: { color: colors.primary },
  panel: { gap: 10 },
  panelRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, padding: 16 },
  panelText: { flex: 1 },
  panelTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  panelMeta: { color: colors.muted, fontSize: 13, marginTop: 2 },
  panelValue: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  emptyText: { color: colors.muted, fontSize: 15, textAlign: 'center', paddingVertical: 24 }, hero: { backgroundColor: colors.surface, borderRadius: 28, padding: 24, borderLeftWidth: 5, borderLeftColor: colors.primary, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 }, heroRisk: { borderLeftColor: colors.danger }, statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, status: { backgroundColor: '#E9DDFF', color: colors.tertiary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, fontWeight: '700', overflow: 'hidden' }, statusRisk: { backgroundColor: '#FFDDD8', color: colors.danger }, title: { color: colors.text, fontSize: 30, fontWeight: '800', marginTop: 16 }, dateRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }, date: { color: colors.text, fontSize: 18 }, progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 36, marginBottom: 10 }, progressLabel: { color: colors.text, fontSize: 14, fontWeight: '700', letterSpacing: 1 }, progressValue: { color: colors.primary, fontSize: 30, fontWeight: '800' }, progress: { height: 12, borderRadius: 99, backgroundColor: '#E5E7EB', overflow: 'hidden' }, fill: { height: '100%', borderRadius: 99, backgroundColor: colors.primary }, editCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 18, gap: 10 }, editTitle: { color: colors.text, fontSize: 18, fontWeight: '800' }, input: { height: 46, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, color: colors.text, backgroundColor: colors.surface }, dateField: { height: 46, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface }, dateFieldText: { color: colors.text, fontSize: 15 }, placeholder: { color: colors.muted }, webDateInput: { height: 42, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, color: colors.text }, buttonRow: { flexDirection: 'row', gap: 10 }, sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }, sectionTitle: { color: colors.text, fontSize: 24, fontWeight: '800' }, addLink: { flexDirection: 'row', alignItems: 'center', gap: 6 }, addLinkText: { color: colors.primary, fontSize: 16, fontWeight: '700' }, formCard: { backgroundColor: colors.surface, padding: 16, borderRadius: 18, gap: 10 }, milestoneCard: { backgroundColor: colors.surface, borderRadius: 24, padding: 18, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 1 }, milestoneExpanded: { borderWidth: 1, borderColor: '#C9D7FF' }, milestoneHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 }, milestoneIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E7EEFF', alignItems: 'center', justifyContent: 'center' }, milestoneIconDone: { backgroundColor: '#62FAE3' }, flex: { flex: 1 }, milestoneTitle: { color: colors.text, fontSize: 21, fontWeight: '800' }, milestoneMeta: { color: colors.primary, fontSize: 15, marginTop: 4 }, milestoneBody: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 16, paddingTop: 4 }, taskRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#EEF0F5' }, checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, checkboxDone: { backgroundColor: colors.primary }, taskTitle: { flex: 1, color: colors.text, fontSize: 16 }, taskCompleted: { color: colors.muted, textDecorationLine: 'line-through' }, taskProgress: { color: colors.primary, fontWeight: '700' }, addTask: { minHeight: 56, borderWidth: 2, borderStyle: 'dashed', borderColor: '#B9C2D8', borderRadius: 16, marginTop: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }, addTaskText: { color: colors.muted, fontSize: 16, fontWeight: '700' }, taskForm: { gap: 10, marginTop: 14 }, inlineActions: { alignItems: 'flex-end', marginTop: 10 }, deleteText: { color: colors.danger, fontSize: 13, fontWeight: '700' }, bottomActions: { gap: 10, marginTop: 4 },
});
