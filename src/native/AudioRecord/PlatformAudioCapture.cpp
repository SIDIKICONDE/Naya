#include "PlatformAudioCapture.h"
#include <algorithm>
#include <cmath>
#include <cstring>

namespace audio {

// ========================================
// PLATFORM DETECTION ET FACTORY
// ========================================

PlatformAudioCaptureFactory::Platform PlatformAudioCaptureFactory::current_platform_ = Platform::UNKNOWN;

PlatformAudioCaptureFactory::Platform PlatformAudioCaptureFactory::DetectPlatform() {
    if (current_platform_ != Platform::UNKNOWN) {
        return current_platform_;
    }
    
#ifdef __APPLE__
    #ifdef TARGET_OS_IPHONE
        #if TARGET_OS_IPHONE
            current_platform_ = Platform::IOS;
        #else
            current_platform_ = Platform::MACOS;
        #endif
    #else
        current_platform_ = Platform::MACOS;
    #endif
#elif defined(__ANDROID__)
    current_platform_ = Platform::ANDROID;
#elif defined(_WIN32)
    current_platform_ = Platform::WINDOWS;
#elif defined(__linux__)
    current_platform_ = Platform::LINUX;
#else
    current_platform_ = Platform::UNKNOWN;
#endif
    
    return current_platform_;
}

std::unique_ptr<AudioCaptureInterface> PlatformAudioCaptureFactory::CreateNativeCapture() {
    Platform platform = DetectPlatform();
    
    switch (platform) {
#ifdef __APPLE__
        case Platform::IOS:
        case Platform::MACOS:
            return std::make_unique<iOSAudioCapture>();
#endif
            
#ifdef __ANDROID__
        case Platform::ANDROID:
            return std::make_unique<AndroidAudioCapture>();
#endif
            
        case Platform::WINDOWS:
        case Platform::LINUX:
        case Platform::UNKNOWN:
        default:
#if !defined(__APPLE__) && !defined(__ANDROID__)
            return std::make_unique<DesktopAudioCapture>();
#else
            // Fallback vers la capture C++ pure
            return AudioCaptureFactory::CreatePlatformCapture();
#endif
    }
}

std::string PlatformAudioCaptureFactory::GetPlatformName() {
    Platform platform = DetectPlatform();
    
    switch (platform) {
        case Platform::IOS: return "iOS";
        case Platform::ANDROID: return "Android";
        case Platform::WINDOWS: return "Windows";
        case Platform::LINUX: return "Linux";
        case Platform::MACOS: return "macOS";
        default: return "Unknown";
    }
}

bool PlatformAudioCaptureFactory::IsNativeCaptureAvailable() {
    Platform platform = DetectPlatform();
    return platform != Platform::UNKNOWN;
}

AudioCaptureFactory::PlatformCapabilities PlatformAudioCaptureFactory::GetNativeCapabilities() {
    AudioCaptureFactory::PlatformCapabilities caps;
    Platform platform = DetectPlatform();
    
    switch (platform) {
        case Platform::IOS:
            caps.supported_sample_rates = {8000, 16000, 22050, 44100, 48000, 88200};
            caps.max_channels = 2; // Stéréo typique pour mobile
            caps.supported_bit_depths = {16, 24, 32};
            caps.supports_pause = true;
            caps.supports_low_latency = true;
            caps.min_latency_ms = 5.0f; // iOS peut descendre très bas
            break;
            
        case Platform::ANDROID:
            caps.supported_sample_rates = {8000, 16000, 22050, 44100, 48000};
            caps.max_channels = 2;
            caps.supported_bit_depths = {16, 24};
            caps.supports_pause = true;
            caps.supports_low_latency = false; // Variable selon le device
            caps.min_latency_ms = 20.0f; // Android généralement plus élevé
            break;
            
        default:
            // Capacités par défaut conservatrices
            caps.supported_sample_rates = {16000, 44100, 48000};
            caps.max_channels = 2;
            caps.supported_bit_depths = {16, 32};
            caps.supports_pause = true;
            caps.supports_low_latency = false;
            caps.min_latency_ms = 50.0f;
            break;
    }
    
    return caps;
}

float PlatformAudioCaptureFactory::GetPlatformLatency() {
    Platform platform = DetectPlatform();
    
    switch (platform) {
        case Platform::IOS: return 10.0f;      // iOS optimisé
        case Platform::ANDROID: return 40.0f;  // Android variable
        case Platform::WINDOWS: return 30.0f;  // WASAPI
        case Platform::LINUX: return 25.0f;    // ALSA/PulseAudio
        case Platform::MACOS: return 15.0f;    // CoreAudio
        default: return 50.0f;
    }
}

bool PlatformAudioCaptureFactory::CheckAudioPermissions() {
    Platform platform = DetectPlatform();
    
    // Pour les plateformes desktop, pas de permissions nécessaires
    if (platform == Platform::WINDOWS || platform == Platform::LINUX || platform == Platform::MACOS) {
        return true;
    }
    
    // Pour mobile, on simule le check (implémentation réelle nécessiterait du code platform-specific)
    // TODO: Implémenter vrai check de permissions
    return true;
}

bool PlatformAudioCaptureFactory::RequestAudioPermissions() {
    // TODO: Implémenter demande de permissions réelle
    return CheckAudioPermissions();
}

// ========================================
// IMPLÉMENTATION iOS (STUB AVEC LOGIQUE C++)
// ========================================

#ifdef __APPLE__

// PIMPL pour cacher les détails Objective-C++
class iOSAudioCapture::Impl {
public:
    Impl() {
        // TODO: Initialiser AVAudioEngine
        // engine_ = [[AVAudioEngine alloc] init];
    }
    
