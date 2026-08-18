import 'react-native-url-polyfill/auto';
import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { getProfile } from '@/features/auth/api';
import { useAuthStore } from '@/stores/authStore';
import { setUnauthorizedHandler } from '@/lib/api-client';
import * as SplashScreen from 'expo-splash-screen';
import CustomSplashScreen from '../components/CustomSplashScreen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { session, initialized, setSession, setInitialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => setSession(null));
    return () => setUnauthorizedHandler(null);
  }, [setSession]);

  useEffect(() => {
    getProfile().then((user) => setSession({ access_token: '', user: user as never })).catch(() => setSession(null)).finally(() => setInitialized(true));
  }, [setInitialized, setSession]);

  const navigationState = useRootNavigationState();
  useEffect(() => {
    if (!initialized || !navigationState?.key || showSplash) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!session && !inAuthGroup) router.replace('/(auth)/login');
    else if (session && inAuthGroup) router.replace('/(tabs)/today');
  }, [session, initialized, segments, navigationState?.key, showSplash, router]);

  useEffect(() => { if (showSplash) SplashScreen.hideAsync(); }, [showSplash]);
  if (showSplash || !initialized) return <CustomSplashScreen isReady={initialized} onFinish={() => setShowSplash(false)} />;
  return <QueryClientProvider client={queryClient}><Slot /></QueryClientProvider>;
}
