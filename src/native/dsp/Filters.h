/**
 * Filters.h
 * Module minimal pour les filtres audio de base
 */

#pragma once

#include <vector>

namespace facebook::react {

/**
 * Types de filtres disponibles
 */
enum class FilterType {
    LOW_PASS,
    HIGH_PASS,
    BAND_PASS,
    BAND_STOP,
    PEAKING
};

/**
 * Classe minimale pour les filtres audio
 */
class Filters {
public:
    Filters();
    ~Filters();

    /**
     * Applique un filtre passe-bas simple
     */
    static double lowPass(double input, double cutoff, double sampleRate);

    /**
     * Applique un filtre passe-haut simple
     */
    static double highPass(double input, double cutoff, double sampleRate);

    /**
     * Filtre un buffer audio
     */
    static void filterBuffer(
        const std::vector<float>& input,
        std::vector<float>& output,
        FilterType type,
        double frequency,
        double sampleRate
    );

private:
    static double calculateLPCoeff(double cutoff, double sampleRate);
    static double calculateHPCoeff(double cutoff, double sampleRate);
};

} // namespace facebook::react