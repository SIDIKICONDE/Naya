/**
 * Hook pour le formatage des dates
 * Utilise les préférences linguistiques actuelles pour formater les dates
 */

import { useCallback, useMemo } from 'react';
import type { DateFormatOptions } from '../types';
import { formatDate, getCurrentLanguage, getSystemLocale } from '../utils';
import { useI18nContext } from './useI18nContext';

/**
 * Formats de date prédéfinis
 */
type DatePreset = 
  | 'short'      // 01/01/2024
  | 'medium'     // 1 jan. 2024
  | 'long'       // 1 janvier 2024
  | 'full'       // lundi 1 janvier 2024
  | 'time'       // 14:30
  | 'datetime'   // 01/01/2024 14:30
  | 'relative';  // il y a 2 heures

/**
 * Hook pour le formatage des dates
 */
export const useDateFormatter = () => {
  const { language } = useI18nContext();

  // Locale par défaut basée sur la langue courante
  const defaultLocale = useMemo(() => {
    return getSystemLocale(language);
  }, [language]);

  // Fonction de formatage principal
  const format = useCallback((
    date: Date | string | number,
    options: DateFormatOptions = {}
  ): string => {
    const formatOptions: DateFormatOptions = {
      locale: defaultLocale,
      ...options,
    };

    return formatDate(date, formatOptions);
  }, [defaultLocale]);

  // Formatage avec preset
  const formatPreset = useCallback((
    date: Date | string | number,
    preset: DatePreset
  ): string => {
    const dateObj = new Date(date);

    switch (preset) {
      case 'short':
        return format(date, { dateStyle: 'short' });
      
      case 'medium':
        return format(date, { dateStyle: 'medium' });
      
      case 'long':
        return format(date, { dateStyle: 'long' });
      
      case 'full':
        return format(date, { dateStyle: 'full' });
      
      case 'time':
        return format(date, { timeStyle: 'short' });
      
      case 'datetime':
        return format(date, { dateStyle: 'short', timeStyle: 'short' });
      
      case 'relative':
        return formatRelative(dateObj);
      
      default:
        return format(date);
    }
  }, [format]);

  // Formatage relatif (il y a X temps)
  const formatRelative = useCallback((date: Date | string | number): string => {
    try {
      const dateObj = new Date(date);
      const now = new Date();
      const diffMs = now.getTime() - dateObj.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = Math.floor(diffDays / 365);

      // Support de RelativeTimeFormat si disponible
      if (Intl.RelativeTimeFormat) {
        const rtf = new Intl.RelativeTimeFormat(defaultLocale, { 
          numeric: 'auto' 
        });

        if (diffYears > 0) {
          return rtf.format(-diffYears, 'year');
        } else if (diffMonths > 0) {
          return rtf.format(-diffMonths, 'month');
        } else if (diffWeeks > 0) {
          return rtf.format(-diffWeeks, 'week');
        } else if (diffDays > 0) {
          return rtf.format(-diffDays, 'day');
        } else if (diffHours > 0) {
          return rtf.format(-diffHours, 'hour');
        } else if (diffMinutes > 0) {
          return rtf.format(-diffMinutes, 'minute');
        } else {
          return rtf.format(0, 'second');
        }
      }

      // Fallback manuel
      return formatRelativeFallback(diffMs, language);
      
    } catch (error) {
      console.error('[useDateFormatter] Relative formatting error:', error);
      return format(date, { dateStyle: 'short' });
    }
  }, [defaultLocale, language, format]);

  // Formatage de durée
  const formatDuration = useCallback((
    startDate: Date | string | number,
    endDate: Date | string | number
  ): string => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffMs = end.getTime() - start.getTime();
      
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      const parts: string[] = [];
      
      if (days > 0) parts.push(getDurationLabel(days, 'day', language));
      if (hours > 0) parts.push(getDurationLabel(hours, 'hour', language));
      if (minutes > 0) parts.push(getDurationLabel(minutes, 'minute', language));

      return parts.join(' ') || getDurationLabel(0, 'minute', language);
      
    } catch (error) {
      console.error('[useDateFormatter] Duration formatting error:', error);
      return '';
    }
  }, [language]);

  // Formatage de plage de dates
  const formatRange = useCallback((
    startDate: Date | string | number,
    endDate: Date | string | number,
    options: DateFormatOptions = {}
  ): string => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Même jour
      if (start.toDateString() === end.toDateString()) {
        const dateStr = format(start, { dateStyle: 'medium' });
        const startTime = format(start, { timeStyle: 'short' });
        const endTime = format(end, { timeStyle: 'short' });
        return `${dateStr} ${startTime} - ${endTime}`;
      }

      // Dates différentes
      const startStr = format(start, options);
      const endStr = format(end, options);
      return `${startStr} - ${endStr}`;
      
    } catch (error) {
      console.error('[useDateFormatter] Range formatting error:', error);
      return '';
    }
  }, [format]);

  // Formatage pour agenda
  const formatCalendar = useCallback((date: Date | string | number): string => {
    const dateObj = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    
    const diffDays = Math.floor((dateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return getCalendarLabel('today', language);
    } else if (diffDays === 1) {
      return getCalendarLabel('tomorrow', language);
    } else if (diffDays === -1) {
      return getCalendarLabel('yesterday', language);
    } else if (diffDays > 1 && diffDays <= 7) {
      return format(date, { weekday: 'long' });
    } else {
      return format(date, { dateStyle: 'medium' });
    }
  }, [format, language]);

  // Validation de date
  const isValidDate = useCallback((date: any): boolean => {
    return date instanceof Date && !isNaN(date.getTime());
  }, []);

  // Comparaison de dates
  const compareDates = useCallback((
    date1: Date | string | number,
    date2: Date | string | number,
    precision: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' = 'day'
  ): number => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    const truncate = (date: Date): number => {
      switch (precision) {
        case 'year':
          return new Date(date.getFullYear(), 0, 1).getTime();
        case 'month':
          return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
        case 'day':
          return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        case 'hour':
          return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).getTime();
        case 'minute':
          return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()).getTime();
        case 'second':
          return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()).getTime();
        default:
          return date.getTime();
      }
    };

    const t1 = truncate(d1);
    const t2 = truncate(d2);

    if (t1 < t2) return -1;
    if (t1 > t2) return 1;
    return 0;
  }, []);

  // Formatage pour l'accessibilité
  const formatAccessible = useCallback((
    date: Date | string | number,
    includeTime = false
  ): string => {
    const options: DateFormatOptions = {
      dateStyle: 'full',
      ...(includeTime && { timeStyle: 'medium' }),
    };

    return format(date, options);
  }, [format]);

  return {
    // Formatage principal
    format,
    formatPreset,
    formatRelative,
    formatDuration,
    formatRange,
    formatCalendar,
    formatAccessible,
    
    // Utilitaires
    isValidDate,
    compareDates,
    
    // Propriétés
    defaultLocale,
    currentLanguage: language,
  };
};

