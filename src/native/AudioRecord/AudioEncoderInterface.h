#pragma once

#include <memory>
#include <string>
#include <vector>
#include <functional>
#include "AudioStructs.h"

namespace audio {

/**
 * Types de formats audio supportés
 */
enum class AudioFormat {
    WAV,     // PCM Wave (déjà implémenté)
    FLAC,    // Free Lossless Audio Codec
    OGG,     // Ogg Vorbis
    AAC,     // Advanced Audio Coding
    MP3,     // MPEG-1/2 Audio Layer III (future)
    OPUS     // Opus Codec (future)
};

/**
 * Qualité d'encodage pour les formats avec perte
 */
enum class AudioQuality {
    LOW = 0,       // ~96 kbps
    MEDIUM = 1,    // ~128 kbps
    HIGH = 2,      // ~192 kbps
    VERY_HIGH = 3, // ~256 kbps
    EXTREME = 4    // ~320 kbps ou VBR max
};

/**
 * Configuration d'encodage spécifique au format
 */
struct EncoderConfig {
    AudioFormat format = AudioFormat::WAV;
    AudioQuality quality = AudioQuality::HIGH;
    
    // Options spécifiques
    bool use_variable_bitrate = true;  // Pour MP3/OGG
    int compression_level = 5;         // Pour FLAC (0-8)
    bool write_metadata = true;        // Inclure les métadonnées
    
    // Métadonnées
    std::string title;
    std::string artist;
    std::string album;
    std::string comment;
    std::string genre;
    int track_number = 0;
    int year = 0;
};

/**
 * Interface abstraite pour l'encodage audio multi-format
 */
class AudioEncoderInterface {
public:
    virtual ~AudioEncoderInterface() = default;
    
    /**
     * Callback pour rapporter l'avancement de l'encodage
     * @param percent Pourcentage d'avancement (0.0 - 1.0)
     * @param bytes_written Nombre d'octets écrits
     */
    using ProgressCallback = std::function<void(float percent, size_t bytes_written)>;
    
    /**
     * Callback pour les erreurs d'encodage
     * @param error Description de l'erreur
     */
    using ErrorCallback = std::function<void(const std::string& error)>;
    
    /**
     * Initialise l'encodeur avec la configuration donnée
     * @param audio_config Configuration audio (sample rate, channels, etc.)
     * @param encoder_config Configuration d'encodage (format, qualité, etc.)
     * @param output_path Chemin du fichier de sortie
     * @return true si l'initialisation réussit
     */
    virtual bool Initialize(const AudioConfig& audio_config,
                           const EncoderConfig& encoder_config,
                           const std::string& output_path) = 0;
    
    /**
     * Démarre l'encodage
     * @return true si le démarrage réussit
     */
    virtual bool StartEncoding() = 0;
    
    /**
     * Encode un buffer de données audio
     * @param data Données audio au format float32 entrelacé
     * @param frames Nombre de frames audio
     * @return true si l'encodage réussit
     */
    virtual bool EncodeAudio(const float* data, size_t frames) = 0;
    
    /**
     * Finalise l'encodage et ferme le fichier
     * @return Chemin du fichier créé, ou chaîne vide en cas d'erreur
     */
    virtual std::string FinishEncoding() = 0;
    
    /**
     * Annule l'encodage en cours
     */
    virtual void CancelEncoding() = 0;
    
    /**
     * Vérifie si l'encodage est en cours
     * @return true si l'encodage est actif
     */
    virtual bool IsEncoding() const = 0;
    
    /**
     * Obtient les statistiques d'encodage
     */
    struct EncodingStats {
        size_t total_frames_encoded = 0;
        size_t output_file_size = 0;
        float compression_ratio = 0.0f;
        double encoding_duration = 0.0;
        AudioFormat output_format = AudioFormat::WAV;
    };
    
    virtual EncodingStats GetStats() const = 0;
    
    /**
     * Définit le callback de progression
     * @param callback Fonction appelée périodiquement
     */
    virtual void SetProgressCallback(ProgressCallback callback) = 0;
    
