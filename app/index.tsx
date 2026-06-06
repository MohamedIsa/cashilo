import { useAppTheme } from '@/contexts/ThemeContext';
import { hasCompletedOnboarding } from '@/storage';
import { Redirect, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const theme = useAppTheme();
  const [done, setDone] = useState<boolean | null>(null);

  useEffect(() => {
    hasCompletedOnboarding().then(setDone);
  }, []);

  // While we read the onboarding flag, show a neutral splash.
  if (done === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  // '/onboarding' is cast as Href because expo-router regenerates its typed
  // route union at dev-server start; the cast keeps tsc happy in the meantime.
  const target = (done ? '/(tabs)/Dashboard' : '/onboarding') as Href;
  return <Redirect href={target} />;
}
