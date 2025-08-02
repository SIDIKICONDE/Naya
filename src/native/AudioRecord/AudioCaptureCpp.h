#pragma once

#include "AudioCaptureInterface.h"
#include <thread>
#include <atomic>
#include <chrono>
#include <cmath>
#include <mutex>
#include <condition_variable>

namespace audio {

/**
 * Implémentation C++ pure de la capture audio
 * Utilise un générateur de signal pour simuler la capture en attendant l'intégration FFmpeg
 * 
 * TODO: Remplacer par FFmpeg pour la capture réelle cross-platform
 */
class AudioCaptureCpp : public AudioCaptureInterface {
public:
    AudioCaptureCpp();
    ~AudioCaptureCpp() override;
    
    // Interface AudioCaptureInterface
    bool Initialize(const AudioConfig& config) override;
    bool StartCapture() override;
    void StopCapture() override;
    bool PauseCapture() override;
    bool ResumeCapture() override;
    void SetCaptureCallback(CaptureCallback callback) override;
    void SetErrorCallback(ErrorCallback callback) override;
    bool IsCapturing() const override;
    AudioConfig GetCurrentConfig() const override;
    float GetCurrentLevel() const override;
    float GetCaptureLatency() const override;
    void Cleanup() override;
    
private:
    // Thread de capture
    void CaptureThread();
    
    // Génération du signal audio (temporaire)
    void GenerateAudioData(float* buffer, size_t frames);
    
    // Calcul du niveau RMS
    float CalculateRMS(const float* data, size_t samples) const;
    
    // Configuration
    AudioConfig config_;
    std::atomic<bool> is_initialized_{false};
    std::atomic<bool> is_capturing_{false};
    std::atomic<bool> is_paused_{false};
    std::atomic<bool> should_stop_{false};
    
    // Thread et synchronisation
    std::unique_ptr<std::thread> capture_thread_;
    mutable std::mutex state_mutex_;
    std::condition_variable pause_cv_;
    
    // Callbacks
    CaptureCallback capture_callback_;
    ErrorCallback error_callback_;
    mutable std::mutex callback_mutex_;
    
    // Métriques
    std::atomic<float> current_level_{0.0f};
    std::chrono::steady_clock::time_point start_time_;
    
    // Générateur de signal (temporaire)
    double phase_{0.0};
    const double test_frequency_{440.0}; // La 440Hz
    
    // Constantes
    static constexpr float kDefaultLatency = 10.0f; // 10ms de latence simulée
    static constexpr size_t kMinBufferSize = 64;
    static constexpr size_t kMaxBufferSize = 16384;
};

/**
 * Implémentation avancée avec support FFmpeg (future)
 * Cette classe sera utilisée quand FFmpeg sera intégré
 */
class AudioCaptureFFmpeg : public AudioCaptureInterface {
public:
    AudioCaptureFFmpeg();
    ~AudioCaptureFFmpeg() override;
    
    // Interface AudioCaptureInterface
    bool Initialize(const AudioConfig& config) override;
    bool StartCapture() override;
    void StopCapture() override;
    bool PauseCapture() override;
    bool ResumeCapture() override;
    void SetCaptureCallback(CaptureCallback callback) override;
    void SetErrorCallback(ErrorCallback callback) override;
    bool IsCapturing() const override;
    AudioConfig GetCurrentConfig() const override;
    float GetCurrentLevel() const override;
    float GetCaptureLatency() const override;
    void Cleanup() override;
    
private:
    // FFmpeg specific members seront ajoutés ici
    // AVFormatContext* format_context_ = nullptr;
    // AVCodecContext* codec_context_ = nullptr;
    // etc.
    
    AudioConfig config_;
    std::atomic<bool> is_capturing_{false};
    CaptureCallback capture_callback_;
    ErrorCallback error_callback_;
};

} // namespace audio