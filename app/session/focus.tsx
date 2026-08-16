import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { typography } from '@/theme/typography';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// Tổng thời gian mặc định của session (ví dụ: 25 phút = 1500 giây)
const TOTAL_DURATION_SECONDS = 25 * 60;

export default function FocusSessionScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

  // State quản lý bộ đếm thời gian
  const [remainingSeconds, setRemainingSeconds] = useState(TOTAL_DURATION_SECONDS);
  const [isPaused, setIsPaused] = useState(false);

  // Animation values cho 2 đốm sáng background
  const translateX1 = useSharedValue(0);
  const translateY1 = useSharedValue(0);
  const scale1 = useSharedValue(1);

  const translateX2 = useSharedValue(0);
  const translateY2 = useSharedValue(0);
  const scale2 = useSharedValue(1);

  // 1. Quản lý đếm ngược (Timer Interval)
  useEffect(() => {
    if (isPaused || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, remainingSeconds]);

  // 2. Chuyển đổi giây sang định dạng mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 3. Tính % thanh tiến trình (Chạy từ 0% lên 100% khi thời gian cạn về 0)
  const elapsedSeconds = TOTAL_DURATION_SECONDS - remainingSeconds;
  const progressPercent = Math.min(
    100,
    Math.max(0, (elapsedSeconds / TOTAL_DURATION_SECONDS) * 100)
  );

  // Animation hiệu ứng đốm sáng
  useEffect(() => {
    translateX1.value = withRepeat(
      withSequence(
        withTiming(50, { duration: 4000, easing: Easing.inOut(Easing.quad) }),
        withTiming(-30, { duration: 5000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
    translateY1.value = withRepeat(
      withSequence(
        withTiming(-40, { duration: 4500, easing: Easing.inOut(Easing.quad) }),
        withTiming(30, { duration: 4000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 4500, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
    scale1.value = withRepeat(
      withSequence(withTiming(1.3, { duration: 5000 }), withTiming(0.9, { duration: 4000 })),
      -1,
      true
    );

    translateX2.value = withRepeat(
      withSequence(
        withTiming(-60, { duration: 5500, easing: Easing.inOut(Easing.quad) }),
        withTiming(20, { duration: 4500, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 5000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
    translateY2.value = withRepeat(
      withSequence(
        withTiming(50, { duration: 5000, easing: Easing.inOut(Easing.quad) }),
        withTiming(-20, { duration: 4000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 4500, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
    scale2.value = withRepeat(
      withSequence(withTiming(0.8, { duration: 4500 }), withTiming(1.25, { duration: 5000 })),
      -1,
      true
    );
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX1.value },
      { translateY: translateY1.value },
      { scale: scale1.value },
    ],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX2.value },
      { translateY: translateY2.value },
      { scale: scale2.value },
    ],
  }));

  // This function is temporary
  const handleCloseEarly = () => {
    router.push({
      pathname: "/session/post-review",
      params: {
        sessionId: sessionId
      }
    })
  };
  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/today");
    }
  }
  const handleEndEarly = () => {
    Alert.alert('Stop the focus session?', 'Are you sure to stop the focus session early?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End early',
        style: 'destructive',
        onPress: () => handleCloseEarly(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Animated Glows */}
      <Animated.View style={[styles.glowTopLeft, animatedStyle1]} />
      <Animated.View style={[styles.glowBottomRight, animatedStyle2]} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
          <MaterialIcons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.dndBadge}>
          <MaterialIcons name="do-not-disturb-on" size={16} color="#3CDDC7" />
          <Text style={styles.dndText}>DO NOT DISTURB</Text>
        </View>

        <View style={styles.spacer} />
      </View>

      {/* Central Content */}
      <View style={styles.centerCluster}>
        <View style={styles.labelSection}>
          <View style={styles.statusRow}>
            <View style={[styles.pulseDot, isPaused && styles.pulseDotPaused]} />
            <Text style={styles.statusText}>
              {isPaused ? 'SESSION PAUSED' : 'HIGH FOCUS ACTIVE'}
            </Text>
          </View>
          <Text style={styles.taskTitle}>Design Dashboard</Text>
        </View>

        {/* Dynamic Countdown Display */}
        <View style={styles.timerSection}>
          <Text style={styles.timerText}>{formatTime(remainingSeconds)}</Text>
          <Text style={styles.remainingText}>
            {remainingSeconds === 0 ? 'Completed!' : 'Remaining'}
          </Text>
        </View>

        {/* Dynamic Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercent.toFixed(1)}%` as `${number}%` },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Footer Controls */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.pauseBtn}
          onPress={() => setIsPaused((prev) => !prev)}
        >
          <MaterialIcons
            name={isPaused ? 'play-arrow' : 'pause'}
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.pauseBtnText}>{isPaused ? 'Resume' : 'Pause'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.endBtn} onPress={handleEndEarly}>
          <MaterialIcons name="stop-circle" size={24} color="#FCA5A5" />
          <Text style={styles.endBtnText}>End Early</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0B2E',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  glowTopLeft: {
    position: 'absolute',
    top: '15%',
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(132, 85, 239, 0.18)',
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: '20%',
    right: -60,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(60, 221, 199, 0.12)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  closeBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dndBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  dndText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    letterSpacing: 1,
  },
  spacer: { width: 48, height: 48 },
  centerCluster: { alignItems: 'center', justifyContent: 'center', gap: 36 },
  labelSection: { alignItems: 'center', gap: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3CDDC7' },
  pulseDotPaused: { backgroundColor: '#FBBF24' },
  statusText: { color: '#3CDDC7', fontSize: typography.sizes.xs, fontWeight: 'bold', letterSpacing: 2 },
  taskTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '600', textAlign: 'center' },
  timerSection: { alignItems: 'center' },
  timerText: {
    color: '#FFFFFF',
    fontSize: 100,
    fontWeight: '800',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
    lineHeight: 108,
  },
  remainingText: { color: 'rgba(255, 255, 255, 0.6)', fontSize: typography.sizes.base, marginTop: 4 },
  progressContainer: { alignItems: 'center', width: '100%' },
  progressBarBg: {
    width: 256,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', backgroundColor: '#3CDDC7', borderRadius: 3 },
  footer: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  pauseBtn: {
    flex: 1,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pauseBtnText: { color: '#FFFFFF', fontSize: typography.sizes.lg, fontWeight: '600' },
  endBtn: {
    flex: 1,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  endBtnText: { color: '#FCA5A5', fontSize: typography.sizes.lg, fontWeight: '600' },
});