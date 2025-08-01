/**
 * NoiseReduction.h
 * Module minimal pour la réduction de bruit
 */

#pragma once

#include <vector>

namespace facebook::react {

/**
 * Configuration de la réduction de bruit
 */
struct NoiseReductionConfig {
    double intensity;      // Intensité de la réduction (0.0 à 1.0)
    double threshold;      // Seuil de détection du bruit en dB
    bool adaptive;         // Mode adaptatif
};

/**
 * Réducteur de bruit minimal
 */
class NoiseReduction {
public:
    NoiseReduction();
    ~NoiseReduction();

    /**
     * Configure la réduction de bruit
     */
    bool configure(const NoiseReductionConfig& config);

    /**
     * Analyse un échantillon de bruit de référence
     */
    void analyzeNoiseProfile(const std::vector<float>& noiseBuffer);

    /**
     * Traite un buffer audio
     */
    void processBuffer(
        const std::vector<float>& input,
        std::vector<float>& output
    );

    /**
     * Active/désactive la réduction
     */
    void setEnabled(bool enabled) { m_enabled = enabled; }

private:
    NoiseReductionConfig m_config;
    std::vector<float> m_noiseProfile;
    bool m_configured;
    bool m_enabled;
    double m_noiseLevel;
    
    double calculateNoiseLevel(const std::vector<float>& buffer);
    double applyReduction(double input, double noiseLevel);
};

} // namespace facebook::react