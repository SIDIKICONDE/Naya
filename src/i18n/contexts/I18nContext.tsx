/**
 * Contexte React pour l'internationalisation
 * Fournit l'état global de la langue et les fonctions de formatage
 */

import React, { createContext } from 'react';
import type { I18nContextType } from '../types';

/**
 * Contexte i18n par défaut
 */
export const I18nContext = createContext<I18nContextType | null>(null);