/**
 * Compressor.cpp
 * Implémentation minimale du compresseur
 */

#include "Compressor.h"
#include <cmath>
#include <algorithm>
#include <iostream>

namespace facebook::react {

Compressor::Compressor() 
    : m_gainReduction(0.0), m_envelope(0.0), m_configured(false) {
    
    std::cout << "[Compressor] Constructeur" << std::endl;
    
    // Configuration par défaut
    m_config = {
        -20.0,  // threshold
        4.0,    // ratio
        10.0,   // attack
        100.0,  // release
        0.0     // makeup gain
    };
}

Compressor::~Compressor() {
    std::cout << "[Compressor] Destructeur" << std::endl;
}

bool Compressor::configure(const CompressorConfig& config) {
    if (config.ratio < 1.0 || config.attackTime < 0.1 || config.releaseTime < 1.0) {
        std::cout << "[Compressor] Configuration invalide" << std::endl;
        return false;
    }
    
    m_config = config;
    m_configured = true;
    
    std::cout << "[Compressor] Configuré: threshold=" << config.threshold 
              << "dB, ratio=" << config.ratio << ":1" << std::endl;
    
    return true;
}

double Compressor::processSample(double input, double sampleRate) {
    if (!m_configured) {
        return input;
    }
    
    // Conversion en dB
    double inputLevel = linearToDb(std::abs(input));
    
    // Calcul de la réduction de gain
    double targetGainReduction = 0.0;
    
    if (inputLevel > m_config.threshold) {
        double overshoot = inputLevel - m_config.threshold;
        targetGainReduction = overshoot * (1.0 - 1.0/m_config.ratio);
    }
    
    // Lissage de l'enveloppe (attack/release)
    double attackCoeff = std::exp(-1.0 / (m_config.attackTime * 0.001 * sampleRate));
    double releaseCoeff = std::exp(-1.0 / (m_config.releaseTime * 0.001 * sampleRate));
    
    if (targetGainReduction > m_gainReduction) {
        // Attack
        m_gainReduction = targetGainReduction + (m_gainReduction - targetGainReduction) * attackCoeff;
    } else {
        // Release
        m_gainReduction = targetGainReduction + (m_gainReduction - targetGainReduction) * releaseCoeff;
    }
    
    // Application du gain et makeup gain
    double totalGain = -m_gainReduction + m_config.makeupGain;
    double gainLinear = dbToLinear(totalGain);
    
    return input * gainLinear;
}

void Compressor::processBuffer(
    const std::vector<float>& input,
    std::vector<float>& output,
    double sampleRate
) {
    output.resize(input.size());
    
    for (size_t i = 0; i < input.size(); i++) {
        output[i] = static_cast<float>(processSample(input[i], sampleRate));
    }
}

double Compressor::dbToLinear(double db) const {
    return std::pow(10.0, db / 20.0);
}

double Compressor::linearToDb(double linear) const {
    return 20.0 * std::log10(std::max(linear, 1e-10));
}

} // namespace facebook::react