    ~Impl() {
        // TODO: Nettoyer AVAudioEngine
    }
    
    bool Initialize(const AudioConfig& config) {
        // TODO: Configurer AVAudioEngine avec la config
        config_ = config;
        return true;
    }
    
    bool StartCapture() {
        // TODO: Démarrer AVAudioEngine
        is_capturing_ = true;
        
        // Simuler la capture avec un thread pour le moment
        capture_thread_ = std::make_unique<std::thread>(&Impl::CaptureThread, this);
        return true;
    }
    
    void StopCapture() {
        is_capturing_ = false;
        if (capture_thread_ && capture_thread_->joinable()) {
            capture_thread_->join();
        }
    }
    
    bool IsCapturing() const {
        return is_capturing_;
    }
    
    void SetCallback(AudioCaptureInterface::CaptureCallback callback) {
        std::lock_guard<std::mutex> lock(callback_mutex_);
        capture_callback_ = callback;
    }
    
private:
    AudioConfig config_;
    std::atomic<bool> is_capturing_{false};
    std::unique_ptr<std::thread> capture_thread_;
    
    AudioCaptureInterface::CaptureCallback capture_callback_;
    mutable std::mutex callback_mutex_;
    
    // TODO: Ajouter membres AVAudioEngine
    // AVAudioEngine* engine_;
    // AVAudioInputNode* inputNode_;
    
    void CaptureThread() {
        const size_t frames_per_buffer = config_.buffer_size;
        const size_t samples_per_buffer = frames_per_buffer * config_.channels;
        const double buffer_duration_ms = (frames_per_buffer * 1000.0) / config_.sample_rate;
        
        std::vector<float> buffer(samples_per_buffer);
        double phase = 0.0;
        
        auto start_time = std::chrono::steady_clock::now();
        
        while (is_capturing_) {
            // Simuler données audio (remplacer par vraie capture AVAudioEngine)
            GenerateTestAudio(buffer.data(), frames_per_buffer, phase);
            
            // Timestamp
            auto now = std::chrono::steady_clock::now();
            auto timestamp = std::chrono::duration_cast<std::chrono::microseconds>(
                now - start_time).count();
            
            // Callback
            {
                std::lock_guard<std::mutex> lock(callback_mutex_);
                if (capture_callback_) {
                    capture_callback_(buffer.data(), frames_per_buffer, timestamp);
                }
            }
            
            // Timing
            std::this_thread::sleep_for(std::chrono::microseconds(
                static_cast<int64_t>(buffer_duration_ms * 1000)));
        }
    }
    
