/**
 * AudioProcessor.h
 * Module dédié pour le traitement audio de base
 */

#pragma once

#include <string>
#include <vector>

namespace facebook::react {

/**
 * Structure pour la configuration audio
 */
struct AudioConfig {
    int sampleRate;
    int channels;
    int bufferSize;
};

/**
 * Structure pour les informations de fichier audio
 */
struct AudioFileInfo {
    std::string path;
    std::string name;
    double duration;
    int sampleRate;
    int channels;
    long size;
    bool valid;
};

/**
 * Classe pour le traitement audio de base
 */
class AudioProcessor {
public:
    AudioProcessor();
    ~AudioProcessor();

    /**
     * Initialise le processeur avec une configuration
     */
    bool initialize(const AudioConfig& config);

    /**
     * Valide la configuration audio
     */
    bool validateConfig(const AudioConfig& config) const;

    /**
     * Obtient la configuration actuelle
     */
    const AudioConfig& getConfig() const { return m_config; }

    /**
     * Vérifie si le processeur est initialisé
     */
    bool isInitialized() const { return m_initialized; }

    /**
     * Nettoie les ressources
     */
    void cleanup();

private:
    bool m_initialized;
    AudioConfig m_config;
};

} // namespace facebook::react