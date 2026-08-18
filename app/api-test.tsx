import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../src/theme/colors';
import { getNextApiTestStep, type ApiTestFlowState } from '../src/features/api-test/flow';

type AnyRecord = Record<string, any>;

function record(value: unknown): AnyRecord {
  return value && typeof value === 'object' ? value as AnyRecord : {};
}

function idFrom(value: unknown): string | undefined {
  const result = record(value);
  return result.id ?? record(result.data).id ?? record(result.session).id ?? record(result.user).id;
}

function messageFrom(error: unknown): string {
  const result = record(error);
  return result.message ?? (error instanceof Error ? error.message : 'Something went wrong');
}

export default function ApiTestScreen() {
  const [flow, setFlow] = useState<ApiTestFlowState>({});
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('OnTrack Demo');
  const [deadlineTitle, setDeadlineTitle] = useState('API test deadline');
  const [taskTitle, setTaskTitle] = useState('API test task');
  const [sessionMinutes, setSessionMinutes] = useState('25');
  const [progressAfter, setProgressAfter] = useState('40');
  const [resultNote, setResultNote] = useState('Completed API test focus session');
  const [session, setSession] = useState<AnyRecord>({});
  const [review, setReview] = useState<AnyRecord>({});
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const nextStep = getNextApiTestStep(flow);
  const sessionStatus = session.status ?? record(session.data).status;
  const expectedEndAt = session.expected_end_at ?? record(session.data).expected_end_at;
  const remainingMinutes = useMemo(() => {
    if (!expectedEndAt) return null;
    return Math.max(0, Math.ceil((Date.parse(expectedEndAt) - now) / 60000));
  }, [expectedEndAt, now]);

  useEffect(() => {
    if (sessionStatus !== 'IN_PROGRESS') return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [sessionStatus]);

  async function run(action: string, operation: () => Promise<unknown>, onSuccess: (value: unknown) => void) {
    setBusy(action);
    setError(null);
    setNotice(null);
    try {
      const value = await operation();
      onSuccess(value);
      setNotice(`${action} thành công`);
    } catch (caught) {
      setError(messageFrom(caught));
    } finally {
      setBusy(null);
    }
  }

  async function auth(action: 'register' | 'login') {
    await run(action, async () => {
      const api = await import('../src/features/auth/api');
      return action === 'register'
        ? api.register({ fullName, email, password })
        : api.login({ email, password });
    }, (value) => {
      const id = idFrom(value) ?? record(record(value).session).user?.id;
      if (id) setFlow((current) => ({ ...current, userId: id }));
    });
  }

  async function createPlan() {
    await run('Tạo kế hoạch', async () => {
      const api = await import('../src/features/plans/api');
      const deadline = record(await api.createDeadline({ title: deadlineTitle, due_at: new Date(Date.now() + 7 * 86400000).toISOString(), priority: 'MEDIUM' }));
      const milestone = record(await api.createMilestone({ deadline_id: deadline.id, title: 'Milestone API', target_at: new Date(Date.now() + 6 * 86400000).toISOString() }));
      return api.createTask({ milestone_id: milestone.id, title: taskTitle, priority: 'MEDIUM' });
    }, (value) => {
      const taskId = idFrom(value);
      if (taskId) setFlow((current) => ({ ...current, taskId }));
    });
  }

  async function createPlannedSession() {
    await run('Tạo session', async () => {
      const api = await import('../src/features/sessions/api');
      return api.createSession({ task_id: flow.taskId!, planned_start_at: new Date().toISOString(), estimated_minutes: Number(sessionMinutes) || 25, focus_mode: 'NORMAL' });
    }, (value) => {
      const next = record(value);
      const sessionId = idFrom(value);
      setSession(next);
      if (sessionId) setFlow((current) => ({ ...current, sessionId }));
    });
  }

  async function transition(action: 'start' | 'pause' | 'resume' | 'end') {
    await run(action, async () => {
      const api = await import('../src/features/sessions/api');
      if (action === 'start') return api.startSession(flow.sessionId!);
      if (action === 'pause') return api.pauseSession(flow.sessionId!);
      if (action === 'resume') return api.resumeSession(flow.sessionId!);
      return api.endSession(flow.sessionId!, true);
    }, (value) => {
      const next = record(value);
      setSession(next);
      if (action === 'end') setFlow((current) => ({ ...current, focusEnded: true }));
    });
  }

  async function saveReview() {
    await run('Lưu review', async () => {
      const api = await import('../src/features/dashboard/api');
      return api.completeSessionReview({ p_session_id: flow.sessionId!, p_progress_after: Number(progressAfter) || 0, p_actual_minutes: Number(sessionMinutes) || 25, p_result_note: resultNote || null });
    }, (value) => {
      setReview(record(value));
      setFlow((current) => ({ ...current, reviewSaved: true }));
    });
  }

  async function createFollowUp() {
    await run('Tạo follow-up', async () => {
      const api = await import('../src/features/dashboard/api');
      return api.createFollowUpSession({ p_previous_session_id: flow.sessionId!, p_planned_start_at: new Date(Date.now() + 86400000).toISOString(), p_estimated_minutes: Number(sessionMinutes) || 25, p_focus_mode: 'NORMAL' });
    }, (value) => {
      const followUpId = idFrom(value);
      if (followUpId) setFlow((current) => ({ ...current, followUpId }));
    });
  }

  function Button({ label, action, onPress, disabled = false }: { label: string; action: string; onPress: () => void; disabled?: boolean }) {
    return <Pressable disabled={Boolean(busy) || disabled} onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed, (busy || disabled) && styles.disabled]}><Text style={styles.buttonText}>{busy === action ? 'Đang xử lý…' : label}</Text></Pressable>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>DEV API CHECK</Text>
      <Text style={styles.title}>OnTrack flow test</Text>
      <Text style={styles.subtitle}>Đi theo đúng flow: kế hoạch → session → focus → review.</Text>
      {error && <View style={styles.error}><Text style={styles.errorText}>{error}</Text></View>}
      {notice && <Text style={styles.notice}>{notice}</Text>}
      <View style={styles.progress}><Text style={styles.progressText}>Bước tiếp theo: {nextStep}</Text>{busy && <ActivityIndicator color={colors.primary} />}</View>

      <View style={styles.card}><Text style={styles.cardTitle}>1. Auth</Text><TextInput value={fullName} onChangeText={setFullName} placeholder="Họ tên" style={styles.input} /><TextInput value={email} onChangeText={setEmail} autoCapitalize="none" placeholder="Email" style={styles.input} /><TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Mật khẩu" style={styles.input} /><View style={styles.row}><Button label="Đăng ký" action="register" onPress={() => void auth('register')} /><Button label="Đăng nhập" action="login" onPress={() => void auth('login')} /></View>{flow.userId && <Text style={styles.meta}>User: {flow.userId}</Text>}</View>

      <View style={[styles.card, !flow.userId && styles.locked]}><Text style={styles.cardTitle}>2. Plans</Text><TextInput value={deadlineTitle} onChangeText={setDeadlineTitle} placeholder="Tên deadline" style={styles.input} /><TextInput value={taskTitle} onChangeText={setTaskTitle} placeholder="Tên task" style={styles.input} /><Button disabled={!flow.userId} label="Tạo Deadline → Milestone → Task" action="Tạo kế hoạch" onPress={() => void createPlan()} />{flow.taskId && <Text style={styles.meta}>Task: {flow.taskId}</Text>}</View>

      <View style={[styles.card, !flow.taskId && styles.locked]}><Text style={styles.cardTitle}>3. Plan Session</Text><TextInput value={sessionMinutes} onChangeText={setSessionMinutes} keyboardType="number-pad" placeholder="Số phút" style={styles.input} /><Button disabled={!flow.taskId} label="Tạo session" action="Tạo session" onPress={() => void createPlannedSession()} />{flow.sessionId && <Text style={styles.meta}>Session: {flow.sessionId}</Text>}</View>

      <View style={[styles.card, !flow.sessionId && styles.locked]}><Text style={styles.cardTitle}>4. Focus Session</Text><Text style={styles.status}>Status: {sessionStatus ?? 'PLANNED'}{remainingMinutes !== null ? ` · còn khoảng ${remainingMinutes} phút` : ''}</Text><View style={styles.row}><Button disabled={!flow.sessionId || sessionStatus !== 'PLANNED'} label="Start" action="start" onPress={() => void transition('start')} /><Button disabled={!flow.sessionId || sessionStatus !== 'IN_PROGRESS'} label="Pause" action="pause" onPress={() => void transition('pause')} /><Button disabled={!flow.sessionId || sessionStatus !== 'PAUSED'} label="Resume" action="resume" onPress={() => void transition('resume')} /></View><Button disabled={!flow.sessionId || !['IN_PROGRESS', 'PAUSED'].includes(sessionStatus)} label="End early → Review" action="end" onPress={() => void transition('end')} /></View>

      <View style={[styles.card, !flow.focusEnded && styles.locked]}><Text style={styles.cardTitle}>5. Post-Session Review</Text><TextInput value={progressAfter} onChangeText={setProgressAfter} keyboardType="number-pad" placeholder="Progress after (%)" style={styles.input} /><TextInput value={resultNote} onChangeText={setResultNote} placeholder="Kết quả" style={styles.input} /><Button disabled={!flow.focusEnded} label="Lưu review" action="Lưu review" onPress={() => void saveReview()} />{review.task && <Text style={styles.meta}>Progress: {record(review.task).current_progress ?? '—'}</Text>}</View>

      <View style={[styles.card, !flow.reviewSaved && styles.locked]}><Text style={styles.cardTitle}>6. Follow-up / Completed</Text><Text style={styles.status}>{record(review).can_create_follow_up === false ? 'Task completed' : 'Có thể tạo session tiếp theo'}</Text>{record(review).can_create_follow_up !== false && <Button disabled={!flow.reviewSaved} label="Tạo follow-up ngày mai" action="Tạo follow-up" onPress={() => void createFollowUp()} />}{flow.followUpId && <Text style={styles.meta}>Follow-up: {flow.followUpId}</Text>}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 64, backgroundColor: colors.background, gap: 14 },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  progress: { padding: 14, borderRadius: 12, backgroundColor: '#EAF2FF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressText: { color: colors.primary, fontWeight: '700' },
  card: { padding: 16, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: 10 },
  locked: { opacity: 0.48 },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: colors.text, backgroundColor: colors.background },
  row: { flexDirection: 'row', gap: 8 },
  button: { flex: 1, minHeight: 42, paddingHorizontal: 14, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.55 },
  buttonText: { color: colors.surface, fontWeight: '800', textAlign: 'center' },
  status: { color: colors.text, fontWeight: '600' },
  meta: { color: colors.muted, fontSize: 12 },
  error: { padding: 12, borderRadius: 10, backgroundColor: '#FDECEC' },
  errorText: { color: colors.danger, fontWeight: '600' },
  notice: { color: colors.success, fontWeight: '700' },
});
