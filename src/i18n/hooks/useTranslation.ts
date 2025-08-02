/**
 * Hook useTranslation personnalisé pour React Native
 * Alternative au hook i18next avec fonctionnalités étendues
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation as useI18nextTranslation } from 'react-i18next';

import type { FormatOptions, UseTranslationOptions, UseTranslationResult } from '../types';
import { I18nManager } from '../core/i18nManager';
import { I18N_EVENTS } from '../constants';
import { isValidTranslationKey, extractInterpolationVariables } from '../utils';

/**
 * Hook personnalisé pour les traductions
 */
export const useTranslation = (
  namespace = 'common',
  options: UseTranslationOptions = {}
): UseTranslationResult & {
  // Fonctionnalités étendues
  isLoading: boolean;
  error: string | null;
  missingKeys: string[];
  debugInfo: {
    namespace: string;
    keyPrefix?: string;
    totalKeys: number;
    missingCount: number;
  };
} => {
  // Hook i18next de base
  const { t: i18nextT, i18n, ready } = useI18nextTranslation(namespace, {
    keyPrefix: options.keyPrefix,
    useSuspense: options.suspense ?? false,
  });

  // État local
  const [isLoading, setIsLoading] = useState(!ready);
  const [error, setError] = useState<string | null>(null);
  const [missingKeys, setMissingKeys] = useState<string[]>([]);

  // Fonction de traduction améliorée
  const t = useCallback((key: string, formatOptions: FormatOptions = {}) => {
    try {
      // Validation de la clé
      if (!isValidTranslationKey(key)) {
        console.warn(`[useTranslation] Invalid translation key: ${key}`);
        setMissingKeys(prev => [...new Set([...prev, key])]);
        return formatOptions.defaultValue || key;
      }

      // Appel de la traduction i18next
      const translation = i18nextT(key, {
        defaultValue: formatOptions.defaultValue,
        count: formatOptions.count,
        context: formatOptions.context,
        ...formatOptions.interpolation,
      });

      // Vérification si la traduction existe réellement
      if (translation === key && !formatOptions.defaultValue) {
        setMissingKeys(prev => [...new Set([...prev, key])]);
        console.warn(`[useTranslation] Missing translation for key: ${key}`);
      }

      return translation;
      
    } catch (translationError) {
      console.error(`[useTranslation] Translation error for key ${key}:`, translationError);
      setError(`Translation error: ${translationError}`);
      return formatOptions.defaultValue || key;
    }
  }, [i18nextT]);

  // Fonction de traduction avec validation d'interpolation
  const tSafe = useCallback((key: string, formatOptions: FormatOptions = {}) => {
    const translation = t(key, formatOptions);
    
    // Vérification des variables d'interpolation manquantes
    if (formatOptions.interpolation) {
      const requiredVars = extractInterpolationVariables(translation);
      const providedVars = Object.keys(formatOptions.interpolation);
      
      const missingVars = requiredVars.filter(variable => 
        !providedVars.includes(variable)
      );
      
      if (missingVars.length > 0) {
        console.warn(
          `[useTranslation] Missing interpolation variables for ${key}:`, 
          missingVars
        );
      }
    }
    
    return translation;
  }, [t]);

  // Informations de debug
  const debugInfo = useMemo(() => {
    const resourceStore = i18n.getResourceBundle(i18n.language, namespace) || {};
    const totalKeys = countKeys(resourceStore);
    
    return {
      namespace,
      keyPrefix: options.keyPrefix,
      totalKeys,
      missingCount: missingKeys.length,
    };
  }, [i18n, namespace, options.keyPrefix, missingKeys.length]);

  // Gestion des événements i18n
  useEffect(() => {
    const handleLanguageChange = () => {
      setMissingKeys([]); // Reset des clés manquantes lors du changement de langue
      setError(null);
    };

    const handleTranslationLoaded = () => {
      setIsLoading(false);
      setError(null);
    };

    const handleError = (data: { error: any }) => {
      setError(data.error.message || 'Translation error');
      setIsLoading(false);
    };

    I18nManager.addEventListener(I18N_EVENTS.LANGUAGE_CHANGED, handleLanguageChange);
    I18nManager.addEventListener(I18N_EVENTS.TRANSLATION_LOADED, handleTranslationLoaded);
    I18nManager.addEventListener(I18N_EVENTS.ERROR_OCCURRED, handleError);

    return () => {
      I18nManager.removeEventListener(I18N_EVENTS.LANGUAGE_CHANGED, handleLanguageChange);
      I18nManager.removeEventListener(I18N_EVENTS.TRANSLATION_LOADED, handleTranslationLoaded);
      I18nManager.removeEventListener(I18N_EVENTS.ERROR_OCCURRED, handleError);
    };
  }, []);

  // Mise à jour de l'état de chargement
  useEffect(() => {
    setIsLoading(!ready);
  }, [ready]);

  return {
    t: tSafe,
    i18n,
    ready,
    isLoading,
    error,
    missingKeys,
    debugInfo,
  };
};

/**
 * Hook pour traduction avec namespace spécifique
 */
export const useNamespacedTranslation = (namespace: string) => {
  return useTranslation(namespace);
};

/**
 * Hook pour traductions avec préfixe de clé
 */
export const usePrefixedTranslation = (keyPrefix: string, namespace = 'common') => {
  return useTranslation(namespace, { keyPrefix });
};

/**
 * Hook pour traductions avec fallback
 */
export const useTranslationWithFallback = (
  primaryNamespace: string,
  fallbackNamespace = 'common'
) => {
  const primary = useTranslation(primaryNamespace);
  const fallback = useTranslation(fallbackNamespace);

  const t = useCallback((key: string, formatOptions: FormatOptions = {}) => {
    // Tentative avec le namespace principal
    const primaryResult = primary.t(key, { ...formatOptions, defaultValue: '__MISSING__' });
    
    if (primaryResult !== '__MISSING__' && primaryResult !== key) {
      return primaryResult;
    }
    
    // Fallback vers le namespace de secours
    return fallback.t(key, formatOptions);
  }, [primary.t, fallback.t]);

  return {
    ...primary,
    t,
    isLoading: primary.isLoading || fallback.isLoading,
    error: primary.error || fallback.error,
  };
};

/**
 * Compte récursivement les clés dans un objet de ressources
 */
function countKeys(obj: any): number {
  let count = 0;
  
  for (const value of Object.values(obj)) {
    if (typeof value === 'string') {
      count++;
    } else if (typeof value === 'object' && value !== null) {
      count += countKeys(value);
    }
  }
  
  return count;
}