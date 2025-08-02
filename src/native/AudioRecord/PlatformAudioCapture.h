#pragma once

#include "AudioCaptureInterface.h"
#include <memory>
#include <thread>
#include <atomic>

namespace audio {

// ========================================
// CAPTURE AUDIO NATIVE iOS (C++ WRAPPER)
// ========================================

#ifdef __APPLE__

/**
 * Wrapper C++ pour AVAudioEngine iOS
 * Encapsule l'API Objective-C dans une interface C++ pure
 */
class iOSAudioCapture : public AudioCaptureInterface {
public:
    iOSAudioCapture();
    ~iOSAudioCapture() override;
    
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
    // PIMPL pour cacher les détails Objective-C++
    class Impl;
    std::unique_ptr<Impl> impl_;
    
    AudioConfig config_;
    std::atomic<bool> is_capturing_{false};
    std::atomic<bool> is_paused_{false};
    std::atomic<float> current_level_{0.0f};
    
    CaptureCallback capture_callback_;
    ErrorCallback error_callback_;
    mutable std::mutex callback_mutex_;
};

#endif // __APPLE__

// ========================================
// CAPTURE AUDIO NATIVE ANDROID (C++ WRAPPER)
// ========================================

#ifdef __ANDROID__

/**
 * Wrapper C++ pour AudioRecord Android
 * Utilise JNI pour accéder à l'API Java AudioRecord
 */
class AndroidAudioCapture : public AudioCaptureInterface {
public:
    AndroidAudioCapture();
    ~AndroidAudioCapture() override;
    
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
    // PIMPL pour cacher les détails JNI
    class Impl;
    std::unique_ptr<Impl> impl_;
    
    AudioConfig config_;
    std::atomic<bool> is_capturing_{false};
    std::atomic<bool> is_paused_{false};
    std::atomic<float> current_level_{0.0f};
    
    CaptureCallback capture_callback_;
    ErrorCallback error_callback_;
    mutable std::mutex callback_mutex_;
    
    // Thread de capture pour Android
    std::unique_ptr<std::thread> capture_thread_;
    std::atomic<bool> should_stop_{false};
    
    void CaptureThreadFunction();
};

#endif // __ANDROID__

// ========================================
// CAPTURE AUDIO DESKTOP (C++ PUR)
// ========================================

#if !defined(__APPLE__) && !defined(__ANDROID__)

/**
 * Capture audio pour plateformes desktop (Windows, Linux)
 * Utilise des APIs C++ pures ou des librairies cross-platform
 */
class DesktopAudioCapture : public AudioCaptureInterface {
public:
    DesktopAudioCapture();
    ~DesktopAudioCapture() override;
    
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
    AudioConfig config_;
    std::atomic<bool> is_capturing_{false};
    std::atomic<bool> is_paused_{false};
    std::atomic<float> current_level_{0.0f};
    
    CaptureCallback capture_callback_;
    ErrorCallback error_callback_;
    mutable std::mutex callback_mutex_;
    
    // Thread de simulation pour desktop
    std::unique_ptr<std::thread> capture_thread_;
    std::atomic<bool> should_stop_{false};
    
    void CaptureThreadFunction();
    void GenerateTestSignal(float* buffer, size_t frames);
    
    // Générateur de signal test
    double phase_{0.0};
    double test_frequency_{440.0};
};

#endif // Desktop

// ========================================
// FACTORY AUTOMATIQUE PLATFORM-AWARE
// ========================================

/**
 * Factory qui crée automatiquement le bon type de capture selon la plateforme
 */
class PlatformAudioCaptureFactory {
public:
    /**
     * Crée l'implémentation de capture appropriée pour la plateforme
     * @return Instance optimisée pour la plateforme actuelle
     */
    static std::unique_ptr<AudioCaptureInterface> CreateNativeCapture();
    
    /**
     * Obtient le nom de la plateforme détectée
     * @return Nom de la plateforme ("iOS", "Android", "Desktop")
     */
    static std::string GetPlatformName();
    
    /**
     * Vérifie si la capture native est disponible
     * @return true si la plateforme supporte la capture native
     */
    static bool IsNativeCaptureAvailable();
    
    /**
     * Obtient les capacités spécifiques à la plateforme
     * @return Capacités de capture pour cette plateforme
     */
    static AudioCaptureFactory::PlatformCapabilities GetNativeCapabilities();
    
