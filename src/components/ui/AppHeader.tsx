import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

const AVATAR_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxixReZkqmWkJxc-4B70efIhlWaQdll6XkGWlMu0UpGTqHYW1tou5Egp8XDLud3ue847yuotMRoggBsSjCqZKQXoVJZXyOHnwDMcR1H0e0bUGCTiE-hg9RT9EvXJ_gM-WpouRTh89OFNXZHwfUvqJb7PQs7y26xlv4ru0NMWRhHceBPn0vTiROZ_RaHAYSYGBVjXlKCEQsmi_nhE1wSTza7uo1SHzTTkDFwCCHv4OAdcQokA';

export function AppHeader({ title = 'OnTrack', onBack }: { title?: string; onBack?: () => void }) {
  return <View style={styles.header}>
    {onBack ? <TouchableOpacity onPress={onBack} style={styles.icon}><MaterialIcons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity> : <Image source={{ uri: AVATAR_URL }} style={styles.avatar} />}
    <Text style={styles.title}>{title}</Text>
    <TouchableOpacity style={styles.icon}><MaterialIcons name="notifications-none" size={24} color={colors.primary} /></TouchableOpacity>
  </View>;
}

const styles = StyleSheet.create({
  header: { height: 80, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.background },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#D4E2FF' },
  icon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, marginLeft: 12, color: colors.primary, fontSize: typography.sizes.xl, fontWeight: '700' },
});
