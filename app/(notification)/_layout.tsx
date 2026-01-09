import { Stack } from 'expo-router';
import React from 'react';

export default function NotificationLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, navigationBarHidden: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
