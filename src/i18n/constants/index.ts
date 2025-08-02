/**
 * Constantes du système d'internationalisation
 * Centralise toutes les valeurs constantes utilisées dans le module i18n
 */

import type { SupportedLanguage, CurrencyCode, I18nConfig, LanguageMetadata } from '../types';

/**
 * Langue par défaut de l'application
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'fr';

/**
 * Langue de fallback en cas d'erreur
 */
export const FALLBACK_LANGUAGE: SupportedLanguage = 'en';

/**
 * Liste des langues supportées
 */
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['fr', 'en', 'es', 'de', 'it'];

/**
 * Devises par défaut par langue
 */
export const DEFAULT_CURRENCIES: Record<SupportedLanguage, CurrencyCode> = {
  fr: 'EUR',
  en: 'USD',
  es: 'EUR',
  de: 'EUR',
  it: 'EUR',
};

/**
 * Clé de stockage pour la persistance de la langue
 */
export const STORAGE_KEYS = {
  LANGUAGE: '@naya/language',
  CURRENCY: '@naya/currency',
  LOCALE_SETTINGS: '@naya/locale_settings',
} as const;

/**
 * Namespaces de traduction disponibles
 */
export const TRANSLATION_NAMESPACES = {
  COMMON: 'common',
  NAVIGATION: 'navigation',
  AUDIO: 'audio',
  FORMS: 'forms',
  ERRORS: 'errors',
  SYSTEM: 'system',
} as const;

/**
 * Configuration par défaut du système i18n
 */
export const DEFAULT_I18N_CONFIG: I18nConfig = {
  defaultLanguage: DEFAULT_LANGUAGE,
  fallbackLanguage: FALLBACK_LANGUAGE,
  supportedLanguages: SUPPORTED_LANGUAGES,
  interpolation: {
    escapeValue: false, // React échappe déjà les valeurs
    format: (value: any, format?: string, lng?: string) => {
      if (format === 'uppercase') return value.toUpperCase();
      if (format === 'lowercase') return value.toLowerCase();
      if (format === 'capitalize') {
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      }
      return value;
    },
  },
  debug: __DEV__,
  persistence: {
    enabled: true,
    storageKey: STORAGE_KEYS.LANGUAGE,
  },
};

/**
 * Métadonnées complètes des langues supportées
 */
export const LANGUAGE_METADATA: Record<SupportedLanguage, LanguageMetadata> = {
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
    currency: 'EUR',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: {
      decimal: ',',
      thousands: ' ',
    },
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    numberFormat: {
      decimal: '.',
      thousands: ',',
    },
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
    currency: 'EUR',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: {
      decimal: ',',
      thousands: '.',
    },
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    rtl: false,
    currency: 'EUR',
    dateFormat: 'dd.MM.yyyy',
    numberFormat: {
      decimal: ',',
      thousands: '.',
    },
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    rtl: false,
    currency: 'EUR',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: {
      decimal: ',',
      thousands: '.',
    },
  },
};

/**
 * Locales système pour chaque langue
 */
export const SYSTEM_LOCALES: Record<SupportedLanguage, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  es: 'es-ES',
  de: 'de-DE',
  it: 'it-IT',
};

/**
 * Expressions régulières pour la validation
 */
export const VALIDATION_PATTERNS = {
  LANGUAGE_CODE: /^[a-z]{2}$/,
  CURRENCY_CODE: /^[A-Z]{3}$/,
  LOCALE_FORMAT: /^[a-z]{2}-[A-Z]{2}$/,
} as const;

/**
 * Timeouts et délais
 */
export const TIMEOUTS = {
  LANGUAGE_SWITCH: 1000, // ms
  TRANSLATION_LOAD: 5000, // ms
  CACHE_REFRESH: 300000, // 5 minutes
} as const;

/**
 * Événements personnalisés
 */
export const I18N_EVENTS = {
  LANGUAGE_CHANGED: 'i18n:languageChanged',
  TRANSLATION_LOADED: 'i18n:translationLoaded',
  ERROR_OCCURRED: 'i18n:errorOccurred',
} as const;

/**
 * Messages d'erreur par défaut
 */
export const DEFAULT_ERROR_MESSAGES = {
  TRANSLATION_MISSING: 'Translation missing',
  LANGUAGE_NOT_SUPPORTED: 'Language not supported',
  LOADING_FAILED: 'Failed to load translations',
  INVALID_FORMAT: 'Invalid format provided',
} as const;