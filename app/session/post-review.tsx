import { Redirect, useLocalSearchParams } from 'expo-router';
import { legacyDestination } from '@/features/navigation/legacy-route';
export default function LegacySessionReview() { const { sessionId } = useLocalSearchParams<{ sessionId?: string }>(); return <Redirect href={legacyDestination('sessionReview', sessionId) as any} />; }
