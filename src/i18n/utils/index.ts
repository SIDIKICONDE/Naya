/**
 * Utilitaires pour le système d'internationalisation
 * Fonctions helper pour la gestion des langues, devises et formats
 */

import type { 
  SupportedLanguage, 
  CurrencyCode, 
  CurrencyFormatOptions, 
  DateFormatOptions 
} from '../types';
import { 
  SUPPORTED_LANGUAGES, 
  DEFAULT_CURRENCIES, 
  LANGUAGE_METADATA, 
  SYSTEM_LOCALES 
} from '../constants';
import { getI18nInstance } from '../core/i18nManager';

/**
 * Récupère la langue actuellement active
 */
export const getCurrentLanguage = (): SupportedLanguage => {
  const i18n = getI18nInstance();
  return (i18n.language || 'en') as SupportedLanguage;
};

/**
 * Récupère la liste des langues supportées
 */
export const getSupportedLanguages = (): SupportedLanguage[] => {
  return [...SUPPORTED_LANGUAGES];
};

/**
 * Vérifie si une langue est supportée
 */
export const isLanguageSupported = (language: string): language is SupportedLanguage => {
  return SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);
};

/**
 * Récupère les métadonnées d'une langue
 */
export const getLanguageMetadata = (language: SupportedLanguage) => {
  return LANGUAGE_METADATA[language];
};

/**
 * Vérifie si une langue s'écrit de droite à gauche
 */
export const isRTLLanguage = (language: SupportedLanguage): boolean => {
  return LANGUAGE_METADATA[language]?.rtl || false;
};

/**
 * Récupère la devise par défaut pour une langue
 */
export const getDefaultCurrency = (language: SupportedLanguage): CurrencyCode => {
  return DEFAULT_CURRENCIES[language] || 'EUR';
};

/**
 * Récupère la locale système pour une langue
 */
export const getSystemLocale = (language: SupportedLanguage): string => {
  return SYSTEM_LOCALES[language] || 'en-US';
};

/**
 * Formate un montant en devise
 */
export const formatCurrency = (
  amount: number,
  options: CurrencyFormatOptions = { currency: 'EUR' }
): string => {
  try {
    const currentLanguage = getCurrentLanguage();
    const locale = options.locale || getSystemLocale(currentLanguage);
    
    const formatter = new Intl.NumberFormat(locale, {
      style: options.style || 'currency',
      currency: options.currency,
      minimumFractionDigits: options.minimumFractionDigits ?? 2,
      maximumFractionDigits: options.maximumFractionDigits ?? 2,
    });

    return formatter.format(amount);
    
  } catch (error) {
    console.error('[formatCurrency] Formatting error:', error);
    
    // Fallback simple
    return `${amount.toFixed(2)} ${options.currency}`;
  }
};

/**
 * Formate une date selon les préférences locales
 */
export const formatDate = (
  date: Date | string | number,
  options: DateFormatOptions = {}
): string => {
  try {
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date');
    }

    const currentLanguage = getCurrentLanguage();
    const locale = options.locale || getSystemLocale(currentLanguage);
    
    const formatter = new Intl.DateTimeFormat(locale, {
      dateStyle: options.dateStyle,
      timeStyle: options.timeStyle,
      year: options.year,
      month: options.month,
      day: options.day,
      hour: options.hour,
      minute: options.minute,
      second: options.second,
      timeZone: options.timeZone,
    });

    return formatter.format(dateObj);
    
  } catch (error) {
    console.error('[formatDate] Formatting error:', error);
    
    // Fallback simple
    return new Date(date).toLocaleDateString();
  }
};

/**
 * Formate un nombre selon les préférences locales
 */
export const formatNumber = (
  number: number,
  options: {
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    useGrouping?: boolean;
  } = {}
): string => {
  try {
    const currentLanguage = getCurrentLanguage();
    const locale = options.locale || getSystemLocale(currentLanguage);
    
    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: options.minimumFractionDigits,
      maximumFractionDigits: options.maximumFractionDigits,
      useGrouping: options.useGrouping ?? true,
    });

    return formatter.format(number);
    
  } catch (error) {
    console.error('[formatNumber] Formatting error:', error);
    return number.toString();
  }
};

/**
 * Convertit une clé de traduction en chaîne lisible
 */
