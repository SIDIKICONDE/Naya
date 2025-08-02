/**
 * Higher-Order Component pour l'internationalisation
 * Injecte les fonctionnalités de traduction dans les composants de classe
 */

import React from 'react';
import type { SupportedLanguage, FormatOptions } from '../types';
import { useTranslation, useCurrencyFormatter, useDateFormatter } from '../hooks';

/**
 * Props injectées par le HOC
 */
export interface WithTranslationProps {
  t: (key: string, options?: FormatOptions) => string;
  language: SupportedLanguage;
  isLoading: boolean;
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (date: Date | string | number, options?: any) => string;
}

/**
 * Options du HOC
 */
interface WithTranslationOptions {
  namespace?: string;
  keyPrefix?: string;
}

/**
 * Higher-Order Component pour l'internationalisation
 */
export function withTranslation<P extends object>(
  WrappedComponent: React.ComponentType<P & WithTranslationProps>,
  options: WithTranslationOptions = {}
) {
  const TranslatedComponent = (props: P) => {
    const { t, isLoading, i18n } = useTranslation(
      options.namespace || 'common',
      {
        keyPrefix: options.keyPrefix,
      }
    );
    
    const { formatDefault: formatCurrency } = useCurrencyFormatter();
    const { format: formatDate } = useDateFormatter();

    const translationProps: WithTranslationProps = {
      t,
      language: i18n.language as SupportedLanguage,
      isLoading,
      formatCurrency,
      formatDate,
    };

    return <WrappedComponent {...props} {...translationProps} />;
  };

  // Préservation du nom du composant pour le debug
  TranslatedComponent.displayName = `withTranslation(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return TranslatedComponent;
}