import { Theme } from '../types/ThemeTypes';
import { palette, semanticColors, audioColors } from '../constants/colors';

export const lightTheme: Theme = {
  colorScheme: 'light',
  colors: {
    // Couleurs primaires
    primary: palette.blue500,
    primaryDark: palette.blue700,
    primaryLight: palette.blue100,
    
    // Couleurs secondaires
    secondary: palette.gray500,
    secondaryDark: palette.gray700,
    secondaryLight: palette.gray300,
    
    // Couleurs de fond
    background: palette.white,
    surface: palette.gray50,
    surfaceVariant: palette.gray100,
    
    // Couleurs de texte
    textPrimary: palette.gray900,
    textSecondary: palette.gray700,
    textDisabled: palette.gray500,
    
    // Couleurs d'état
    error: semanticColors.error,
    warning: semanticColors.warning,
    success: semanticColors.success,
    info: semanticColors.info,
    
    // Couleurs de bordure
    border: palette.gray200,
    divider: palette.gray200,
    
    // Couleurs d'interaction
    ripple: palette.gray200,
    highlight: palette.blue50,
    
    // Couleurs système
    statusBar: palette.white,
    navigationBar: palette.white,
    
    // Couleurs audio spécialisées
    audio: audioColors.light,
  },
  typography: {
    h1: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '700' as const,
    },
    h2: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '600' as const,
    },
    body1: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
    },
    body2: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as const,
    },
    button: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '500' as const,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400' as const,
    },
  },
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};