export const humanizeTranslationKey = (key: string): string => {
  return key
    .split('.')
    .pop()
    ?.replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim() || key;
};

/**
 * Valide une clé de traduction
 */
export const isValidTranslationKey = (key: string): boolean => {
  if (!key || typeof key !== 'string') {
    return false;
  }
  
  // Vérifie que la clé ne contient que des caractères autorisés
  const validKeyPattern = /^[a-zA-Z0-9._-]+$/;
  return validKeyPattern.test(key);
};

/**
 * Extrait les variables d'interpolation d'une chaîne de traduction
 */
export const extractInterpolationVariables = (text: string): string[] => {
  const variablePattern = /\{\{([^}]+)\}\}/g;
  const variables: string[] = [];
  let match;
  
  while ((match = variablePattern.exec(text)) !== null) {
    variables.push(match[1].trim());
  }
  
  return variables;
};

/**
 * Vérifie si une traduction contient des variables d'interpolation
 */
export const hasInterpolationVariables = (text: string): boolean => {
  return /\{\{[^}]+\}\}/.test(text);
};

/**
 * Normalise une locale (ex: "fr_FR" -> "fr-FR")
 */
export const normalizeLocale = (locale: string): string => {
  return locale.replace('_', '-');
};

/**
 * Parse une locale et retourne ses composants
 */
export const parseLocale = (locale: string): {
  language: string;
  region?: string;
  script?: string;
} => {
  const normalized = normalizeLocale(locale);
  const parts = normalized.split('-');
  
  return {
    language: parts[0] || 'en',
    region: parts[1],
    script: parts[2],
  };
};

/**
 * Génère une locale complète à partir d'une langue
 */
export const generateLocale = (
  language: SupportedLanguage,
  region?: string
): string => {
  const metadata = LANGUAGE_METADATA[language];
  const defaultLocale = SYSTEM_LOCALES[language];
  
  if (region) {
    return `${language}-${region.toUpperCase()}`;
  }
  
  return defaultLocale;
};

/**
 * Compare deux langues et retourne leur similarité (0-1)
 */
export const calculateLanguageSimilarity = (
  lang1: SupportedLanguage,
  lang2: SupportedLanguage
): number => {
  if (lang1 === lang2) {
    return 1.0;
  }
  
  const metadata1 = LANGUAGE_METADATA[lang1];
  const metadata2 = LANGUAGE_METADATA[lang2];
  
  let similarity = 0;
  
  // Même famille de langue (approximation basique)
  if (
    (lang1 === 'fr' && lang2 === 'it') ||
    (lang1 === 'it' && lang2 === 'fr') ||
    (lang1 === 'es' && lang2 === 'it') ||
    (lang1 === 'it' && lang2 === 'es')
  ) {
    similarity += 0.3; // Langues romanes
  }
  
  if (
    (lang1 === 'en' && lang2 === 'de') ||
    (lang1 === 'de' && lang2 === 'en')
  ) {
    similarity += 0.2; // Langues germaniques
  }
  
  // Même écriture (LTR/RTL)
  if (metadata1.rtl === metadata2.rtl) {
    similarity += 0.1;
  }
  
  // Même devise par défaut
  if (metadata1.currency === metadata2.currency) {
    similarity += 0.2;
  }
  
  return Math.min(similarity, 1.0);
};

/**
 * Trouve la langue la plus similaire dans une liste
 */
export const findClosestLanguage = (
  targetLanguage: SupportedLanguage,
  availableLanguages: SupportedLanguage[]
): SupportedLanguage | null => {
  if (availableLanguages.includes(targetLanguage)) {
    return targetLanguage;
  }
  
  let bestMatch: SupportedLanguage | null = null;
  let bestSimilarity = 0;
  
  for (const language of availableLanguages) {
    const similarity = calculateLanguageSimilarity(targetLanguage, language);
    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestMatch = language;
    }
  }
  
  return bestMatch;
};

/**
 * Débougle les informations de debug pour une langue
 */
export const getLanguageDebugInfo = (language: SupportedLanguage) => {
  const metadata = getLanguageMetadata(language);
  const systemLocale = getSystemLocale(language);
  const defaultCurrency = getDefaultCurrency(language);
  
  return {
    language,
    metadata,
    systemLocale,
    defaultCurrency,
    isRTL: isRTLLanguage(language),
    isSupported: isLanguageSupported(language),
  };
};