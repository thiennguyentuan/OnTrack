import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getMilestone } from '@/features/plans/api';
import { Screen, ErrorMessage } from '@/components/ui/Screen';
import { ActionButton } from '@/components/ui/ActionButton';
import { colors } from '@/theme/colors';
import { flowRoutes } from '@/features/navigation/flow';

export default function MilestoneDetail() {
  const { milestoneId, deadlineId } = useLocalSearchParams<{ milestoneId: string; deadlineId?: string }>();
  const router = useRouter();
  const [milestone, setMilestone] = useState<any>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { getMilestone(milestoneId).then(setMilestone).catch((cause: any) => setError(cause.message)); }, [milestoneId]);

  return <Screen title="Milestone Detail" onBack={() => router.back()}><ErrorMessage message={error} />{milestone ? <View style={styles.content}><Text style={styles.kicker}>MILESTONE</Text><Text style={styles.title}>{milestone.title}</Text><Text style={styles.meta}>Target {new Date(milestone.target_at).toLocaleDateString()}</Text><View style={styles.card}><Text style={styles.label}>PROGRESS</Text><Text style={styles.progress}>{milestone.progress ?? 0}%</Text><View style={styles.track}><View style={[styles.fill, { width: `${milestone.progress ?? 0}%` }]} /></View></View><Text style={styles.heading}>Tasks ({milestone.tasks?.length ?? 0})</Text>{milestone.tasks?.map((task: any) => <Pressable key={task.id} style={styles.task} onPress={() => router.push(`/task/${task.id}` as any)}><Text style={styles.taskTitle}>{task.title}</Text><Text style={styles.meta}>{task.current_progress ?? 0}%</Text></Pressable>)}<ActionButton title="Add Task" onPress={() => router.push(flowRoutes.taskCreate(milestoneId) as any)} /><ActionButton title="Edit Milestone" secondary onPress={() => router.push(flowRoutes.milestoneEdit(milestoneId, deadlineId) as any)} /></View> : null}</Screen>;
}
const styles = StyleSheet.create({ content: { gap: 14, paddingBottom: 32 }, kicker: { color: colors.muted, fontWeight: '800', letterSpacing: 2 }, title: { color: colors.text, fontSize: 32, fontWeight: '800' }, meta: { color: colors.muted }, card: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, gap: 10 }, label: { color: colors.muted, fontSize: 12, fontWeight: '800' }, progress: { color: colors.primary, fontSize: 28, fontWeight: '800' }, track: { height: 10, borderRadius: 99, backgroundColor: '#E5E7EB', overflow: 'hidden' }, fill: { height: '100%', backgroundColor: colors.primary }, heading: { color: colors.text, fontSize: 20, fontWeight: '800' }, task: { backgroundColor: colors.surface, padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between' }, taskTitle: { color: colors.text, fontWeight: '700' } });
