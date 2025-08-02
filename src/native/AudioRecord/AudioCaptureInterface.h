#pragma once

#include <functional>
#include <memory>
#include <vector>
#include <string>
#include "AudioStructs.h"

namespace audio {

/**
 * Interface abstraite pour la capture audio platform-agnostic
 * Permet d'abstraire les différences entre iOS, Android et autres plateformes
 */
class AudioCaptureInterface {
public:
    virtual ~AudioCaptureInterface() = default;
    
    /**
     * Callback pour recevoir les données audio capturées
     * @param data Données audio au format float32 entrelacé
     * @param frames Nombre de frames audio (1 frame = N canaux)
     * @param timestamp Timestamp de capture en microsecondes
     */
    using CaptureCallback = std::function<void(const float* data, size_t frames, int64_t timestamp)>;
    
    /**
     * Callback pour les erreurs de capture
     * @param error Description de l'erreur
     */
    using ErrorCallback = std::function<void(const std::string& error)>;
    
    /**
     * Initialise le système de capture avec la configuration donnée
     * @param config Configuration audio souhaitée
     * @return true si l'initialisation réussit
     */
    virtual bool Initialize(const AudioConfig& config) = 0;
    
    /**
     * Démarre la capture audio
     * @return true si le démarrage réussit
     */
    virtual bool StartCapture() = 0;
    
    /**
     * Arrête la capture audio
     */
    virtual void StopCapture() = 0;
    
    /**
     * Met la capture en pause
     * @return true si la mise en pause réussit
     */
    virtual bool PauseCapture() = 0;
    
    /**
     * Reprend la capture après une pause
     * @return true si la reprise réussit
     */
    virtual bool ResumeCapture() = 0;
    
    /**
     * Définit le callback pour recevoir les données audio
     * @param callback Fonction appelée avec les données audio
     */
    virtual void SetCaptureCallback(CaptureCallback callback) = 0;
    
    /**
     * Définit le callback pour les erreurs
     * @param callback Fonction appelée en cas d'erreur
     */
    virtual void SetErrorCallback(ErrorCallback callback) = 0;
    
    /**
     * Vérifie si la capture est en cours
     * @return true si la capture est active
     */
    virtual bool IsCapturing() const = 0;
    
    /**
     * Obtient la configuration audio actuelle
     * @return Configuration en cours d'utilisation
     */
    virtual AudioConfig GetCurrentConfig() const = 0;
    
    /**
     * Obtient le niveau audio actuel (RMS)
     * @return Niveau entre 0.0 et 1.0
     */
    virtual float GetCurrentLevel() const = 0;
    
    /**
     * Obtient la latence de capture estimée en millisecondes
     * @return Latence en ms
     */
    virtual float GetCaptureLatency() const = 0;
    
    /**
     * Nettoie toutes les ressources
     */
    virtual void Cleanup() = 0;
};

/**
 * Factory pour créer l'implémentation appropriée selon la plateforme
 */
class AudioCaptureFactory {
public:
    /**
     * Crée une instance de capture audio pour la plateforme actuelle
     * @return Instance unique_ptr de l'implémentation platform-specific
     */
    static std::unique_ptr<AudioCaptureInterface> CreatePlatformCapture();
    
    /**
     * Vérifie si la capture audio est disponible sur cette plateforme
     * @return true si la capture est supportée
     */
    static bool IsCaptureAvailable();
    
    /**
     * Obtient les capacités de capture de la plateforme
     * @return Structure décrivant les capacités
     */
    struct PlatformCapabilities {
        std::vector<uint32_t> supported_sample_rates;
        uint16_t max_channels;
        std::vector<uint16_t> supported_bit_depths;
        bool supports_pause;
        bool supports_low_latency;
        float min_latency_ms;
    };
    
    static PlatformCapabilities GetCapabilities();
};

} // namespace audio