/**
 * Formatage relatif de fallback
 */
function formatRelativeFallback(diffMs: number, language: string): string {
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const labels = getRelativeLabels(language);

  if (diffDays > 0) {
    return `${labels.ago} ${diffDays} ${diffDays === 1 ? labels.day : labels.days}`;
  } else if (diffHours > 0) {
    return `${labels.ago} ${diffHours} ${diffHours === 1 ? labels.hour : labels.hours}`;
  } else if (diffMinutes > 0) {
    return `${labels.ago} ${diffMinutes} ${diffMinutes === 1 ? labels.minute : labels.minutes}`;
  } else {
    return labels.now;
  }
}

/**
 * Labels relatifs par langue
 */
function getRelativeLabels(language: string) {
  const labels: Record<string, any> = {
    fr: {
      ago: 'il y a',
      now: 'maintenant',
      day: 'jour',
      days: 'jours',
      hour: 'heure',
      hours: 'heures',
      minute: 'minute',
      minutes: 'minutes',
    },
    en: {
      ago: '',
      now: 'now',
      day: 'day ago',
      days: 'days ago',
      hour: 'hour ago',
      hours: 'hours ago',
      minute: 'minute ago',
      minutes: 'minutes ago',
    },
    es: {
      ago: 'hace',
      now: 'ahora',
      day: 'día',
      days: 'días',
      hour: 'hora',
      hours: 'horas',
      minute: 'minuto',
      minutes: 'minutos',
    },
    de: {
      ago: 'vor',
      now: 'jetzt',
      day: 'Tag',
      days: 'Tagen',
      hour: 'Stunde',
      hours: 'Stunden',
      minute: 'Minute',
      minutes: 'Minuten',
    },
    it: {
      ago: '',
      now: 'ora',
      day: 'giorno fa',
      days: 'giorni fa',
      hour: 'ora fa',
      hours: 'ore fa',
      minute: 'minuto fa',
      minutes: 'minuti fa',
    },
  };

  return labels[language] || labels.en;
}

/**
 * Labels de durée par langue
 */
function getDurationLabel(value: number, unit: 'day' | 'hour' | 'minute', language: string): string {
  const labels: Record<string, any> = {
    fr: {
      day: value === 1 ? 'jour' : 'jours',
      hour: value === 1 ? 'heure' : 'heures',
      minute: value === 1 ? 'minute' : 'minutes',
    },
    en: {
      day: value === 1 ? 'day' : 'days',
      hour: value === 1 ? 'hour' : 'hours',
      minute: value === 1 ? 'minute' : 'minutes',
    },
    es: {
      day: value === 1 ? 'día' : 'días',
      hour: value === 1 ? 'hora' : 'horas',
      minute: value === 1 ? 'minuto' : 'minutos',
    },
    de: {
      day: value === 1 ? 'Tag' : 'Tage',
      hour: value === 1 ? 'Stunde' : 'Stunden',
      minute: value === 1 ? 'Minute' : 'Minuten',
    },
    it: {
      day: value === 1 ? 'giorno' : 'giorni',
      hour: value === 1 ? 'ora' : 'ore',
      minute: value === 1 ? 'minuto' : 'minuti',
    },
  };

  const unitLabel = labels[language]?.[unit] || labels.en[unit];
  return `${value} ${unitLabel}`;
}

/**
 * Labels de calendrier par langue
 */
function getCalendarLabel(type: 'today' | 'tomorrow' | 'yesterday', language: string): string {
  const labels: Record<string, any> = {
    fr: {
      today: "Aujourd'hui",
      tomorrow: 'Demain',
      yesterday: 'Hier',
    },
    en: {
      today: 'Today',
      tomorrow: 'Tomorrow',
      yesterday: 'Yesterday',
    },
    es: {
      today: 'Hoy',
      tomorrow: 'Mañana',
      yesterday: 'Ayer',
    },
    de: {
      today: 'Heute',
      tomorrow: 'Morgen',
      yesterday: 'Gestern',
    },
    it: {
      today: 'Oggi',
      tomorrow: 'Domani',
      yesterday: 'Ieri',
    },
  };

  return labels[language]?.[type] || labels.en[type];
}