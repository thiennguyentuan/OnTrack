import { Redirect, useLocalSearchParams } from 'expo-router';
import { legacyDestination } from '@/features/navigation/legacy-route';
export default function LegacyTaskDetail() { const { taskId } = useLocalSearchParams<{ taskId?: string }>(); return <Redirect href={legacyDestination('task', taskId) as any} />; }
