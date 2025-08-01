/**
 * Compressor.h
 * Module minimal pour la compression audio
 */

#pragma once

#include <vector>

namespace facebook::react {

/**
 * Configuration du compresseur
 */
struct CompressorConfig {
    double threshold;    // Seuil en dB
    double ratio;        // Ratio de compression
    double attackTime;   // Temps d'attaque en ms
    double releaseTime;  // Temps de relâchement en ms
    double makeupGain;   // Gain de compensation en dB
};

/**
 * Compresseur audio minimal
 */
class Compressor {
public:
    Compressor();
    ~Compressor();

    /**
     * Configure le compresseur
     */
    bool configure(const CompressorConfig& config);

    /**
     * Traite un échantillon
     */
    double processSample(double input, double sampleRate);

    /**
     * Traite un buffer complet
     */
    void processBuffer(
        const std::vector<float>& input,
        std::vector<float>& output,
        double sampleRate
    );

    /**
     * Obtient le niveau de réduction de gain actuel
     */
    double getGainReduction() const { return m_gainReduction; }

private:
    CompressorConfig m_config;
    double m_gainReduction;
    double m_envelope;
    bool m_configured;
    
    double dbToLinear(double db) const;
    double linearToDb(double linear) const;
};

} // namespace facebook::react