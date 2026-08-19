import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';

function initialsOf(name?: string | null, email?: string | null) {
  const source = (name ?? '').trim() || (email ?? '').trim();
  if (!source) return 'ON';
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

/**
 * Offline-safe user avatar. The wireframes ship with a remote placeholder photo;
 * rendering initials keeps the app working without a network and shows the real user.
 */
export function Avatar({
  name,
  email,
  size = 40,
  style,
}: {
  name?: string | null;
  email?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initialsOf(name, email)}</Text>
    </View>
  );
}

export { initialsOf };

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#D4E2FF',
    borderWidth: 2,
    borderColor: '#B9D2FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: { color: colors.primary, fontWeight: '800' },
});
