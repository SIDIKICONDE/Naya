/**
 * FileManager.h
 * Module dédié pour la gestion des fichiers audio
 */

#pragma once

#include <string>
#include "../audio/AudioProcessor.h"

namespace facebook::react {

/**
 * Gestionnaire de fichiers audio avec FFmpeg
 */
class FileManager {
public:
    FileManager();
    ~FileManager();

    /**
     * Initialise FFmpeg (une seule fois)
     */
    bool initializeFFmpeg();

    /**
     * Valide qu'un fichier audio existe et est lisible
     */
    bool validateAudioFile(const std::string& filePath) const;

    /**
     * Lit les informations d'un fichier audio avec FFmpeg
     */
    bool getAudioFileInfo(const std::string& filePath, AudioFileInfo& info);

    /**
     * Vérifie si FFmpeg est initialisé
     */
    bool isFFmpegInitialized() const { return m_ffmpegInitialized; }

private:
    /**
     * Log des messages de debug
     */
    void logDebug(const std::string& message) const;

private:
    static bool m_ffmpegInitialized;
};

} // namespace facebook::react