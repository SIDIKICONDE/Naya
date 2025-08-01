#pragma once

/**
 * AudioEqualizer.h
 * Header principal du TurboModule - IMPORTS CENTRAUX UNIQUEMENT
 * Point d'entrée qui importe tous les modules dédiés
 */
// Headers React Native et JSI générés
#include "NayaNativeModulesJSI.h"
#include <ReactCommon/TurboModule.h>
#include <jsi/jsi.h>
#include "NayaNativeModulesJSI.h"
#include <memory>
#include <string>
#include <mutex>

// IMPORTS DES MODULES DÉDIÉS
#include "audio/AudioProcessor.h"
#include "audio/EQEngine.h"
#include "utils/FileManager.h"

// Forward declarations
namespace facebook::react {
    class CallInvoker;
}

namespace facebook::react {

/**
 * AudioEqualizer - Classe principale du TurboModule
 * Orchestrateur qui utilise les modules dédiés
 */
class NativeAudioEqualizer : public facebook::react::NativeAudioEqualizerCxxSpec<NativeAudioEqualizer> {
private:
    // État du système
    bool m_initialized;
    std::string m_currentFilePath;
    std::mutex m_mutex; // Thread safety
    
    // MODULES DÉDIÉS - Composition au lieu d'héritage
    std::unique_ptr<AudioProcessor> m_audioProcessor;
    std::unique_ptr<EQEngine> m_eqEngine;
    std::unique_ptr<FileManager> m_fileManager;
    
    // Informations du fichier audio actuel
    AudioFileInfo m_currentFileInfo;

public:
    /**
     * Constructeur
     */
    NativeAudioEqualizer(std::shared_ptr<CallInvoker> jsInvoker);
    
    /**
     * Destructeur
     */
    ~NativeAudioEqualizer();
    
    // ========================
    // MÉTHODES DU TURBOMODULE
    // ========================
    
    /**
     * Initialise le système audio avec vraie configuration
     */
    jsi::Value initialize(jsi::Runtime &rt, const jsi::Value &config);
    
    /**
     * Charge un VRAI fichier audio
     */
    jsi::Value loadAudioFile(jsi::Runtime &rt, const jsi::Value &filePath);
    
    /**
     * Définit le gain RÉEL d'une bande avec calcul des coefficients
     */
    jsi::Value setBandGain(jsi::Runtime &rt, const jsi::Value &bandIndex, const jsi::Value &gain);
    
    /**
     * Obtient le gain d'une bande
     */
    jsi::Value getBandGain(jsi::Runtime &rt, const jsi::Value &bandIndex);
    
    /**
     * Remet à zéro l'égaliseur (recalcule les coefficients)
     */
    jsi::Value resetEqualizer(jsi::Runtime &rt);
    
    /**
     * Obtient le statut du système réel
     */
    jsi::Value getStatus(jsi::Runtime &rt);
    
    /**
     * Libère les ressources
     */
    jsi::Value cleanup(jsi::Runtime &rt);

private:
    // ========================
    // MÉTHODES UTILITAIRES JSI
    // ========================
    
    /**
     * Crée un objet JSI pour OperationResult
     */
    jsi::Object createOperationResult(jsi::Runtime &rt, bool success, const std::string &message, const std::string &errorCode = "");
    
    /**
     * Crée un objet JSI pour AudioFileInfo
     */
    jsi::Object createAudioFileInfo(jsi::Runtime &rt, const AudioFileInfo &info);
    
    /**
     * Log des messages de debug
     */
    void logDebug(const std::string &message) const;
};

} // namespace facebook::react