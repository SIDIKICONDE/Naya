#pragma once

#include <string>

namespace naya {

class FFmpegTestModule {
public:
    // Test de base pour vérifier la disponibilité de FFmpeg
    static std::string getFFmpegVersion();
    
    // Test de l'initialisation des codecs
    static bool initializeFFmpeg();
    
    // Liste les formats supportés
    static std::string getSupportedFormats();
    
    // Test d'encodage audio simple
    static bool testAudioEncoding();
    
private:
    static bool isInitialized;
};

} // namespace naya