    /**
     * Définit le callback d'erreur
     * @param callback Fonction appelée en cas d'erreur
     */
    virtual void SetErrorCallback(ErrorCallback callback) = 0;
    
    /**
     * Obtient la configuration actuelle
     * @return Configuration d'encodage en cours
     */
    virtual EncoderConfig GetCurrentConfig() const = 0;
    
    /**
     * Vérifie si un format est supporté par cette implémentation
     * @param format Format à vérifier
     * @return true si supporté
     */
    virtual bool SupportsFormat(AudioFormat format) const = 0;
    
    /**
     * Obtient l'extension de fichier recommandée pour ce format
     * @param format Format audio
     * @return Extension (sans le point, ex: "flac")
     */
    static std::string GetFileExtension(AudioFormat format);
    
    /**
     * Obtient le nom lisible du format
     * @param format Format audio
     * @return Nom du format (ex: "FLAC Lossless")
     */
    static std::string GetFormatName(AudioFormat format);
    
    /**
     * Estime la taille de fichier finale
     * @param audio_config Configuration audio
     * @param encoder_config Configuration d'encodage
     * @param duration_seconds Durée en secondes
     * @return Taille estimée en octets
     */
    static size_t EstimateFileSize(const AudioConfig& audio_config,
                                  const EncoderConfig& encoder_config,
                                  double duration_seconds);
};

/**
 * Factory pour créer les encodeurs selon le format
 */
class AudioEncoderFactory {
public:
    /**
     * Crée un encodeur pour le format spécifié
     * @param format Format audio désiré
     * @return Instance unique_ptr de l'encodeur, ou nullptr si non supporté
     */
    static std::unique_ptr<AudioEncoderInterface> CreateEncoder(AudioFormat format);
    
    /**
     * Vérifie si un format est supporté
     * @param format Format à vérifier
     * @return true si supporté par la plateforme
     */
    static bool IsFormatSupported(AudioFormat format);
    
    /**
     * Obtient la liste des formats supportés
     * @return Vector des formats disponibles
     */
    static std::vector<AudioFormat> GetSupportedFormats();
    
    /**
     * Obtient les capacités d'encodage de la plateforme
     */
    struct EncodingCapabilities {
        std::vector<AudioFormat> supported_formats;
        std::vector<uint32_t> supported_sample_rates;
        std::vector<uint16_t> supported_channels;
        bool supports_metadata = true;
        bool supports_variable_bitrate = true;
        size_t max_file_size = SIZE_MAX;
    };
    
    static EncodingCapabilities GetCapabilities();
    
    /**
     * Crée une configuration d'encodage optimisée pour un usage
     * @param format Format désiré
     * @param usage Type d'usage ("music", "voice", "podcast", "archive")
     * @return Configuration optimisée
     */
    static EncoderConfig CreateOptimizedConfig(AudioFormat format, const std::string& usage);
};

/**
 * Utilitaires pour les formats audio
 */
namespace format_utils {
    
    /**
     * Détermine le format à partir de l'extension de fichier
     * @param filename Nom ou chemin du fichier
     * @return Format détecté ou WAV par défaut
     */
    AudioFormat DetectFormatFromFilename(const std::string& filename);
    
    /**
     * Valide qu'une configuration est compatible avec un format
     * @param audio_config Configuration audio
     * @param format Format cible
     * @return true si compatible
     */
    bool IsConfigurationValid(const AudioConfig& audio_config, AudioFormat format);
    
    /**
     * Obtient la qualité recommandée pour un format et usage
     * @param format Format audio
     * @param usage Type d'usage
     * @return Qualité recommandée
     */
    AudioQuality GetRecommendedQuality(AudioFormat format, const std::string& usage);
    
    /**
     * Convertit une qualité en bitrate approximatif
     * @param quality Niveau de qualité
     * @param format Format audio (pour les codecs variables)
     * @return Bitrate en kbps
     */
    int QualityToBitrate(AudioQuality quality, AudioFormat format);
    
} // namespace format_utils

} // namespace audio