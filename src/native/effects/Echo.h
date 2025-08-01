#pragma once
#include <vector>
namespace facebook::react {
struct EchoConfig { double delay; double feedback; double mix; };
class Echo {
public:
    Echo();
    ~Echo();
    bool configure(const EchoConfig& config);
    void processBuffer(const std::vector<float>& input, std::vector<float>& output);
private:
    EchoConfig m_config;
    bool m_configured;
    std::vector<float> m_delayBuffer;
    size_t m_delayIndex;
};
} // namespace facebook::react