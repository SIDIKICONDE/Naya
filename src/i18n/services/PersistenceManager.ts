/**
 * Gestionnaire de persistance pour les paramètres i18n
 * Sauvegarde et récupère les préférences linguistiques de l'utilisateur
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SupportedLanguage, CurrencyCode } from '../types';
import { STORAGE_KEYS, SUPPORTED_LANGUAGES, DEFAULT_CURRENCIES } from '../constants';

/**
 * Structure des paramètres locaux sauvegardés
 */
interface LocaleSettings {
  language: SupportedLanguage;
  currency: CurrencyCode;
  dateFormat?: string;
  numberFormat?: {
    decimal: string;
    thousands: string;
  };
  lastUpdated: number;
}

/**
 * Gestionnaire de persistance des paramètres i18n
 */
export class PersistenceManager {
  /**
   * Sauvegarde la langue sélectionnée
   */
  public async saveLanguage(language: SupportedLanguage): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
      
      // Mise à jour des paramètres complets
      await this.updateLocaleSettings({ language });
      
      console.log(`[PersistenceManager] Language saved: ${language}`);
      
    } catch (error) {
      console.error('[PersistenceManager] Failed to save language:', error);
      throw error;
    }
  }

  /**
   * Récupère la langue sauvegardée
   */
  public async getStoredLanguage(): Promise<SupportedLanguage | null> {
    try {
      const storedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      
      if (storedLanguage && this.isValidLanguage(storedLanguage)) {
        return storedLanguage as SupportedLanguage;
      }
      
      return null;
      
    } catch (error) {
      console.error('[PersistenceManager] Failed to get stored language:', error);
      return null;
    }
  }

  /**
   * Sauvegarde la devise sélectionnée
   */
  public async saveCurrency(currency: CurrencyCode): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
      
      // Mise à jour des paramètres complets
      await this.updateLocaleSettings({ currency });
      
      console.log(`[PersistenceManager] Currency saved: ${currency}`);
      
    } catch (error) {
      console.error('[PersistenceManager] Failed to save currency:', error);
      throw error;
    }
  }

  /**
   * Récupère la devise sauvegardée
   */
  public async getStoredCurrency(): Promise<CurrencyCode | null> {
    try {
      const storedCurrency = await AsyncStorage.getItem(STORAGE_KEYS.CURRENCY);
      
      if (storedCurrency && this.isValidCurrency(storedCurrency)) {
        return storedCurrency as CurrencyCode;
      }
      
      return null;
      
    } catch (error) {
      console.error('[PersistenceManager] Failed to get stored currency:', error);
      return null;
    }
  }

  /**
   * Sauvegarde les paramètres locaux complets
   */
  public async saveLocaleSettings(settings: Partial<LocaleSettings>): Promise<void> {
    try {
      const currentSettings = await this.getLocaleSettings();
      
      const updatedSettings: LocaleSettings = {
        ...currentSettings,
        ...settings,
        lastUpdated: Date.now(),
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.LOCALE_SETTINGS,
        JSON.stringify(updatedSettings)
      );
      
      console.log('[PersistenceManager] Locale settings saved:', updatedSettings);
      
    } catch (error) {
      console.error('[PersistenceManager] Failed to save locale settings:', error);
      throw error;
    }
  }

  /**
   * Récupère les paramètres locaux complets
   */
  public async getLocaleSettings(): Promise<LocaleSettings> {
    try {
      const storedSettings = await AsyncStorage.getItem(STORAGE_KEYS.LOCALE_SETTINGS);
      
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        
        // Validation et migration des données si nécessaire
        return this.validateAndMigrateSettings(parsed);
      }
      
      // Paramètres par défaut
      return this.getDefaultLocaleSettings();
      
    } catch (error) {
      console.error('[PersistenceManager] Failed to get locale settings:', error);
      return this.getDefaultLocaleSettings();
    }
  }

  /**
   * Met à jour partiellement les paramètres locaux
   */
  private async updateLocaleSettings(updates: Partial<LocaleSettings>): Promise<void> {
    const currentSettings = await this.getLocaleSettings();
    await this.saveLocaleSettings({ ...currentSettings, ...updates });
  }

  /**
   * Valide et migre les paramètres si nécessaire
   */
  private validateAndMigrateSettings(settings: any): LocaleSettings {
    const defaultSettings = this.getDefaultLocaleSettings();
    
    // Validation de la langue
    if (!settings.language || !this.isValidLanguage(settings.language)) {
      settings.language = defaultSettings.language;
    }
    
    // Validation de la devise
    if (!settings.currency || !this.isValidCurrency(settings.currency)) {
      settings.currency = DEFAULT_CURRENCIES[settings.language as SupportedLanguage] || defaultSettings.currency;
    }
    
    // Ajout des champs manquants
    return {
      ...defaultSettings,
      ...settings,
      lastUpdated: settings.lastUpdated || Date.now(),
    };
  }

  /**
   * Récupère les paramètres par défaut
   */
  private getDefaultLocaleSettings(): LocaleSettings {
    const language = SUPPORTED_LANGUAGES[0]; // Première langue supportée
    
    return {
      language,
      currency: DEFAULT_CURRENCIES[language],
      lastUpdated: Date.now(),
    };
  }

  /**
   * Vérifie si une langue est valide
   */
  private isValidLanguage(language: string): boolean {
    return SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);
  }

  /**
   * Vérifie si une devise est valide
   */
  private isValidCurrency(currency: string): boolean {
    const validCurrencies = Object.values(DEFAULT_CURRENCIES);
    return validCurrencies.includes(currency as CurrencyCode);
  }

  /**
   * Vide toutes les données de persistance
   */
  public async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.LANGUAGE),
        AsyncStorage.removeItem(STORAGE_KEYS.CURRENCY),
        AsyncStorage.removeItem(STORAGE_KEYS.LOCALE_SETTINGS),
      ]);
      
      console.log('[PersistenceManager] All data cleared');
      
    } catch (error) {
      console.error('[PersistenceManager] Failed to clear data:', error);
      throw error;
    }
  }

  /**
   * Exporte toutes les données sauvegardées
   */
  public async exportData(): Promise<{
    language: SupportedLanguage | null;
    currency: CurrencyCode | null;
    localeSettings: LocaleSettings;
  }> {
    try {
      const [language, currency, localeSettings] = await Promise.all([
        this.getStoredLanguage(),
        this.getStoredCurrency(),
        this.getLocaleSettings(),
      ]);

      return {
        language,
        currency,
        localeSettings,
      };
      
    } catch (error) {
      console.error('[PersistenceManager] Failed to export data:', error);
      throw error;
    }
  }

  /**
   * Importe des données de configuration
   */
  public async importData(data: {
    language?: SupportedLanguage;
    currency?: CurrencyCode;
    localeSettings?: Partial<LocaleSettings>;
  }): Promise<void> {
    try {
      if (data.language && this.isValidLanguage(data.language)) {
        await this.saveLanguage(data.language);
      }
      
      if (data.currency && this.isValidCurrency(data.currency)) {
        await this.saveCurrency(data.currency);
      }
      
      if (data.localeSettings) {
        await this.saveLocaleSettings(data.localeSettings);
      }
      
      console.log('[PersistenceManager] Data imported successfully');
      
    } catch (error) {
      console.error('[PersistenceManager] Failed to import data:', error);
      throw error;
    }
  }

  /**
   * Récupère les informations de debug
   */
  public async getDebugInfo(): Promise<{
    storageKeys: typeof STORAGE_KEYS;
    storedValues: Record<string, string | null>;
    settings: LocaleSettings;
  }> {
    const storedValues: Record<string, string | null> = {};
    
    for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
      try {
        storedValues[key] = await AsyncStorage.getItem(storageKey);
      } catch (error) {
        storedValues[key] = `Error: ${error}`;
      }
    }

    const settings = await this.getLocaleSettings();

    return {
      storageKeys: STORAGE_KEYS,
      storedValues,
      settings,
    };
  }
}