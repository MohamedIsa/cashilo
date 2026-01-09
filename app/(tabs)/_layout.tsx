import { useAppTheme } from '@/contexts/ThemeContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Octicons from '@expo/vector-icons/Octicons';
import { router, Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const theme = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.primaryText,
        headerTitleStyle: {
          color: theme.headline,
          fontWeight: 'bold',
        },
        headerTitleAlign: 'center',
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: `${theme.secondary}33`,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: `${theme.primaryText}66`,
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerRight: () => (
          <Octicons
            name="bell"
            size={24}
            color={theme.primary}
            style={{ marginRight: 16 }}
            onPress={() => router.navigate('/(notification)')}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="Dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => (
            <MaterialIcons
              name="dashboard"
              size={24}
              color={focused ? theme.primary : `${theme.primaryText}66`}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ focused }) => (
            <AntDesign
              name="transaction"
              size={24}
              color={focused ? theme.primary : `${theme.primaryText}66`}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Goals"
        options={{
          title: 'My Goals',
          tabBarIcon: ({ focused }) => (
            <FontAwesome6
              name="list"
              size={24}
              color={focused ? theme.primary : `${theme.primaryText}66`}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ focused }) => (
            <MaterialIcons
              name="pie-chart"
              size={24}
              color={focused ? theme.primary : `${theme.primaryText}66`}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <AntDesign
              name="setting"
              size={24}
              color={focused ? theme.primary : `${theme.primaryText}66`}
            />
          ),
        }}
      />
    </Tabs>
  );
}
