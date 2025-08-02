/**
 * Configuration React Native pour le système i18n
 * Intégration spécifique à React Native avec détection automatique
 */

import { NativeModules, Platform } from 'react-native';
import type { I18nConfig, SupportedLanguage } from '../types';
import { DEFAULT_I18N_CONFIG } from '../constants';

/**
 * Configuration spécifique à React Native
 */
export const REACT_NATIVE_I18N_CONFIG: Partial<I18nConfig> = {
  ...DEFAULT_I18N_CONFIG,
  
  // Configuration React Native spécifique
  interpolation: {
    ...DEFAULT_I18N_CONFIG.interpolation,
    // React Native échappe automatiquement les valeurs
    escapeValue: false,
  },
  
  // Debug activé uniquement en développement
  debug: __DEV__,
  
  // Persistance activée par défaut sur mobile
  persistence: {
    enabled: true,
    storageKey: '@naya/i18n/language',
  },
};

/**
 * Détecte la langue du système React Native
 */
export async function detectReactNativeLanguage(): Promise<SupportedLanguage | null> {
  try {
    let systemLanguage: string;

    if (Platform.OS === 'ios') {
      // iOS - utilise SettingsManager
      const settingsManager = NativeModules.SettingsManager;
      if (settingsManager?.settings) {
        systemLanguage = 
          settingsManager.settings.AppleLanguages?.[0] || 
          settingsManager.settings.AppleLocale || 
          'en';
      } else {
        systemLanguage = 'en';
      }
    } else {
      // Android - utilise I18nManager
      const i18nManager = NativeModules.I18nManager;
      systemLanguage = i18nManager?.localeIdentifier || 'en';
    }

    // Extraction du code de langue (fr-FR -> fr)
    const languageCode = systemLanguage.split('-')[0].split('_')[0].toLowerCase();
    
    // Vérification si supporté
    const supportedLanguages: SupportedLanguage[] = ['fr', 'en', 'es', 'de', 'it'];
    
    if (supportedLanguages.includes(languageCode as SupportedLanguage)) {
      return languageCode as SupportedLanguage;
    }

    return null;
    
  } catch (error) {
    console.warn('[ReactNative-i18n] Language detection failed:', error);
    return null;
  }
}

/**
 * Vérifie si React Native est en mode RTL
 */
export function isReactNativeRTL(): boolean {
  try {
    if (Platform.OS === 'android') {
      return NativeModules.I18nManager?.isRTL || false;
    }
    
    // iOS n'a pas de module natif pour RTL par défaut
    return false;
    
  } catch (error) {
    console.warn('[ReactNative-i18n] RTL detection failed:', error);
    return false;
  }
}

/**
 * Force le mode RTL sur React Native
 */
export function forceReactNativeRTL(isRTL: boolean): void {
  try {
    if (Platform.OS === 'android' && NativeModules.I18nManager) {
      NativeModules.I18nManager.forceRTL(isRTL);
    }
  } catch (error) {
    console.warn('[ReactNative-i18n] Force RTL failed:', error);
  }
}

/**
 * Redémarre l'application React Native (Android uniquement)
 */
export function restartReactNativeApp(): void {
  try {
    if (Platform.OS === 'android' && NativeModules.DevSettings) {
      NativeModules.DevSettings.reload();
    } else {
      console.warn('[ReactNative-i18n] App restart not available on this platform');
    }
  } catch (error) {
    console.warn('[ReactNative-i18n] App restart failed:', error);
  }
}

/**
 * Récupère les informations de localisation React Native
 */
export async function getReactNativeLocaleInfo(): Promise<{
  language: string;
  region: string;
  currency: string;
  calendar: string;
  numberFormat: {
    decimal: string;
    grouping: string;
  };
}> {
  try {
    let localeInfo;

    if (Platform.OS === 'ios') {
      const settings = NativeModules.SettingsManager?.settings || {};
      
      localeInfo = {
        language: settings.AppleLanguages?.[0] || 'en',
        region: settings.AppleLocale?.split('_')[1] || 'US',
        currency: settings.AppleCurrency || 'USD',
        calendar: settings.AppleCalendar || 'gregorian',
        numberFormat: {
          decimal: '.',
          grouping: ',',
        },
      };
    } else {
      const i18nManager = NativeModules.I18nManager || {};
      const locale = i18nManager.localeIdentifier || 'en_US';
      const parts = locale.split('_');
      
      localeInfo = {
        language: parts[0] || 'en',
        region: parts[1] || 'US',
        currency: 'USD', // Pas d'API native directe sur Android
        calendar: 'gregorian',
        numberFormat: {
          decimal: '.',
          grouping: ',',
        },
      };
    }

    return localeInfo;
    
  } catch (error) {
    console.warn('[ReactNative-i18n] Locale info failed:', error);
    
    // Fallback
    return {
      language: 'en',
      region: 'US',
      currency: 'USD',
      calendar: 'gregorian',
      numberFormat: {
        decimal: '.',
        grouping: ',',
      },
    };
  }
}

/**
 * Configuration optimisée pour React Native
 */
export function createReactNativeI18nConfig(overrides: Partial<I18nConfig> = {}): I18nConfig {
  return {
    ...REACT_NATIVE_I18N_CONFIG,
    ...overrides,
  } as I18nConfig;
}