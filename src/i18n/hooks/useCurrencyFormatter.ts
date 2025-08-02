/**
 * Hook pour le formatage des devises
 * Utilise les préférences linguistiques actuelles pour formater les montants
 */

import { useCallback, useMemo } from 'react';
import type { CurrencyCode, CurrencyFormatOptions } from '../types';
import { formatCurrency, getCurrentLanguage, getDefaultCurrency, getSystemLocale } from '../utils';
import { useI18nContext } from './useI18nContext';

/**
 * Hook pour le formatage des devises
 */
export const useCurrencyFormatter = () => {
  const { language } = useI18nContext();

  // Devise par défaut basée sur la langue courante
  const defaultCurrency = useMemo(() => {
    return getDefaultCurrency(language);
  }, [language]);

  // Locale par défaut basée sur la langue courante
  const defaultLocale = useMemo(() => {
    return getSystemLocale(language);
  }, [language]);

  // Fonction de formatage principal
  const format = useCallback((
    amount: number,
    currency: CurrencyCode = defaultCurrency,
    options: Partial<CurrencyFormatOptions> = {}
  ): string => {
    const formatOptions: CurrencyFormatOptions = {
      currency,
      locale: defaultLocale,
      style: 'currency',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    };

    return formatCurrency(amount, formatOptions);
  }, [defaultCurrency, defaultLocale]);

  // Formatage simple avec devise par défaut
  const formatDefault = useCallback((amount: number): string => {
    return format(amount, defaultCurrency);
  }, [format, defaultCurrency]);

  // Formatage avec devise spécifique
  const formatWithCurrency = useCallback((
    amount: number,
    currency: CurrencyCode
  ): string => {
    return format(amount, currency);
  }, [format]);

  // Formatage compact (K, M, B)
  const formatCompact = useCallback((
    amount: number,
    currency: CurrencyCode = defaultCurrency
  ): string => {
    try {
      const formatter = new Intl.NumberFormat(defaultLocale, {
        style: 'currency',
        currency,
        notation: 'compact',
        compactDisplay: 'short',
      });

      return formatter.format(amount);
    } catch (error) {
      console.error('[useCurrencyFormatter] Compact formatting error:', error);
      return format(amount, currency);
    }
  }, [defaultLocale, defaultCurrency, format]);

  // Formatage pour affichage (sans devise)
  const formatAmount = useCallback((
    amount: number,
    options: {
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
      useGrouping?: boolean;
    } = {}
  ): string => {
    try {
      const formatter = new Intl.NumberFormat(defaultLocale, {
        style: 'decimal',
        minimumFractionDigits: options.minimumFractionDigits ?? 2,
        maximumFractionDigits: options.maximumFractionDigits ?? 2,
        useGrouping: options.useGrouping ?? true,
      });

      return formatter.format(amount);
    } catch (error) {
      console.error('[useCurrencyFormatter] Amount formatting error:', error);
      return amount.toFixed(2);
    }
  }, [defaultLocale]);

  // Formatage en pourcentage
  const formatPercentage = useCallback((
    ratio: number,
    options: {
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
    } = {}
  ): string => {
    try {
      const formatter = new Intl.NumberFormat(defaultLocale, {
        style: 'percent',
        minimumFractionDigits: options.minimumFractionDigits ?? 1,
        maximumFractionDigits: options.maximumFractionDigits ?? 2,
      });

      return formatter.format(ratio);
    } catch (error) {
      console.error('[useCurrencyFormatter] Percentage formatting error:', error);
      return `${(ratio * 100).toFixed(1)}%`;
    }
  }, [defaultLocale]);

  // Parse un montant formaté vers un nombre
  const parseAmount = useCallback((
    formattedAmount: string,
    currency: CurrencyCode = defaultCurrency
  ): number | null => {
    try {
      // Suppression des caractères de devise et espaces
      const cleanAmount = formattedAmount
        .replace(/[^\d.,\-+]/g, '')
        .replace(',', '.');

      const parsed = parseFloat(cleanAmount);
      return isNaN(parsed) ? null : parsed;
    } catch (error) {
      console.error('[useCurrencyFormatter] Parse error:', error);
      return null;
    }
  }, [defaultCurrency]);

  // Validation d'un montant
  const isValidAmount = useCallback((amount: any): boolean => {
    return typeof amount === 'number' && !isNaN(amount) && isFinite(amount);
  }, []);

  // Comparaison de deux montants avec tolérance
  const compareAmounts = useCallback((
    amount1: number,
    amount2: number,
    tolerance = 0.01
  ): number => {
    const diff = Math.abs(amount1 - amount2);
    if (diff <= tolerance) return 0;
    return amount1 > amount2 ? 1 : -1;
  }, []);

  // Formatage pour l'accessibilité
  const formatAccessible = useCallback((
    amount: number,
    currency: CurrencyCode = defaultCurrency
  ): string => {
    const formatted = format(amount, currency);
    const currencyName = getCurrencyDisplayName(currency, language);
    
    return `${formatted}, ${currencyName}`;
  }, [format, defaultCurrency, language]);

  // Symbole de devise
  const getCurrencySymbol = useCallback((currency: CurrencyCode): string => {
    try {
      const formatter = new Intl.NumberFormat(defaultLocale, {
        style: 'currency',
        currency,
        currencyDisplay: 'symbol',
      });

      const parts = formatter.formatToParts(0);
      const symbolPart = parts.find(part => part.type === 'currency');
      
      return symbolPart?.value || currency;
    } catch (error) {
      console.error('[useCurrencyFormatter] Symbol error:', error);
      return currency;
    }
  }, [defaultLocale]);

  return {
    // Formatage principal
    format,
    formatDefault,
    formatWithCurrency,
    formatCompact,
    formatAmount,
    formatPercentage,
    formatAccessible,
    
    // Utilitaires
    parseAmount,
    isValidAmount,
    compareAmounts,
    getCurrencySymbol,
    
    // Propriétés
    defaultCurrency,
    defaultLocale,
    currentLanguage: language,
  };
};

/**
 * Récupère le nom complet d'une devise dans une langue donnée
 */
function getCurrencyDisplayName(currency: CurrencyCode, language: string): string {
  const currencyNames: Record<CurrencyCode, Record<string, string>> = {
    EUR: {
      fr: 'Euro',
      en: 'Euro',
      es: 'Euro',
      de: 'Euro',
      it: 'Euro',
    },
    USD: {
      fr: 'Dollar américain',
      en: 'US Dollar',
      es: 'Dólar estadounidense',
      de: 'US-Dollar',
      it: 'Dollaro americano',
    },
    GBP: {
      fr: 'Livre sterling',
      en: 'British Pound',
      es: 'Libra esterlina',
      de: 'Britisches Pfund',
      it: 'Sterlina britannica',
    },
    CAD: {
      fr: 'Dollar canadien',
      en: 'Canadian Dollar',
      es: 'Dólar canadiense',
      de: 'Kanadischer Dollar',
      it: 'Dollaro canadese',
    },
    CHF: {
      fr: 'Franc suisse',
      en: 'Swiss Franc',
      es: 'Franco suizo',
      de: 'Schweizer Franken',
      it: 'Franco svizzero',
    },
  };

  return currencyNames[currency]?.[language] || currency;
}