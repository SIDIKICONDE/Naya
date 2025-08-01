/**
 * Normalizer.cpp
 * Implémentation de la normalisation audio
 */

#include "Normalizer.h"
#include <cmath>
#include <algorithm>
#include <iostream>

namespace facebook::react {

Normalizer::Normalizer() 
    : m_configured(false), m_enabled(false), 
      m_currentGain(1.0), m_targetGain(1.0), m_gainSmoothingFactor(0.01) {
    
    std::cout << "[Normalizer] Constructeur" << std::endl;
    
    // Configuration par défaut
    m_config = {
        NormalizationType::PEAK_NORMALIZATION,  // type
        -3.0,   // targetLevel
        true,   // preserveDynamics
        -20.0,  // maxGainReduction
        20.0,   // maxGainBoost
        true    // enableLimiting
    };
    
    // Statistiques par défaut
    m_lastStats = {
        0.0, 0.0, 0.0, 0.0, 0.0, false
    };
}

Normalizer::~Normalizer() {
    std::cout << "[Normalizer] Destructeur" << std::endl;
}

bool Normalizer::configure(const NormalizationConfig& config) {
    if (config.targetLevel > 0.0 || config.targetLevel < -60.0) {
        std::cout << "[Normalizer] Niveau cible invalide: " << config.targetLevel << "dB" << std::endl;
        return false;
    }
    
    if (config.maxGainReduction > 0.0 || config.maxGainBoost < 0.0) {
        std::cout << "[Normalizer] Plages de gain invalides" << std::endl;
        return false;
    }
    
    m_config = config;
    m_configured = true;
    
    std::cout << "[Normalizer] Configuré: type=" << static_cast<int>(config.type)
              << ", cible=" << config.targetLevel << "dB" << std::endl;
    
    return true;
}

NormalizationStats Normalizer::analyzeBuffer(const std::vector<float>& buffer) {
    NormalizationStats stats = {0.0, 0.0, 0.0, 0.0, 0.0, false};
    
    if (buffer.empty()) {
        return stats;
    }
    
    // Calcul des métriques originales
    stats.originalPeak = linearToDb(calculatePeak(buffer));
    stats.originalRMS = linearToDb(calculateRMS(buffer));
    stats.clippingDetected = detectClipping(buffer);
    
    // Calcul du gain nécessaire
    stats.appliedGain = calculateNormalizationGain(buffer, m_config.type);
    
    // Limitation du gain
    stats.appliedGain = std::clamp(stats.appliedGain, 
                                   m_config.maxGainReduction, 
                                   m_config.maxGainBoost);
    
    // Calcul des métriques finales
    stats.finalPeak = stats.originalPeak + stats.appliedGain;
    stats.finalRMS = stats.originalRMS + stats.appliedGain;
    
    return stats;
}

bool Normalizer::normalizeBuffer(
    const std::vector<float>& input,
    std::vector<float>& output,
    NormalizationStats& stats
) {
    if (!m_configured || !m_enabled) {
        output = input;
        return false;
    }
    
    // Analyse du buffer
    stats = analyzeBuffer(input);
    m_lastStats = stats;
    
    // Application du gain
    double gainLinear = dbToLinear(stats.appliedGain);
    applyGainWithLimiting(input, output, gainLinear);
    
    std::cout << "[Normalizer] Normalisé: gain=" << stats.appliedGain 
              << "dB, pic final=" << stats.finalPeak << "dB" << std::endl;
    
    return true;
}

bool Normalizer::normalizeTwoPass(
    const std::vector<float>& input,
    std::vector<float>& output
) {
    if (!m_configured || !m_enabled) {
        output = input;
        return false;
    }
    
    // Pass 1: Analyse complète
    NormalizationStats stats = analyzeBuffer(input);
    
    // Pass 2: Application du traitement
    return normalizeBuffer(input, output, stats);
}

void Normalizer::normalizeRealTime(
    const std::vector<float>& input,
    std::vector<float>& output
) {
    output.resize(input.size());
    
    if (!m_configured || !m_enabled) {
        output = input;
        return;
    }
    
    // Calcul du gain cible basé sur l'analyse en temps réel
    double currentPeak = calculatePeak(input);
    double currentPeakDb = linearToDb(currentPeak);
    
    // Calcul du gain nécessaire pour atteindre la cible
    m_targetGain = dbToLinear(m_config.targetLevel - currentPeakDb);
    
    // Limitation du gain
    double targetGainDb = linearToDb(m_targetGain);
    targetGainDb = std::clamp(targetGainDb, 
                              m_config.maxGainReduction, 
                              m_config.maxGainBoost);
    m_targetGain = dbToLinear(targetGainDb);
    
    // Application avec lissage
    for (size_t i = 0; i < input.size(); i++) {
        m_currentGain = smoothGain(m_currentGain, m_targetGain, m_gainSmoothingFactor);
        
        double sample = input[i] * m_currentGain;
        
        // Limitation si activée
        if (m_config.enableLimiting) {
            sample = std::clamp(sample, -1.0, 1.0);
        }
        
        output[i] = static_cast<float>(sample);
    }
}

double Normalizer::calculateNormalizationGain(
    const std::vector<float>& buffer,
    NormalizationType type
) {
    double gainDb = 0.0;
    
    switch (type) {
        case NormalizationType::PEAK_NORMALIZATION: {
            double peakDb = linearToDb(calculatePeak(buffer));
            gainDb = m_config.targetLevel - peakDb;
            break;
        }
        
        case NormalizationType::RMS_NORMALIZATION: {
            double rmsDb = linearToDb(calculateRMS(buffer));
            gainDb = m_config.targetLevel - rmsDb;
            break;
        }
        
        case NormalizationType::LUFS_NORMALIZATION: {
            double lufs = calculateLUFS(buffer);
            gainDb = m_config.targetLevel - lufs;
            break;
        }
        
        case NormalizationType::DYNAMIC_RANGE_CONTROL: {
            // Normalisation intelligente préservant la dynamique
            double peakDb = linearToDb(calculatePeak(buffer));
            double rmsDb = linearToDb(calculateRMS(buffer));
            double dynamicRange = peakDb - rmsDb;
            
            // Objectif: maintenir la dynamique tout en atteignant le niveau cible
            gainDb = m_config.targetLevel - peakDb;
            
            // Réduction si la dynamique est trop faible
            if (dynamicRange < 6.0 && m_config.preserveDynamics) {
                gainDb *= 0.7; // Réduction plus conservative
            }
            break;
        }
    }
    
    return gainDb;
}

double Normalizer::calculatePeak(const std::vector<float>& buffer) {
    if (buffer.empty()) return 0.0;
    
    double peak = 0.0;
    for (float sample : buffer) {
        peak = std::max(peak, static_cast<double>(std::abs(sample)));
    }
    
    return peak;
}

double Normalizer::calculateRMS(const std::vector<float>& buffer) {
    if (buffer.empty()) return 0.0;
    
    double sum = 0.0;
    for (float sample : buffer) {
        sum += sample * sample;
    }
    
    return std::sqrt(sum / buffer.size());
}

double Normalizer::calculateLUFS(const std::vector<float>& buffer) {
    // Implémentation simplifiée de LUFS
    // Dans la réalité, nécessiterait un filtrage K-weighting complexe
    double rms = calculateRMS(buffer);
    return linearToDb(rms) - 23.0; // Approximation LUFS
}

void Normalizer::applyGainWithLimiting(
    const std::vector<float>& input,
    std::vector<float>& output,
    double gain
) {
    output.resize(input.size());
    
    for (size_t i = 0; i < input.size(); i++) {
        double sample = input[i] * gain;
        
        if (m_config.enableLimiting) {
            // Soft limiting pour éviter l'écrêtage dur
            if (std::abs(sample) > 0.95) {
                double sign = (sample > 0) ? 1.0 : -1.0;
                sample = sign * (0.95 + 0.05 * std::tanh((std::abs(sample) - 0.95) * 10.0));
            }
        }
        
        output[i] = static_cast<float>(sample);
    }
}

double Normalizer::smoothGain(double currentGain, double targetGain, double factor) {
    return currentGain + (targetGain - currentGain) * factor;
}

double Normalizer::linearToDb(double linear) {
    return 20.0 * std::log10(std::max(linear, 1e-10));
}

double Normalizer::dbToLinear(double db) {
    return std::pow(10.0, db / 20.0);
}

bool Normalizer::detectClipping(const std::vector<float>& buffer, double threshold) {
    for (float sample : buffer) {
        if (std::abs(sample) >= threshold) {
            return true;
        }
    }
    return false;
}

} // namespace facebook::react