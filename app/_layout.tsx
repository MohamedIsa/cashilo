import 'react-native-get-random-values';
import AnimatedSplash from '@/components/AnimatedSplash';
import { ThemeProvider } from '@/contexts/ThemeContext';
import '@/i18n';
import { getLanguage } from '@/storage';
import { configureNotificationHandler, createAndroidChannel } from '@/utils/notifications';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { I18nManager } from 'react-native';

// Keep native splash visible until we're ready to animate it away ourselves.
SplashScreen.preventAutoHideAsync().catch(() => {});
configureNotificationHandler();

export default function RootLayout() {
  const [rtlReady, setRtlReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    createAndroidChannel();
    getLanguage().then((lang) => {
      const shouldBeRTL = lang === 'ar';
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.forceRTL(shouldBeRTL);
      }
      setRtlReady(true);
    });
  }, []);

  // Hide the native splash the moment JS is ready; our AnimatedSplash takes over seamlessly.
  useEffect(() => {
    if (rtlReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [rtlReady]);

  if (!rtlReady) return null;

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      {!splashDone && <AnimatedSplash onDone={() => setSplashDone(true)} />}
    </ThemeProvider>
  );
}
