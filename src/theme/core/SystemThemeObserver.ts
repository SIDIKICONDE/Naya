import { Appearance, ColorSchemeName } from 'react-native';
import { ColorScheme } from '../types/ThemeTypes';

class SystemThemeObserver {
  private static instance: SystemThemeObserver;
  private listeners: Set<(theme: ColorScheme) => void> = new Set();

  private constructor() {}

  public async initialize(): Promise<void> {
    this.initializeAppearanceListener();
  }

  public static getInstance(): SystemThemeObserver {
    if (!SystemThemeObserver.instance) {
      SystemThemeObserver.instance = new SystemThemeObserver();
    }
    return SystemThemeObserver.instance;
  }

  private initializeAppearanceListener(): void {
    Appearance.addChangeListener(({ colorScheme }) => {
      this.notifyListeners(this.normalizeColorScheme(colorScheme));
    });
  }

  public getCurrentSystemTheme(): ColorScheme {
    return this.normalizeColorScheme(Appearance.getColorScheme());
  }

  public subscribe(listener: (theme: ColorScheme) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(theme: ColorScheme): void {
    this.listeners.forEach(listener => listener(theme));
  }

  private normalizeColorScheme(colorScheme: ColorSchemeName): ColorScheme {
    return (colorScheme as ColorScheme) || 'light';
  }
}

export default SystemThemeObserver;