/**
 * FFTProcessor.h
 * Module minimal pour la transformée de Fourier
 */

#pragma once

#include <vector>
#include <complex>

namespace facebook::react {

/**
 * Processeur FFT minimal
 */
class FFTProcessor {
public:
    FFTProcessor();
    ~FFTProcessor();

    /**
     * Initialise avec une taille de FFT
     */
    bool initialize(int fftSize);

    /**
     * FFT simple (puissance de 2 uniquement)
     */
    static void simpleFFT(
        const std::vector<float>& input,
        std::vector<std::complex<float>>& output
    );

    /**
     * Calcule la magnitude du spectre
     */
    static void magnitude(
        const std::vector<std::complex<float>>& complex,
        std::vector<float>& magnitude
    );

    /**
     * Applique une fenêtre de Hanning
     */
    static void applyHanningWindow(std::vector<float>& buffer);

    /**
     * Applique une fenêtre de Tukey (recommandée pour audio)
     */
    static void applyTukeyWindow(std::vector<float>& buffer, double alpha = 0.25);

    /**
     * Applique une fenêtre de Hamming
     */
    static void applyHammingWindow(std::vector<float>& buffer);

    /**
     * Applique une fenêtre de Blackman
     */
    static void applyBlackmanWindow(std::vector<float>& buffer);

    /**
     * Vérifie si une taille est une puissance de 2
     */
    static bool isPowerOfTwo(int n);

private:
    int m_fftSize;
    bool m_initialized;
};

} // namespace facebook::react