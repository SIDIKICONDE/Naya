/**
 * EffectSuppression.cpp
 * Implémentation de la suppression d'effets indésirables
 */

#include "EffectSuppression.h"
#include <cmath>
#include <algorithm>
#include <iostream>

namespace facebook::react {

EffectSuppression::EffectSuppression() : m_configured(false) {
    std::cout << "[EffectSuppression] Constructeur" << std::endl;
    
    // Configuration par défaut
    m_config = {
        true,   // detectEcho
        true,   // detectReverb
        true,   // detectPhaseIssues
        true,   // detectClipping
        true,   // detectHum
        true,   // detectSibilance
        0.5,    // suppressionIntensity
        false   // autoCorrect
    };
}

EffectSuppression::~EffectSuppression() {
    std::cout << "[EffectSuppression] Destructeur" << std::endl;
}

bool EffectSuppression::configure(const EffectSuppressionConfig& config) {
    if (config.suppressionIntensity < 0.0 || config.suppressionIntensity > 1.0) {
        std::cout << "[EffectSuppression] Intensité invalide: " << config.suppressionIntensity << std::endl;
        return false;
    }
    
    m_config = config;
    m_configured = true;
    
    std::cout << "[EffectSuppression] Configuré avec intensité: " << config.suppressionIntensity << std::endl;
    
    return true;
}

std::vector<EffectDetectionResult> EffectSuppression::analyzeBuffer(const std::vector<float>& buffer) {
    std::vector<EffectDetectionResult> results;
    
    if (!m_configured || buffer.empty()) {
        return results;
    }
    
    // Détection des différents effets indésirables
    if (m_config.detectClipping) {
        results.push_back(detectClipping(buffer));
    }
    
    if (m_config.detectHum) {
        results.push_back(detectHum(buffer));
    }
    
    if (m_config.detectEcho) {
        results.push_back(detectEcho(buffer));
    }
    
    if (m_config.detectReverb) {
        results.push_back(detectReverb(buffer));
    }
    
    if (m_config.detectPhaseIssues) {
        results.push_back(detectPhaseIssues(buffer));
    }
    
    if (m_config.detectSibilance) {
        results.push_back(detectSibilance(buffer));
    }
    
    return results;
}

void EffectSuppression::suppressEffects(
    const std::vector<float>& input,
    std::vector<float>& output,
    const std::vector<EffectDetectionResult>& detectedEffects
) {
    output = input;
    
    if (!m_configured || detectedEffects.empty()) {
        return;
    }
    
    // Suppression basée sur les effets détectés
    for (const auto& effect : detectedEffects) {
        if (!effect.detected || effect.confidence < 0.5) {
            continue;
        }
        
        double intensity = m_config.suppressionIntensity * effect.severity;
        
        switch (effect.type) {
            case UnwantedEffectType::CLIPPING:
                suppressClipping(output, intensity);
                break;
                
            case UnwantedEffectType::HUM_NOISE:
                suppressHum(output, intensity);
                break;
                
            default:
                // Autres suppressions à implémenter
                break;
        }
    }
}

void EffectSuppression::processBuffer(
    const std::vector<float>& input,
    std::vector<float>& output
) {
    if (!m_configured) {
        output = input;
        return;
    }
    
    if (m_config.autoCorrect) {
        // Analyse automatique
        auto detectedEffects = analyzeBuffer(input);
        
        // Suppression automatique
        suppressEffects(input, output, detectedEffects);
        
        // Log des effets détectés
        for (const auto& effect : detectedEffects) {
            if (effect.detected && effect.confidence > 0.5) {
                std::cout << "[EffectSuppression] Détecté: " << effect.description 
                          << " (confiance: " << effect.confidence << ")" << std::endl;
            }
        }
    } else {
        output = input;
    }
}

EffectDetectionResult EffectSuppression::detectEcho(const std::vector<float>& buffer) {
    EffectDetectionResult result;
    result.type = UnwantedEffectType::ECHO_ARTIFACT;
    result.description = "Écho artificiel";
    result.detected = false;
    result.confidence = 0.0;
    result.severity = 0.0;
    
    if (buffer.size() < 1024) {
        return result;
    }
    
    // Détection d'écho par autocorrélation
    double maxCorrelation = 0.0;
    int bestDelay = 0;
    
    // Test de delays typiques d'écho (10ms à 100ms à 44.1kHz)
    for (int delay = 441; delay < 4410 && delay < static_cast<int>(buffer.size()/2); delay += 100) {
        double correlation = calculateAutocorrelation(buffer, delay);
        if (correlation > maxCorrelation) {
            maxCorrelation = correlation;
            bestDelay = delay;
        }
    }
    
    // Seuil de détection d'écho
    if (maxCorrelation > 0.3) {
        result.detected = true;
        result.confidence = std::min(maxCorrelation, 1.0);
        result.severity = maxCorrelation;
    }
    
    return result;
}

EffectDetectionResult EffectSuppression::detectReverb(const std::vector<float>& buffer) {
    EffectDetectionResult result;
    result.type = UnwantedEffectType::REVERB_ARTIFACT;
    result.description = "Réverbération excessive";
    result.detected = false;
    result.confidence = 0.0;
    result.severity = 0.0;
    
    // Détection de réverb par analyse de la queue de décroissance
    double rms = calculateRMS(buffer);
    
    if (rms > 0.01) { // Seuil minimum d'énergie
        // Calcul simple de la décroissance
        size_t quarterSize = buffer.size() / 4;
        double firstQuarterRMS = calculateRMS(std::vector<float>(buffer.begin(), buffer.begin() + quarterSize));
        double lastQuarterRMS = calculateRMS(std::vector<float>(buffer.end() - quarterSize, buffer.end()));
        
        double decayRatio = lastQuarterRMS / firstQuarterRMS;
        
        // Si la décroissance est trop lente, c'est potentiellement de la réverb
        if (decayRatio > 0.3) {
            result.detected = true;
            result.confidence = decayRatio;
            result.severity = decayRatio;
        }
    }
    
    return result;
}

EffectDetectionResult EffectSuppression::detectPhaseIssues(const std::vector<float>& buffer) {
    EffectDetectionResult result;
    result.type = UnwantedEffectType::PHASE_ISSUES;
    result.description = "Problèmes de phase";
    result.detected = false;
    result.confidence = 0.0;
    result.severity = 0.0;
    
    // Détection simplifiée - à améliorer avec analyse spectrale
    return result;
}

EffectDetectionResult EffectSuppression::detectClipping(const std::vector<float>& buffer) {
    EffectDetectionResult result;
    result.type = UnwantedEffectType::CLIPPING;
    result.description = "Écrêtage numérique";
    result.detected = false;
    result.confidence = 0.0;
    result.severity = 0.0;
    
    int clippedSamples = 0;
    const float clipThreshold = 0.99f;
    
    for (float sample : buffer) {
        if (std::abs(sample) >= clipThreshold) {
            clippedSamples++;
        }
    }
    
    double clippingRatio = static_cast<double>(clippedSamples) / buffer.size();
    
    if (clippingRatio > 0.001) { // 0.1% de samples écrêtés
        result.detected = true;
        result.confidence = std::min(clippingRatio * 100.0, 1.0);
        result.severity = clippingRatio * 10.0;
    }
    
    return result;
}

EffectDetectionResult EffectSuppression::detectHum(const std::vector<float>& buffer) {
    EffectDetectionResult result;
    result.type = UnwantedEffectType::HUM_NOISE;
    result.description = "Bourdonnement 50/60Hz";
    result.detected = false;
    result.confidence = 0.0;
    result.severity = 0.0;
    
    // Détection simplifiée du bourdonnement
    // Nécessiterait une analyse FFT complète pour être précise
    double rms = calculateRMS(buffer);
    
    if (rms > 0.001 && rms < 0.1) { // Niveau typique du bourdonnement
        result.detected = true;
        result.confidence = 0.7;
        result.severity = rms * 10.0;
    }
    
    return result;
}

EffectDetectionResult EffectSuppression::detectSibilance(const std::vector<float>& buffer) {
    EffectDetectionResult result;
    result.type = UnwantedEffectType::SIBILANCE;
    result.description = "Sifflantes excessives";
    result.detected = false;
    result.confidence = 0.0;
    result.severity = 0.0;
    
    // Détection de sifflantes par analyse d'énergie haute fréquence
    // Implémentation simplifiée
    double highFreqEnergy = 0.0;
    
    // Approximation: compte les variations rapides comme énergie HF
    for (size_t i = 1; i < buffer.size(); i++) {
        double diff = buffer[i] - buffer[i-1];
        highFreqEnergy += diff * diff;
    }
    
    highFreqEnergy = std::sqrt(highFreqEnergy / buffer.size());
    
    if (highFreqEnergy > 0.1) {
        result.detected = true;
        result.confidence = std::min(highFreqEnergy, 1.0);
        result.severity = highFreqEnergy;
    }
    
    return result;
}

void EffectSuppression::suppressClipping(std::vector<float>& buffer, double intensity) {
    const float threshold = 0.95f;
    
    for (float& sample : buffer) {
        if (std::abs(sample) > threshold) {
            // Soft limiting
            float sign = (sample > 0) ? 1.0f : -1.0f;
            float excess = std::abs(sample) - threshold;
            float suppressed = threshold + excess * (1.0f - static_cast<float>(intensity));
            sample = sign * suppressed;
        }
    }
}

void EffectSuppression::suppressHum(std::vector<float>& buffer, double intensity) {
    // Filtre notch simple pour 50/60Hz
    // Implémentation basique - nécessiterait un vrai filtre notch
    if (intensity > 0.1) {
        for (float& sample : buffer) {
            sample *= (1.0f - static_cast<float>(intensity * 0.5));
        }
    }
}

double EffectSuppression::calculateRMS(const std::vector<float>& buffer) {
    if (buffer.empty()) return 0.0;
    
    double sum = 0.0;
    for (float sample : buffer) {
        sum += sample * sample;
    }
    
    return std::sqrt(sum / buffer.size());
}

double EffectSuppression::calculateAutocorrelation(const std::vector<float>& buffer, int delay) {
    if (delay >= static_cast<int>(buffer.size()) || delay <= 0) {
        return 0.0;
    }
    
    double correlation = 0.0;
    int validSamples = buffer.size() - delay;
    
    for (int i = 0; i < validSamples; i++) {
        correlation += buffer[i] * buffer[i + delay];
    }
    
    return correlation / validSamples;
}

} // namespace facebook::react