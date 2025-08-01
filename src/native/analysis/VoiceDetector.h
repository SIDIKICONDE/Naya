#pragma once
#include <vector>
namespace facebook::react {
struct VoiceDetectionResult { bool voiceDetected; double confidence; };
class VoiceDetector {
public:
    VoiceDetector();
    ~VoiceDetector();
    VoiceDetectionResult detectVoice(const std::vector<float>& buffer);
private:
    double calculateEnergy(const std::vector<float>& buffer);
};
} // namespace facebook::react