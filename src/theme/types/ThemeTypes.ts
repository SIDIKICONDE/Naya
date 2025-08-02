export type ColorScheme = 'light' | 'dark';

export interface AudioColors {
  // Couleurs de fond
  moduleBackground: string;

  // Couleurs de visualisation audio
  spectrumPrimary: string;
  spectrumSecondary: string;
  spectrumGradientStart: string;
  spectrumGradientEnd: string;
  spectrumNormal: string;
  spectrumWarning: string;
  spectrumCaution: string;
  spectrumAlert: string;
  spectrumBackground: string;
  
  // Couleurs de niveau
  levelLow: string;
  levelMid: string;
  levelHigh: string;
  levelPeak: string;
  levelClip: string;
  levelMeterColor: string;
  rmsNormal: string;
  rmsWarning: string;
  rmsCaution: string;
  rmsAlert: string;
  
  // Couleurs d'oscilloscope
  waveformLeft: string;
  waveformRight: string;
  triggerLine: string;
  gridLine: string;
  gridLineMajor: string;
  
  // Couleurs des modules audio
  equalizerColor: string;
  compressorColor: string;
  reverbColor: string;
  delayColor: string;
  chorusColor: string;
  distortionColor: string;
  limiterColor: string;
  gateColor: string;
  flangerColor: string;
  phaserColor: string;
  pitchShiftColor: string;
  harmonizerColor: string;
  
  // Couleurs d'interface audio
  knobBackground: string;
  knobActive: string;
  sliderTrack: string;
  sliderThumb: string;
  buttonActive: string;
  buttonInactive: string;
  text: string;
  
  // Couleurs de contrôle
  bypass: string;
  solo: string;
  mute: string;
  record: string;
  play: string;
  
  // Couleurs de visualisation 3D
  visualizer3DPrimary: string;
  visualizer3DSecondary: string;
  visualizer3DAccent: string;
  visualizer3DNormal: string;
  visualizer3DWarning: string;
  visualizer3DCaution: string;
  visualizer3DAlert: string;
  visualizer3DActive: string;
  panelActive: string;
}

export interface ThemeColors {
  // Couleurs primaires
  primary: string;
  primaryDark: string;
  primaryLight: string;
  
  // Couleurs secondaires
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  
  // Couleurs de fond
  background: string;
  surface: string;
  surfaceVariant: string;
  
  // Couleurs de texte
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  
  // Couleurs d'état
  error: string;
  warning: string;
  success: string;
  info: string;
  
  // Couleurs de bordure
  border: string;
  divider: string;
  
  // Couleurs d'interaction
  ripple: string;
  highlight: string;
  
  // Couleurs système
  statusBar: string;
  navigationBar: string;
  
  // Couleurs audio spécialisées
  audio: AudioColors;
}

export type FontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

export interface ThemeTypography {
  h1: {
    fontSize: number;
    lineHeight: number;
    fontWeight: FontWeight;
  };
  h2: {
    fontSize: number;
    lineHeight: number;
    fontWeight: FontWeight;
  };
  body1: {
    fontSize: number;
    lineHeight: number;
    fontWeight: FontWeight;
  };
  body2: {
    fontSize: number;
    lineHeight: number;
    fontWeight: FontWeight;
  };
  button: {
    fontSize: number;
    lineHeight: number;
    fontWeight: FontWeight;
  };
  caption: {
    fontSize: number;
    lineHeight: number;
    fontWeight: FontWeight;
  };
}

export interface ThemeSpacing {
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface Theme {
  colorScheme: ColorScheme;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
}

export interface ThemeContextValue {
  theme: Theme;
  systemTheme: ColorScheme;
  setTheme: (theme: ColorScheme | 'system') => void;
}