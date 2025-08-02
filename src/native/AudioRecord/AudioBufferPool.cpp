#include "AudioBufferPool.h"
#include <memory>

namespace facebook::react {

AudioBufferPool::AudioBufferPool(size_t pool_size, size_t buffer_size) 
    : buffer_size_(buffer_size) {
    // Pré-allouer tous les buffers pour éviter les allocations dynamiques
    for (size_t i = 0; i < pool_size; ++i) {
        auto buffer = std::make_unique<audio::AudioBuffer>(buffer_size);
        available_.push(std::move(buffer));
    }
}

std::unique_ptr<audio::AudioBuffer> AudioBufferPool::acquire() {
    std::lock_guard<std::mutex> lock(mutex_);
    
    if (available_.empty()) {
        // Allocation d'urgence si le pool est vide
        // En production, cela indique que le pool est trop petit
        return std::make_unique<audio::AudioBuffer>(buffer_size_);
    }
    
    auto buffer = std::move(available_.front());
    available_.pop();
    return buffer;
}

void AudioBufferPool::release(std::unique_ptr<audio::AudioBuffer> buffer) {
    if (!buffer) {
        return;
    }
    
    std::lock_guard<std::mutex> lock(mutex_);
    
    // Réinitialiser le buffer pour réutilisation
    buffer->data.clear();
    buffer->data.resize(buffer_size_);
    buffer->duration_ms = 0.0;
    
    available_.push(std::move(buffer));
}

size_t AudioBufferPool::available_count() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return available_.size();
}

} // namespace facebook::react