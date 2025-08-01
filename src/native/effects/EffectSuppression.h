/**
 * EffectSuppression.h
 * Module minimal pour la suppression d'effets indésirables
 */

#pragma once

#include <vector>
#include <string>

namespace facebook::react {

/**
 * Types d'effets indésirables détectables
 */
enum class UnwantedEffectType {
    ECHO_ARTIFACT,      // Échos artificiels
    REVERB_ARTIFACT,    // Réverbération excessive
    PHASE_ISSUES,       // Problèmes de phase
    DIGITAL_DISTORTION, // Distorsion numérique
    CLIPPING,           // Écrêtage
    HUM_NOISE,          // Bourdonnement 50/60Hz
    SIBILANCE           // Sifflantes excessives
};

/**
 * Configuration de la suppression d'effets
 */
struct EffectSuppressionConfig {
    bool detectEcho;           // Détection d'échos
    bool detectReverb;         // Détection de réverb
    bool detectPhaseIssues;    // Détection de problèmes de phase
    bool detectClipping;       // Détection d'écrêtage
    bool detectHum;            // Détection de bourdonnement
    bool detectSibilance;      // Détection de sifflantes
    
    double suppressionIntensity; // Intensité de suppression (0.0 à 1.0)
    bool autoCorrect;            // Correction automatique
};

/**
 * Résultat de détection d'effet indésirable
 */
struct EffectDetectionResult {
    UnwantedEffectType type;
    bool detected;
    double confidence;       // Confiance de détection (0.0 à 1.0)
    double severity;         // Sévérité de l'effet (0.0 à 1.0)
    std::string description;
};

/**
 * Suppresseur d'effets indésirables
 */
class EffectSuppression {
public:
    EffectSuppression();
    ~EffectSuppression();

    /**
     * Configure le suppresseur
     */
    bool configure(const EffectSuppressionConfig& config);

    /**
     * Analyse un buffer pour détecter les effets indésirables
     */
    std::vector<EffectDetectionResult> analyzeBuffer(const std::vector<float>& buffer);

    /**
     * Supprime les effets détectés d'un buffer
     */
    void suppressEffects(
        const std::vector<float>& input,
        std::vector<float>& output,
        const std::vector<EffectDetectionResult>& detectedEffects
    );

    /**
     * Traite un buffer avec détection et suppression automatiques
     */
    void processBuffer(
        const std::vector<float>& input,
        std::vector<float>& output
    );

    /**
     * Active/désactive la suppression automatique
     */
    void setAutoCorrection(bool enabled) { m_config.autoCorrect = enabled; }

private:
    EffectSuppressionConfig m_config;
    bool m_configured;
    
    // Buffers pour l'analyse
    std::vector<float> m_analysisBuffer;
    std::vector<float> m_previousBuffer;
    
    /**
     * Détecte les échos artificiels
     */
    EffectDetectionResult detectEcho(const std::vector<float>& buffer);
    
    /**
     * Détecte la réverbération excessive
     */
    EffectDetectionResult detectReverb(const std::vector<float>& buffer);
    
    /**
     * Détecte les problèmes de phase
     */
    EffectDetectionResult detectPhaseIssues(const std::vector<float>& buffer);
    
    /**
     * Détecte l'écrêtage
     */
    EffectDetectionResult detectClipping(const std::vector<float>& buffer);
    
    /**
     * Détecte le bourdonnement 50/60Hz
     */
    EffectDetectionResult detectHum(const std::vector<float>& buffer);
    
    /**
     * Détecte les sifflantes excessives
     */
    EffectDetectionResult detectSibilance(const std::vector<float>& buffer);
    
    /**
     * Supprime l'écrêtage
     */
    void suppressClipping(std::vector<float>& buffer, double intensity);
    
    /**
     * Supprime le bourdonnement
     */
    void suppressHum(std::vector<float>& buffer, double intensity);
    
    /**
     * Calcule l'énergie RMS d'un buffer
     */
    double calculateRMS(const std::vector<float>& buffer);
    
    /**
     * Calcule l'autocorrélation pour détecter les répétitions
     */
    double calculateAutocorrelation(const std::vector<float>& buffer, int delay);
};

} // namespace facebook::react