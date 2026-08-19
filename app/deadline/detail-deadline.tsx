import { Redirect, useLocalSearchParams } from 'expo-router';
import { legacyDestination } from '@/features/navigation/legacy-route';
export default function LegacyDeadlineDetail() { const { deadlineId } = useLocalSearchParams<{ deadlineId?: string }>(); return <Redirect href={legacyDestination('deadline', deadlineId) as any} />; }
