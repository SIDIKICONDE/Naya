#pragma once

/**
 * 🎵 NativeAudioRecorder - Module Audio Natif React Native
 * 
 * Fichier barrel import centralisant tous les composants du module audio.
 * Architecture modulaire optimisée pour performance et maintenabilité.
 * 
 * @usage
 *   #include "NativeAudioRecorder.h"
 *   using namespace naya::audio;
 *   
 *   auto recorder = factory::CreateRecorder();
 *   recorder->Initialize(factory::CreateHiResConfig());
 */

// Inclure les vrais headers du module AudioRecord
#include "AudioRecord/AudioRecorder.h"
#include "AudioRecord/AudioStructs.h"
#include "AudioRecord/AudioCaptureInterface.h"
#include "AudioRecord/AudioCaptureCpp.h"
#include "AudioRecord/PlatformAudioCapture.h"
#include "AudioRecord/AudioEncoderInterface.h"
#include "AudioRecord/AudioEncoders.h"
#include "AudioRecord/AudioDSPInterface.h"
#include "AudioRecord/AudioDSPProcessors.h"
#include "AudioRecord/AudioBufferPool.h"

// ========================================
// NAMESPACE PRINCIPAL ET RE-EXPORTS
// ========================================

namespace naya::audio {
    
    // Re-export des types principaux pour simplifier l'usage
    using AudioRecorder = audio::AudioRecorder;
    using AudioConfig = audio::AudioConfig;
    using AudioBuffer = audio::AudioBuffer;
    using RecordingStats = audio::RecordingStats;
    using AudioRecorderCallback = audio::AudioRecorderCallback;
    
    // Re-export des interfaces de capture audio
    using AudioCaptureInterface = audio::AudioCaptureInterface;
    using AudioCaptureCpp = audio::AudioCaptureCpp;
    using PlatformAudioCaptureFactory = audio::PlatformAudioCaptureFactory;
    
#ifdef __APPLE__
    using iOSAudioCapture = audio::iOSAudioCapture;
#endif
#ifdef __ANDROID__
    using AndroidAudioCapture = audio::AndroidAudioCapture;
#endif
#if !defined(__APPLE__) && !defined(__ANDROID__)
    using DesktopAudioCapture = audio::DesktopAudioCapture;
#endif
    
    // Re-export des interfaces d'encodage multi-format
    using AudioEncoderInterface = audio::AudioEncoderInterface;
    using AudioFormat = audio::AudioFormat;
    using AudioQuality = audio::AudioQuality;
    using EncoderConfig = audio::EncoderConfig;
    using AudioEncoderFactory = audio::AudioEncoderFactory;
    using WAVEncoder = audio::WAVEncoder;
    using UniversalEncoder = audio::UniversalEncoder;
    
    // Re-export des interfaces DSP temps réel
    using AudioDSPProcessor = audio::dsp::AudioDSPProcessor;
    using AudioDSPPipeline = audio::dsp::AudioDSPPipeline;
    using AudioDSPFactory = audio::dsp::AudioDSPFactory;
    using EffectType = audio::dsp::EffectType;
    using DSPParameter = audio::dsp::DSPParameter;
    using DSPPreset = audio::dsp::DSPPreset;
    using ParametricEqualizer = audio::dsp::ParametricEqualizer;
    using BiquadFilter = audio::dsp::BiquadFilter;
    
    // Re-export des optimisations mémoire
    using AudioBufferPool = audio::AudioBufferPool;
    
    // ========================================
    // FACTORY FUNCTIONS SIMPLIFIÉES
    // ========================================
    
    namespace factory {
        
        /**
         * Crée une instance optimisée d'AudioRecorder
         * @return Instance unique_ptr avec gestion RAII automatique
         */
        inline std::unique_ptr<AudioRecorder> CreateRecorder() {
            return std::make_unique<AudioRecorder>();
        }
        
        /**
         * Configuration standard CD-quality (44.1kHz, 16-bit, Stéréo)
         */
        inline AudioConfig CreateStandardConfig() {
            return AudioConfig{
                .sample_rate = 44100,
                .channels = 2,
                .bit_depth = 16,
                .buffer_size = 1024
            };
        }
        
        /**
         * Configuration Hi-Res Audio (96kHz, 24-bit, Stéréo)
         */
        inline AudioConfig CreateHiResConfig() {
            return AudioConfig{
                .sample_rate = 96000,
                .channels = 2,
                .bit_depth = 24,
                .buffer_size = 512
            };
        }
        
        /**
         * Configuration podcast/voix (44.1kHz, 16-bit, Mono)
         */
        inline AudioConfig CreateVoiceConfig() {
            return AudioConfig{
                .sample_rate = 44100,
                .channels = 1,
                .bit_depth = 16,
                .buffer_size = 2048
            };
        }
        
        /**
         * Configuration studio (48kHz, 24-bit, Stéréo)
         */
        inline AudioConfig CreateStudioConfig() {
            return AudioConfig{
                .sample_rate = 48000,
                .channels = 2,
                .bit_depth = 24,
                .buffer_size = 256
            };
        }
        
    } // namespace factory
    
    // ========================================
    // UTILITAIRES DE DIAGNOSTIC SYSTÈME
    // ========================================
    
