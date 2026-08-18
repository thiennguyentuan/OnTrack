import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/theme/colors';

export function ActionButton({ title, onPress, loading = false, secondary = false, disabled = false }: { title: string; onPress: () => void; loading?: boolean; secondary?: boolean; disabled?: boolean }) {
  return <Pressable disabled={loading || disabled} onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.secondary, (pressed || loading || disabled) && styles.dim]}>
    {loading ? <ActivityIndicator color={secondary ? colors.primary : colors.surface} /> : <Text style={[styles.text, secondary && styles.secondaryText]}>{title}</Text>}
  </Pressable>;
}

const styles = StyleSheet.create({
  button: { minHeight: 48, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  text: { color: colors.surface, fontWeight: '700', fontSize: 15 },
  secondaryText: { color: colors.primary },
  dim: { opacity: 0.55 },
});
