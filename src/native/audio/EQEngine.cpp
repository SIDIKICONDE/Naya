/**
 * EQEngine.cpp
 * Implémentation du moteur d'égalisation
 */

#include "EQEngine.h"
#include <iostream>
#include <cmath>


namespace facebook::react {

EQEngine::EQEngine() : m_initialized(false), m_sampleRate(44100) {
    std::cout << "[EQEngine] Constructeur" << std::endl;
    m_bandGains.fill(0.0);
}

EQEngine::~EQEngine() {
    std::cout << "[EQEngine] Destructeur" << std::endl;
}

bool EQEngine::initialize(int sampleRate) {
    std::cout << "[EQEngine] Initialisation avec " << sampleRate << "Hz" << std::endl;
    
    if (sampleRate < 8000 || sampleRate > 192000) {
        std::cout << "[EQEngine] Sample rate invalide: " << sampleRate << std::endl;
        return false;
    }
    
    m_sampleRate = sampleRate;
    initializeFilters();
    m_initialized = true;
    
    std::cout << "[EQEngine] Initialisé avec succès" << std::endl;
    return true;
}

bool EQEngine::setBandGain(int bandIndex, double gain) {
    if (!isValidBandIndex(bandIndex)) {
        std::cout << "[EQEngine] Index de bande invalide: " << bandIndex << std::endl;
        return false;
    }
    
    if (!isValidGain(gain)) {
        std::cout << "[EQEngine] Gain invalide: " << gain << std::endl;
        return false;
    }
    
    double oldGain = m_bandGains[bandIndex];
    m_bandGains[bandIndex] = gain;
    
    if (m_initialized) {
        calculateBiquadCoefficients(bandIndex, gain);
    }
    
    std::cout << "[EQEngine] Bande " << bandIndex 
              << " (" << BAND_FREQUENCIES[bandIndex] << "Hz): "
              << oldGain << "dB → " << gain << "dB" << std::endl;
    
    return true;
}

double EQEngine::getBandGain(int bandIndex) const {
    if (!isValidBandIndex(bandIndex)) {
        return 0.0;
    }
    return m_bandGains[bandIndex];
}

void EQEngine::reset() {
    std::cout << "[EQEngine] Reset de toutes les bandes" << std::endl;
    
    m_bandGains.fill(0.0);
    
    if (m_initialized) {
        for (int i = 0; i < EQ_BANDS_COUNT; i++) {
            calculateBiquadCoefficients(i, 0.0);
        }
    }
}

double EQEngine::processSample(double input, int bandIndex) {
    if (!m_initialized || !isValidBandIndex(bandIndex)) {
        return input;
    }
    
    BandFilter& filter = m_filters[bandIndex];
    
    if (!filter.enabled) {
        return input;
    }
    
    // Filtre biquad : y[n] = a0*x[n] + a1*x[n-1] + a2*x[n-2] - b1*y[n-1] - b2*y[n-2]
    double output = filter.a0 * input + filter.a1 * filter.x1 + filter.a2 * filter.x2
                   - filter.b1 * filter.y1 - filter.b2 * filter.y2;
    
    // Mise à jour des états
    filter.x2 = filter.x1;
    filter.x1 = input;
    filter.y2 = filter.y1;
    filter.y1 = output;
    
    return output;
}

void EQEngine::processBuffer(const std::vector<float>& input, std::vector<float>& output) {
    if (!m_initialized || input.empty()) {
        output = input;
        return;
    }
    
    output.resize(input.size());
    
    for (size_t i = 0; i < input.size(); i++) {
        double sample = input[i];
        
        // Applique tous les filtres en série
        for (int band = 0; band < EQ_BANDS_COUNT; band++) {
            sample = processSample(sample, band);
        }
        
        output[i] = static_cast<float>(sample);
    }
}

bool EQEngine::isValidBandIndex(int index) const {
    return index >= 0 && index < EQ_BANDS_COUNT;
}

bool EQEngine::isValidGain(double gain) const {
    return gain >= MIN_GAIN_DB && gain <= MAX_GAIN_DB;
}

void EQEngine::calculateBiquadCoefficients(int bandIndex, double gain) {
    if (!isValidBandIndex(bandIndex)) return;
    
    double frequency = BAND_FREQUENCIES[bandIndex];
    double Q = DEFAULT_Q;
    
    // Conversion gain dB vers linéaire
    double A = dbToLinear(gain);
    double omega = 2.0 * PI * frequency / m_sampleRate;
    double sin_omega = std::sin(omega);
    double cos_omega = std::cos(omega);
    double alpha = sin_omega / (2.0 * Q);
    
    // Coefficients pour un filtre peaking (boost/cut)
    double b0 = 1.0 + alpha * A;
    double b1 = -2.0 * cos_omega;
    double b2 = 1.0 - alpha * A;
    double a0 = 1.0 + alpha / A;
    double a1 = -2.0 * cos_omega;
    double a2 = 1.0 - alpha / A;
    
    // Normalisation
    m_filters[bandIndex].a0 = b0 / a0;
    m_filters[bandIndex].a1 = b1 / a0;
    m_filters[bandIndex].a2 = b2 / a0;
    m_filters[bandIndex].b1 = a1 / a0;
    m_filters[bandIndex].b2 = a2 / a0;
    
    // Mise à jour des paramètres
    m_filters[bandIndex].frequency = frequency;
    m_filters[bandIndex].gain = gain;
    m_filters[bandIndex].q = Q;
    m_filters[bandIndex].enabled = (std::abs(gain) > 0.01);
    
    std::cout << "[EQEngine] Coefficients calculés pour bande " << bandIndex 
              << " (" << frequency << "Hz, " << gain << "dB)" << std::endl;
}

void EQEngine::initializeFilters() {
    for (int i = 0; i < EQ_BANDS_COUNT; i++) {
        m_filters[i] = {
            1.0, 0.0, 0.0, 0.0, 0.0,  // Coefficients
            0.0, 0.0, 0.0, 0.0,        // États
            BAND_FREQUENCIES[i], 0.0, DEFAULT_Q, false
        };
        calculateBiquadCoefficients(i, 0.0);
    }
    std::cout << "[EQEngine] Filtres initialisés" << std::endl;
}

double EQEngine::dbToLinear(double db) const {
    return std::pow(10.0, db / 20.0);
}

} // namespace facebook::react