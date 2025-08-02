export const palette = {
  // Couleurs de base
  white: '#FFFFFF',
  black: '#000000',
  
  // Gris
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // Bleus
  blue50: '#E3F2FD',
  blue100: '#BBDEFB',
  blue500: '#2196F3',
  blue700: '#1976D2',
  blue900: '#0D47A1',
  
  // Verts
  green50: '#E8F5E9',
  green500: '#4CAF50',
  green700: '#388E3C',
  
  // Rouges
  red50: '#FFEBEE',
  red500: '#F44336',
  red700: '#D32F2F',
  
  // Oranges
  orange50: '#FFF3E0',
  orange500: '#FF9800',
  orange700: '#F57C00',
  
  // Violets (pour audio)
  purple50: '#F3E5F5',
  purple500: '#9C27B0',
  purple700: '#7B1FA2',
  
  // Cyan (pour audio)
  cyan50: '#E0F2F1',
  cyan500: '#00BCD4',
  cyan700: '#0097A7',
  
  // Jaunes (pour audio)
  yellow500: '#FFEB3B',
  yellow700: '#FBC02D',
  
  // Roses (pour audio)
  pink500: '#E91E63',
  pink700: '#C2185B',
  
  // Indigo (pour audio)
  indigo500: '#3F51B5',
  indigo700: '#303F9F',
  
  // Teal (pour audio)
  teal500: '#009688',
  teal700: '#00796B',
};

// Couleurs sémantiques
export const semanticColors = {
  success: palette.green500,
  error: palette.red500,
  warning: palette.orange500,
  info: palette.blue500,
};

