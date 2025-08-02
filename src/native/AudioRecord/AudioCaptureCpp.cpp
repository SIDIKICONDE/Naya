#include "AudioCaptureCpp.h"
#include <algorithm>
#include <cstring>
#include <iostream>

namespace audio {

// ========================================
// AudioCaptureCpp Implementation
// ========================================

AudioCaptureCpp::AudioCaptureCpp() {
    start_time_ = std::chrono::steady_clock::now();
}

AudioCaptureCpp::~AudioCaptureCpp() {
    Cleanup();
}

bool AudioCaptureCpp::Initialize(const AudioConfig& config) {
    std::lock_guard<std::mutex> lock(state_mutex_);
    
    if (is_initialized_ || is_capturing_) {
        return false;
    }
    
    // Validation de la configuration
    if (config.sample_rate == 0 || config.channels == 0 || config.buffer_size == 0) {
        if (error_callback_) {
            error_callback_("Configuration audio invalide");
        }
        return false;
    }
    
    // Validation de la taille du buffer
    if (config.buffer_size < kMinBufferSize || config.buffer_size > kMaxBufferSize) {
        if (error_callback_) {
            error_callback_("Taille de buffer invalide: " + std::to_string(config.buffer_size));
        }
        return false;
    }
    
    config_ = config;
    is_initialized_ = true;
    
    return true;
}

bool AudioCaptureCpp::StartCapture() {
    std::lock_guard<std::mutex> lock(state_mutex_);
    
    if (!is_initialized_ || is_capturing_) {
        return false;
    }
    
    // Réinitialiser les flags
    is_capturing_ = true;
    is_paused_ = false;
    should_stop_ = false;
    phase_ = 0.0;
    
    // Démarrer le thread de capture
    capture_thread_ = std::make_unique<std::thread>(&AudioCaptureCpp::CaptureThread, this);
    
    return true;
}

void AudioCaptureCpp::StopCapture() {
    {
        std::lock_guard<std::mutex> lock(state_mutex_);
        
        if (!is_capturing_) {
            return;
        }
        
        should_stop_ = true;
        is_capturing_ = false;
    }
    
    // Réveiller le thread s'il est en pause
    pause_cv_.notify_all();
    
    // Attendre la fin du thread
    if (capture_thread_ && capture_thread_->joinable()) {
        capture_thread_->join();
    }
    
    capture_thread_.reset();
}

bool AudioCaptureCpp::PauseCapture() {
    std::lock_guard<std::mutex> lock(state_mutex_);
    
    if (!is_capturing_ || is_paused_) {
        return false;
    }
    
    is_paused_ = true;
    return true;
}

bool AudioCaptureCpp::ResumeCapture() {
    std::lock_guard<std::mutex> lock(state_mutex_);
    
    if (!is_capturing_ || !is_paused_) {
        return false;
    }
    
    is_paused_ = false;
    pause_cv_.notify_all();
    return true;
}

void AudioCaptureCpp::SetCaptureCallback(CaptureCallback callback) {
    std::lock_guard<std::mutex> lock(callback_mutex_);
    capture_callback_ = callback;
}

void AudioCaptureCpp::SetErrorCallback(ErrorCallback callback) {
    std::lock_guard<std::mutex> lock(callback_mutex_);
    error_callback_ = callback;
}

bool AudioCaptureCpp::IsCapturing() const {
    std::lock_guard<std::mutex> lock(state_mutex_);
    return is_capturing_ && !is_paused_;
}

AudioConfig AudioCaptureCpp::GetCurrentConfig() const {
    return config_;
}

float AudioCaptureCpp::GetCurrentLevel() const {
    return current_level_.load();
}

float AudioCaptureCpp::GetCaptureLatency() const {
    return kDefaultLatency;
}

void AudioCaptureCpp::Cleanup() {
    StopCapture();
    
    std::lock_guard<std::mutex> lock(state_mutex_);
    is_initialized_ = false;
    current_level_ = 0.0f;
}

void AudioCaptureCpp::CaptureThread() {
    // Calcul des paramètres du buffer
    const size_t frames_per_buffer = config_.buffer_size;
    const size_t samples_per_buffer = frames_per_buffer * config_.channels;
    const double buffer_duration_ms = (frames_per_buffer * 1000.0) / config_.sample_rate;
    
    // Allouer le buffer audio
    std::vector<float> buffer(samples_per_buffer);
    
    while (!should_stop_) {
        // Gestion de la pause
        if (is_paused_) {
            std::unique_lock<std::mutex> lock(state_mutex_);
            pause_cv_.wait_for(lock, std::chrono::milliseconds(10), [this] {
                return !is_paused_ || should_stop_;
            });
            continue;
        }
        
        // Timestamp de capture
        auto now = std::chrono::steady_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::microseconds>(now - start_time_);
        int64_t timestamp = duration.count();
        
        // Générer les données audio
        GenerateAudioData(buffer.data(), frames_per_buffer);
        
        // Calculer le niveau RMS
        float rms = CalculateRMS(buffer.data(), samples_per_buffer);
        current_level_ = rms;
        
        // Appeler le callback
        {
            std::lock_guard<std::mutex> lock(callback_mutex_);
            if (capture_callback_) {
                capture_callback_(buffer.data(), frames_per_buffer, timestamp);
            }
        }
        
        // Simuler le timing réel de capture
        std::this_thread::sleep_for(std::chrono::microseconds(
            static_cast<int64_t>(buffer_duration_ms * 1000)
        ));
    }
}

void AudioCaptureCpp::GenerateAudioData(float* buffer, size_t frames) {
    // Génération d'un signal sinusoïdal multi-canaux
    // TODO: Remplacer par capture réelle avec FFmpeg
    
    const double amplitude = 0.3;
    const double phase_increment = test_frequency_ / config_.sample_rate;
    
    for (size_t frame = 0; frame < frames; ++frame) {
        // Générer l'échantillon
        float sample = static_cast<float>(amplitude * std::sin(2.0 * M_PI * phase_));
        
        // Remplir tous les canaux avec la même valeur
        for (size_t ch = 0; ch < config_.channels; ++ch) {
            buffer[frame * config_.channels + ch] = sample;
        }
        
        // Avancer la phase
        phase_ += phase_increment;
        if (phase_ > 1.0) {
            phase_ -= 1.0;
        }
    }
    
    // Ajouter un peu de variation pour rendre le signal plus intéressant
    static double modulation_phase = 0.0;
    const double modulation_freq = 0.1; // 0.1 Hz
    modulation_phase += modulation_freq / config_.sample_rate * frames;
    
    // Appliquer une modulation d'amplitude légère
    float modulation = static_cast<float>(0.8 + 0.2 * std::sin(2.0 * M_PI * modulation_phase));
    for (size_t i = 0; i < frames * config_.channels; ++i) {
        buffer[i] *= modulation;
    }
}

float AudioCaptureCpp::CalculateRMS(const float* data, size_t samples) const {
    if (samples == 0) {
        return 0.0f;
    }
    
    double sum_squares = 0.0;
    for (size_t i = 0; i < samples; ++i) {
        sum_squares += data[i] * data[i];
    }
    
    return static_cast<float>(std::sqrt(sum_squares / samples));
}

// ========================================
// AudioCaptureFFmpeg Stub Implementation
// ========================================

AudioCaptureFFmpeg::AudioCaptureFFmpeg() {
    // TODO: Initialiser FFmpeg
}

AudioCaptureFFmpeg::~AudioCaptureFFmpeg() {
    Cleanup();
}

bool AudioCaptureFFmpeg::Initialize(const AudioConfig& config) {
    // TODO: Implémenter avec FFmpeg
    config_ = config;
    return false; // Non implémenté pour le moment
}

bool AudioCaptureFFmpeg::StartCapture() {
    // TODO: Implémenter avec FFmpeg
    return false;
}

void AudioCaptureFFmpeg::StopCapture() {
    // TODO: Implémenter avec FFmpeg
}

bool AudioCaptureFFmpeg::PauseCapture() {
    // TODO: Implémenter avec FFmpeg
    return false;
}

bool AudioCaptureFFmpeg::ResumeCapture() {
    // TODO: Implémenter avec FFmpeg
    return false;
}

void AudioCaptureFFmpeg::SetCaptureCallback(CaptureCallback callback) {
    capture_callback_ = callback;
}

void AudioCaptureFFmpeg::SetErrorCallback(ErrorCallback callback) {
    error_callback_ = callback;
}

bool AudioCaptureFFmpeg::IsCapturing() const {
    return is_capturing_;
}

AudioConfig AudioCaptureFFmpeg::GetCurrentConfig() const {
    return config_;
}

float AudioCaptureFFmpeg::GetCurrentLevel() const {
    // TODO: Implémenter avec FFmpeg
    return 0.0f;
}

float AudioCaptureFFmpeg::GetCaptureLatency() const {
    // TODO: Obtenir la latence réelle de FFmpeg
    return 20.0f; // 20ms par défaut
}

void AudioCaptureFFmpeg::Cleanup() {
    // TODO: Nettoyer les ressources FFmpeg
}

// ========================================
// AudioCaptureFactory Implementation
// ========================================

std::unique_ptr<AudioCaptureInterface> AudioCaptureFactory::CreatePlatformCapture() {
    // Pour le moment, utiliser l'implémentation C++ pure
    // TODO: Basculer vers FFmpeg quand disponible
    return std::make_unique<AudioCaptureCpp>();
}

bool AudioCaptureFactory::IsCaptureAvailable() {
    // La capture C++ pure est toujours disponible
    return true;
}

AudioCaptureFactory::PlatformCapabilities AudioCaptureFactory::GetCapabilities() {
    PlatformCapabilities caps;
    
    // Capacités de l'implémentation C++ pure
    caps.supported_sample_rates = {8000, 16000, 22050, 44100, 48000, 88200};
    caps.max_channels = 8;
    caps.supported_bit_depths = {16, 24, 32};
    caps.supports_pause = true;
    caps.supports_low_latency = true;
    caps.min_latency_ms = 10.0f;
    
    return caps;
}

} // namespace audio