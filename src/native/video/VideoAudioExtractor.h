/**
 * VideoAudioExtractor.h
 * Module d'extraction audio depuis des fichiers vidéo
 */

#pragma once

#include <string>
#include <vector>
#include <functional>

namespace facebook::react {

/**
 * Formats vidéo supportés
 */
enum class VideoFormat {
    MP4,            // MPEG-4
    MOV,            // QuickTime
    AVI,            // Audio Video Interleave
    MKV,            // Matroska
    WMV,            // Windows Media Video
    FLV,            // Flash Video
    WEBM,           // WebM
    M4V,            // iTunes Video
    THREE_GP,       // 3GP
    UNKNOWN
};

/**
 * Informations d'une piste audio dans une vidéo
 */
struct VideoAudioTrack {
    int trackIndex;
    std::string codecName;
    int sampleRate;
    int channels;
    int bitrate;
    double duration;
    std::string language;
    bool isDefault;
};

/**
 * Informations vidéo avec pistes audio
 */
struct VideoInfo {
    std::string filePath;
    VideoFormat format;
    double duration;
    int width;
    int height;
    double frameRate;
    std::string videoCodec;
    std::vector<VideoAudioTrack> audioTracks;
    bool hasAudio;
    long fileSize;
};

/**
 * Options d'extraction audio
 */
struct AudioExtractionOptions {
    int audioTrackIndex;        // Index de la piste audio (-1 = défaut)
    std::string outputFormat;   // Format de sortie (wav, mp3, aac, etc.)
    int outputSampleRate;       // Sample rate de sortie (0 = original)
    int outputChannels;         // Nombre de canaux (0 = original)
    int outputBitrate;          // Bitrate de sortie (0 = original)
    double startTime;           // Temps de début en secondes
    double duration;            // Durée d'extraction (0 = jusqu'à la fin)
    bool normalize;             // Normaliser l'audio extrait
    std::string tempDirectory;  // Répertoire temporaire
};

/**
 * Résultat d'extraction
 */
struct ExtractionResult {
    bool success;
    std::string outputPath;
    std::string errorMessage;
    double extractedDuration;
    long outputFileSize;
    VideoAudioTrack extractedTrack;
};

/**
 * Callback de progression
 */
using ProgressCallback = std::function<void(double progress, const std::string& status)>;

/**
 * Extracteur audio pour fichiers vidéo
 */
class VideoAudioExtractor {
public:
    VideoAudioExtractor();
    ~VideoAudioExtractor();

    /**
     * Initialise l'extracteur
     */
    bool initialize();

    /**
     * Analyse un fichier vidéo pour obtenir ses informations
     */
    bool analyzeVideo(const std::string& videoPath, VideoInfo& info);

    /**
     * Extrait l'audio d'une vidéo
     */
    bool extractAudio(
        const std::string& videoPath,
        const std::string& outputPath,
        const AudioExtractionOptions& options,
        ExtractionResult& result
    );

    /**
     * Extrait l'audio avec callback de progression
     */
    bool extractAudioWithProgress(
        const std::string& videoPath,
        const std::string& outputPath,
        const AudioExtractionOptions& options,
        ExtractionResult& result,
        ProgressCallback progressCallback
    );

    /**
     * Obtient les pistes audio disponibles
     */
    std::vector<VideoAudioTrack> getAudioTracks(const std::string& videoPath);

    /**
     * Vérifie si un fichier vidéo a de l'audio
     */
    bool hasAudioTrack(const std::string& videoPath);

    /**
     * Détecte le format vidéo d'un fichier
     */
    static VideoFormat detectVideoFormat(const std::string& filePath);

    /**
     * Vérifie si un format vidéo est supporté
     */
    static bool isVideoFormatSupported(VideoFormat format);

    /**
     * Obtient les extensions de fichier vidéo supportées
     */
    static std::vector<std::string> getSupportedVideoExtensions();

    /**
     * Estime la durée d'extraction
     */
    double estimateExtractionTime(
        const std::string& videoPath,
        const AudioExtractionOptions& options
    );

    /**
     * Valide les options d'extraction
     */
    bool validateExtractionOptions(const AudioExtractionOptions& options);

    /**
     * Génère un nom de fichier de sortie automatique
     */
    std::string generateOutputFilename(
        const std::string& videoPath,
        const std::string& format,
        const std::string& outputDir = ""
    );

    /**
     * Nettoie les fichiers temporaires
     */
    void cleanupTemporaryFiles();

private:
    bool m_initialized;
    std::vector<std::string> m_temporaryFiles;
    
    /**
     * Initialise FFmpeg pour l'extraction vidéo
     */
    bool initializeFFmpeg();
    
    /**
     * Exécute une commande FFmpeg
     */
    bool executeFFmpegCommand(
        const std::string& command,
        ProgressCallback progressCallback = nullptr
    );
    
    /**
     * Construit la commande FFmpeg pour l'extraction
     */
    std::string buildFFmpegCommand(
        const std::string& inputPath,
        const std::string& outputPath,
        const AudioExtractionOptions& options
    );
    
    /**
     * Parse les informations vidéo depuis la sortie FFmpeg
     */
    bool parseVideoInfo(const std::string& ffmpegOutput, VideoInfo& info);
    
    /**
     * Parse les pistes audio depuis la sortie FFmpeg
     */
    std::vector<VideoAudioTrack> parseAudioTracks(const std::string& ffmpegOutput);
    
    /**
     * Valide un fichier vidéo
     */
    bool validateVideoFile(const std::string& filePath);
    
    /**
     * Obtient un nom de fichier temporaire unique
     */
    std::string getTempFilename(const std::string& extension);
    
    /**
     * Convertit un format vidéo en chaîne
     */
    static std::string videoFormatToString(VideoFormat format);
    
    /**
     * Log des messages de debug
     */
    void logDebug(const std::string& message) const;
};

} // namespace facebook::react