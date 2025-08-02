/**
 * Hook pour gérer automatiquement le thème basé sur le système
 * Détecte et suit les changements du thème système
 */

import { useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { Theme, lightTheme, darkTheme } from '../config/themes';

type ThemeMode = 'light' | 'dark';

interface UseSystemThemeReturn {
  theme: Theme;
  colorScheme: ThemeMode;
  isDark: boolean;
}

export const useSystemTheme = (): UseSystemThemeReturn => {
  const [colorScheme, setColorScheme] = useState<ThemeMode>(() => {
    const initialScheme = Appearance.getColorScheme();
    return initialScheme === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: newColorScheme }: { colorScheme: ColorSchemeName }) => {
      setColorScheme(newColorScheme === 'dark' ? 'dark' : 'light');
    });

    return () => subscription?.remove();
  }, []);

  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const isDark = colorScheme === 'dark';

  return {
    theme,
    colorScheme,
    isDark,
  };
};