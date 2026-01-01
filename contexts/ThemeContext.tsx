import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { darkTheme, lightTheme, Theme } from '../contants/theme';

const STORAGE_KEY = '@app_theme';

type ThemeContextType = Theme & { toggleTheme: () => void };

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ColorSchemeName>('light');

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTheme === 'light' || storedTheme === 'dark') {
        setThemeMode(storedTheme);
      } else {
        const deviceTheme = Appearance.getColorScheme();
        setThemeMode(deviceTheme || 'light');
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    const listener = ({ colorScheme }: { colorScheme: ColorSchemeName }) => {
      AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
        if (!stored) setThemeMode(colorScheme || 'light');
      });
    };
    const subscription = Appearance.addChangeListener(listener);
    return () => subscription.remove();
  }, []);

  const toggleTheme = useCallback(async () => {
    const newTheme = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newTheme);
    await AsyncStorage.setItem(STORAGE_KEY, newTheme);
  }, [themeMode]);

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const value = { ...theme, toggleTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
