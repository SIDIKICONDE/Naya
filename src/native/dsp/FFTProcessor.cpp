/**
 * FFTProcessor.cpp
 * Implémentation minimale de la FFT
 */

#include "FFTProcessor.h"
#include <cmath>
#include <algorithm>
#include <iostream>

namespace facebook::react {

FFTProcessor::FFTProcessor() : m_fftSize(1024), m_initialized(false) {
    std::cout << "[FFTProcessor] Constructeur" << std::endl;
}

FFTProcessor::~FFTProcessor() {
    std::cout << "[FFTProcessor] Destructeur" << std::endl;
}

bool FFTProcessor::initialize(int fftSize) {
    if (!isPowerOfTwo(fftSize)) {
        std::cout << "[FFTProcessor] Erreur: FFT size doit être une puissance de 2" << std::endl;
        return false;
    }
    
    m_fftSize = fftSize;
    m_initialized = true;
    
    std::cout << "[FFTProcessor] Initialisé avec taille " << fftSize << std::endl;
    return true;
}

void FFTProcessor::simpleFFT(
    const std::vector<float>& input,
    std::vector<std::complex<float>>& output
) {
    int N = input.size();
    output.resize(N);
    
    // FFT très simple (pas optimisée - pour prototype uniquement)
    for (int k = 0; k < N; k++) {
        std::complex<float> sum(0, 0);
        
        for (int n = 0; n < N; n++) {
            float angle = -2.0f * M_PI * k * n / N;
            std::complex<float> w(std::cos(angle), std::sin(angle));
            sum += input[n] * w;
        }
        
        output[k] = sum;
    }
}

void FFTProcessor::magnitude(
    const std::vector<std::complex<float>>& complex,
    std::vector<float>& magnitude
) {
    magnitude.resize(complex.size());
    
    for (size_t i = 0; i < complex.size(); i++) {
        magnitude[i] = std::abs(complex[i]);
    }
}

void FFTProcessor::applyHanningWindow(std::vector<float>& buffer) {
    int N = buffer.size();
    
    for (int i = 0; i < N; i++) {
        float window = 0.5f * (1.0f - std::cos(2.0f * M_PI * i / (N - 1)));
        buffer[i] *= window;
    }
}

void FFTProcessor::applyTukeyWindow(std::vector<float>& buffer, double alpha) {
    int N = buffer.size();
    
    // Validation du paramètre alpha (0.0 à 1.0)
    alpha = std::clamp(alpha, 0.0, 1.0);
    
    for (int i = 0; i < N; i++) {
        float window = 1.0f;
        
        // Transition de montée (cosinus)
        if (i < alpha * N / 2) {
            window = 0.5f * (1.0f + std::cos(M_PI * (2.0f * i / (alpha * N) - 1.0f)));
        }
        // Plateau plat au centre
        else if (i <= (1.0 - alpha / 2.0) * N) {
            window = 1.0f;
        }
        // Transition de descente (cosinus)
        else {
            window = 0.5f * (1.0f + std::cos(M_PI * (2.0f * i / (alpha * N) - 2.0f / alpha + 1.0f)));
        }
        
        buffer[i] *= window;
    }
}

void FFTProcessor::applyHammingWindow(std::vector<float>& buffer) {
    int N = buffer.size();
    
    for (int i = 0; i < N; i++) {
        // Hamming: w[n] = 0.54 - 0.46 * cos(2π * n / (N-1))
        float window = 0.54f - 0.46f * std::cos(2.0f * M_PI * i / (N - 1));
        buffer[i] *= window;
    }
}

void FFTProcessor::applyBlackmanWindow(std::vector<float>& buffer) {
    int N = buffer.size();
    
    for (int i = 0; i < N; i++) {
        // Blackman: w[n] = 0.42 - 0.5*cos(2π*n/(N-1)) + 0.08*cos(4π*n/(N-1))
        float window = 0.42f - 0.5f * std::cos(2.0f * M_PI * i / (N - 1)) 
                      + 0.08f * std::cos(4.0f * M_PI * i / (N - 1));
        buffer[i] *= window;
    }
}

bool FFTProcessor::isPowerOfTwo(int n) {
    return n > 0 && (n & (n - 1)) == 0;
}

} // namespace facebook::react