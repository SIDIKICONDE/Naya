/**
 * SpectrumAnalyzer.h
 * Module minimal pour l'analyse spectrale
 */

#pragma once

#include <vector>
#include <complex>

namespace facebook::react {

/**
 * Données de spectre
 */
struct SpectrumData {
    std::vector<float> frequencies;
    std::vector<float> magnitudes;
    int sampleRate;
    int fftSize;
};

/**
 * Analyseur de spectre minimal
 */
class SpectrumAnalyzer {
public:
    SpectrumAnalyzer();
    ~SpectrumAnalyzer();

    /**
     * Initialise l'analyseur
     */
    bool initialize(int fftSize, int sampleRate);

    /**
     * Analyse le spectre d'un buffer
     */
    bool analyzeBuffer(const std::vector<float>& input, SpectrumData& output);

    /**
     * Calcule l'énergie dans une bande de fréquence
     */
    static double getBandEnergy(
        const SpectrumData& spectrum,
        double lowFreq,
        double highFreq
    );

    /**
     * Trouve la fréquence dominante
     */
    static double findPeakFrequency(const SpectrumData& spectrum);

private:
    int m_fftSize;
    int m_sampleRate;
    bool m_initialized;
    
    std::vector<float> m_window;
    
    void generateTukeyWindow();
    void generateHanningWindow();
};

} // namespace facebook::react