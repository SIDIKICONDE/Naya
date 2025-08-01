/**
 * SpectrumAnalyzer.cpp
 * Implémentation minimale de l'analyse spectrale
 */

#include "SpectrumAnalyzer.h"
#include "../dsp/FFTProcessor.h"
#include <cmath>
#include <algorithm>
#include <iostream>

namespace facebook::react {

SpectrumAnalyzer::SpectrumAnalyzer() 
    : m_fftSize(1024), m_sampleRate(44100), m_initialized(false) {
    std::cout << "[SpectrumAnalyzer] Constructeur" << std::endl;
}

SpectrumAnalyzer::~SpectrumAnalyzer() {
    std::cout << "[SpectrumAnalyzer] Destructeur" << std::endl;
}

bool SpectrumAnalyzer::initialize(int fftSize, int sampleRate) {
    if (!FFTProcessor::isPowerOfTwo(fftSize)) {
        std::cout << "[SpectrumAnalyzer] FFT size doit être une puissance de 2" << std::endl;
        return false;
    }
    
    if (sampleRate < 8000 || sampleRate > 192000) {
        std::cout << "[SpectrumAnalyzer] Sample rate invalide: " << sampleRate << std::endl;
        return false;
    }
    
    m_fftSize = fftSize;
    m_sampleRate = sampleRate;
    
    generateTukeyWindow();
    m_initialized = true;
    
    std::cout << "[SpectrumAnalyzer] Initialisé: FFT=" << fftSize 
              << ", SR=" << sampleRate << "Hz" << std::endl;
    
    return true;
}

bool SpectrumAnalyzer::analyzeBuffer(const std::vector<float>& input, SpectrumData& output) {
    if (!m_initialized || input.size() < static_cast<size_t>(m_fftSize)) {
        std::cout << "[SpectrumAnalyzer] Erreur: non initialisé ou buffer trop petit" << std::endl;
        return false;
    }
    
    // Copie et fenêtrage
    std::vector<float> windowedInput(input.begin(), input.begin() + m_fftSize);
    for (int i = 0; i < m_fftSize; i++) {
        windowedInput[i] *= m_window[i];
    }
    
    // FFT
    std::vector<std::complex<float>> fftOutput;
    FFTProcessor::simpleFFT(windowedInput, fftOutput);
    
    // Calcul des magnitudes
    std::vector<float> magnitudes;
    FFTProcessor::magnitude(fftOutput, magnitudes);
    
    // Préparation des fréquences
    std::vector<float> frequencies(m_fftSize / 2);
    for (int i = 0; i < m_fftSize / 2; i++) {
        frequencies[i] = static_cast<float>(i * m_sampleRate) / m_fftSize;
    }
    
    // Remplissage de la structure de sortie
    output.frequencies = frequencies;
    output.magnitudes = std::vector<float>(magnitudes.begin(), magnitudes.begin() + m_fftSize / 2);
    output.sampleRate = m_sampleRate;
    output.fftSize = m_fftSize;
    
    return true;
}

double SpectrumAnalyzer::getBandEnergy(
    const SpectrumData& spectrum,
    double lowFreq,
    double highFreq
) {
    double energy = 0.0;
    
    for (size_t i = 0; i < spectrum.frequencies.size(); i++) {
        if (spectrum.frequencies[i] >= lowFreq && spectrum.frequencies[i] <= highFreq) {
            energy += spectrum.magnitudes[i] * spectrum.magnitudes[i];
        }
    }
    
    return std::sqrt(energy);
}

double SpectrumAnalyzer::findPeakFrequency(const SpectrumData& spectrum) {
    if (spectrum.magnitudes.empty()) return 0.0;
    
    auto maxIt = std::max_element(spectrum.magnitudes.begin(), spectrum.magnitudes.end());
    size_t maxIndex = std::distance(spectrum.magnitudes.begin(), maxIt);
    
    if (maxIndex < spectrum.frequencies.size()) {
        return spectrum.frequencies[maxIndex];
    }
    
    return 0.0;
}

void SpectrumAnalyzer::generateTukeyWindow() {
    m_window.resize(m_fftSize);
    double alpha = 0.25; // 25% de transition - optimal pour audio
    
    for (int i = 0; i < m_fftSize; i++) {
        float window = 1.0f;
        
        // Transition de montée (cosinus)
        if (i < alpha * m_fftSize / 2) {
            window = 0.5f * (1.0f + std::cos(M_PI * (2.0f * i / (alpha * m_fftSize) - 1.0f)));
        }
        // Plateau plat au centre
        else if (i <= (1.0 - alpha / 2.0) * m_fftSize) {
            window = 1.0f;
        }
        // Transition de descente (cosinus)
        else {
            window = 0.5f * (1.0f + std::cos(M_PI * (2.0f * i / (alpha * m_fftSize) - 2.0f / alpha + 1.0f)));
        }
        
        m_window[i] = window;
    }
}

void SpectrumAnalyzer::generateHanningWindow() {
    m_window.resize(m_fftSize);
    
    for (int i = 0; i < m_fftSize; i++) {
        m_window[i] = 0.5f * (1.0f - std::cos(2.0f * M_PI * i / (m_fftSize - 1)));
    }
}

} // namespace facebook::react