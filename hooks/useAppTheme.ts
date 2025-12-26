// hooks/useAppTheme.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { darkTheme, lightTheme, Theme } from '../contants/theme';

const STORAGE_KEY = '@app_theme';

export const useAppTheme = (): Theme & { toggleTheme: () => void } => {
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

  return { ...theme, toggleTheme };
};
export default useAppTheme;