    void GenerateTestAudio(float* buffer, size_t frames, double& phase) {
        const double frequency = 880.0; // La 880Hz
        const double amplitude = 0.2;
        const double phase_increment = frequency / config_.sample_rate;
        
        for (size_t frame = 0; frame < frames; ++frame) {
            float sample = static_cast<float>(amplitude * std::sin(2.0 * M_PI * phase));
            
            for (size_t ch = 0; ch < config_.channels; ++ch) {
                buffer[frame * config_.channels + ch] = sample;
            }
            
            phase += phase_increment;
            if (phase > 1.0) phase -= 1.0;
        }
    }
};

iOSAudioCapture::iOSAudioCapture() : impl_(std::make_unique<Impl>()) {}

iOSAudioCapture::~iOSAudioCapture() {
    Cleanup();
}

bool iOSAudioCapture::Initialize(const AudioConfig& config) {
    config_ = config;
    return impl_->Initialize(config);
}

bool iOSAudioCapture::StartCapture() {
    if (impl_->StartCapture()) {
        is_capturing_ = true;
        return true;
    }
    return false;
}

void iOSAudioCapture::StopCapture() {
    impl_->StopCapture();
    is_capturing_ = false;
}

bool iOSAudioCapture::PauseCapture() {
    is_paused_ = true;
    return true;
}

bool iOSAudioCapture::ResumeCapture() {
    is_paused_ = false;
    return true;
}

void iOSAudioCapture::SetCaptureCallback(CaptureCallback callback) {
    std::lock_guard<std::mutex> lock(callback_mutex_);
    capture_callback_ = callback;
    impl_->SetCallback(callback);
}

void iOSAudioCapture::SetErrorCallback(ErrorCallback callback) {
    std::lock_guard<std::mutex> lock(callback_mutex_);
    error_callback_ = callback;
}

bool iOSAudioCapture::IsCapturing() const {
    return is_capturing_ && !is_paused_;
}

AudioConfig iOSAudioCapture::GetCurrentConfig() const {
    return config_;
}

float iOSAudioCapture::GetCurrentLevel() const {
    return current_level_.load();
}

float iOSAudioCapture::GetCaptureLatency() const {
    return 10.0f; // iOS optimisé
}

void iOSAudioCapture::Cleanup() {
    StopCapture();
}

#endif // __APPLE__

// ========================================
// IMPLÉMENTATION ANDROID (STUB AVEC LOGIQUE C++)
// ========================================

#ifdef __ANDROID__

class AndroidAudioCapture::Impl {
public:
    Impl() {
        // TODO: Initialiser JNI et AudioRecord
    }
    
    ~Impl() {
        // TODO: Nettoyer JNI
    }
    
    bool Initialize(const AudioConfig& config) {
        // TODO: Configurer AudioRecord via JNI
        config_ = config;
        return true;
    }
    
    bool StartCapture() {
        // TODO: audioRecord.startRecording() via JNI
        return true;
    }
    
