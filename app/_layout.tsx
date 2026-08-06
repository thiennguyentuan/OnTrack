import 'react-native-url-polyfill/auto';
import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import * as SplashScreen from 'expo-splash-screen';
import CustomSplashScreen from '../components/CustomSplashScreen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { session, initialized, setSession, setInitialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    }).catch((e) => {
      console.error('Supabase init error:', e);
      setInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!initialized || !navigationState?.key || showSplash) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)/today');
    }

  }, [session, initialized, segments, navigationState?.key, showSplash]);

  useEffect(() => {
    // Hide the native splash screen as soon as the JS Custom Splash Screen is ready to render
    if (showSplash) {
      SplashScreen.hideAsync();
    }
  }, [showSplash]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash || !initialized) {
    return <CustomSplashScreen isReady={initialized} onFinish={handleSplashFinish} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Slot />
    </QueryClientProvider>
  );
}
