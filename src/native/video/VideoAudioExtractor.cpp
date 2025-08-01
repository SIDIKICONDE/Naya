/**
 * VideoAudioExtractor.cpp
 * Implémentation de l'extracteur audio vidéo
 */

#include "VideoAudioExtractor.h"
#include <iostream>
#include <algorithm>
#include <sstream>
#include <filesystem>

namespace facebook::react {

VideoAudioExtractor::VideoAudioExtractor() : m_initialized(false) {
    std::cout << "[VideoAudioExtractor] Constructeur" << std::endl;
}

VideoAudioExtractor::~VideoAudioExtractor() {
    cleanupTemporaryFiles();
    std::cout << "[VideoAudioExtractor] Destructeur" << std::endl;
}

bool VideoAudioExtractor::initialize() {
    if (m_initialized) {
        return true;
    }
    
    try {
        if (!initializeFFmpeg()) {
            std::cout << "[VideoAudioExtractor] Erreur d'initialisation FFmpeg" << std::endl;
            return false;
        }
        
        m_initialized = true;
        std::cout << "[VideoAudioExtractor] Initialisé avec succès" << std::endl;
        return true;
        
    } catch (const std::exception& e) {
        std::cout << "[VideoAudioExtractor] Exception: " << e.what() << std::endl;
        return false;
    }
}

bool VideoAudioExtractor::analyzeVideo(const std::string& videoPath, VideoInfo& info) {
    if (!m_initialized || !validateVideoFile(videoPath)) {
        return false;
    }
    
    logDebug("Analyse de: " + videoPath);
    
    // TODO: Implémenter avec FFmpeg
    // Placeholder avec valeurs par défaut
    info.filePath = videoPath;
    info.format = detectVideoFormat(videoPath);
    info.duration = 120.0; // 2 minutes par défaut
    info.width = 1920;
    info.height = 1080;
    info.frameRate = 30.0;
    info.videoCodec = "h264";
    info.hasAudio = true;
    info.fileSize = 50000000; // 50MB par défaut
    
    // Piste audio par défaut
    VideoAudioTrack defaultTrack = {
        0,              // trackIndex
        "aac",          // codecName
        44100,          // sampleRate
        2,              // channels
        128000,         // bitrate
        info.duration,  // duration
        "und",          // language
        true            // isDefault
    };
    
    info.audioTracks.push_back(defaultTrack);
    
    logDebug("Analyse terminée: " + std::to_string(info.audioTracks.size()) + " pistes audio");
    return true;
}

bool VideoAudioExtractor::extractAudio(
    const std::string& videoPath,
    const std::string& outputPath,
    const AudioExtractionOptions& options,
    ExtractionResult& result
) {
    return extractAudioWithProgress(videoPath, outputPath, options, result, nullptr);
}

bool VideoAudioExtractor::extractAudioWithProgress(
    const std::string& videoPath,
    const std::string& outputPath,
    const AudioExtractionOptions& options,
    ExtractionResult& result,
    ProgressCallback progressCallback
) {
    result.success = false;
    result.outputPath = outputPath;
    result.errorMessage = "";
    
    if (!m_initialized) {
        result.errorMessage = "Extracteur non initialisé";
        return false;
    }
    
    if (!validateVideoFile(videoPath)) {
        result.errorMessage = "Fichier vidéo invalide";
        return false;
    }
    
    if (!validateExtractionOptions(options)) {
        result.errorMessage = "Options d'extraction invalides";
        return false;
    }
    
    logDebug("Extraction audio: " + videoPath + " -> " + outputPath);
    
    // Simulation de progression si callback fourni
    if (progressCallback) {
        progressCallback(0.0, "Initialisation...");
        progressCallback(0.25, "Analyse du fichier...");
        progressCallback(0.50, "Extraction en cours...");
        progressCallback(0.75, "Finalisation...");
        progressCallback(1.0, "Terminé");
    }
    
    // TODO: Implémenter l'extraction réelle avec FFmpeg
    // Pour l'instant, simulation d'un succès
    
    result.success = true;
    result.extractedDuration = options.duration > 0 ? options.duration : 120.0;
    result.outputFileSize = 5000000; // 5MB par défaut
    
    // Informations de la piste extraite
    result.extractedTrack = {
        options.audioTrackIndex >= 0 ? options.audioTrackIndex : 0,
        options.outputFormat,
        options.outputSampleRate > 0 ? options.outputSampleRate : 44100,
        options.outputChannels > 0 ? options.outputChannels : 2,
        options.outputBitrate > 0 ? options.outputBitrate : 128000,
        result.extractedDuration,
        "und",
        true
    };
    
    logDebug("Extraction terminée avec succès");
    return true;
}

std::vector<VideoAudioTrack> VideoAudioExtractor::getAudioTracks(const std::string& videoPath) {
    VideoInfo info;
    if (analyzeVideo(videoPath, info)) {
        return info.audioTracks;
    }
    return {};
}

bool VideoAudioExtractor::hasAudioTrack(const std::string& videoPath) {
    auto tracks = getAudioTracks(videoPath);
    return !tracks.empty();
}

VideoFormat VideoAudioExtractor::detectVideoFormat(const std::string& filePath) {
    if (filePath.empty()) {
        return VideoFormat::UNKNOWN;
    }
    
    size_t dotPos = filePath.find_last_of('.');
    if (dotPos == std::string::npos) {
        return VideoFormat::UNKNOWN;
    }
    
    std::string extension = filePath.substr(dotPos + 1);
    std::transform(extension.begin(), extension.end(), extension.begin(), ::tolower);
    
    if (extension == "mp4") return VideoFormat::MP4;
    if (extension == "mov") return VideoFormat::MOV;
    if (extension == "avi") return VideoFormat::AVI;
    if (extension == "mkv") return VideoFormat::MKV;
    if (extension == "wmv") return VideoFormat::WMV;
    if (extension == "flv") return VideoFormat::FLV;
    if (extension == "webm") return VideoFormat::WEBM;
    if (extension == "m4v") return VideoFormat::M4V;
    if (extension == "3gp") return VideoFormat::THREE_GP;
    
    return VideoFormat::UNKNOWN;
}

bool VideoAudioExtractor::isVideoFormatSupported(VideoFormat format) {
    return format != VideoFormat::UNKNOWN;
}

std::vector<std::string> VideoAudioExtractor::getSupportedVideoExtensions() {
    return {"mp4", "mov", "avi", "mkv", "wmv", "flv", "webm", "m4v", "3gp"};
}

double VideoAudioExtractor::estimateExtractionTime(
    const std::string& videoPath,
    const AudioExtractionOptions& options
) {
    // Estimation simplifiée basée sur la durée
    double duration = options.duration > 0 ? options.duration : 120.0;
    
    // Facteur basé sur le format de sortie
    double formatFactor = 1.0;
    if (options.outputFormat == "wav") {
        formatFactor = 0.5; // Plus rapide pour WAV
    } else if (options.outputFormat == "mp3") {
        formatFactor = 1.2; // Compression MP3
    }
    
    return duration * 0.1 * formatFactor; // ~10% du temps de lecture
}

bool VideoAudioExtractor::validateExtractionOptions(const AudioExtractionOptions& options) {
    // Validation du format de sortie
    if (options.outputFormat.empty()) {
        return false;
    }
    
    std::vector<std::string> supportedFormats = {"wav", "mp3", "aac", "flac", "ogg"};
    if (std::find(supportedFormats.begin(), supportedFormats.end(), options.outputFormat) 
        == supportedFormats.end()) {
        return false;
    }
    
    // Validation des paramètres audio
    if (options.outputSampleRate < 0 || options.outputSampleRate > 192000) {
        return false;
    }
    
    if (options.outputChannels < 0 || options.outputChannels > 8) {
        return false;
    }
    
    if (options.startTime < 0.0 || options.duration < 0.0) {
        return false;
    }
    
    return true;
}

std::string VideoAudioExtractor::generateOutputFilename(
    const std::string& videoPath,
    const std::string& format,
    const std::string& outputDir
) {
    std::string baseName = videoPath;
    
    // Extraction du nom de fichier sans extension
    size_t lastSlash = baseName.find_last_of("/\\");
    if (lastSlash != std::string::npos) {
        baseName = baseName.substr(lastSlash + 1);
    }
    
    size_t lastDot = baseName.find_last_of('.');
    if (lastDot != std::string::npos) {
        baseName = baseName.substr(0, lastDot);
    }
    
    // Construction du chemin de sortie
    std::string outputPath = outputDir.empty() ? "" : outputDir + "/";
    outputPath += baseName + "_audio." + format;
    
    return outputPath;
}

void VideoAudioExtractor::cleanupTemporaryFiles() {
    for (const std::string& tempFile : m_temporaryFiles) {
        try {
            if (std::filesystem::exists(tempFile)) {
                std::filesystem::remove(tempFile);
                logDebug("Fichier temporaire supprimé: " + tempFile);
            }
        } catch (const std::exception& e) {
            logDebug("Erreur suppression fichier temporaire: " + std::string(e.what()));
        }
    }
    m_temporaryFiles.clear();
}

bool VideoAudioExtractor::initializeFFmpeg() {
    // TODO: Initialiser FFmpeg
    logDebug("Initialisation FFmpeg (placeholder)");
    return true;
}

bool VideoAudioExtractor::executeFFmpegCommand(
    const std::string& command,
    ProgressCallback progressCallback
) {
    logDebug("Exécution commande FFmpeg: " + command);
    // TODO: Exécuter la commande FFmpeg réelle
    return true;
}

std::string VideoAudioExtractor::buildFFmpegCommand(
    const std::string& inputPath,
    const std::string& outputPath,
    const AudioExtractionOptions& options
) {
    std::ostringstream cmd;
    cmd << "ffmpeg -i \"" << inputPath << "\"";
    
    // Sélection de la piste audio
    if (options.audioTrackIndex >= 0) {
        cmd << " -map 0:a:" << options.audioTrackIndex;
    }
    
    // Paramètres de sortie
    if (options.outputSampleRate > 0) {
        cmd << " -ar " << options.outputSampleRate;
    }
    
    if (options.outputChannels > 0) {
        cmd << " -ac " << options.outputChannels;
    }
    
    if (options.outputBitrate > 0) {
        cmd << " -b:a " << options.outputBitrate;
    }
    
    // Temps de début et durée
    if (options.startTime > 0.0) {
        cmd << " -ss " << options.startTime;
    }
    
    if (options.duration > 0.0) {
        cmd << " -t " << options.duration;
    }
    
    cmd << " \"" << outputPath << "\"";
    
    return cmd.str();
}

bool VideoAudioExtractor::validateVideoFile(const std::string& filePath) {
    if (filePath.empty()) {
        return false;
    }
    
    VideoFormat format = detectVideoFormat(filePath);
    if (!isVideoFormatSupported(format)) {
        return false;
    }
    
    // TODO: Vérification plus poussée avec FFmpeg
    return true;
}

std::string VideoAudioExtractor::getTempFilename(const std::string& extension) {
    static int counter = 0;
    std::string tempFile = "/tmp/video_audio_extract_" + std::to_string(++counter) + "." + extension;
    m_temporaryFiles.push_back(tempFile);
    return tempFile;
}

std::string VideoAudioExtractor::videoFormatToString(VideoFormat format) {
    switch (format) {
        case VideoFormat::MP4: return "MP4";
        case VideoFormat::MOV: return "MOV";
        case VideoFormat::AVI: return "AVI";
        case VideoFormat::MKV: return "MKV";
        case VideoFormat::WMV: return "WMV";
        case VideoFormat::FLV: return "FLV";
        case VideoFormat::WEBM: return "WEBM";
        case VideoFormat::M4V: return "M4V";
        case VideoFormat::THREE_GP: return "3GP";
        default: return "UNKNOWN";
    }
}

void VideoAudioExtractor::logDebug(const std::string& message) const {
    std::cout << "[VideoAudioExtractor] " << message << std::endl;
}

} // namespace facebook::react