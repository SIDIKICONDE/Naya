/**
 * Fonctions utilitaires pour le CompressorView
 */

/**
 * Calcule la sortie du compresseur selon les paramètres
 */
export const calculateCompressorOutput = (
  input: number,
  threshold: number,
  ratio: number,
  knee: number
): number => {
  if (input <= threshold - knee / 2) {
    return input; // Pas de compression
  } else if (input >= threshold + knee / 2) {
    // Compression complète
    const excess = input - threshold;
    return threshold + excess / ratio;
  } else {
    // Zone de knee (transition douce)
    const kneeRange = knee;
    const kneePosition = (input - (threshold - knee / 2)) / kneeRange;
    const compressionAmount = kneePosition * kneePosition;
    const linearOutput = input;
    const compressedOutput = threshold + (input - threshold) / ratio;
    return linearOutput + (compressedOutput - linearOutput) * compressionAmount;
  }
};

/**
 * Formate l'affichage du ratio
 */
export const formatRatio = (ratio: number): string => {
  return ratio >= 20 ? '∞:1' : `${ratio.toFixed(1)}:1`;
};

/**
 * Formate l'affichage du temps d'attaque
 */
export const formatAttack = (attack: number): string => {
  return attack < 1 ? `${(attack * 1000).toFixed(0)}μs` : `${attack.toFixed(1)}ms`;
};

/**
 * Formate l'affichage du temps de relâchement
 */
export const formatRelease = (release: number): string => {
  return release < 100 ? `${release.toFixed(0)}ms` : `${(release / 1000).toFixed(2)}s`;
};

/**
 * Formate l'affichage des décibels avec signe
 */
export const formatDecibels = (value: number, showSign: boolean = false): string => {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)} dB`;
};

/**
 * Génère la courbe SVG pour le graphique de compression
 */
export const generateCompressionCurve = (
  threshold: number,
  ratio: number,
  knee: number,
  width: number,
  height: number
): string => {
  const points: { x: number; y: number }[] = [];
  
  for (let input = -60; input <= 0; input += 1) {
    const output = calculateCompressorOutput(input, threshold, ratio, knee);
    const x = ((input + 60) / 60) * width;
    const y = height - ((output + 60) / 60) * height;
    points.push({ x, y });
  }
  
  return points.map((p, i) => 
    i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
  ).join(' ');
};

/**
 * Détermine la couleur selon la valeur
 */
export const getValueColor = (
  value: number,
  thresholds: { normal: string; warning: number; warningColor: string; danger: number; dangerColor: string }
): string => {
  if (value >= thresholds.danger) return thresholds.dangerColor;
  if (value >= thresholds.warning) return thresholds.warningColor;
  return thresholds.normal;
};

/**
 * Calcule le step adaptatif pour les sliders
 */
export const getAdaptiveStep = (value: number, baseStep: number, threshold: number): number => {
  return value < threshold ? baseStep : baseStep * 10;
};