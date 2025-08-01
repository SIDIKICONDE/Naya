/**
 * Reverb.cpp
 * Implémentation minimale de la réverbération
 */

#include "Reverb.h"
#include <iostream>

namespace facebook::react {

Reverb::Reverb() : m_configured(false), m_delayIndex(0) {
    std::cout << "[Reverb] Constructeur" << std::endl;
    m_delayBuffer.resize(44100); // 1 seconde de delay à 44.1kHz
}

Reverb::~Reverb() {
    std::cout << "[Reverb] Destructeur" << std::endl;
}

bool Reverb::configure(const ReverbConfig& config) {
    m_config = config;
    m_configured = true;
    std::cout << "[Reverb] Configuré" << std::endl;
    return true;
}

void Reverb::processBuffer(const std::vector<float>& input, std::vector<float>& output) {
    output.resize(input.size());
    
    if (!m_configured) {
        output = input;
        return;
    }
    
    // Réverb très simple - delay + feedback
    for (size_t i = 0; i < input.size(); i++) {
        float delayed = m_delayBuffer[m_delayIndex];
        m_delayBuffer[m_delayIndex] = input[i] + delayed * m_config.roomSize * 0.5f;
        
        output[i] = input[i] * m_config.dryLevel + delayed * m_config.wetLevel;
        
        m_delayIndex = (m_delayIndex + 1) % m_delayBuffer.size();
    }
}

} // namespace facebook::react