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

#include <memory>
#include <string>

// ========================================
// NAMESPACE PRINCIPAL ET RE-EXPORTS
// ========================================

namespace naya::audio {
    
    // Re-export des types principaux pour simplifier l'usage
    using AudioRecorder = ::audio::AudioRecorder;
    using AudioConfig = ::audio::AudioConfig;
    using AudioBuffer = ::audio::AudioBuffer;
    using RecordingStats = ::audio::RecordingStats;
    using AudioRecorderCallback = ::audio::AudioRecorderCallback;
    
    // Re-export des interfaces de capture audio
    using AudioCaptureInterface = ::audio::AudioCaptureInterface;
    using AudioCaptureCpp = ::audio::AudioCaptureCpp;
    using AudioCaptureFactory = ::audio::AudioCaptureFactory;
    using PlatformAudioCaptureFactory = ::audio::PlatformAudioCaptureFactory;
    
#ifdef __APPLE__
    using iOSAudioCapture = ::audio::iOSAudioCapture;
#endif
#ifdef __ANDROID__
    using AndroidAudioCapture = ::audio::AndroidAudioCapture;
#endif
#if !defined(__APPLE__) && !defined(__ANDROID__)
    using DesktopAudioCapture = ::audio::DesktopAudioCapture;
#endif
    
    // Re-export des interfaces d'encodage multi-format
    using AudioEncoderInterface = ::audio::AudioEncoderInterface;
    using AudioFormat = ::audio::AudioFormat;
    using AudioQuality = ::audio::AudioQuality;
    using EncoderConfig = ::audio::EncoderConfig;
    using AudioEncoderFactory = ::audio::AudioEncoderFactory;
    using WAVEncoder = ::audio::WAVEncoder;
    using UniversalEncoder = ::audio::UniversalEncoder;
    
    // Re-export des interfaces DSP temps réel
    using AudioDSPProcessor = ::audio::dsp::AudioDSPProcessor;
    using AudioDSPPipeline = ::audio::dsp::AudioDSPPipeline;
    using AudioDSPFactory = ::audio::dsp::AudioDSPFactory;
    using EffectType = ::audio::dsp::EffectType;
    using DSPParameter = ::audio::dsp::DSPParameter;
    using DSPPreset = ::audio::dsp::DSPPreset;
    using ParametricEqualizer = ::audio::dsp::ParametricEqualizer;
    using BiquadFilter = ::audio::dsp::BiquadFilter;
    
    // Re-export des optimisations mémoire
    using AudioBufferPool = ::facebook::react::AudioBufferPool;
    
    // ========================================
    // FACTORY FUNCTIONS SIMPLIFIÉES
    // ========================================
    
    namespace factory {
        
        /**
         * Crée une instance optimisée d'AudioRecorder
         * @return Instance unique_ptr avec gestion RAII automatique
         */
        inline std::unique_ptr<AudioRecorder> CreateRecorder() {
            return ::audio::AudioRecorderFactory::CreateRecorder();
        }
        
        /**
         * Configuration standard CD-quality (44.1kHz, 16-bit, Stéréo)
         */
        inline AudioConfig CreateStandardConfig() {
            return AudioConfig{
                .sample_rate = 44100,
                .channels = 2,
                .bit_depth = 16,
                .buffer_size = 4096
            };
        }
        
        /**
         * Configuration Hi-Res Audio (88.2kHz, 32-bit, Stéréo)
         * Qualité studio professionnelle
         */
        inline AudioConfig CreateHiResConfig() {
            return AudioConfig{
                .sample_rate = 88200,
                .channels = 2,
                .bit_depth = 32,
                .buffer_size = 8192
            };
        }
        
        /**
         * Configuration optimisée voix (16kHz, 16-bit, Mono)
         * Idéale pour podcasts et communications
         */
        inline AudioConfig CreateVoiceConfig() {
            return AudioConfig{
                .sample_rate = 16000,
                .channels = 1,
                .bit_depth = 16,
                .buffer_size = 2048
            };
        }
        
        /**
         * Configuration personnalisée avec validation
         * @throws std::invalid_argument si configuration invalide
         */
        inline AudioConfig CreateCustomConfig(uint32_t sample_rate, 
                                            uint16_t channels, 
                                            uint16_t bit_depth) {
            AudioConfig config{
                .sample_rate = sample_rate,
                .channels = channels,
                .bit_depth = bit_depth,
                .buffer_size = 4096
            };
            
            if (!config.IsValidSampleRate()) {
                throw std::invalid_argument("Taux d'échantillonnage non supporté: " 
                                          + std::to_string(sample_rate));
            }
            if (!config.IsValidBitDepth()) {
                throw std::invalid_argument("Profondeur de bits non supportée: " 
                                          + std::to_string(bit_depth));
            }
            if (!config.IsValidChannels()) {
                throw std::invalid_argument("Nombre de canaux non supporté: " 
                                          + std::to_string(channels));
            }
            
            return config;
        }
        
