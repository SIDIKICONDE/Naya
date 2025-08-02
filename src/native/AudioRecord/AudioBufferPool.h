#pragma once

#include <array>
#include <atomic>
#include <memory>
#include <mutex>
#include <queue>
#include "AudioRecorder.h"

namespace facebook::react {

/**
 * Pool de buffers audio pour éviter les allocations dynamiques
 * pendant l'enregistrement en temps réel
 */
class AudioBufferPool {
public:
    explicit AudioBufferPool(size_t pool_size = 20, size_t buffer_size = 4096);
    ~AudioBufferPool() = default;
    
    // Non-copiable
    AudioBufferPool(const AudioBufferPool&) = delete;
    AudioBufferPool& operator=(const AudioBufferPool&) = delete;
    
    // Non-movable (mutex et const membres)
    AudioBufferPool(AudioBufferPool&&) = delete;
    AudioBufferPool& operator=(AudioBufferPool&&) = delete;
    
    std::unique_ptr<audio::AudioBuffer> acquire();
    void release(std::unique_ptr<audio::AudioBuffer> buffer);
    size_t available_count() const;
    
private:
    const size_t buffer_size_;
    mutable std::mutex mutex_;
    std::queue<std::unique_ptr<audio::AudioBuffer>> available_;
};

/**
 * Version lock-free du pool pour une performance maximale
 */
template<size_t PoolSize = 20>
class LockFreeAudioBufferPool {
public:
    explicit LockFreeAudioBufferPool(size_t buffer_size = 4096) {
        for (size_t i = 0; i < PoolSize; ++i) {
            buffers_[i] = std::make_unique<audio::AudioBuffer>(buffer_size);
            available_mask_ |= (1ULL << i);
        }
    }
    
    std::unique_ptr<audio::AudioBuffer> acquire() {
        uint64_t mask = available_mask_.load(std::memory_order_acquire);
        
        while (mask != 0) {
            int index = __builtin_ctzll(mask); // Trouve le premier bit à 1
            uint64_t bit = 1ULL << index;
            
            // Essaye d'acquérir ce buffer
            if (available_mask_.fetch_and(~bit, std::memory_order_acq_rel) & bit) {
                return std::move(buffers_[index]);
            }
            
            // Recharge le masque si l'acquisition a échoué
            mask = available_mask_.load(std::memory_order_acquire);
        }
        
        return nullptr; // Pool vide
    }
    
    void release(std::unique_ptr<audio::AudioBuffer> buffer, size_t index) {
        buffers_[index] = std::move(buffer);
        available_mask_.fetch_or(1ULL << index, std::memory_order_release);
    }
    
private:
    std::array<std::unique_ptr<audio::AudioBuffer>, PoolSize> buffers_;
    std::atomic<uint64_t> available_mask_{0};
};

} // namespace facebook::react