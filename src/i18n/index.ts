/**
 * Point d'entrée principal du système d'internationalisation
 * Expose les fonctionnalités i18n de manière centralisée
 */

export { initI18n, getI18nInstance } from './core/i18nManager';
export { useTranslation, useCurrencyFormatter, useDateFormatter } from './hooks';
export { TranslationProvider } from './providers/TranslationProvider';
export { withTranslation } from './hoc/withTranslation';
export { I18nContext } from './contexts/I18nContext';

// Types publics
export type {
  SupportedLanguage,
  TranslationKeys,
  FormatOptions,
  I18nConfig,
  CurrencyCode,
  DateFormatOptions
} from './types';

// Utilitaires publics
export {
  getCurrentLanguage,
  getSupportedLanguages,
  formatCurrency,
  formatDate,
  isRTLLanguage
} from './utils';

// Constantes publiques
export { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './constants';