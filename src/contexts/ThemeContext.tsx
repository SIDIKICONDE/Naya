/**
 * Contexte de thème pour l'application
 * Fournit le thème actuel à tous les composants enfants
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { Theme } from '../config/themes';
import { useSystemTheme } from '../hooks/useSystemTheme';

interface ThemeContextValue {
  theme: Theme;
  colorScheme: 'light' | 'dark';
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme, colorScheme, isDark } = useSystemTheme();

  const value: ThemeContextValue = {
    theme,
    colorScheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};