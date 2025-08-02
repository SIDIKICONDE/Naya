/**
 * Hook pour accéder au contexte i18n
 * Fournit un accès centralisé aux fonctionnalités d'internationalisation
 */

import { useContext } from 'react';
import { I18nContext } from '../contexts/I18nContext';

/**
 * Hook pour utiliser le contexte i18n
 */
export const useI18nContext = () => {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useI18nContext must be used within a TranslationProvider');
  }
  
  return context;
};