    /**
     * Obtient la latence typique de la plateforme
     * @return Latence en millisecondes
     */
    static float GetPlatformLatency();
    
    /**
     * Configuration des permissions pour les plateformes mobiles
     * @return true si les permissions sont accordées
     */
    static bool CheckAudioPermissions();
    
    /**
     * Demande les permissions audio (mobiles)
     * @return true si les permissions sont accordées ou déjà présentes
     */
    static bool RequestAudioPermissions();
    
public:
    // Détection automatique de plateforme
    enum class Platform {
        IOS,
        ANDROID_PLATFORM, 
        WINDOWS,
        LINUX,
        MACOS,
        UNKNOWN
    };
    
    static Platform DetectPlatform();
    
private:
    static Platform current_platform_;
};

// ========================================
// UTILITAIRES PLATFORM-SPECIFIC
// ========================================

namespace platform_utils {
    
    /**
     * Convertit une configuration AudioConfig vers le format natif
     * @param config Configuration générique
     * @return Configuration adaptée à la plateforme
     */
    template<typename NativeConfigType>
    NativeConfigType ConvertToNativeConfig(const AudioConfig& config);
    
    /**
     * Obtient la taille de buffer optimale pour la plateforme
     * @param sample_rate Taux d'échantillonnage
     * @param channels Nombre de canaux
     * @return Taille de buffer recommandée
     */
    size_t GetOptimalBufferSize(uint32_t sample_rate, uint16_t channels);
    
    /**
     * Calcule le niveau audio en temps réel avec optimisations platform-specific
     * @param data Buffer audio
     * @param frames Nombre de frames
     * @param channels Nombre de canaux
     * @return Niveau RMS optimisé
     */
    float CalculateLevelOptimized(const float* data, size_t frames, size_t channels);
    
    /**
     * Applique un gain avec optimisations SIMD si disponibles
     * @param data Buffer audio (in/out)
     * @param frames Nombre de frames
     * @param channels Nombre de canaux
     * @param gain Gain à appliquer
     */
    void ApplyGainSIMD(float* data, size_t frames, size_t channels, float gain);
    
    /**
     * Convertit entre différents formats d'échantillons
     */
    namespace format_conversion {
        void Int16ToFloat32(const int16_t* input, float* output, size_t samples);
        void Float32ToInt16(const float* input, int16_t* output, size_t samples);
        void Int24ToFloat32(const uint8_t* input, float* output, size_t samples);
        void Float32ToInt24(const float* input, uint8_t* output, size_t samples);
        
        // Entrelacement/désentrelacement
        void InterleaveChannels(const float* const* input, float* output, 
                               size_t frames, size_t channels);
        void DeinterleaveChannels(const float* input, float* const* output, 
                                 size_t frames, size_t channels);
    }
    
    /**
     * Détection et gestion des interruptions audio (mobiles)
     */
    namespace interruption_handling {
        
        enum class InterruptionType {
            PHONE_CALL,
            OTHER_APP,
            SYSTEM_SOUND,
            HARDWARE_CHANGE
        };
        
        using InterruptionCallback = std::function<void(InterruptionType, bool began)>;
        
        bool RegisterInterruptionHandler(InterruptionCallback callback);
        void UnregisterInterruptionHandler();
        bool IsAudioSessionActive();
        void RestoreAudioSession();
    }
    
    /**
     * Optimisations spécifiques selon la plateforme
     */
    namespace optimizations {
        
        /**
         * Active le mode basse latence si disponible
         * @return true si activé avec succès
         */
        bool EnableLowLatencyMode();
        
        /**
         * Configure les paramètres de thread temps réel
         * @param thread_id ID du thread à optimiser
         * @return true si configuré
         */
        bool SetRealtimeThreadPriority(std::thread::native_handle_type thread_id);
        
        /**
         * Préchauffe les buffers audio pour éviter les latences initiales
         * @param config Configuration audio
         */
        void WarmupAudioBuffers(const AudioConfig& config);
        
        /**
         * Utilise les optimisations vectorielles si disponibles
         * @return true si SIMD disponible
         */
        bool HasSIMDSupport();
        
        /**
         * Obtient le nombre optimal de threads audio
         * @return Nombre de threads recommandé
         */
        size_t GetOptimalThreadCount();
    }
    
} // namespace platform_utils

} // namespace audio