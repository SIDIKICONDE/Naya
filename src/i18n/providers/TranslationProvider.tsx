/**
 * Provider React pour l'internationalisation
 * Encapsule l'application avec le contexte i18n et gère l'état global
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { SupportedLanguage, I18nContextType, CurrencyFormatOptions, DateFormatOptions } from '../types';
import { I18nContext } from '../contexts/I18nContext';
import { I18nManager } from '../core/i18nManager';
import { I18N_EVENTS } from '../constants';
import { formatCurrency, formatDate } from '../utils';

/**
 * Props du TranslationProvider
 */
interface TranslationProviderProps {
  children: React.ReactNode;
  initialLanguage?: SupportedLanguage;
  onLanguageChange?: (language: SupportedLanguage) => void;
  onError?: (error: Error) => void;
}

/**
 * Provider pour le contexte d'internationalisation
 */
export const TranslationProvider: React.FC<TranslationProviderProps> = ({
  children,
  initialLanguage,
  onLanguageChange,
  onError,
}) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(
    initialLanguage || 'fr'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Fonction de traduction
  const t = useCallback((key: string, options = {}) => {
    try {
      const i18n = I18nManager.getI18nInstance();
      return i18n.t(key, options);
    } catch (error) {
      console.error('[TranslationProvider] Translation error:', error);
      return key;
    }
  }, []);

  // Fonction de changement de langue
  const setLanguage = useCallback(async (newLanguage: SupportedLanguage) => {
    if (newLanguage === language) {
      return;
    }

    setIsLoading(true);

    try {
      await I18nManager.changeLanguage(newLanguage);
      setLanguageState(newLanguage);
      onLanguageChange?.(newLanguage);
    } catch (error) {
      console.error('[TranslationProvider] Language change failed:', error);
      const errorObj = error instanceof Error ? error : new Error('Language change failed');
      onError?.(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [language, onLanguageChange, onError]);

  // Fonction de formatage de devise
  const formatCurrencyValue = useCallback((
    amount: number,
    options?: CurrencyFormatOptions
  ) => {
    return formatCurrency(amount, options);
  }, []);

  // Fonction de formatage de date
  const formatDateValue = useCallback((
    date: Date | string | number,
    options?: DateFormatOptions
  ) => {
    return formatDate(date, options);
  }, []);

  // Valeur du contexte
  const contextValue: I18nContextType = useMemo(() => ({
    language,
    setLanguage,
    t,
    isLoading,
    isReady,
    formatCurrency: formatCurrencyValue,
    formatDate: formatDateValue,
  }), [
    language,
    setLanguage,
    t,
    isLoading,
    isReady,
    formatCurrencyValue,
    formatDateValue,
  ]);

  // Gestion des événements i18n
  useEffect(() => {
    const handleLanguageChanged = (data: { newLanguage: SupportedLanguage }) => {
      setLanguageState(data.newLanguage);
      setIsLoading(false);
    };

    const handleTranslationLoaded = () => {
      setIsLoading(false);
      setIsReady(true);
    };

    const handleError = (data: { error: any }) => {
      setIsLoading(false);
      const errorObj = data.error instanceof Error ? data.error : new Error('i18n error');
      onError?.(errorObj);
    };

    I18nManager.addEventListener(I18N_EVENTS.LANGUAGE_CHANGED, handleLanguageChanged);
    I18nManager.addEventListener(I18N_EVENTS.TRANSLATION_LOADED, handleTranslationLoaded);
    I18nManager.addEventListener(I18N_EVENTS.ERROR_OCCURRED, handleError);

    return () => {
      I18nManager.removeEventListener(I18N_EVENTS.LANGUAGE_CHANGED, handleLanguageChanged);
      I18nManager.removeEventListener(I18N_EVENTS.TRANSLATION_LOADED, handleTranslationLoaded);
      I18nManager.removeEventListener(I18N_EVENTS.ERROR_OCCURRED, handleError);
    };
  }, [onError]);

  // Initialisation du système i18n
  useEffect(() => {
    const initializeI18n = async () => {
      if (I18nManager.isReady()) {
        setIsReady(true);
        setIsLoading(false);
        return;
      }

      try {
        await I18nManager.init({
          defaultLanguage: initialLanguage || 'fr',
        });
        
        const currentLanguage = I18nManager.getCurrentLanguage();
        setLanguageState(currentLanguage);
        setIsReady(true);
        
      } catch (error) {
        console.error('[TranslationProvider] Initialization failed:', error);
        const errorObj = error instanceof Error ? error : new Error('i18n initialization failed');
        onError?.(errorObj);
      } finally {
        setIsLoading(false);
      }
    };

    initializeI18n();
  }, [initialLanguage, onError]);

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};