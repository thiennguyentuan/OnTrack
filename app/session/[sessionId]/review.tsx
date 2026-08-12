import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

export default function PostSessionReviewScreen() {
  const progressOptions = [40, 50, 60, 75, 90, 100];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Icon */}
        <View style={styles.headerIconContainer}>
          <View style={styles.checkBg}>
            <MaterialIcons name="check" size={32} color={colors.surface} />
          </View>
          <Text style={styles.title}>Session Complete!</Text>
          <Text style={styles.subtitle}>Great focus! You spent 45 mins on Design Dashboard.</Text>
        </View>

        {/* Progress Selector Card */}
        <View style={styles.card}>
          <View style={styles.progressHeader}>
            <Text style={styles.cardLabel}>Update Task Progress</Text>
            <Text style={styles.progressBefore}>Before: 40%</Text>
          </View>

          <View style={styles.chipGrid}>
            {progressOptions.map((val) => {
              const isSelected = val === 75;
              return (
                <TouchableOpacity
                  key={val}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {val}%
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Result Note Input */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Result / Notes (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="What did you achieve in this session?"
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={4}
          />
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Save & Finish</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 24, gap: 20 },
  headerIconContainer: { alignItems: 'center', marginVertical: 12 },
  checkBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: typography.sizes.sm, color: colors.muted, textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardLabel: { fontSize: typography.sizes.sm, fontWeight: 'bold', color: colors.text },
  progressBefore: { fontSize: typography.sizes.xs, color: colors.muted },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    width: '30%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  chipSelected: { backgroundColor: colors.primary },
  chipText: { fontSize: typography.sizes.sm, fontWeight: 'bold', color: colors.text },
  chipTextSelected: { color: colors.surface },
  textArea: {
    height: 100,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    fontSize: typography.sizes.sm,
    color: colors.text,
    textAlignVertical: 'top',
  },
  bottomBar: { padding: 20, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  saveBtn: { backgroundColor: colors.primary, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: colors.surface, fontWeight: 'bold', fontSize: typography.sizes.base },
});