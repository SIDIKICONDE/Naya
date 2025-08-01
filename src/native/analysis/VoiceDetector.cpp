#include "VoiceDetector.h"
#include <iostream>
#include <cmath>
namespace facebook::react {
VoiceDetector::VoiceDetector() {
    std::cout << "[VoiceDetector] Constructeur" << std::endl;
}
VoiceDetector::~VoiceDetector() {
    std::cout << "[VoiceDetector] Destructeur" << std::endl;
}
VoiceDetectionResult VoiceDetector::detectVoice(const std::vector<float>& buffer) {
    double energy = calculateEnergy(buffer);
    return {energy > 0.01, energy};
}
double VoiceDetector::calculateEnergy(const std::vector<float>& buffer) {
    double sum = 0.0;
    for (float sample : buffer) sum += sample * sample;
    return std::sqrt(sum / buffer.size());
}
} // namespace facebook::react