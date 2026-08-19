import { Redirect, useLocalSearchParams } from 'expo-router';
import { legacyDestination } from '@/features/navigation/legacy-route';
export default function LegacyMilestoneDetail() { const { deadlineId } = useLocalSearchParams<{ deadlineId?: string }>(); return <Redirect href={legacyDestination('deadline', deadlineId) as any} />; }
