/**
 * Données simulées pour les visualiseurs audio
 * À SUPPRIMER quand le vrai moteur audio sera connecté
 */

export class AudioMockData {
  private static startTime = Date.now();

  // Mock pour les métriques audio (VU-mètres)
  static getAudioMetrics() {
    const time = (Date.now() - this.startTime) * 0.001;
    
    // Simulation de niveaux audio variables
    const baseLeft = -20 + Math.sin(time * 2) * 15 + Math.random() * 5;
    const baseRight = -18 + Math.cos(time * 1.7) * 12 + Math.random() * 5;
    
    return {
      peak: {
        left: Math.max(-60, Math.min(0, baseLeft + 5)),
        right: Math.max(-60, Math.min(0, baseRight + 3)),
      },
      rms: {
        left: Math.max(-60, Math.min(0, baseLeft - 3)),
        right: Math.max(-60, Math.min(0, baseRight - 5)),
      }
    };
  }

  // Mock pour les données de spectre FFT
  static getSpectrumData(fftSize: number): Float32Array {
    const data = new Float32Array(fftSize / 2);
    const time = (Date.now() - this.startTime) * 0.001;
    
    for (let i = 0; i < data.length; i++) {
      const freq = (i / data.length) * 20000;
      const baseLevel = -30 - (Math.log10(freq + 1) * 20);
      const variation = Math.sin(time * 3 + i * 0.1) * 10;
      const noise = (Math.random() - 0.5) * 5;
      
      data[i] = Math.max(-90, Math.min(-10, baseLevel + variation + noise));
    }
    
    return data;
  }

  // Mock pour les données de forme d'onde
  static getWaveformData(bufferSize: number): { left: Float32Array; right: Float32Array } {
    const left = new Float32Array(bufferSize);
    const right = new Float32Array(bufferSize);
    const time = (Date.now() - this.startTime) * 0.001;
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      
      // Mélange de fréquences pour simuler un signal audio réaliste
      const fundamental = Math.sin(2 * Math.PI * 440 * t + time);
      const harmonic2 = Math.sin(2 * Math.PI * 880 * t + time) * 0.3;
      const harmonic3 = Math.sin(2 * Math.PI * 1320 * t + time) * 0.1;
      const noise = (Math.random() - 0.5) * 0.05;
      
      left[i] = (fundamental + harmonic2 + harmonic3 + noise) * 0.3;
      right[i] = (fundamental + harmonic2 + harmonic3 + noise) * 0.3 * Math.cos(time * 0.5);
    }
    
    return { left, right };
  }
}