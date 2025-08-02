/**
 * Générateur de données simulées pour les visualiseurs audio
 * Produit des données réalistes pour les tests et le développement
 */

export interface MockLevelData {
  peak: { left: number; right: number };
  rms: { left: number; right: number };
  lufs: { momentary: number; shortTerm: number; integrated: number; range: number };
  truePeak: { left: number; right: number };
  correlation: number;
  phase: number;
  crestFactor: number;
  dynamicRange: number;
}

export interface MockSpectrumData {
  frequencies: Float32Array;
  magnitudes: Float32Array;
  timestamp: number;
}

export class MockDataGenerator {
  private static instance: MockDataGenerator;
  private time: number = 0;
  private baseFrequency: number = 440; // La 440Hz
  private running: boolean = false;
  private lastUpdate: number = 0;
  
  // Paramètres de simulation audio
  private musicState = {
    hasKick: false,
    hasSnare: false,
    hasBass: false,
    hasMelody: false,
    kickPhase: 0,
    snarePhase: 0,
    bassPhase: 0,
    melodyPhase: 0
  };

  static getInstance(): MockDataGenerator {
    if (!MockDataGenerator.instance) {
      MockDataGenerator.instance = new MockDataGenerator();
    }
    return MockDataGenerator.instance;
  }

  start(): void {
    this.running = true;
    this.lastUpdate = Date.now();
    console.log('[MockDataGenerator] Démarrage de la génération de données simulées');
  }

  stop(): void {
    this.running = false;
    console.log('[MockDataGenerator] Arrêt de la génération de données simulées');
  }

  // ==================== GÉNÉRATION DE NIVEAUX AUDIO ====================

  generateLevelData(): MockLevelData {
    if (!this.running) {
      return this.getSilentLevelData();
    }

    const now = Date.now();
    const deltaTime = (now - this.lastUpdate) / 1000;
    this.time += deltaTime;
    this.lastUpdate = now;

    this.updateMusicState();

    // Simulation d'un mix musical réaliste
    const kickLevel = this.musicState.hasKick ? this.generateKickLevel() : 0;
    const snareLevel = this.musicState.hasSnare ? this.generateSnareLevel() : 0;
    const bassLevel = this.musicState.hasBass ? this.generateBassLevel() : 0;
    const melodyLevel = this.musicState.hasMelody ? this.generateMelodyLevel() : 0;

    // Mix des éléments
    const leftPeak = Math.max(kickLevel, snareLevel * 0.8, bassLevel * 0.9, melodyLevel);
    const rightPeak = Math.max(kickLevel, snareLevel, bassLevel * 0.7, melodyLevel * 1.1);

    // RMS est généralement 6-12dB en dessous du peak
    const leftRms = leftPeak - 8 - Math.random() * 4;
    const rightRms = rightPeak - 8 - Math.random() * 4;

    // LUFS pour la sonie perçue
    const momentaryLufs = Math.max(leftRms, rightRms) - 3;
    const shortTermLufs = momentaryLufs - 1;
    const integratedLufs = shortTermLufs - 2;

    // True peak légèrement au-dessus du peak
    const leftTruePeak = leftPeak + Math.random() * 1.5;
    const rightTruePeak = rightPeak + Math.random() * 1.5;

    // Corrélation stéréo
    const correlation = 0.3 + Math.random() * 0.5; // Typique pour la musique

    // Phase entre les canaux
    const phase = (Math.sin(this.time * 0.1) * 5) + (Math.random() - 0.5) * 2;

    // Facteur de crête (peak/RMS ratio)
    const crestFactor = leftPeak - leftRms;

    // Plage dynamique
    const dynamicRange = 12 + Math.sin(this.time * 0.05) * 6;

    return {
      peak: { 
        left: Math.max(-60, leftPeak), 
        right: Math.max(-60, rightPeak) 
      },
      rms: { 
        left: Math.max(-60, leftRms), 
        right: Math.max(-60, rightRms) 
      },
      lufs: {
        momentary: Math.max(-60, momentaryLufs),
        shortTerm: Math.max(-60, shortTermLufs),
        integrated: Math.max(-60, integratedLufs),
        range: Math.max(0, dynamicRange)
      },
      truePeak: { 
        left: Math.max(-60, leftTruePeak), 
        right: Math.max(-60, rightTruePeak) 
      },
      correlation: Math.max(-1, Math.min(1, correlation)),
      phase: Math.max(-180, Math.min(180, phase)),
      crestFactor: Math.max(0, crestFactor),
      dynamicRange: Math.max(0, dynamicRange)
    };
  }

  // ==================== GÉNÉRATION DE SPECTRE ====================

