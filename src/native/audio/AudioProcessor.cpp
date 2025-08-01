/**
 * AudioProcessor.cpp
 * Implémentation du module de traitement audio de base
 */

#include "AudioProcessor.h"
#include <iostream>

namespace facebook::react {

AudioProcessor::AudioProcessor() : m_initialized(false) {
    std::cout << "[AudioProcessor] Constructeur" << std::endl;
}

AudioProcessor::~AudioProcessor() {
    cleanup();
    std::cout << "[AudioProcessor] Destructeur" << std::endl;
}

bool AudioProcessor::initialize(const AudioConfig& config) {
    std::cout << "[AudioProcessor] Initialisation..." << std::endl;
    
    if (!validateConfig(config)) {
        std::cout << "[AudioProcessor] Configuration invalide" << std::endl;
        return false;
    }
    
    m_config = config;
    m_initialized = true;
    
    std::cout << "[AudioProcessor] Initialisé: " << m_config.sampleRate 
              << "Hz, " << m_config.channels << " canaux" << std::endl;
    
    return true;
}

bool AudioProcessor::validateConfig(const AudioConfig& config) const {
    if (config.sampleRate < 8000 || config.sampleRate > 192000) {
        return false;
    }
    
    if (config.channels < 1 || config.channels > 8) {
        return false;
    }
    
    if (config.bufferSize < 64 || config.bufferSize > 8192) {
        return false;
    }
    
    return true;
}

void AudioProcessor::cleanup() {
    if (m_initialized) {
        std::cout << "[AudioProcessor] Nettoyage des ressources" << std::endl;
        m_initialized = false;
    }
}

} // namespace facebook::react