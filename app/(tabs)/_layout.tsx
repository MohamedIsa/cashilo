import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="Dashboard"
        options={{
          title: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="Transactions"
        options={{
          title: 'Transactions',
          //TODO
        }}
      />
      <Tabs.Screen
        name="Goals"
        options={{
          title: 'My Goals',
        }}
      />
      <Tabs.Screen
        name="Reports"
        options={{
          title: 'Reports',
        }}
      />
      <Tabs.Screen
        name="Settings"
        options={{
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}
