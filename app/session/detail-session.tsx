import { Redirect, useLocalSearchParams } from 'expo-router';
import { legacyDestination } from '@/features/navigation/legacy-route';
export default function LegacySessionDetail() { const { sessionId } = useLocalSearchParams<{ sessionId?: string }>(); return <Redirect href={legacyDestination('session', sessionId) as any} />; }
