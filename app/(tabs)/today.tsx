import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

export default function TodayScreen() {
  return <View style={styles.container}><Text style={styles.eyebrow}>ONTRACK</Text><Text style={styles.title}>Today</Text><Text style={styles.subtitle}>Plan your focus. Stay on track.</Text></View>;
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24, paddingTop: 72, backgroundColor: colors.background }, eyebrow: { color: colors.primary, fontWeight: '700', letterSpacing: 2 }, title: { marginTop: 10, color: colors.text, fontSize: 36, fontWeight: '800' }, subtitle: { marginTop: 8, color: colors.muted, fontSize: 16 } });
