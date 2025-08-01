/**
 * AudioFormats.h
 * Module pour la gestion des formats audio
 */

#pragma once

#include <string>
#include <vector>
#include <unordered_map>

namespace facebook::react {

/**
 * Formats audio supportés
 */
enum class AudioFormat {
    WAV,            // WAV (PCM)
    MP3,            // MP3 (MPEG-1 Layer 3)
    AAC,            // AAC (Advanced Audio Coding)
    FLAC,           // FLAC (Free Lossless Audio Codec)
    OGG,            // OGG Vorbis
    M4A,            // M4A (MPEG-4 Audio)
    AIFF,           // AIFF (Audio Interchange File Format)
    UNKNOWN         // Format non reconnu
};

/**
 * Qualités audio
 */
enum class AudioQuality {
    LOW,            // 128 kbps ou moins
    MEDIUM,         // 128-256 kbps
    HIGH,           // 256-320 kbps
    LOSSLESS        // Sans perte (FLAC, WAV)
};

/**
 * Codecs audio
 */
enum class AudioCodec {
    PCM,            // PCM non compressé
    MP3,            // MP3
    AAC,            // AAC
    FLAC,           // FLAC
    VORBIS,         // OGG Vorbis
    ALAC,           // Apple Lossless
    OPUS,           // Opus
    UNKNOWN
};

/**
 * Propriétés d'un format audio
 */
struct AudioFormatInfo {
    AudioFormat format;
    AudioCodec codec;
    std::string extension;
    std::string mimeType;
    std::string description;
    bool isLossless;
    bool supportsMetadata;
    int maxChannels;
    int maxSampleRate;
    std::vector<int> supportedBitrates;
};

/**
 * Métadonnées audio
 */
struct AudioMetadata {
    std::string title;
    std::string artist;
    std::string album;
    std::string genre;
    int year;
    int track;
    int duration;           // en secondes
    std::string comment;
    std::string albumArtist;
    std::string composer;
};

/**
 * Informations techniques d'un fichier audio
 */
struct AudioTechnicalInfo {
    AudioFormat format;
    AudioCodec codec;
    int sampleRate;         // Hz
    int bitrate;            // kbps
    int channels;
    int bitsPerSample;
    long fileSize;          // octets
    double duration;        // secondes
    bool isVbr;             // Variable Bitrate
    AudioQuality quality;
};

/**
 * Gestionnaire des formats audio
 */
class AudioFormats {
public:
    AudioFormats();
    ~AudioFormats();

    /**
     * Détecte le format d'un fichier par son extension
     */
    static AudioFormat detectFormatFromExtension(const std::string& filePath);

    /**
     * Détecte le format d'un fichier par ses données
     */
    static AudioFormat detectFormatFromData(const std::vector<uint8_t>& data);

    /**
     * Obtient les informations d'un format
     */
    static const AudioFormatInfo* getFormatInfo(AudioFormat format);

    /**
     * Vérifie si un format est supporté
     */
    static bool isFormatSupported(AudioFormat format);

    /**
     * Obtient tous les formats supportés
     */
    static std::vector<AudioFormat> getSupportedFormats();

    /**
     * Obtient les extensions de fichier supportées
     */
    static std::vector<std::string> getSupportedExtensions();

    /**
     * Convertit un format en chaîne
     */
    static std::string formatToString(AudioFormat format);

    /**
     * Convertit une chaîne en format
     */
    static AudioFormat stringToFormat(const std::string& formatStr);

    /**
     * Obtient le codec par défaut pour un format
     */
    static AudioCodec getDefaultCodec(AudioFormat format);

    /**
     * Détermine la qualité audio basée sur le bitrate et le format
     */
    static AudioQuality determineQuality(int bitrate, AudioFormat format);

    /**
     * Vérifie si un format supporte un sample rate donné
     */
    static bool supportsSampleRate(AudioFormat format, int sampleRate);

    /**
     * Vérifie si un format supporte un nombre de canaux donné
     */
    static bool supportsChannels(AudioFormat format, int channels);

    /**
     * Obtient les bitrates recommandés pour un format
     */
    static std::vector<int> getRecommendedBitrates(AudioFormat format);

    /**
     * Vérifie si deux formats sont compatibles pour la conversion
     */
    static bool areFormatsCompatible(AudioFormat source, AudioFormat target);

    /**
     * Obtient le MIME type d'un format
     */
    static std::string getMimeType(AudioFormat format);

    /**
     * Analyse les métadonnées d'un fichier (placeholder)
     */
    static bool extractMetadata(const std::string& filePath, AudioMetadata& metadata);

    /**
     * Analyse les informations techniques d'un fichier (placeholder)
     */
    static bool extractTechnicalInfo(const std::string& filePath, AudioTechnicalInfo& info);

private:
    /**
     * Initialise les informations des formats
     */
    static void initializeFormatInfos();

    /**
     * Map des informations de formats (static)
     */
    static std::unordered_map<AudioFormat, AudioFormatInfo> s_formatInfos;
    static bool s_initialized;
};

} // namespace facebook::react