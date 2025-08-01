/**
 * Filters.cpp
 * Implémentation minimale des filtres audio
 */

#include "Filters.h"
#include <cmath>
#include <iostream>

namespace facebook::react {

Filters::Filters() {
    std::cout << "[Filters] Constructeur" << std::endl;
}

Filters::~Filters() {
    std::cout << "[Filters] Destructeur" << std::endl;
}

double Filters::lowPass(double input, double cutoff, double sampleRate) {
    // Filtre passe-bas simple (premier ordre)
    double RC = 1.0 / (2.0 * M_PI * cutoff);
    double dt = 1.0 / sampleRate;
    double alpha = dt / (RC + dt);
    
    static double prevOutput = 0.0;
    double output = prevOutput + alpha * (input - prevOutput);
    prevOutput = output;
    
    return output;
}

double Filters::highPass(double input, double cutoff, double sampleRate) {
    // Filtre passe-haut simple (premier ordre)
    double RC = 1.0 / (2.0 * M_PI * cutoff);
    double dt = 1.0 / sampleRate;
    double alpha = RC / (RC + dt);
    
    static double prevInput = 0.0;
    static double prevOutput = 0.0;
    
    double output = alpha * (prevOutput + input - prevInput);
    prevInput = input;
    prevOutput = output;
    
    return output;
}

void Filters::filterBuffer(
    const std::vector<float>& input,
    std::vector<float>& output,
    FilterType type,
    double frequency,
    double sampleRate
) {
    output.resize(input.size());
    
    for (size_t i = 0; i < input.size(); i++) {
        switch (type) {
            case FilterType::LOW_PASS:
                output[i] = static_cast<float>(lowPass(input[i], frequency, sampleRate));
                break;
            case FilterType::HIGH_PASS:
                output[i] = static_cast<float>(highPass(input[i], frequency, sampleRate));
                break;
            default:
                output[i] = input[i]; // Pass-through
                break;
        }
    }
}

double Filters::calculateLPCoeff(double cutoff, double sampleRate) {
    double RC = 1.0 / (2.0 * M_PI * cutoff);
    double dt = 1.0 / sampleRate;
    return dt / (RC + dt);
}

double Filters::calculateHPCoeff(double cutoff, double sampleRate) {
    double RC = 1.0 / (2.0 * M_PI * cutoff);
    double dt = 1.0 / sampleRate;
    return RC / (RC + dt);
}

} // namespace facebook::react