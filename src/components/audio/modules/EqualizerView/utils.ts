/**
 * Utilitaires pour l'EqualizerView
 */

import type { EQBand } from './types';

/**
 * Calcule le gain d'une bande spécifique pour une fréquence donnée
 */
const calculateBandGain = (band: EQBand, frequency: number): number => {
  if (!band.enabled) return 0;

  const ratio = frequency / band.frequency;
  let bandGain = 0;

  switch (band.type) {
    case 'BELL':
      const bellFactor = 1 / (1 + Math.pow((ratio - 1/ratio) * band.q, 2));
      bandGain = band.gain * bellFactor;
      break;
    case 'LOW_SHELF':
      if (frequency <= band.frequency) {
        bandGain = band.gain;
      } else {
        const shelfFactor = 1 / Math.sqrt(1 + Math.pow(frequency / band.frequency, 2));
        bandGain = band.gain * shelfFactor;
      }
      break;
    case 'HIGH_SHELF':
      if (frequency >= band.frequency) {
        bandGain = band.gain;
      } else {
        const shelfFactor = frequency / band.frequency / Math.sqrt(1 + Math.pow(frequency / band.frequency, 2));
        bandGain = band.gain * shelfFactor;
      }
      break;
  }
  
  return bandGain;
};

/**
 * Génération de la courbe de réponse EQ globale
 */
export const generateResponseCurve = (bands: EQBand[]): string => {
  const width = 340;
  const height = 140;
  const points: string[] = [];
  
  for (let x = 0; x <= width; x += 2) {
    // Conversion logarithmique des fréquences (20Hz - 20kHz)
    const freq = 20 * Math.pow(1000, x / width);
    let totalGain = 0;

    // Calculer la contribution de chaque bande
    bands.forEach(band => {
      totalGain += calculateBandGain(band, freq);
    });

    // Conversion gain vers position Y (centré, +12dB en haut, -12dB en bas)
    const y = height/2 - (totalGain / 24) * height;
    const clampedY = Math.max(0, Math.min(height, y));
    
    if (x === 0) {
      points.push(`M ${x} ${clampedY}`);
    } else {
      points.push(`L ${x} ${clampedY}`);
    }
  }

  return points.join(' ');
};

/**
 * Génération de la courbe de réponse pour une bande individuelle
 */
export const generateIndividualBandCurve = (band: EQBand): string => {
  const width = 340;
  const height = 140;
  const points: string[] = [];
  
  for (let x = 0; x <= width; x += 2) {
    // Conversion logarithmique des fréquences (20Hz - 20kHz)
    const freq = 20 * Math.pow(1000, x / width);
    const bandGain = calculateBandGain(band, freq);

    // Conversion gain vers position Y (centré, +12dB en haut, -12dB en bas)
    const y = height/2 - (bandGain / 24) * height;
    const clampedY = Math.max(0, Math.min(height, y));
    
    if (x === 0) {
      points.push(`M ${x} ${clampedY}`);
    } else {
      points.push(`L ${x} ${clampedY}`);
    }
  }

  return points.join(' ');
};

/**
 * Calcule la position X d'une fréquence sur le graphique
 * Formule inverse de: freq = 20 * Math.pow(1000, x / width)
 * Donc: x = width * Math.log(freq / 20) / Math.log(1000)
 */
export const getFrequencyPosition = (frequency: number): number => {
  const width = 340;
  // Clamp frequency entre 20Hz et 20kHz
  const clampedFreq = Math.max(20, Math.min(20000, frequency));
  // Formule inverse exacte de la courbe de réponse
  return width * Math.log(clampedFreq / 20) / Math.log(1000);
};

/**
 * Formate l'affichage d'une fréquence
 */
export const formatFrequency = (frequency: number): string => {
  if (frequency >= 1000) {
    const kHz = frequency / 1000;
    // Si c'est un nombre rond en kHz, ne pas afficher de décimale
    return kHz % 1 === 0 ? `${Math.round(kHz)}k` : `${kHz.toFixed(1)}k`;
  } else {
    // Arrondir les Hz à l'entier le plus proche
    return `${Math.round(frequency)}`;
  }
};

/**
 * Formate l'affichage d'un gain
 */
export const formatGain = (gain: number): string => {
  return `${gain > 0 ? '+' : ''}${gain.toFixed(1)}dB`;
};

/**
 * Formate l'affichage d'une fréquence avec unité
 */
export const formatFrequencyWithUnit = (frequency: number): string => {
  if (frequency >= 1000) {
    const kHz = frequency / 1000;
    // Si c'est un nombre rond en kHz, ne pas afficher de décimale
    const formattedKHz = kHz % 1 === 0 ? Math.round(kHz) : kHz.toFixed(1);
    return `${formattedKHz} kHz`;
  } else {
    // Arrondir les Hz à l'entier le plus proche
    return `${Math.round(frequency)} Hz`;
  }
};

/**
 * Retourne la couleur spécifique pour chaque bande
 */
export const getBandColor = (bandId: number, isSelected: boolean = false, audioColors: any): string => {
  const colors = {
    0: audioColors.equalizerColor, // LOW_SHELF
    1: audioColors.levelLow,       // BELL 1
    2: audioColors.levelMid,       // BELL 2
    3: audioColors.levelHigh,      // BELL 3
    4: audioColors.chorusColor,    // BELL 4
    5: audioColors.equalizerColor, // HIGH_SHELF
  };
  
  if (isSelected) {
    return audioColors.equalizerColor;
  }
  
  return colors[bandId as keyof typeof colors] || audioColors.equalizerColor;
};

/**
 * Retourne la couleur pour les sliders selon la bande
 */
export const getBandSliderColor = (bandId: number, audioColors: any): string => {
  const colors = {
    0: audioColors.equalizerColor, // LOW_SHELF
    1: audioColors.levelLow,       // BELL 1
    2: audioColors.levelMid,       // BELL 2
    3: audioColors.levelHigh,      // BELL 3
    4: audioColors.chorusColor,    // BELL 4
    5: audioColors.equalizerColor, // HIGH_SHELF
  };
  
  return colors[bandId as keyof typeof colors] || audioColors.equalizerColor;
};