    namespace diagnostics {
        
        /**
         * Informations système sur l'audio
         */
        struct AudioSystemInfo {
            bool is_available = false;
            std::string platform_name;
            std::vector<uint32_t> supported_sample_rates;
            std::vector<uint16_t> supported_bit_depths;
            size_t max_channels = 0;
            size_t min_buffer_size = 0;
            size_t max_buffer_size = 0;
        };
        
        /**
         * Obtient les capacités audio du système
         */
        inline AudioSystemInfo GetSystemAudioInfo() {
            AudioSystemInfo info;
            
#ifdef __APPLE__
            info.platform_name = "iOS/macOS";
            info.is_available = true;
            info.supported_sample_rates = {8000, 16000, 22050, 44100, 48000, 88200, 96000};
            info.supported_bit_depths = {16, 24, 32};
            info.max_channels = 8;
            info.min_buffer_size = 64;
            info.max_buffer_size = 8192;
#elif defined(__ANDROID__)
            info.platform_name = "Android";
            info.is_available = true;
            info.supported_sample_rates = {8000, 16000, 22050, 44100, 48000};
            info.supported_bit_depths = {16, 24};
            info.max_channels = 2;
            info.min_buffer_size = 256;
            info.max_buffer_size = 4096;
#else
            info.platform_name = "Desktop";
            info.is_available = false; // Non implémenté pour desktop dans cette version
#endif
            
            return info;
        }
        
        /**
         * Vérifie si une configuration audio est supportée
         */
        inline bool IsConfigurationSupported(const AudioConfig& config) {
            auto system_info = GetSystemAudioInfo();
            
            if (!system_info.is_available) return false;
            
            // Vérifier le taux d'échantillonnage
            auto rates = system_info.supported_sample_rates;
            if (std::find(rates.begin(), rates.end(), config.sample_rate) == rates.end()) {
                return false;
            }
            
            // Vérifier la profondeur de bits
            auto depths = system_info.supported_bit_depths;
            if (std::find(depths.begin(), depths.end(), config.bit_depth) == depths.end()) {
                return false;
            }
            
            // Vérifier le nombre de canaux
            if (config.channels > system_info.max_channels) {
                return false;
            }
            
            // Vérifier la taille du buffer
            if (config.buffer_size < system_info.min_buffer_size || 
                config.buffer_size > system_info.max_buffer_size) {
                return false;
            }
            
            return true;
        }
        
    } // namespace diagnostics
    
    // ========================================
    // GESTION D'ERREURS SPÉCIALISÉE
    // ========================================
    
    namespace errors {
        
        enum class AudioErrorCode {
            SUCCESS = 0,
            INITIALIZATION_FAILED,
            INVALID_CONFIGURATION,
            DEVICE_NOT_AVAILABLE,
            PERMISSION_DENIED,
            BUFFER_OVERFLOW,
            ENCODING_ERROR,
            FILE_IO_ERROR,
            UNKNOWN_ERROR
        };
        
        struct AudioError {
            AudioErrorCode code;
            std::string message;
            std::string context;
            
            AudioError(AudioErrorCode c, const std::string& msg, const std::string& ctx = "")
                : code(c), message(msg), context(ctx) {}
        };
        
        inline std::string GetErrorMessage(AudioErrorCode code) {
            switch (code) {
                case AudioErrorCode::SUCCESS:
                    return "Opération réussie";
                case AudioErrorCode::INITIALIZATION_FAILED:
                    return "Échec de l'initialisation du système audio";
                case AudioErrorCode::INVALID_CONFIGURATION:
                    return "Configuration audio invalide";
                case AudioErrorCode::DEVICE_NOT_AVAILABLE:
                    return "Périphérique audio non disponible";
                case AudioErrorCode::PERMISSION_DENIED:
                    return "Permission d'accès au microphone refusée";
                case AudioErrorCode::BUFFER_OVERFLOW:
                    return "Débordement du buffer audio";
                case AudioErrorCode::ENCODING_ERROR:
                    return "Erreur lors de l'encodage audio";
                case AudioErrorCode::FILE_IO_ERROR:
                    return "Erreur d'écriture du fichier audio";
                case AudioErrorCode::UNKNOWN_ERROR:
                default:
                    return "Erreur inconnue";
            }
        }
        
    } // namespace errors
    
} // namespace naya::audio

// ========================================
// MACROS DE COMMODITÉ POUR LE DEBUG
// ========================================

#ifdef DEBUG
    #define NAYA_AUDIO_LOG(msg) \
        std::cout << "[NayaAudio] " << msg << std::endl
    #define NAYA_AUDIO_ERROR(msg) \
        std::cerr << "[NayaAudio ERROR] " << msg << std::endl
#else
    #define NAYA_AUDIO_LOG(msg) ((void)0)
    #define NAYA_AUDIO_ERROR(msg) ((void)0)
#endif

#define NAYA_AUDIO_ASSERT(condition, message) \
    do { \
        if (!(condition)) { \
            NAYA_AUDIO_ERROR("Assertion failed: " << message); \
            throw std::runtime_error("Assertion failed: " + std::string(message)); \
        } \
    } while(0)