// Couleurs audio professionnelles
export const audioColors = {
  // Couleurs de visualisation audio (mode sombre par défaut)
  dark: {
    spectrumPrimary: '#00ff88',
    spectrumSecondary: '#ff9500',
    spectrumGradientStart: '#00ff88',
    spectrumGradientEnd: '#ff0055',
    spectrumNormal: '#33ff99',
    spectrumWarning: '#ffcc33',
    spectrumCaution: '#ff9933',
    spectrumAlert: '#ff3333',
    spectrumBackground: '#000000',
    
    // Couleurs de niveau (basées sur les standards audio)
    levelLow: '#4CAF50',      // Vert - signal sain
    levelMid: '#FFEB3B',      // Jaune - signal modéré
    levelHigh: '#FF9800',     // Orange - signal élevé
    levelPeak: '#FF5722',     // Rouge orange - pic
    levelClip: '#F44336',     // Rouge - écrêtage
    levelMeterColor: '#2196F3', // Bleu - couleur de base pour les vumètres
    rmsNormal: '#33ff99',
    rmsWarning: '#ffcc33',
    rmsCaution: '#ff9933',
    rmsAlert: '#ff3333',
    
    // Couleurs d'oscilloscope
    waveformLeft: '#00ff88',
    waveformRight: '#ff6600',
    triggerLine: 'rgba(255, 255, 0, 0.5)',
    gridLine: 'rgba(255, 255, 255, 0.1)',
    gridLineMajor: 'rgba(255, 255, 255, 0.3)',
    
    // Couleurs des modules audio (palette professionnelle)
    equalizerColor: '#00BCD4',    // Cyan - EQ
    compressorColor: '#FF9800',   // Orange - Compresseur
    reverbColor: '#9C27B0',       // Violet - Reverb
    delayColor: '#3F51B5',        // Indigo - Delay
    chorusColor: '#E91E63',       // Rose - Chorus
    distortionColor: '#FF5722',   // Rouge orange - Distortion
    limiterColor: '#795548',      // Marron - Limiter
    gateColor: '#607D8B',         // Bleu gris - Gate
    flangerColor: '#009688',      // Teal - Flanger
    phaserColor: '#FFC107',       // Ambre - Phaser
    pitchShiftColor: '#795548',    // Marron - Pitch Shifter
    harmonizerColor: '#8BC34A',   // Vert clair - Harmoniseur
    
    // Couleurs de fond
    moduleBackground: '#1a1a1a',

    // Couleurs d'interface audio
    knobBackground: '#2a2a2a',
    knobActive: '#ff9500',
    sliderTrack: '#333333',
    sliderThumb: '#ff9500',
    buttonActive: '#ff9500',
    buttonInactive: '#666666',
    text: '#FFFFFF',
    
    // Couleurs de contrôle
    bypass: '#666666',
    solo: '#FFEB3B',
    mute: '#F44336',
    record: '#F44336',
    play: '#4CAF50',
    
    // Couleurs de visualisation 3D
    visualizer3DPrimary: '#00ff88',
    visualizer3DSecondary: '#ff9500',
    visualizer3DAccent: '#ff0055',
    visualizer3DNormal: '#33ff99',
    visualizer3DWarning: '#ffcc33',
    visualizer3DCaution: '#ff9933',
    visualizer3DAlert: '#ff3333',
    visualizer3DActive: '#00ff88',
    panelActive: '#00ff88',
  },
  
  // Couleurs audio pour mode clair
  light: {
    spectrumPrimary: '#2196F3',
    spectrumSecondary: '#FF9800',
    spectrumGradientStart: '#2196F3',
    spectrumGradientEnd: '#E91E63',
    spectrumNormal: '#2196F3',
    spectrumWarning: '#FF9800',
    spectrumCaution: '#FF5722',
    spectrumAlert: '#F44336',
    spectrumBackground: '#FFFFFF',
    
    // Couleurs de niveau (adaptées pour le mode clair)
    levelLow: '#4CAF50',
    levelMid: '#FF9800',
    levelHigh: '#FF5722',
    levelPeak: '#F44336',
    levelClip: '#D32F2F',
    levelMeterColor: '#1976D2',
    rmsNormal: '#2196F3',
    rmsWarning: '#FF9800',
    rmsCaution: '#FF5722',
    rmsAlert: '#F44336',
    
    // Couleurs d'oscilloscope
    waveformLeft: '#2196F3',
    waveformRight: '#FF9800',
    triggerLine: 'rgba(255, 193, 7, 0.5)',
    gridLine: 'rgba(0, 0, 0, 0.1)',
    gridLineMajor: 'rgba(0, 0, 0, 0.3)',
    
    // Couleurs des modules audio (plus douces pour le mode clair)
    equalizerColor: '#00BCD4',
    compressorColor: '#FF9800',
    reverbColor: '#9C27B0',
    delayColor: '#3F51B5',
    chorusColor: '#E91E63',
    distortionColor: '#FF5722',
    limiterColor: '#795548',
    gateColor: '#607D8B',
    flangerColor: '#009688',
    phaserColor: '#FFC107',
    pitchShiftColor: '#795548',
    harmonizerColor: '#8BC34A',
    
    // Couleurs de fond
    moduleBackground: '#FFFFFF',

    // Couleurs d'interface audio
    knobBackground: '#F5F5F5',
    knobActive: '#FF9800',
    sliderTrack: '#E0E0E0',
    sliderThumb: '#FF9800',
    buttonActive: '#FF9800',
    buttonInactive: '#BDBDBD',
    text: '#212121',
    
    // Couleurs de contrôle
    bypass: '#9E9E9E',
    solo: '#FF9800',
    mute: '#F44336',
    record: '#F44336',
    play: '#4CAF50',
    
    // Couleurs de visualisation 3D
    visualizer3DPrimary: '#2196F3',
    visualizer3DSecondary: '#FF9800',
    visualizer3DAccent: '#E91E63',
    visualizer3DNormal: '#2196F3',
    visualizer3DWarning: '#FF9800',
    visualizer3DCaution: '#FF5722',
    visualizer3DAlert: '#F44336',
    visualizer3DActive: '#2196F3',
    panelActive: '#2196F3',
  }
};