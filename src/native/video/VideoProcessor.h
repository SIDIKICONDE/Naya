/**
 * VideoProcessor.h
 * Module de traitement vidéo avec audio
 */

#pragma once

#include <string>
#include <vector>
#include <functional>
#include "VideoAudioExtractor.h"

namespace facebook::react {

/**
 * Types d'opérations de traitement vidéo
 */
enum class VideoProcessingOperation {
    AUDIO_REPLACEMENT,      // Remplacement de l'audio
    AUDIO_MIXING,          // Mélange audio
    AUDIO_SYNC_CORRECTION, // Correction de synchronisation
    AUDIO_NORMALIZATION,   // Normalisation audio
    AUDIO_NOISE_REDUCTION, // Réduction de bruit audio
    AUDIO_ENHANCEMENT      // Amélioration audio
};

/**
 * Options de traitement vidéo
 */
struct VideoProcessingOptions {
    VideoProcessingOperation operation;
    std::string newAudioPath;      // Chemin du nouvel audio (pour remplacement)
    double audioVolume;            // Volume de l'audio (0.0 à 2.0)
    double audioOffset;            // Décalage audio en secondes
    bool preserveOriginalAudio;    // Conserver l'audio original
    double mixRatio;               // Ratio de mélange (0.0 = original, 1.0 = nouveau)
    bool normalizeAudio;           // Normaliser l'audio final
    std::string outputFormat;      // Format de sortie vidéo
    std::string outputQuality;     // Qualité de sortie (low, medium, high)
    bool fastMode;                 // Mode rapide (moins de qualité)
};

/**
 * Informations de synchronisation audio/vidéo
 */
struct AudioVideoSyncInfo {
    double videoStartTime;
    double audioStartTime;
    double syncOffset;             // Décalage détecté
    double confidence;             // Confiance de la détection (0.0 à 1.0)
    bool syncRequired;             // Correction nécessaire
    std::string detectionMethod;   // Méthode utilisée pour la détection
};

/**
 * Résultat de traitement vidéo
 */
struct VideoProcessingResult {
    bool success;
    std::string outputPath;
    std::string errorMessage;
    double processedDuration;
    long outputFileSize;
    AudioVideoSyncInfo syncInfo;
    double processingTime;         // Temps de traitement en secondes
};

/**
 * Callback de progression pour le traitement vidéo
 */
using VideoProgressCallback = std::function<void(double progress, const std::string& stage, const std::string& status)>;

/**
 * Processeur vidéo avec capacités audio avancées
 */
class VideoProcessor {
public:
    VideoProcessor();
    ~VideoProcessor();

    /**
     * Initialise le processeur vidéo
     */
    bool initialize();

    /**
     * Remplace l'audio d'une vidéo
     */
    bool replaceAudio(
        const std::string& videoPath,
        const std::string& newAudioPath,
        const std::string& outputPath,
        const VideoProcessingOptions& options,
        VideoProcessingResult& result
    );

    /**
     * Mélange un nouvel audio avec l'audio existant
     */
    bool mixAudio(
        const std::string& videoPath,
        const std::string& mixAudioPath,
        const std::string& outputPath,
        const VideoProcessingOptions& options,
        VideoProcessingResult& result
    );

    /**
     * Corrige la synchronisation audio/vidéo
     */
    bool correctAudioSync(
        const std::string& videoPath,
        const std::string& outputPath,
        VideoProcessingResult& result
    );

    /**
     * Normalise l'audio d'une vidéo
     */
    bool normalizeVideoAudio(
        const std::string& videoPath,
        const std::string& outputPath,
        double targetLevel,
        VideoProcessingResult& result
    );

    /**
     * Applique une réduction de bruit à l'audio de la vidéo
     */
    bool reduceVideoAudioNoise(
        const std::string& videoPath,
        const std::string& outputPath,
        double noiseReductionLevel,
        VideoProcessingResult& result
    );

    /**
     * Améliore l'audio d'une vidéo
     */
    bool enhanceVideoAudio(
        const std::string& videoPath,
        const std::string& outputPath,
        const VideoProcessingOptions& options,
        VideoProcessingResult& result
    );

    /**
     * Traitement avec callback de progression
     */
    bool processVideoWithProgress(
        const std::string& videoPath,
        const std::string& outputPath,
        const VideoProcessingOptions& options,
        VideoProcessingResult& result,
        VideoProgressCallback progressCallback
    );

    /**
     * Détecte les problèmes de synchronisation audio/vidéo
     */
    AudioVideoSyncInfo detectSyncIssues(const std::string& videoPath);

    /**
     * Estime le temps de traitement
     */
    double estimateProcessingTime(
        const std::string& videoPath,
        const VideoProcessingOptions& options
    );

    /**
     * Valide les options de traitement
     */
    bool validateProcessingOptions(const VideoProcessingOptions& options);

    /**
     * Obtient les formats de sortie supportés
     */
    static std::vector<std::string> getSupportedOutputFormats();

    /**
     * Obtient les qualités de sortie supportées
     */
    static std::vector<std::string> getSupportedOutputQualities();

    /**
     * Génère un nom de fichier de sortie automatique
     */
    std::string generateOutputFilename(
        const std::string& videoPath,
        const VideoProcessingOptions& options,
        const std::string& outputDir = ""
    );

    /**
     * Nettoie les fichiers temporaires de traitement
     */
    void cleanupProcessingFiles();

    /**
     * Obtient les informations détaillées d'une vidéo
     */
    bool getDetailedVideoInfo(const std::string& videoPath, VideoInfo& info);

private:
    bool m_initialized;
    std::unique_ptr<VideoAudioExtractor> m_audioExtractor;
    std::vector<std::string> m_temporaryFiles;
    
    /**
     * Initialise FFmpeg pour le traitement vidéo
     */
    bool initializeFFmpegProcessing();
    
    /**
     * Exécute une commande FFmpeg de traitement
     */
    bool executeProcessingCommand(
        const std::string& command,
        VideoProgressCallback progressCallback = nullptr
    );
    
    /**
     * Construit la commande FFmpeg pour le remplacement audio
     */
    std::string buildAudioReplacementCommand(
        const std::string& videoPath,
        const std::string& audioPath,
        const std::string& outputPath,
        const VideoProcessingOptions& options
    );
    
    /**
     * Construit la commande FFmpeg pour le mélange audio
     */
    std::string buildAudioMixingCommand(
        const std::string& videoPath,
        const std::string& mixAudioPath,
        const std::string& outputPath,
        const VideoProcessingOptions& options
    );
    
    /**
     * Construit la commande FFmpeg pour la correction de sync
     */
    std::string buildSyncCorrectionCommand(
        const std::string& videoPath,
        const std::string& outputPath,
        const AudioVideoSyncInfo& syncInfo
    );
    
    /**
     * Analyse la synchronisation audio/vidéo
     */
    AudioVideoSyncInfo analyzeSynchronization(const std::string& videoPath);
    
    /**
     * Applique les filtres audio FFmpeg
     */
    std::string buildAudioFilters(const VideoProcessingOptions& options);
    
    /**
     * Valide la compatibilité des fichiers
     */
    bool validateFileCompatibility(
        const std::string& videoPath,
        const std::string& audioPath
    );
    
    /**
     * Obtient un nom de fichier temporaire pour le traitement
     */
    std::string getTempProcessingFile(const std::string& extension);
    
    /**
     * Parse la progression depuis la sortie FFmpeg
     */
    double parseProgressFromFFmpegOutput(const std::string& output);
    
    /**
     * Log des messages de debug
     */
    void logDebug(const std::string& message) const;
};

} // namespace facebook::react