        /**
         * Crée une instance de capture audio platform-agnostic
         * @return Instance unique_ptr de AudioCaptureInterface
         */
        inline std::unique_ptr<AudioCaptureInterface> CreateAudioCapture() {
            return AudioCaptureFactory::CreatePlatformCapture();
        }
        
        /**
         * Vérifie si la capture audio est disponible
         * @return true si la capture est supportée sur cette plateforme
         */
        inline bool IsAudioCaptureAvailable() {
            return AudioCaptureFactory::IsCaptureAvailable();
        }
        
        /**
         * Obtient les capacités de capture de la plateforme
         * @return Structure décrivant les capacités audio
         */
        inline AudioCaptureFactory::PlatformCapabilities GetAudioCapabilities() {
            return AudioCaptureFactory::GetCapabilities();
        }
        
        /**
         * Crée une instance de capture audio native optimisée pour la plateforme
         * @return Instance native (iOS/Android/Desktop)
         */
        inline std::unique_ptr<AudioCaptureInterface> CreateNativeAudioCapture() {
            return PlatformAudioCaptureFactory::CreateNativeCapture();
        }
        
        /**
         * Obtient le nom de la plateforme détectée
         * @return Nom de la plateforme ("iOS", "Android", "Desktop")
         */
        inline std::string GetPlatformName() {
            return PlatformAudioCaptureFactory::GetPlatformName();
        }
        
        /**
         * Vérifie si la capture native est disponible sur cette plateforme
         * @return true si la capture native est supportée
         */
        inline bool IsNativeAudioCaptureAvailable() {
            return PlatformAudioCaptureFactory::IsNativeCaptureAvailable();
        }
        
        /**
         * Obtient les capacités natives de la plateforme
         * @return Capacités spécifiques à la plateforme actuelle
         */
        inline AudioCaptureFactory::PlatformCapabilities GetNativeAudioCapabilities() {
            return PlatformAudioCaptureFactory::GetNativeCapabilities();
        }
        
        /**
         * Obtient la latence typique de capture pour cette plateforme
         * @return Latence en millisecondes
         */
        inline float GetPlatformAudioLatency() {
            return PlatformAudioCaptureFactory::GetPlatformLatency();
        }
        
        /**
         * Vérifie les permissions audio (mobiles)
         * @return true si les permissions sont accordées
         */
        inline bool CheckAudioPermissions() {
            return PlatformAudioCaptureFactory::CheckAudioPermissions();
        }
        
        /**
         * Demande les permissions audio (mobiles)
         * @return true si accordées ou déjà présentes
         */
        inline bool RequestAudioPermissions() {
            return PlatformAudioCaptureFactory::RequestAudioPermissions();
        }
        
        /**
         * Crée un encodeur pour le format spécifié
         * @param format Format audio désiré (WAV, FLAC, OGG, AAC)
         * @return Instance unique_ptr de l'encodeur
         */
        inline std::unique_ptr<AudioEncoderInterface> CreateEncoder(AudioFormat format = AudioFormat::WAV) {
            return AudioEncoderFactory::CreateEncoder(format);
        }
        
        /**
         * Crée un encodeur universel avec fallback automatique
         * @param preferred_format Format préféré
         * @return Encodeur universel qui gère les fallbacks
         */
        inline std::unique_ptr<UniversalEncoder> CreateUniversalEncoder(AudioFormat preferred_format = AudioFormat::WAV) {
            return std::make_unique<UniversalEncoder>(preferred_format);
        }
        
        /**
         * Obtient les formats d'encodage supportés
         * @return Vector des formats disponibles
         */
        inline std::vector<AudioFormat> GetSupportedFormats() {
            return AudioEncoderFactory::GetSupportedFormats();
        }
        
        /**
         * Crée une configuration d'encodage optimisée
         * @param format Format désiré
         * @param usage Type d'usage ("music", "voice", "podcast", "archive")
         * @return Configuration optimisée pour l'usage
         */
        inline EncoderConfig CreateEncoderConfig(AudioFormat format, const std::string& usage = "music") {
            return AudioEncoderFactory::CreateOptimizedConfig(format, usage);
        }
        
        /**
         * Détecte le format audio à partir de l'extension de fichier
         * @param filename Nom ou chemin du fichier
         * @return Format détecté
         */
        inline AudioFormat DetectFormatFromFilename(const std::string& filename) {
            return ::audio::format_utils::DetectFormatFromFilename(filename);
        }
        
