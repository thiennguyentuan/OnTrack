import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from './Avatar';

export function AppHeader({ title = 'OnTrack', onBack }: { title?: string; onBack?: () => void }) {
  const router = useRouter();
  const { user } = useAuthStore();
  return <View style={styles.header}>
    {onBack ? <TouchableOpacity onPress={onBack} style={styles.icon}><MaterialIcons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity> : <Avatar name={user?.full_name} email={user?.email} />}
    <Text style={styles.title}>{title}</Text>
    <TouchableOpacity style={styles.icon} onPress={() => router.push('/settings/notification-settings' as any)}><MaterialIcons name="notifications-none" size={24} color={colors.primary} /></TouchableOpacity>
  </View>;
}

const styles = StyleSheet.create({
  header: { height: 80, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.background },
  icon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, marginLeft: 12, color: colors.primary, fontSize: typography.sizes.xl, fontWeight: '700' },
});
