import { Redirect, useLocalSearchParams } from 'expo-router';
import { legacyDestination } from '@/features/navigation/legacy-route';
export default function LegacySessionFocus() { const { sessionId } = useLocalSearchParams<{ sessionId?: string }>(); return <Redirect href={legacyDestination('sessionFocus', sessionId) as any} />; }
