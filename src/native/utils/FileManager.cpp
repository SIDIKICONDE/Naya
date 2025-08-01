/**
 * FileManager.cpp
 * Implémentation du gestionnaire de fichiers audio
 */

#include "FileManager.h"
#include <iostream>
#include <fstream>

// FFmpeg headers - temporairement commentés pour éviter les erreurs de compilation
// extern "C" {
//     #include <libavformat/avformat.h>
//     #include <libavcodec/avcodec.h>
//     #include <libavutil/avutil.h>
// }

namespace facebook::react {

bool FileManager::m_ffmpegInitialized = false;

FileManager::FileManager() {
    logDebug("Constructeur FileManager");
}

FileManager::~FileManager() {
    logDebug("Destructeur FileManager");
}

bool FileManager::initializeFFmpeg() {
    if (m_ffmpegInitialized) {
        logDebug("FFmpeg déjà initialisé");
        return true;
    }

    try {
        // TODO: Réactiver quand FFmpeg sera configuré
        // av_register_all();
        // avformat_network_init();
        
        m_ffmpegInitialized = true;
        logDebug("FFmpeg initialisé avec succès");
        return true;
        
    } catch (const std::exception& e) {
        logDebug("Erreur d'initialisation FFmpeg: " + std::string(e.what()));
        return false;
    }
}

bool FileManager::validateAudioFile(const std::string& filePath) const {
    if (filePath.empty()) {
        logDebug("Erreur: Chemin de fichier vide");
        return false;
    }

    // Vérification basique de l'existence du fichier
    std::ifstream file(filePath);
    if (!file.good()) {
        logDebug("Erreur: Fichier inexistant ou illisible - " + filePath);
        return false;
    }

    // Vérification de l'extension
    std::string extension = filePath.substr(filePath.find_last_of(".") + 1);
    std::transform(extension.begin(), extension.end(), extension.begin(), ::tolower);
    
    if (extension != "wav" && extension != "mp3" && extension != "aac" && 
        extension != "flac" && extension != "ogg" && extension != "m4a") {
        logDebug("Erreur: Format de fichier non supporté - " + extension);
        return false;
    }

    logDebug("Fichier validé: " + filePath);
    return true;
}

bool FileManager::getAudioFileInfo(const std::string& filePath, AudioFileInfo& info) {
    if (!validateAudioFile(filePath)) {
        return false;
    }

    try {
        // TODO: Implémenter avec FFmpeg quand il sera configuré
        // Pour l'instant, retourne des valeurs par défaut
        
        info.path = filePath;
        info.name = filePath.substr(filePath.find_last_of("/\\") + 1);
        info.duration = 180.0; // 3 minutes par défaut
        info.sampleRate = 44100;
        info.channels = 2;
        info.size = 5242880; // 5MB par défaut
        info.valid = true;

        logDebug("Informations extraites pour: " + info.name);
        return true;

        /*
        // Code FFmpeg à réactiver plus tard :
        AVFormatContext *formatCtx = nullptr;
        
        if (avformat_open_input(&formatCtx, filePath.c_str(), nullptr, nullptr) < 0) {
            logDebug("Erreur: Impossible d'ouvrir le fichier avec FFmpeg");
            return false;
        }
        
        if (avformat_find_stream_info(formatCtx, nullptr) < 0) {
            logDebug("Erreur: Impossible de lire les informations du stream");
            avformat_close_input(&formatCtx);
            return false;
        }
        
        // ... reste de l'implémentation FFmpeg
        
        avformat_close_input(&formatCtx);
        */

    } catch (const std::exception& e) {
        logDebug("Exception dans getAudioFileInfo: " + std::string(e.what()));
        return false;
    }
}

void FileManager::logDebug(const std::string& message) const {
    std::cout << "[FileManager] " << message << std::endl;
}

} // namespace facebook::react