import 'react-native-url-polyfill/auto';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { getProfile } from '@/features/auth/api';
import { useAuthStore } from '@/stores/authStore';
import { setUnauthorizedHandler } from '@/lib/api-client';
import * as SplashScreen from 'expo-splash-screen';
import CustomSplashScreen from '../components/CustomSplashScreen';
import {
  cancelAllNotifications,
  consumeLaunchNotification,
  onNotificationTapped,
  syncScheduledNotifications,
} from '@/features/notifications/service';
import { routeForNotification } from '@/features/notifications/scheduling';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { session, initialized, setSession, setInitialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const pendingRoute = useRef<string | null>(null);

  useEffect(() => {
    setUnauthorizedHandler(() => setSession(null));
    return () => setUnauthorizedHandler(null);
  }, [setSession]);

  useEffect(() => {
    getProfile().then((user) => setSession({ access_token: '', user: user as never })).catch(() => setSession(null)).finally(() => setInitialized(true));
  }, [setInitialized, setSession]);

  const navigationState = useRootNavigationState();
  const navigatorReady = Boolean(navigationState?.key) && !showSplash;

  useEffect(() => {
    if (!initialized || !navigatorReady) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!session && !inAuthGroup) router.replace('/(auth)/login');
    else if (session && inAuthGroup) router.replace('/(tabs)/home');
  }, [session, initialized, segments, navigatorReady, router]);

  // Keep the scheduled reminders in step with the signed-in account.
  useEffect(() => {
    if (!initialized) return;
    if (session) void syncScheduledNotifications();
    else void cancelAllNotifications();
  }, [session, initialized]);

  // A tapped notification opens the screen it points at, per the notification flow.
  useEffect(() => {
    void consumeLaunchNotification().then((data) => {
      if (data) pendingRoute.current = routeForNotification(data);
    });
    return onNotificationTapped((data) => {
      const route = routeForNotification(data);
      if (navigatorReady && useAuthStore.getState().session) router.push(route as never);
      else pendingRoute.current = route;
    });
  }, [navigatorReady, router]);

  // Deliver a notification that arrived before the navigator or session was ready.
  useEffect(() => {
    if (!navigatorReady || !session || !pendingRoute.current) return;
    const route = pendingRoute.current;
    pendingRoute.current = null;
    router.push(route as never);
  }, [navigatorReady, session, router]);

  useEffect(() => { if (showSplash) SplashScreen.hideAsync(); }, [showSplash]);
  // Stable identity: an inline arrow here re-triggered the splash effect on every render.
  const finishSplash = useCallback(() => setShowSplash(false), []);
  if (showSplash || !initialized) return <CustomSplashScreen isReady={initialized} onFinish={finishSplash} />;
  return <QueryClientProvider client={queryClient}><Slot /></QueryClientProvider>;
}
