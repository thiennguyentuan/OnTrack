import { PixelRatio, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/theme/colors';

const SWATCHES: { name: string; value: string }[] = [
  { name: 'Primary', value: colors.primary },
  { name: 'Secondary', value: colors.secondary },
  { name: 'High Focus', value: colors.tertiary },
  { name: 'Success', value: colors.success },
  { name: 'Warning', value: colors.warning },
  { name: 'At Risk', value: colors.danger },
];

const describeScale = (scale: number) => {
  if (scale <= 0.9) return 'Smaller than default';
  if (scale < 1.05) return 'Default';
  if (scale < 1.3) return 'Larger than default';
  return 'Much larger than default';
};

export default function AppearanceScreen() {
  const router = useRouter();
  const fontScale = PixelRatio.getFontScale();

  return (
    <Screen title="Appearance" onBack={() => router.back()}>
      <Text style={styles.intro}>How OnTrack looks on this device.</Text>

      <Text style={styles.sectionHeader}>THEME</Text>
      <View style={styles.card}>
        <View style={styles.themeRow}>
          <View style={styles.themeIcon}>
            <MaterialIcons name="light-mode" size={22} color={colors.primary} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.themeTitle}>Cognitive Clarity · Light</Text>
            <Text style={styles.themeMeta}>The design system OnTrack ships with</Text>
          </View>
          <View style={styles.activeChip}><Text style={styles.activeChipText}>ACTIVE</Text></View>
        </View>

        <View style={styles.divider} />

        <View style={styles.swatchRow}>
          {SWATCHES.map((swatch) => (
            <View key={swatch.name} style={styles.swatch}>
              <View style={[styles.swatchChip, { backgroundColor: swatch.value }]} />
              <Text style={styles.swatchName}>{swatch.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.roadmapCard}>
        <MaterialIcons name="dark-mode" size={22} color={colors.muted} />
        <View style={styles.flex}>
          <Text style={styles.roadmapTitle}>Dark mode</Text>
          <Text style={styles.roadmapMeta}>On the roadmap — not part of this release</Text>
        </View>
        <View style={styles.roadmapChip}><Text style={styles.roadmapChipText}>PLANNED</Text></View>
      </View>

      <Text style={styles.sectionHeader}>TEXT SIZE</Text>
      <View style={styles.card}>
        <View style={styles.themeRow}>
          <View style={styles.themeIcon}>
            <MaterialIcons name="format-size" size={22} color={colors.primary} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.themeTitle}>{describeScale(fontScale)}</Text>
            <Text style={styles.themeMeta}>OnTrack follows your device text size ({Math.round(fontScale * 100)}%)</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <Text style={styles.hint}>
          Change it in your phone settings under Display → Font size, and OnTrack updates with it.
        </Text>
      </View>

      <Text style={styles.sectionHeader}>PREVIEW</Text>
      <View style={styles.previewCard}>
        <View style={styles.previewTop}>
          <View style={styles.previewBadge}><Text style={styles.previewBadgeText}>AT RISK</Text></View>
          <Text style={styles.previewDays}>5 days left</Text>
        </View>
        <Text style={styles.previewTitle}>Final Year Project</Text>
        <Text style={styles.previewMeta}>Due 8 Sep 2026 · 4 milestones</Text>
        <View style={styles.previewTrack}><View style={styles.previewFill} /></View>
        <Text style={styles.previewLabel}>45% COMPLETE</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { color: colors.muted, fontSize: 16, lineHeight: 23 },
  flex: { flex: 1 },
  sectionHeader: { color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, marginTop: 8 },
  card: { backgroundColor: colors.surface, borderRadius: 20, paddingVertical: 4 },
  themeRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  themeIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EAF1FD', alignItems: 'center', justifyContent: 'center' },
  themeTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  themeMeta: { color: colors.muted, fontSize: 13, marginTop: 2 },
  activeChip: { backgroundColor: '#DCF0E8', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  activeChipText: { color: colors.secondary, fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16 },
  swatch: { alignItems: 'center', gap: 6, width: '28%' },
  swatchChip: { width: '100%', height: 34, borderRadius: 10 },
  swatchName: { color: colors.muted, fontSize: 11, fontWeight: '700' },

  roadmapCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderRadius: 20, padding: 16, opacity: 0.75 },
  roadmapTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  roadmapMeta: { color: colors.muted, fontSize: 13, marginTop: 2 },
  roadmapChip: { backgroundColor: '#EDF1F8', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  roadmapChipText: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  hint: { color: colors.muted, fontSize: 14, lineHeight: 21, padding: 16 },

  previewCard: { backgroundColor: colors.surface, borderRadius: 24, padding: 20, gap: 10, borderLeftWidth: 5, borderLeftColor: colors.danger },
  previewTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  previewBadge: { backgroundColor: '#FFDDD8', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5 },
  previewBadgeText: { color: colors.danger, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  previewDays: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  previewTitle: { color: colors.text, fontSize: 22, fontWeight: '800' },
  previewMeta: { color: colors.muted, fontSize: 14 },
  previewTrack: { height: 8, borderRadius: 99, backgroundColor: '#E5EAF2', overflow: 'hidden', marginTop: 4 },
  previewFill: { width: '45%', height: '100%', borderRadius: 99, backgroundColor: colors.primary },
  previewLabel: { color: colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
});