  generateSpectrumData(fftSize: number = 2048): MockSpectrumData {
    const frequencies = new Float32Array(fftSize / 2);
    const magnitudes = new Float32Array(fftSize / 2);
    
    if (!this.running) {
      // Retourner un spectre silencieux
      frequencies.fill(0);
      magnitudes.fill(-80);
      return {
        frequencies,
        magnitudes,
        timestamp: Date.now()
      };
    }

    const sampleRate = 48000;
    const nyquist = sampleRate / 2;

    // Générer les fréquences
    for (let i = 0; i < frequencies.length; i++) {
      frequencies[i] = (i / frequencies.length) * nyquist;
    }

    // Générer un spectre musical réaliste
    for (let i = 0; i < magnitudes.length; i++) {
      const freq = frequencies[i];
      let magnitude = -80; // Plancher de bruit

      // Composantes de basse fréquence (20-200 Hz) - Kick et basse
      if (freq >= 20 && freq <= 200) {
        if (this.musicState.hasKick && freq >= 40 && freq <= 80) {
          magnitude = Math.max(magnitude, -12 + Math.sin(this.musicState.kickPhase) * 6);
        }
        if (this.musicState.hasBass && freq >= 80 && freq <= 200) {
          magnitude = Math.max(magnitude, -18 + Math.sin(this.musicState.bassPhase) * 4);
        }
      }

      // Médiums (200-2000 Hz) - Instruments et voix
      if (freq >= 200 && freq <= 2000) {
        if (this.musicState.hasSnare && freq >= 200 && freq <= 800) {
          magnitude = Math.max(magnitude, -15 + Math.sin(this.musicState.snarePhase) * 8);
        }
        if (this.musicState.hasMelody && freq >= 400 && freq <= 1500) {
          magnitude = Math.max(magnitude, -20 + Math.sin(this.musicState.melodyPhase) * 5);
        }
      }

      // Aigus (2-20 kHz) - Cymbales et harmoniques
      if (freq >= 2000 && freq <= 20000) {
        if (this.musicState.hasSnare && freq >= 3000 && freq <= 8000) {
          magnitude = Math.max(magnitude, -25 + Math.sin(this.musicState.snarePhase * 2) * 6);
        }
        // Atténuation naturelle dans les aigus
        const rolloff = Math.max(0, 1 - (freq - 2000) / 18000);
        magnitude -= (1 - rolloff) * 20;
      }

      // Ajouter du bruit rose réaliste
      const pinkNoise = -60 + (Math.random() - 0.5) * 10;
      const freqWeight = Math.log10(Math.max(1, freq / 20)) / Math.log10(1000); // Pondération 1/f
      magnitude = Math.max(magnitude, pinkNoise - freqWeight * 30);

      magnitudes[i] = magnitude;
    }

    return {
      frequencies,
      magnitudes,
      timestamp: Date.now()
    };
  }

  // ==================== MÉTHODES PRIVÉES ====================

  private getSilentLevelData(): MockLevelData {
    return {
      peak: { left: -60, right: -60 },
      rms: { left: -60, right: -60 },
      lufs: { momentary: -60, shortTerm: -60, integrated: -60, range: 0 },
      truePeak: { left: -60, right: -60 },
      correlation: 0,
      phase: 0,
      crestFactor: 0,
      dynamicRange: 0
    };
  }

  private updateMusicState(): void {
    // Simuler des patterns musicaux réalistes
    const beatTime = (this.time * 2) % 4; // 120 BPM, 4/4
    
    // Kick sur les temps 1 et 3
    this.musicState.hasKick = (beatTime < 0.1) || (beatTime >= 2 && beatTime < 2.1);
    this.musicState.kickPhase = this.time * 60 * Math.PI; // 60 Hz kick
    
    // Snare sur les temps 2 et 4
    this.musicState.hasSnare = (beatTime >= 1 && beatTime < 1.2) || (beatTime >= 3 && beatTime < 3.2);
    this.musicState.snarePhase = this.time * 200 * Math.PI; // 200 Hz snare fundamental
    
    // Basse continue avec variations
    this.musicState.hasBass = true;
    this.musicState.bassPhase = this.time * 110 * Math.PI; // Basse en La
    
    // Mélodie avec phrases musicales
    const phraseTime = (this.time * 0.5) % 8; // Phrases de 8 mesures
    this.musicState.hasMelody = phraseTime < 6; // Pauses dans la mélodie
    this.musicState.melodyPhase = this.time * 440 * Math.PI; // La 440Hz
  }

  private generateKickLevel(): number {
    // Kick punch avec decay rapide
    const envelope = Math.max(0, 1 - (this.musicState.kickPhase % (Math.PI * 2)) / (Math.PI * 0.3));
    return -5 - (1 - envelope) * 25; // -5dB peak, decay vers -30dB
  }

  private generateSnareLevel(): number {
    // Snare avec attack rapide et decay
    const envelope = Math.max(0, 1 - (this.musicState.snarePhase % (Math.PI * 4)) / (Math.PI * 0.8));
    return -8 - (1 - envelope) * 20; // -8dB peak
  }

  private generateBassLevel(): number {
    // Basse continue avec modulation
    const level = Math.sin(this.musicState.bassPhase) * Math.sin(this.time * 0.5);
    return -15 + level * 5; // Oscillation entre -20dB et -10dB
  }

  private generateMelodyLevel(): number {
    // Mélodie avec vibrato et dynamique
    const vibrato = 1 + Math.sin(this.time * 6) * 0.1; // Vibrato 6Hz
    const dynamics = 0.7 + Math.sin(this.time * 0.25) * 0.3; // Variations lentes
    const level = Math.sin(this.musicState.melodyPhase * vibrato) * dynamics;
    return -18 + level * 8; // -26dB à -10dB
  }
}

// Export de l'instance singleton
export const mockDataGenerator = MockDataGenerator.getInstance();