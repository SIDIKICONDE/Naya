/**
 * Système de thèmes pour l'application audio
 * Support automatique du mode dark/light basé sur le système
 */

export interface Theme {
  colors: {
    // Couleurs principales
    primary: string;
    primaryVariant: string;
    secondary: string;
    secondaryVariant: string;
    
    // Couleurs de fond
    background: string;
    surface: string;
    surfaceVariant: string;
    
    // Couleurs de texte
    onPrimary: string;
    onSecondary: string;
    onBackground: string;
    onSurface: string;
    
    // Couleurs d'état
    error: string;
    onError: string;
    warning: string;
    success: string;
    info: string;
    
    // Couleurs spécifiques audio
    audioLevel: {
      low: string;
      medium: string;
      high: string;
      peak: string;
    };
    
    // Couleurs d'interface
    border: string;
    borderVariant: string;
    disabled: string;
    overlay: string;
    shadow: string;
    
    // Couleurs de module audio
    knob: string;
    slider: string;
    button: string;
    led: {
      off: string;
      on: string;
      active: string;
    };
  };
  
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  
  borderRadius: {
    small: number;
    medium: number;
    large: number;
    full: number;
  };
  
  typography: {
    fontFamily: string;
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    fontWeight: {
      light: '300';
      regular: '400';
      medium: '500';
      bold: '700';
    };
  };
  
  shadows: {
    small: object;
    medium: object;
    large: object;
  };
}

export const lightTheme: Theme = {
  colors: {
    primary: '#2196F3',
    primaryVariant: '#1976D2',
    secondary: '#FF5722',
    secondaryVariant: '#D84315',
    
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#1C1C1C',
    onSurface: '#1C1C1C',
    
    error: '#F44336',
    onError: '#FFFFFF',
    warning: '#FF9800',
    success: '#4CAF50',
    info: '#2196F3',
    
    audioLevel: {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#FF5722',
      peak: '#F44336',
    },
    
    border: '#E0E0E0',
    borderVariant: '#BDBDBD',
    disabled: '#9E9E9E',
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.1)',
    
    knob: '#424242',
    slider: '#2196F3',
    button: '#2196F3',
    led: {
      off: '#9E9E9E',
      on: '#4CAF50',
      active: '#FF5722',
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    small: 4,
    medium: 8,
    large: 16,
    full: 9999,
  },
  
  typography: {
    fontFamily: 'System',
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 32,
    },
    fontWeight: {
      light: '300' as const,
      regular: '400' as const,
      medium: '500' as const,
      bold: '700' as const,
    },
  },
  
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};

export const darkTheme: Theme = {
  colors: {
    primary: '#64B5F6',
    primaryVariant: '#42A5F5',
    secondary: '#FF7043',
    secondaryVariant: '#FF5722',
    
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
    
    onPrimary: '#000000',
    onSecondary: '#000000',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
    
    error: '#CF6679',
    onError: '#000000',
    warning: '#FFB74D',
    success: '#81C784',
    info: '#64B5F6',
    
    audioLevel: {
      low: '#81C784',
      medium: '#FFB74D',
      high: '#FF7043',
      peak: '#CF6679',
    },
    
    border: '#373737',
    borderVariant: '#4A4A4A',
    disabled: '#6A6A6A',
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    
    knob: '#E0E0E0',
    slider: '#64B5F6',
    button: '#64B5F6',
    led: {
      off: '#6A6A6A',
      on: '#81C784',
      active: '#FF7043',
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    small: 4,
    medium: 8,
    large: 16,
    full: 9999,
  },
  
  typography: {
    fontFamily: 'System',
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 32,
    },
    fontWeight: {
      light: '300' as const,
      regular: '400' as const,
      medium: '500' as const,
      bold: '700' as const,
    },
  },
  
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 3,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};