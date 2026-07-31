import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

export default function PlansScreen() {
  return <View style={styles.container}><Text style={styles.title}>Plans</Text><Text style={styles.subtitle}>Your deadlines, milestones and tasks will appear here.</Text></View>;
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24, paddingTop: 72, backgroundColor: colors.background }, title: { color: colors.text, fontSize: 32, fontWeight: '800' }, subtitle: { marginTop: 10, color: colors.muted, fontSize: 16, lineHeight: 24 } });
