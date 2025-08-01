/**
 * NoiseReduction.cpp
 * Implémentation minimale de la réduction de bruit
 */

#include "NoiseReduction.h"
#include <cmath>
#include <algorithm>
#include <numeric>
#include <iostream>

namespace facebook::react {

NoiseReduction::NoiseReduction() 
    : m_configured(false), m_enabled(false), m_noiseLevel(0.0) {
    
    std::cout << "[NoiseReduction] Constructeur" << std::endl;
    
    // Configuration par défaut
    m_config = {
        0.5,   // intensity
        -40.0, // threshold
        true   // adaptive
    };
}

NoiseReduction::~NoiseReduction() {
    std::cout << "[NoiseReduction] Destructeur" << std::endl;
}

bool NoiseReduction::configure(const NoiseReductionConfig& config) {
    if (config.intensity < 0.0 || config.intensity > 1.0) {
        std::cout << "[NoiseReduction] Intensité invalide: " << config.intensity << std::endl;
        return false;
    }
    
    m_config = config;
    m_configured = true;
    
    std::cout << "[NoiseReduction] Configuré: intensité=" << config.intensity 
              << ", seuil=" << config.threshold << "dB" << std::endl;
    
    return true;
}

void NoiseReduction::analyzeNoiseProfile(const std::vector<float>& noiseBuffer) {
    if (noiseBuffer.empty()) {
        std::cout << "[NoiseReduction] Buffer de bruit vide" << std::endl;
        return;
    }
    
    m_noiseProfile = noiseBuffer;
    m_noiseLevel = calculateNoiseLevel(noiseBuffer);
    
    std::cout << "[NoiseReduction] Profil de bruit analysé, niveau: " 
              << m_noiseLevel << std::endl;
}

void NoiseReduction::processBuffer(
    const std::vector<float>& input,
    std::vector<float>& output
) {
    output.resize(input.size());
    
    if (!m_configured || !m_enabled) {
        output = input;
        return;
    }
    
    // Traitement simple de réduction de bruit
    for (size_t i = 0; i < input.size(); i++) {
        output[i] = static_cast<float>(applyReduction(input[i], m_noiseLevel));
    }
}

double NoiseReduction::calculateNoiseLevel(const std::vector<float>& buffer) {
    if (buffer.empty()) return 0.0;
    
    // Calcul RMS simple
    double sum = 0.0;
    for (float sample : buffer) {
        sum += sample * sample;
    }
    
    double rms = std::sqrt(sum / buffer.size());
    return 20.0 * std::log10(std::max(rms, 1e-10));
}

double NoiseReduction::applyReduction(double input, double noiseLevel) {
    double inputLevel = 20.0 * std::log10(std::max(std::abs(input), 1e-10));
    
    // Si le signal est en dessous du seuil de bruit, on le réduit
    if (inputLevel < m_config.threshold) {
        double reductionFactor = 1.0 - m_config.intensity * 
                                (m_config.threshold - inputLevel) / m_config.threshold;
        reductionFactor = std::max(reductionFactor, 0.1); // Minimum 10% du signal original
        return input * reductionFactor;
    }
    
    return input;
}

} // namespace facebook::react