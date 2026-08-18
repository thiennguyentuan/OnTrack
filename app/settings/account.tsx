import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

export default function AccountScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const AVATAR_URL =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDxixReZkqmWkJxc-4B70efIhlWaQDll6XkGWlMu0UpGTqHYW1tou5Egp8XDLud3ue847yuotMRoggBs9XjSgCjSqWZoZKQXoVJZXyOHnwDMcR1H0e0bUGCTiE-hg9RT9EvXJ_gM-WpouRTh89OFNXZHwfUvqJb7PQs7y26xlv4ru0NMWRhHceBPn0vTiROZ_RaHAYSYGBVjXlKCEQsmi_nhE1wSTza7uo1SHzTTkDFwCCHv4OAdcQokA';

  const [fullName, setFullName] = useState('Alex Rivers');
  const [email] = useState(user?.email || 'alex.rivers@university.edu');
  const [major, setMajor] = useState('Computer Science');
  const [graduationYear, setGraduationYear] = useState('2027');
  const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh (GMT+7)');

  const handleBack = () => {
    router.navigate('/(tabs)/me' as any);
  };

  const handleSaveProfile = () => {
    Alert.alert('Thành công', 'Thông tin tài khoản đã được cập nhật!', [
      { text: 'OK', onPress: handleBack },
    ]);
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'A password reset link has been sent to your email.');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={handleBack}
        >
          <MaterialIcons name="arrow-back-ios-new" size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar & Profile Card */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: AVATAR_URL }} style={styles.avatarImage} />
            <TouchableOpacity style={styles.editAvatarBadge}>
              <MaterialIcons name="photo-camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{fullName}</Text>
          <Text style={styles.userRole}>{email}</Text>
        </View>

        {/* Form Details */}
        <View style={styles.formSection}>
          <Text style={styles.sectionHeader}>PERSONAL INFORMATION</Text>

          <View style={styles.card}>
            {/* Full Name */}
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={styles.fieldInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor={colors.muted}
              />
            </View>

            <View style={styles.divider} />

            {/* Email (Read only) */}
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <TextInput
                style={[styles.fieldInput, styles.fieldInputDisabled]}
                value={email}
                editable={false}
              />
            </View>

            <View style={styles.divider} />

            {/* Academic Major */}
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Major / Discipline</Text>
              <TextInput
                style={styles.fieldInput}
                value={major}
                onChangeText={setMajor}
                placeholder="e.g., Software Engineering"
                placeholderTextColor={colors.muted}
              />
            </View>

            <View style={styles.divider} />

            {/* Graduation Year */}
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Graduation Year</Text>
              <TextInput
                style={styles.fieldInput}
                value={graduationYear}
                onChangeText={setGraduationYear}
                keyboardType="numeric"
                placeholder="e.g., 2027"
                placeholderTextColor={colors.muted}
                maxLength={4}
              />
            </View>
          </View>

          {/* Preferences */}
          <Text style={[styles.sectionHeader, { marginTop: 24 }]}>PREFERENCES & REGION</Text>
          <View style={styles.card}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Timezone</Text>
              <TextInput
                style={styles.fieldInput}
                value={timezone}
                onChangeText={setTimezone}
              />
            </View>
          </View>

          {/* Security Options */}
          <Text style={[styles.sectionHeader, { marginTop: 24 }]}>SECURITY</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.actionRow} onPress={handleChangePassword}>
              <View style={styles.actionLeft}>
                <MaterialIcons name="lock-outline" size={20} color={colors.primary} />
                <Text style={styles.actionTitle}>Change Password</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.actionRow}>
              <View style={styles.actionLeft}>
                <MaterialIcons name="devices" size={20} color="#64748B" />
                <Text style={styles.actionTitle}>Active Devices</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={handleSaveProfile}>
          <MaterialIcons name="check" size={20} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Update Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#F9F9F9',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: 'bold',
    color: '#0058BE',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#D8E2FF',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0058BE',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  userRole: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    marginTop: 2,
  },
  formSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  fieldRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldInput: {
    fontSize: typography.sizes.base,
    color: colors.text,
    paddingVertical: 2,
    fontWeight: '500',
  },
  fieldInputDisabled: {
    color: '#94A3B8',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F9F9F9',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  saveBtn: {
    height: 52,
    backgroundColor: '#0058BE',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.base,
    fontWeight: 'bold',
  },
});
