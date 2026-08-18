import { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { AppHeader } from './AppHeader';

export function Screen({ title, onBack, children }: { title?: string; onBack?: () => void; children: ReactNode }) {
  return <SafeAreaView style={styles.safe}><AppHeader title={title} onBack={onBack} /><ScrollView contentContainerStyle={styles.content}>{children}</ScrollView></SafeAreaView>;
}

export function ErrorMessage({ message }: { message: string | null }) { return message ? <View style={styles.error}><Text style={styles.errorText}>{message}</Text></View> : null; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingBottom: 48, gap: 16 },
  error: { padding: 12, borderRadius: 12, backgroundColor: '#FDECEC' },
  errorText: { color: colors.danger, fontWeight: '600' },
});
