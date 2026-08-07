import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

interface CustomSplashScreenProps {
  onFinish: () => void;
  isReady: boolean;
}

export default function CustomSplashScreen({ onFinish, isReady }: CustomSplashScreenProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 100,
      duration: 2000, // 2s loading simulation
      useNativeDriver: false,
    }).start(() => {
      if (isReady) {
        onFinish();
      }
    });
  }, [isReady, onFinish, progress]);

  const width = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.container}>
      {/* Background Gradient (simulated with solid color for simplicity) */}
      
      <View style={styles.content}>
        <View style={styles.logoBox}>
          <Image source={require('../assets/splash.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.title}>OnTrack</Text>
        <Text style={styles.subtitle}>Stay focused. Stay on track.</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBarFill, { width }]} />
        </View>
        <Text style={styles.loadingText}>PREPARING YOUR FOCUS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoBox: {
    width: 96,
    height: 96,
    backgroundColor: colors.primary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 8,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    color: colors.muted,
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 64,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  progressBarContainer: {
    width: 240,
    height: 6,
    backgroundColor: '#eeeeee',
    borderRadius: 100,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: typography.sizes.sm,
    color: '#727785',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '600',
  },
});
