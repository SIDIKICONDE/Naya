import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorScheme } from '../types/ThemeTypes';

const THEME_STORAGE_KEY = '@theme_preference';

class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: ColorScheme | 'system' = 'system';
  private listeners: Set<(theme: ColorScheme | 'system') => void> = new Set();

  private constructor() {}

  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  public async initialize(): Promise<void> {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        this.currentTheme = savedTheme as ColorScheme | 'system';
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du thème:', error);
    }
  }

  public getCurrentTheme(): ColorScheme | 'system' {
    return this.currentTheme;
  }

  public async setTheme(theme: ColorScheme | 'system'): Promise<void> {
    try {
      this.currentTheme = theme;
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      this.notifyListeners();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du thème:', error);
    }
  }

  public subscribe(listener: (theme: ColorScheme | 'system') => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentTheme));
  }
}

export default ThemeManager;