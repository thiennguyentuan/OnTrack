import { Redirect, useLocalSearchParams } from 'expo-router';
import { legacyDestination } from '@/features/navigation/legacy-route';
export default function LegacySessionPlan() { const { taskId } = useLocalSearchParams<{ taskId?: string }>(); return <Redirect href={legacyDestination('sessionPlan', taskId) as any} />; }