    void StopCapture() {
        // TODO: audioRecord.stop() via JNI
    }
    
private:
    AudioConfig config_;
    // TODO: Ajouter JNI refs
    // jobject audioRecord_;
    // jmethodID startMethod_;
    // jmethodID stopMethod_;
};

AndroidAudioCapture::AndroidAudioCapture() : impl_(std::make_unique<Impl>()) {}

AndroidAudioCapture::~AndroidAudioCapture() {
    Cleanup();
}

bool AndroidAudioCapture::Initialize(const AudioConfig& config) {
    config_ = config;
    return impl_->Initialize(config);
}

bool AndroidAudioCapture::StartCapture() {
    if (!impl_->StartCapture()) {
        return false;
    }
    
    is_capturing_ = true;
    should_stop_ = false;
    
    // Démarrer le thread de capture
    capture_thread_ = std::make_unique<std::thread>(&AndroidAudioCapture::CaptureThreadFunction, this);
    
    return true;
}

void AndroidAudioCapture::StopCapture() {
    should_stop_ = true;
    is_capturing_ = false;
    
    if (capture_thread_ && capture_thread_->joinable()) {
        capture_thread_->join();
    }
    
    impl_->StopCapture();
}

bool AndroidAudioCapture::PauseCapture() {
    is_paused_ = true;
    return true;
}

bool AndroidAudioCapture::ResumeCapture() {
    is_paused_ = false;
    return true;
}

void AndroidAudioCapture::SetCaptureCallback(CaptureCallback callback) {
    std::lock_guard<std::mutex> lock(callback_mutex_);
    capture_callback_ = callback;
}

void AndroidAudioCapture::SetErrorCallback(ErrorCallback callback) {
    std::lock_guard<std::mutex> lock(callback_mutex_);
    error_callback_ = callback;
}

bool AndroidAudioCapture::IsCapturing() const {
    return is_capturing_ && !is_paused_;
}

AudioConfig AndroidAudioCapture::GetCurrentConfig() const {
    return config_;
}

float AndroidAudioCapture::GetCurrentLevel() const {
    return current_level_.load();
}

float AndroidAudioCapture::GetCaptureLatency() const {
    return 40.0f; // Android typique
}

void AndroidAudioCapture::Cleanup() {
    StopCapture();
}

void AndroidAudioCapture::CaptureThreadFunction() {
    const size_t frames_per_buffer = config_.buffer_size;
    const size_t samples_per_buffer = frames_per_buffer * config_.channels;
    const double buffer_duration_ms = (frames_per_buffer * 1000.0) / config_.sample_rate;
    
    std::vector<float> buffer(samples_per_buffer);
    auto start_time = std::chrono::steady_clock::now();
    
    while (!should_stop_) {
        if (is_paused_) {
            std::this_thread::sleep_for(std::chrono::milliseconds(10));
            continue;
        }
        
        // TODO: Lire depuis AudioRecord via JNI
        // Pour le moment, générer un signal test
        static double phase = 0.0;
        const double frequency = 440.0;
        const double amplitude = 0.2;
        
        for (size_t frame = 0; frame < frames_per_buffer; ++frame) {
            float sample = static_cast<float>(amplitude * std::sin(2.0 * M_PI * frequency * phase / config_.sample_rate));
            phase += 1.0;
            
            for (size_t ch = 0; ch < config_.channels; ++ch) {
                buffer[frame * config_.channels + ch] = sample;
            }
        }
        
        // Calculer niveau
        float rms = platform_utils::CalculateLevelOptimized(buffer.data(), frames_per_buffer, config_.channels);
        current_level_ = rms;
        
        // Callback
        auto now = std::chrono::steady_clock::now();
        auto timestamp = std::chrono::duration_cast<std::chrono::microseconds>(now - start_time).count();
        
        {
            std::lock_guard<std::mutex> lock(callback_mutex_);
            if (capture_callback_) {
                capture_callback_(buffer.data(), frames_per_buffer, timestamp);
            }
        }
        
        // Timing
        std::this_thread::sleep_for(std::chrono::microseconds(
            static_cast<int64_t>(buffer_duration_ms * 1000)));
    }
}

#endif // __ANDROID__

// ========================================
// IMPLÉMENTATION DESKTOP
// ========================================

#if !defined(__APPLE__) && !defined(__ANDROID__)

DesktopAudioCapture::DesktopAudioCapture() {}

DesktopAudioCapture::~DesktopAudioCapture() {
    Cleanup();
}

bool DesktopAudioCapture::Initialize(const AudioConfig& config) {
    config_ = config;
    return true;
}

bool DesktopAudioCapture::StartCapture() {
    is_capturing_ = true;
    should_stop_ = false;
    
    capture_thread_ = std::make_unique<std::thread>(&DesktopAudioCapture::CaptureThreadFunction, this);
    
    return true;
}

void DesktopAudioCapture::StopCapture() {
    should_stop_ = true;
    is_capturing_ = false;
    
    if (capture_thread_ && capture_thread_->joinable()) {
        capture_thread_->join();
    }
}

bool DesktopAudioCapture::PauseCapture() {
    is_paused_ = true;
    return true;
}

bool DesktopAudioCapture::ResumeCapture() {
    is_paused_ = false;
    return true;
}

void DesktopAudioCapture::SetCaptureCallback(CaptureCallback callback) {
    std::lock_guard<std::mutex> lock(callback_mutex_);
    capture_callback_ = callback;
}

void DesktopAudioCapture::SetErrorCallback(ErrorCallback callback) {
    std::lock_guard<std::mutex> lock(callback_mutex_);
    error_callback_ = callback;
}

bool DesktopAudioCapture::IsCapturing() const {
    return is_capturing_ && !is_paused_;
}

AudioConfig DesktopAudioCapture::GetCurrentConfig() const {
    return config_;
}

float DesktopAudioCapture::GetCurrentLevel() const {
    return current_level_.load();
}

float DesktopAudioCapture::GetCaptureLatency() const {
    return 50.0f; // Desktop conservateur
}

void DesktopAudioCapture::Cleanup() {
    StopCapture();
}

void DesktopAudioCapture::CaptureThreadFunction() {
    const size_t frames_per_buffer = config_.buffer_size;
    const size_t samples_per_buffer = frames_per_buffer * config_.channels;
    const double buffer_duration_ms = (frames_per_buffer * 1000.0) / config_.sample_rate;
    
    std::vector<float> buffer(samples_per_buffer);
    auto start_time = std::chrono::steady_clock::now();
    
    while (!should_stop_) {
        if (is_paused_) {
            std::this_thread::sleep_for(std::chrono::milliseconds(10));
            continue;
        }
        
        // Générer signal test
        GenerateTestSignal(buffer.data(), frames_per_buffer);
        
        // Calculer niveau
        float rms = platform_utils::CalculateLevelOptimized(buffer.data(), frames_per_buffer, config_.channels);
        current_level_ = rms;
        
        // Callback
        auto now = std::chrono::steady_clock::now();
        auto timestamp = std::chrono::duration_cast<std::chrono::microseconds>(now - start_time).count();
        
        {
            std::lock_guard<std::mutex> lock(callback_mutex_);
            if (capture_callback_) {
                capture_callback_(buffer.data(), frames_per_buffer, timestamp);
            }
        }
        
        // Timing
        std::this_thread::sleep_for(std::chrono::microseconds(
            static_cast<int64_t>(buffer_duration_ms * 1000)));
    }
}

void DesktopAudioCapture::GenerateTestSignal(float* buffer, size_t frames) {
    const double amplitude = 0.2;
    const double phase_increment = test_frequency_ / config_.sample_rate;
    
    for (size_t frame = 0; frame < frames; ++frame) {
        float sample = static_cast<float>(amplitude * std::sin(2.0 * M_PI * phase_));
        
        for (size_t ch = 0; ch < config_.channels; ++ch) {
            buffer[frame * config_.channels + ch] = sample;
        }
        
        phase_ += phase_increment;
        if (phase_ > 1.0) phase_ -= 1.0;
    }
}

#endif // Desktop

// ========================================
// UTILITAIRES PLATFORM-SPECIFIC
// ========================================

namespace platform_utils {

size_t GetOptimalBufferSize(uint32_t sample_rate, uint16_t /* channels */) {
    // Calculer une taille de buffer optimale selon la plateforme
    auto platform = PlatformAudioCaptureFactory::DetectPlatform();
    
    switch (platform) {
        case PlatformAudioCaptureFactory::Platform::IOS:
            // iOS préfère des buffers plus petits pour latence minimale
            return static_cast<size_t>(sample_rate * 0.005); // 5ms
            
        case PlatformAudioCaptureFactory::Platform::ANDROID:
            // Android nécessite des buffers plus gros
            return static_cast<size_t>(sample_rate * 0.02); // 20ms
            
        default:
            // Desktop conservateur
            return static_cast<size_t>(sample_rate * 0.01); // 10ms
    }
}

float CalculateLevelOptimized(const float* data, size_t frames, size_t channels) {
    // Version optimisée du calcul RMS
    size_t total_samples = frames * channels;
    
    // TODO: Utiliser SIMD si disponible
    double sum_squares = 0.0;
    for (size_t i = 0; i < total_samples; ++i) {
        sum_squares += data[i] * data[i];
    }
    
    return static_cast<float>(std::sqrt(sum_squares / total_samples));
}

void ApplyGainSIMD(float* data, size_t frames, size_t channels, float gain) {
    // TODO: Implémenter version SIMD
    size_t total_samples = frames * channels;
    for (size_t i = 0; i < total_samples; ++i) {
        data[i] *= gain;
    }
}

namespace format_conversion {

void Int16ToFloat32(const int16_t* input, float* output, size_t samples) {
    constexpr float scale = 1.0f / 32768.0f;
    for (size_t i = 0; i < samples; ++i) {
        output[i] = static_cast<float>(input[i]) * scale;
    }
}

void Float32ToInt16(const float* input, int16_t* output, size_t samples) {
    constexpr float scale = 32767.0f;
    for (size_t i = 0; i < samples; ++i) {
        float clamped = std::clamp(input[i], -1.0f, 1.0f);
        output[i] = static_cast<int16_t>(clamped * scale);
    }
}

void Int24ToFloat32(const uint8_t* input, float* output, size_t samples) {
    constexpr float scale = 1.0f / 8388608.0f; // 2^23
    
    for (size_t i = 0; i < samples; ++i) {
        // Assembler 24-bit depuis 3 bytes (little endian)
        int32_t sample24 = (input[i*3] | (input[i*3+1] << 8) | (input[i*3+2] << 16));
        
        // Étendre le signe pour 24-bit
        if (sample24 & 0x800000) {
            sample24 |= 0xFF000000;
        }
        
        output[i] = static_cast<float>(sample24) * scale;
    }
}

void Float32ToInt24(const float* input, uint8_t* output, size_t samples) {
    constexpr float scale = 8388607.0f; // 2^23 - 1
    
    for (size_t i = 0; i < samples; ++i) {
        float clamped = std::clamp(input[i], -1.0f, 1.0f);
        int32_t sample24 = static_cast<int32_t>(clamped * scale);
        
        // Décomposer en 3 bytes (little endian)
        output[i*3] = sample24 & 0xFF;
        output[i*3+1] = (sample24 >> 8) & 0xFF;
        output[i*3+2] = (sample24 >> 16) & 0xFF;
    }
}

void InterleaveChannels(const float* const* input, float* output, 
                       size_t frames, size_t channels) {
    for (size_t frame = 0; frame < frames; ++frame) {
        for (size_t ch = 0; ch < channels; ++ch) {
            output[frame * channels + ch] = input[ch][frame];
        }
    }
}

void DeinterleaveChannels(const float* input, float* const* output, 
                         size_t frames, size_t channels) {
    for (size_t frame = 0; frame < frames; ++frame) {
        for (size_t ch = 0; ch < channels; ++ch) {
            output[ch][frame] = input[frame * channels + ch];
        }
    }
}

} // namespace format_conversion

} // namespace platform_utils

} // namespace audio