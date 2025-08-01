/**
 * Normalizer.h
 * Module minimal pour la normalisation audio
 */

#pragma once

#include <vector>
#include <string>

namespace facebook::react {

/**
 * Types de normalisation
 */
enum class NormalizationType {
    PEAK_NORMALIZATION,     // Normalisation par pic
    RMS_NORMALIZATION,      // Normalisation RMS
    LUFS_NORMALIZATION,     // Normalisation LUFS (Loudness)
    DYNAMIC_RANGE_CONTROL   // Contrôle de dynamique
};

/**
 * Configuration de la normalisation
 */
struct NormalizationConfig {
    NormalizationType type;
    double targetLevel;         // Niveau cible en dB
    bool preserveDynamics;      // Préserver la dynamique
    double maxGainReduction;    // Réduction de gain max en dB
    double maxGainBoost;        // Boost de gain max en dB
    bool enableLimiting;        // Activer la limitation
};

/**
 * Statistiques de normalisation
 */
struct NormalizationStats {
    double originalPeak;        // Pic original en dB
    double originalRMS;         // RMS original en dB
    double appliedGain;         // Gain appliqué en dB
    double finalPeak;           // Pic final en dB
    double finalRMS;            // RMS final en dB
    bool clippingDetected;      // Écrêtage détecté
};

/**
 * Normalisateur audio professionnel
 */
class Normalizer {
public:
    Normalizer();
    ~Normalizer();

    /**
     * Configure le normalisateur
     */
    bool configure(const NormalizationConfig& config);

    /**
     * Analyse un buffer pour calculer les statistiques
     */
    NormalizationStats analyzeBuffer(const std::vector<float>& buffer);

    /**
     * Normalise un buffer selon la configuration
     */
    bool normalizeBuffer(
        const std::vector<float>& input,
        std::vector<float>& output,
        NormalizationStats& stats
    );

    /**
     * Normalisation en deux passes (analyse + traitement)
     */
    bool normalizeTwoPass(
        const std::vector<float>& input,
        std::vector<float>& output
    );

    /**
     * Normalisation temps réel (single pass)
     */
    void normalizeRealTime(
        const std::vector<float>& input,
        std::vector<float>& output
    );

    /**
     * Calcule le gain de normalisation nécessaire
     */
    double calculateNormalizationGain(
        const std::vector<float>& buffer,
        NormalizationType type
    );

    /**
     * Active/désactive la normalisation
     */
    void setEnabled(bool enabled) { m_enabled = enabled; }

    /**
     * Obtient les dernières statistiques
     */
    const NormalizationStats& getLastStats() const { return m_lastStats; }

private:
    NormalizationConfig m_config;
    NormalizationStats m_lastStats;
    bool m_configured;
    bool m_enabled;
    
    // Buffers pour l'analyse
    std::vector<float> m_analysisBuffer;
    
    // État pour le traitement temps réel
    double m_currentGain;
    double m_targetGain;
    double m_gainSmoothingFactor;
    
    /**
     * Calcule le pic maximum
     */
    double calculatePeak(const std::vector<float>& buffer);
    
    /**
     * Calcule la valeur RMS
     */
    double calculateRMS(const std::vector<float>& buffer);
    
    /**
     * Calcule la loudness LUFS (simplifiée)
     */
    double calculateLUFS(const std::vector<float>& buffer);
    
    /**
     * Applique un gain avec limitation optionnelle
     */
    void applyGainWithLimiting(
        const std::vector<float>& input,
        std::vector<float>& output,
        double gain
    );
    
    /**
     * Lissage de gain pour éviter les clics
     */
    double smoothGain(double currentGain, double targetGain, double factor);
    
    /**
     * Conversion linéaire vers dB
     */
    double linearToDb(double linear);
    
    /**
     * Conversion dB vers linéaire
     */
    double dbToLinear(double db);
    
    /**
     * Détecte l'écrêtage potentiel
     */
    bool detectClipping(const std::vector<float>& buffer, double threshold = 0.99);
};

} // namespace facebook::react