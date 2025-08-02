/**
 * Énumérations pour le système audio
 */

export enum ModuleType {
  // Égaliseurs
  PARAMETRIC_EQ = 'PARAMETRIC_EQ',
  GRAPHIC_EQ = 'GRAPHIC_EQ',
  MULTIBAND_EQ = 'MULTIBAND_EQ',
  
  // Compression dynamique
  COMPRESSOR = 'COMPRESSOR',
  LIMITER = 'LIMITER',
  GATE = 'GATE',
  MULTIBAND_COMPRESSOR = 'MULTIBAND_COMPRESSOR',
  DE_ESSER = 'DE_ESSER',
  
  // Effets
  REVERB = 'REVERB',
  DELAY = 'DELAY',
  CHORUS = 'CHORUS',
  FLANGER = 'FLANGER',
  PHASER = 'PHASER',
  DISTORTION = 'DISTORTION',
  PITCH_SHIFTER = 'PITCH_SHIFTER',
  HARMONIZER = 'HARMONIZER',
  
  // Analyse et utilitaires
  OSCILLOSCOPE = 'OSCILLOSCOPE',
  LEVEL_METER = 'LEVEL_METER',
  NOISE_REDUCER = 'NOISE_REDUCER',
  STEREO_ENHANCER = 'STEREO_ENHANCER'
}

export enum FilterType {
  PEAK = 0,
  LOW_SHELF = 1,
  HIGH_SHELF = 2,
  LOW_PASS = 3,
  HIGH_PASS = 4,
  BAND_PASS = 5,
  NOTCH = 6,
  ALL_PASS = 7
}

export enum Algorithm {
  SPECTRAL = 0,
  WIENER = 1,
  NEURAL = 2,
  HYBRID = 3,
  AI = 4
}

export enum QualityMode {
  FAST = 0,
  BALANCED = 1,
  HIGH_QUALITY = 2
}

export enum CompressorMode {
  PEAK = 0,
  RMS = 1,
  FEEDBACK = 2,
  FEEDFORWARD = 3
}

export enum ReverbType {
  ROOM = 'ROOM',
  HALL = 'HALL',
  PLATE = 'PLATE',
  SPRING = 'SPRING',
  CHAMBER = 'CHAMBER'
}