#include "Echo.h"
#include <iostream>
namespace facebook::react {
Echo::Echo() : m_configured(false), m_delayIndex(0) {
    std::cout << "[Echo] Constructeur" << std::endl;
    m_delayBuffer.resize(44100);
}
Echo::~Echo() { std::cout << "[Echo] Destructeur" << std::endl; }
bool Echo::configure(const EchoConfig& config) {
    m_config = config; m_configured = true;
    return true;
}
void Echo::processBuffer(const std::vector<float>& input, std::vector<float>& output) {
    output = input; // Placeholder
}
} // namespace facebook::react