import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeContextValue, Theme, ColorScheme } from '../types/ThemeTypes';
import ThemeManager from '../core/ThemeManager';
import SystemThemeObserver from '../core/SystemThemeObserver';
import { useSystemTheme } from '../hooks/useSystemTheme';
import { lightTheme } from '../themes/lightTheme';
import { darkTheme } from '../themes/darkTheme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const systemTheme = useSystemTheme();
  const [themePreference, setThemePreference] = useState<ColorScheme | 'system'>('system');
  const [currentTheme, setCurrentTheme] = useState<Theme>(lightTheme);

  useEffect(() => {
    const initializeTheme = async () => {
      await ThemeManager.getInstance().initialize();
      await SystemThemeObserver.getInstance().initialize();
      const savedTheme = ThemeManager.getInstance().getCurrentTheme();
      setThemePreference(savedTheme);
      setIsInitialized(true);
    };

    initializeTheme();
  }, []);

  useEffect(() => {
    const unsubscribe = ThemeManager.getInstance().subscribe((theme) => {
      setThemePreference(theme);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const effectiveTheme = themePreference === 'system' ? systemTheme : themePreference;
    setCurrentTheme(effectiveTheme === 'dark' ? darkTheme : lightTheme);
  }, [themePreference, systemTheme]);

  const setTheme = async (theme: ColorScheme | 'system') => {
    await ThemeManager.getInstance().setTheme(theme);
  };

  if (!isInitialized) {
    return null; // Ou un composant de chargement si nécessaire
  }

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        systemTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé à l\'intérieur d\'un ThemeProvider');
  }
  return context;
};