import { useState, useEffect } from 'react';
import { ColorScheme } from '../types/ThemeTypes';
import SystemThemeObserver from '../core/SystemThemeObserver';

export const useSystemTheme = (): ColorScheme => {
  const [systemTheme, setSystemTheme] = useState<ColorScheme>(
    SystemThemeObserver.getInstance().getCurrentSystemTheme()
  );

  useEffect(() => {
    const unsubscribe = SystemThemeObserver.getInstance().subscribe((theme) => {
      setSystemTheme(theme);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return systemTheme;
};