        /**
         * Estime la taille de fichier pour une configuration donnée
         * @param audio_config Configuration audio
         * @param encoder_config Configuration d'encodage
         * @param duration_seconds Durée estimée
         * @return Taille estimée en octets
         */
        inline size_t EstimateFileSize(const AudioConfig& audio_config, 
                                     const EncoderConfig& encoder_config, 
                                     double duration_seconds) {
            return AudioEncoderInterface::EstimateFileSize(audio_config, encoder_config, duration_seconds);
        }
        
        /**
         * Crée un processeur DSP pour l'effet spécifié
         * @param type Type d'effet (EQ, compresseur, reverb, etc.)
         * @return Instance unique_ptr du processeur
         */
        inline std::unique_ptr<AudioDSPProcessor> CreateDSPProcessor(EffectType type) {
            return AudioDSPFactory::CreateProcessor(type);
        }
        
        /**
         * Crée un pipeline DSP vide
         * @return Pipeline prêt à recevoir des effets
         */
        inline std::unique_ptr<AudioDSPPipeline> CreateDSPPipeline() {
            return std::make_unique<AudioDSPPipeline>();
        }
        
        /**
         * Crée un pipeline DSP avec preset prédéfini
         * @param preset_name Nom du preset ("Voice Processing", "Music Master", etc.)
         * @return Pipeline configuré avec les effets appropriés
         */
        inline std::unique_ptr<AudioDSPPipeline> CreateDSPPipelinePreset(const std::string& preset_name) {
            return AudioDSPFactory::CreatePipelinePreset(preset_name);
        }
        
        /**
         * Obtient les types d'effets DSP supportés
         * @return Vector des types d'effets disponibles
         */
        inline std::vector<EffectType> GetSupportedDSPEffects() {
            return AudioDSPFactory::GetSupportedEffects();
        }
        
        /**
         * Obtient les presets de pipeline DSP disponibles
         * @return Vector des noms de presets
         */
        inline std::vector<std::string> GetDSPPipelinePresets() {
            return AudioDSPFactory::GetAvailablePipelinePresets();
        }
        
        /**
         * Crée un égaliseur paramétrique prêt à utiliser
         * @return Instance d'égaliseur 10 bandes
         */
        inline std::unique_ptr<ParametricEqualizer> CreateParametricEQ() {
            return std::make_unique<ParametricEqualizer>();
        }
        
        /**
         * Obtient le nom lisible d'un type d'effet
         * @param type Type d'effet
         * @return Nom descriptif
         */
        inline std::string GetEffectTypeName(EffectType type) {
            return AudioDSPFactory::GetEffectTypeName(type);
        }
        
        /**
         * Vérifie si un effet DSP est supporté
         * @param type Type d'effet à vérifier
         * @return true si supporté
         */
        inline bool IsDSPEffectSupported(EffectType type) {
            return AudioDSPFactory::IsEffectSupported(type);
        }
    }
    
    // ========================================
    // CONSTANTES UTILES
    // ========================================
    
    namespace constants {
        // Limites système
        constexpr size_t kMaxBufferSize = 16384;
        constexpr size_t kMinBufferSize = 512;
        constexpr uint32_t kMaxSampleRate = 88200;
        
        // Formats supportés
        constexpr const char* kFormatWAV = "wav";
        constexpr const char* kFormatPCM = "pcm";
        
        // Tailles recommandées
        constexpr size_t kDefaultPoolSize = 20;
        constexpr size_t kDefaultBufferSize = 4096;
    }
}

// ========================================
// INCLUDES DÉTAILLÉS
// ========================================

// Core audio engine - Moteur principal d'enregistrement
#include "AudioRecord/AudioRecorder.h"

// Interface de capture audio cross-platform
#include "AudioRecord/AudioCaptureInterface.h"

// Implémentation C++ pure de la capture audio
#include "AudioRecord/AudioCaptureCpp.h"

// Capture audio native platform-specific (iOS/Android/Desktop)
#include "AudioRecord/PlatformAudioCapture.h"

// Interface d'encodage multi-format
#include "AudioRecord/AudioEncoderInterface.h"

// Implémentations des encodeurs (WAV, FLAC, OGG, AAC)
#include "AudioRecord/AudioEncoders.h"

// Interface DSP temps réel
#include "AudioRecord/AudioDSPInterface.h"

// Processeurs DSP (EQ, compresseur, reverb, etc.)
#include "AudioRecord/AudioDSPProcessors.h"

// Optimisations mémoire - Pools de buffers performants
#include "AudioRecord/AudioBufferPool.h"

// TurboModule wrapper - Interface React Native JSI
#include "AudioRecord/NativeAudioRecorder.h"
