/**
 * AudioEnhancer.h
 * Module minimal pour l'amélioration audio
 */

#pragma once

#include <vector>

namespace facebook::react {

/**
 * Configuration de l'améliorateur audio
 */
struct AudioEnhancementConfig {
    double bassEnhancement;     // Amélioration des basses (0.0 à 2.0)
    double trebleEnhancement;   // Amélioration des aigus (0.0 à 2.0)
    double stereoWidening;      // Élargissement stéréo (0.0 à 2.0)
    double presence;            // Présence/clarté (0.0 à 2.0)
    double warmth;              // Chaleur du son (0.0 à 2.0)
    bool enabled;               // Activé/désactivé
};

/**
 * Améliorateur audio avec multiple effets
 */
class AudioEnhancer {
public:
    AudioEnhancer();
    ~AudioEnhancer();

    /**
     * Configure l'améliorateur
     */
    bool configure(const AudioEnhancementConfig& config);

    /**
     * Traite un buffer stéréo
     */
    void processStereoBuffer(
        const std::vector<float>& inputLeft,
        const std::vector<float>& inputRight,
        std::vector<float>& outputLeft,
        std::vector<float>& outputRight
    );

    /**
     * Traite un buffer mono
     */
    void processMonoBuffer(
        const std::vector<float>& input,
        std::vector<float>& output
    );

    /**
     * Active/désactive l'amélioration
     */
    void setEnabled(bool enabled) { m_config.enabled = enabled; }

    /**
     * Obtient la configuration actuelle
     */
    const AudioEnhancementConfig& getConfig() const { return m_config; }

private:
    AudioEnhancementConfig m_config;
    bool m_configured;
    
    // Filtres pour les améliorations
    double m_bassFilter_x1, m_bassFilter_y1;
    double m_trebleFilter_x1, m_trebleFilter_y1;
    
    /**
     * Applique l'amélioration des basses
     */
    double enhanceBass(double input);
    
    /**
     * Applique l'amélioration des aigus
     */
    double enhanceTreble(double input);
    
    /**
     * Applique l'élargissement stéréo
     */
    void applyStereoWidening(
        double& left, 
        double& right, 
        double amount
    );
    
    /**
     * Applique la présence/clarté
     */
    double applyPresence(double input, double amount);
    
    /**
     * Applique la chaleur
     */
    double applyWarmth(double input, double amount);
};

} // namespace facebook::react