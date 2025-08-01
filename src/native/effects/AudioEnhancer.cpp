/**
 * AudioEnhancer.cpp
 * Implémentation de l'amélioration audio
 */

#include "AudioEnhancer.h"
#include <cmath>
#include <algorithm>
#include <iostream>

namespace facebook::react {

AudioEnhancer::AudioEnhancer() 
    : m_configured(false), 
      m_bassFilter_x1(0.0), m_bassFilter_y1(0.0),
      m_trebleFilter_x1(0.0), m_trebleFilter_y1(0.0) {
    
    std::cout << "[AudioEnhancer] Constructeur" << std::endl;
    
    // Configuration par défaut
    m_config = {
        1.0,    // bassEnhancement
        1.0,    // trebleEnhancement  
        1.0,    // stereoWidening
        1.0,    // presence
        1.0,    // warmth
        false   // enabled
    };
}

AudioEnhancer::~AudioEnhancer() {
    std::cout << "[AudioEnhancer] Destructeur" << std::endl;
}

bool AudioEnhancer::configure(const AudioEnhancementConfig& config) {
    // Validation des paramètres
    if (config.bassEnhancement < 0.0 || config.bassEnhancement > 2.0 ||
        config.trebleEnhancement < 0.0 || config.trebleEnhancement > 2.0 ||
        config.stereoWidening < 0.0 || config.stereoWidening > 2.0 ||
        config.presence < 0.0 || config.presence > 2.0 ||
        config.warmth < 0.0 || config.warmth > 2.0) {
        
        std::cout << "[AudioEnhancer] Configuration invalide" << std::endl;
        return false;
    }
    
    m_config = config;
    m_configured = true;
    
    std::cout << "[AudioEnhancer] Configuré: Bass=" << config.bassEnhancement 
              << ", Treble=" << config.trebleEnhancement 
              << ", Stereo=" << config.stereoWidening << std::endl;
    
    return true;
}

void AudioEnhancer::processStereoBuffer(
    const std::vector<float>& inputLeft,
    const std::vector<float>& inputRight,
    std::vector<float>& outputLeft,
    std::vector<float>& outputRight
) {
    if (!m_configured || !m_config.enabled || 
        inputLeft.size() != inputRight.size()) {
        outputLeft = inputLeft;
        outputRight = inputRight;
        return;
    }
    
    outputLeft.resize(inputLeft.size());
    outputRight.resize(inputRight.size());
    
    for (size_t i = 0; i < inputLeft.size(); i++) {
        double left = inputLeft[i];
        double right = inputRight[i];
        
        // Amélioration des basses
        if (m_config.bassEnhancement != 1.0) {
            left = enhanceBass(left) * m_config.bassEnhancement + 
                   left * (1.0 - m_config.bassEnhancement);
            right = enhanceBass(right) * m_config.bassEnhancement + 
                    right * (1.0 - m_config.bassEnhancement);
        }
        
        // Amélioration des aigus
        if (m_config.trebleEnhancement != 1.0) {
            left = enhanceTreble(left) * m_config.trebleEnhancement + 
                   left * (1.0 - m_config.trebleEnhancement);
            right = enhanceTreble(right) * m_config.trebleEnhancement + 
                    right * (1.0 - m_config.trebleEnhancement);
        }
        
        // Élargissement stéréo
        if (m_config.stereoWidening != 1.0) {
            applyStereoWidening(left, right, m_config.stereoWidening);
        }
        
        // Présence
        if (m_config.presence != 1.0) {
            left = applyPresence(left, m_config.presence);
            right = applyPresence(right, m_config.presence);
        }
        
        // Chaleur
        if (m_config.warmth != 1.0) {
            left = applyWarmth(left, m_config.warmth);
            right = applyWarmth(right, m_config.warmth);
        }
        
        // Limitation pour éviter le clipping
        outputLeft[i] = std::clamp(static_cast<float>(left), -1.0f, 1.0f);
        outputRight[i] = std::clamp(static_cast<float>(right), -1.0f, 1.0f);
    }
}

void AudioEnhancer::processMonoBuffer(
    const std::vector<float>& input,
    std::vector<float>& output
) {
    if (!m_configured || !m_config.enabled) {
        output = input;
        return;
    }
    
    output.resize(input.size());
    
    for (size_t i = 0; i < input.size(); i++) {
        double sample = input[i];
        
        // Amélioration des basses
        if (m_config.bassEnhancement != 1.0) {
            sample = enhanceBass(sample) * m_config.bassEnhancement + 
                     sample * (1.0 - m_config.bassEnhancement);
        }
        
        // Amélioration des aigus
        if (m_config.trebleEnhancement != 1.0) {
            sample = enhanceTreble(sample) * m_config.trebleEnhancement + 
                     sample * (1.0 - m_config.trebleEnhancement);
        }
        
        // Présence
        if (m_config.presence != 1.0) {
            sample = applyPresence(sample, m_config.presence);
        }
        
        // Chaleur
        if (m_config.warmth != 1.0) {
            sample = applyWarmth(sample, m_config.warmth);
        }
        
        output[i] = std::clamp(static_cast<float>(sample), -1.0f, 1.0f);
    }
}

double AudioEnhancer::enhanceBass(double input) {
    // Filtre passe-bas simple pour accentuer les basses
    const double cutoff = 0.2; // Fréquence de coupure normalisée
    
    m_bassFilter_y1 = m_bassFilter_y1 + cutoff * (input - m_bassFilter_y1);
    return m_bassFilter_y1 * 1.5; // Boost de 1.5x
}

double AudioEnhancer::enhanceTreble(double input) {
    // Filtre passe-haut simple pour accentuer les aigus
    const double cutoff = 0.8; // Fréquence de coupure normalisée
    
    double output = input - m_trebleFilter_x1 + 0.95 * m_trebleFilter_y1;
    m_trebleFilter_x1 = input;
    m_trebleFilter_y1 = output;
    
    return output * 1.3; // Boost de 1.3x
}

void AudioEnhancer::applyStereoWidening(
    double& left, 
    double& right, 
    double amount
) {
    if (amount == 1.0) return;
    
    // Calcul Mid/Side
    double mid = (left + right) * 0.5;
    double side = (left - right) * 0.5;
    
    // Élargissement du signal Side
    side *= amount;
    
    // Reconversion en L/R
    left = mid + side;
    right = mid - side;
}

double AudioEnhancer::applyPresence(double input, double amount) {
    // Amélioration de la présence par accentuation des médiums-aigus
    if (amount == 1.0) return input;
    
    // Simulation d'un boost autour de 2-4kHz
    double enhanced = input * (1.0 + (amount - 1.0) * 0.3);
    return enhanced;
}

double AudioEnhancer::applyWarmth(double input, double amount) {
    // Ajout de chaleur par saturation douce et boost des basses-médiums
    if (amount == 1.0) return input;
    
    // Saturation douce (tanh)
    double saturated = std::tanh(input * amount * 1.2) / std::tanh(amount * 1.2);
    
    // Mélange avec le signal original
    return input * (2.0 - amount) + saturated * (amount - 1.0);
}

} // namespace facebook::react