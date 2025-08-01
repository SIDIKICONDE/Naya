/**
 * Reverb.h
 * Module minimal pour la réverbération
 */

#pragma once

#include <vector>

namespace facebook::react {

struct ReverbConfig {
    double roomSize;    // Taille de la pièce (0.0 à 1.0)
    double damping;     // Amortissement (0.0 à 1.0)
    double wetLevel;    // Niveau wet (0.0 à 1.0)
    double dryLevel;    // Niveau dry (0.0 à 1.0)
};

class Reverb {
public:
    Reverb();
    ~Reverb();
    
    bool configure(const ReverbConfig& config);
    void processBuffer(const std::vector<float>& input, std::vector<float>& output);
    
private:
    ReverbConfig m_config;
    bool m_configured;
    std::vector<float> m_delayBuffer;
    size_t m_delayIndex;
};

} // namespace facebook::react