/**
 * EQEngine.h
 * Module dédié pour le moteur d'égalisation
 */

#pragma once

#include <array>
#include <vector>

namespace facebook::react {

/**
 * Structure pour un filtre biquad
 */
struct BandFilter {
    double a0, a1, a2, b1, b2; // Coefficients biquad
    double x1, x2, y1, y2;     // États du filtre
    double frequency;
    double gain;
    double q;
    bool enabled;
};

/**
 * Moteur d'égalisation 10 bandes
 */
class EQEngine {
public:
    static constexpr int EQ_BANDS_COUNT = 10;
    
    // Fréquences centrales des 10 bandes (Hz)
    static constexpr std::array<double, EQ_BANDS_COUNT> BAND_FREQUENCIES = {
        31.5, 63.0, 125.0, 250.0, 500.0, 1000.0, 2000.0, 4000.0, 8000.0, 16000.0
    };

public:
    EQEngine();
    ~EQEngine();

    /**
     * Initialise l'égaliseur avec un sample rate
     */
    bool initialize(int sampleRate);

    /**
     * Définit le gain d'une bande
     */
    bool setBandGain(int bandIndex, double gain);

    /**
     * Obtient le gain d'une bande
     */
    double getBandGain(int bandIndex) const;

    /**
     * Remet à zéro toutes les bandes
     */
    void reset();

    /**
     * Traite un échantillon audio (un canal)
     */
    double processSample(double input, int bandIndex);

    /**
     * Traite un buffer audio complet
     */
    void processBuffer(const std::vector<float>& input, std::vector<float>& output);

    /**
     * Vérifie si un index de bande est valide
     */
    bool isValidBandIndex(int index) const;

    /**
     * Vérifie si une valeur de gain est valide
     */
    bool isValidGain(double gain) const;

    /**
     * Obtient tous les gains
     */
    const std::array<double, EQ_BANDS_COUNT>& getAllGains() const { return m_bandGains; }

private:
    /**
     * Calcule les coefficients biquad pour une bande
     */
    void calculateBiquadCoefficients(int bandIndex, double gain);

    /**
     * Initialise tous les filtres
     */
    void initializeFilters();

    /**
     * Conversion dB vers gain linéaire
     */
    double dbToLinear(double db) const;

private:
    static constexpr double MIN_GAIN_DB = -20.0;
    static constexpr double MAX_GAIN_DB = 20.0;
    static constexpr double DEFAULT_Q = 1.0;
    static constexpr double PI = 3.14159265358979323846;

    bool m_initialized;
    int m_sampleRate;
    std::array<double, EQ_BANDS_COUNT> m_bandGains;
    std::array<BandFilter, EQ_BANDS_COUNT> m_filters;
};

} // namespace facebook::react