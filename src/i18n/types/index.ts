/**
 * Types TypeScript pour le système d'internationalisation
 * Définit toutes les interfaces et types utilisés dans le module i18n
 */

/**
 * Langues supportées par l'application
 */
export type SupportedLanguage = 'fr' | 'en' | 'es' | 'de' | 'it';

/**
 * Codes de devises ISO 4217 supportés
 */
export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'CAD' | 'CHF';

/**
 * Configuration principale du système i18n
 */
export interface I18nConfig {
  defaultLanguage: SupportedLanguage;
  fallbackLanguage: SupportedLanguage;
  supportedLanguages: SupportedLanguage[];
  interpolation: {
    escapeValue: boolean;
    format?: (value: any, format?: string, lng?: string) => string;
  };
  debug: boolean;
  persistence: {
    enabled: boolean;
    storageKey: string;
  };
}

/**
 * Options de formatage pour les devises
 */
export interface CurrencyFormatOptions {
  currency: CurrencyCode;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  style?: 'currency' | 'decimal';
}

/**
 * Options de formatage pour les dates
 */
export interface DateFormatOptions {
  locale?: string;
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  weekday?: 'long' | 'short' | 'narrow';
  timeZone?: string;
}

/**
 * Options générales de formatage
 */
export interface FormatOptions {
  interpolation?: Record<string, any>;
  defaultValue?: string;
  count?: number;
  context?: string;
}

/**
 * Structure des clés de traduction (à étendre selon les besoins)
 */
export interface TranslationKeys {
  // Navigation
  navigation: {
    back: string;
    next: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    settings: string;
    profile: string;
    logout: string;
  };

  // Messages système
  system: {
    loading: string;
    error: string;
    success: string;
    warning: string;
    noData: string;
    retry: string;
    confirm: string;
  };

  // Audio spécifique
  audio: {
    modules: {
      reverb: string;
      compressor: string;
      limiter: string;
      gate: string;
      equalizer: string;
    };
    parameters: {
      gain: string;
      frequency: string;
      bandwidth: string;
      threshold: string;
      ratio: string;
      attack: string;
      release: string;
      wetDry: string;
    };
    presets: {
      load: string;
      save: string;
      delete: string;
      rename: string;
      create: string;
      default: string;
    };
    interface: {
      record: string;
      play: string;
      stop: string;
      pause: string;
      mute: string;
      solo: string;
    };
  };

  // Formulaires
  forms: {
    validation: {
      required: string;
      email: string;
      minLength: string;
      maxLength: string;
      numeric: string;
      alphanumeric: string;
    };
    placeholders: {
      search: string;
      email: string;
      password: string;
      name: string;
      description: string;
    };
  };

  // Messages d'erreur
  errors: {
    network: string;
    authentication: string;
    authorization: string;
    validation: string;
    server: string;
    unknown: string;
    timeout: string;
  };
}

/**
 * Contexte i18n pour React
 */
export interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  t: (key: string, options?: FormatOptions) => string;
  isLoading: boolean;
  isReady: boolean;
  formatCurrency: (amount: number, options?: CurrencyFormatOptions) => string;
  formatDate: (date: Date | string | number, options?: DateFormatOptions) => string;
}

/**
 * Ressource de traduction pour une langue
 */
export interface TranslationResource {
  [namespace: string]: {
    [key: string]: string | TranslationResource;
  };
}

/**
 * Bundle de langues complètes
 */
export interface LanguageBundle {
  [language: string]: TranslationResource;
}

/**
 * Options pour le hook useTranslation
 */
export interface UseTranslationOptions {
  namespace?: string;
  keyPrefix?: string;
  suspense?: boolean;
}

/**
 * Résultat du hook useTranslation
 */
export interface UseTranslationResult {
  t: (key: string, options?: FormatOptions) => string;
  i18n: any;
  ready: boolean;
}

/**
 * Paramètres pour la détection de langue
 */
export interface LanguageDetectorOptions {
  caches?: string[];
  excludeCacheFor?: string[];
  cookieMinutes?: number;
  lookupCookie?: string;
  lookupFromPathIndex?: number;
  lookupFromSubdomainIndex?: number;
  order?: string[];
}

/**
 * Métadonnées d'une langue
 */
export interface LanguageMetadata {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  currency: CurrencyCode;
  dateFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
  };
}