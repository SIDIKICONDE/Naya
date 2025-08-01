/**
 * NativeAudioEqualizer.cpp
 * Implémentation principale - ORCHESTRATEUR des modules existants
 * Utilise les modules déjà créés : AudioProcessor, EQEngine, FileManager
 */

#include "NativeAudioEqualizer.h"
#include <iostream>

namespace facebook::react {

NativeAudioEqualizer::NativeAudioEqualizer(std::shared_ptr<CallInvoker> jsInvoker) 
    : TurboModule("NativeAudioEqualizer", jsInvoker), m_initialized(false) {
    
    logDebug("NativeAudioEqualizer: Constructeur - Utilisation des modules existants");
    
    // UTILISATION DES MODULES EXISTANTS
    m_audioProcessor = std::make_unique<AudioProcessor>();
    m_eqEngine = std::make_unique<EQEngine>();
    m_fileManager = std::make_unique<FileManager>();
    
    // Initialisation via les modules existants
    m_fileManager->initializeFFmpeg();
    
    logDebug("NativeAudioEqualizer: Modules existants connectés");
}

NativeAudioEqualizer::~NativeAudioEqualizer() {
    logDebug("NativeAudioEqualizer: Destructeur");
}

jsi::Value NativeAudioEqualizer::initialize(jsi::Runtime &rt, const jsi::Value &config) {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    try {
        logDebug("initialize() - Délégation aux modules existants");
        
        // Parse config JS
        AudioConfig audioConfig = {44100, 2, 1024};
        
        if (config.isObject()) {
            auto configObj = config.asObject(rt);
            
            if (configObj.hasProperty(rt, "sampleRate")) {
                audioConfig.sampleRate = (int)configObj.getProperty(rt, "sampleRate").asNumber();
            }
            if (configObj.hasProperty(rt, "channels")) {
                audioConfig.channels = (int)configObj.getProperty(rt, "channels").asNumber();
            }
            if (configObj.hasProperty(rt, "bufferSize")) {
                audioConfig.bufferSize = (int)configObj.getProperty(rt, "bufferSize").asNumber();
            }
        }
        
        // DÉLÉGATION aux modules existants
        if (!m_audioProcessor->initialize(audioConfig)) {
            return createOperationResult(rt, false, "Erreur AudioProcessor", "AUDIO_PROCESSOR_ERROR");
        }
        
        if (!m_eqEngine->initialize(audioConfig.sampleRate)) {
            return createOperationResult(rt, false, "Erreur EQEngine", "EQ_ENGINE_ERROR");
        }
        
        m_initialized = true;
        
        std::string message = "Initialisé: " + std::to_string(audioConfig.sampleRate) + "Hz";
        return createOperationResult(rt, true, message);
        
    } catch (const std::exception &e) {
        return createOperationResult(rt, false, "Erreur: " + std::string(e.what()), "INIT_ERROR");
    }
}

jsi::Value AudioEqualizer::loadAudioFile(jsi::Runtime &rt, const jsi::Value &filePath) {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    try {
        if (!filePath.isString()) {
            return createAudioFileInfo(rt, {"", "", 0, 0, 0, 0, false});
        }
        
        std::string path = filePath.asString(rt).utf8(rt);
        logDebug("loadAudioFile() - Délégation à FileManager: " + path);
        
        // DÉLÉGATION au module FileManager existant
        if (m_fileManager->getAudioFileInfo(path, m_currentFileInfo)) {
            m_currentFilePath = path;
            return createAudioFileInfo(rt, m_currentFileInfo);
        } else {
            return createAudioFileInfo(rt, {"", "", 0, 0, 0, 0, false});
        }
        
    } catch (const std::exception &e) {
        logDebug("Erreur loadAudioFile: " + std::string(e.what()));
        return createAudioFileInfo(rt, {"", "", 0, 0, 0, 0, false});
    }
}

jsi::Value AudioEqualizer::setBandGain(jsi::Runtime &rt, const jsi::Value &bandIndex, const jsi::Value &gain) {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    try {
        if (!bandIndex.isNumber() || !gain.isNumber()) {
            return createOperationResult(rt, false, "Paramètres invalides", "INVALID_PARAMS");
        }
        
        int index = (int)bandIndex.asNumber();
        double gainValue = gain.asNumber();
        
        logDebug("setBandGain() - Délégation à EQEngine: bande " + std::to_string(index));
        
        // DÉLÉGATION au module EQEngine existant
        if (m_eqEngine->setBandGain(index, gainValue)) {
            return createOperationResult(rt, true, "Gain modifié");
        } else {
            return createOperationResult(rt, false, "Erreur modification gain", "SET_GAIN_ERROR");
        }
        
    } catch (const std::exception &e) {
        return createOperationResult(rt, false, "Erreur: " + std::string(e.what()), "SET_GAIN_ERROR");
    }
}

jsi::Value AudioEqualizer::getBandGain(jsi::Runtime &rt, const jsi::Value &bandIndex) {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    if (!bandIndex.isNumber()) {
        return jsi::Value(0.0);
    }
    
    int index = (int)bandIndex.asNumber();
    
    // DÉLÉGATION au module EQEngine existant
    double gain = m_eqEngine->getBandGain(index);
    return jsi::Value(gain);
}

jsi::Value AudioEqualizer::resetEqualizer(jsi::Runtime &rt) {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    try {
        logDebug("resetEqualizer() - Délégation à EQEngine");
        
        // DÉLÉGATION au module EQEngine existant
        m_eqEngine->reset();
        
        return createOperationResult(rt, true, "Égaliseur remis à zéro");
        
    } catch (const std::exception &e) {
        return createOperationResult(rt, false, "Erreur reset: " + std::string(e.what()), "RESET_ERROR");
    }
}

jsi::Value AudioEqualizer::getStatus(jsi::Runtime &rt) {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    auto status = jsi::Object(rt);
    status.setProperty(rt, "initialized", jsi::Value(m_initialized));
    status.setProperty(rt, "currentFile", jsi::String::createFromUtf8(rt, m_currentFileInfo.name));
    status.setProperty(rt, "bandsCount", jsi::Value(EQEngine::EQ_BANDS_COUNT));
    
    return status;
}

jsi::Value AudioEqualizer::cleanup(jsi::Runtime &rt) {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    try {
        logDebug("cleanup() - Nettoyage des modules existants");
        
        m_initialized = false;
        m_currentFilePath.clear();
        m_currentFileInfo = {"", "", 0, 0, 0, 0, false};
        
        // DÉLÉGATION au nettoyage des modules existants
        if (m_audioProcessor) {
            m_audioProcessor->cleanup();
        }
        if (m_eqEngine) {
            m_eqEngine->reset();
        }
        
        return createOperationResult(rt, true, "Ressources libérées");
        
    } catch (const std::exception &e) {
        return createOperationResult(rt, false, "Erreur cleanup: " + std::string(e.what()), "CLEANUP_ERROR");
    }
}

// ========================
// UTILITAIRES JSI - Simples helpers
// ========================

jsi::Object AudioEqualizer::createOperationResult(jsi::Runtime &rt, bool success, 
                                                  const std::string &message, 
                                                  const std::string &errorCode) {
    auto result = jsi::Object(rt);
    result.setProperty(rt, "success", jsi::Value(success));
    result.setProperty(rt, "message", jsi::String::createFromUtf8(rt, message));
    if (!errorCode.empty()) {
        result.setProperty(rt, "errorCode", jsi::String::createFromUtf8(rt, errorCode));
    }
    return result;
}

jsi::Object AudioEqualizer::createAudioFileInfo(jsi::Runtime &rt, const AudioFileInfo &info) {
    auto fileInfo = jsi::Object(rt);
    fileInfo.setProperty(rt, "path", jsi::String::createFromUtf8(rt, info.path));
    fileInfo.setProperty(rt, "name", jsi::String::createFromUtf8(rt, info.name));
    fileInfo.setProperty(rt, "duration", jsi::Value(info.duration));
    fileInfo.setProperty(rt, "sampleRate", jsi::Value(info.sampleRate));
    fileInfo.setProperty(rt, "channels", jsi::Value(info.channels));
    fileInfo.setProperty(rt, "size", jsi::Value((double)info.size));
    return fileInfo;
}

void NativeAudioEqualizer::logDebug(const std::string &message) const {
    std::cout << "[NativeAudioEqualizer] " << message << std::endl;
}

} // namespace facebook::react