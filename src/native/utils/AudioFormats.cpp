/**
 * AudioFormats.cpp
 * Implémentation de la gestion des formats audio
 */

#include "AudioFormats.h"
#include <algorithm>
#include <iostream>
#include <fstream>
#include <cctype>

namespace facebook::react {

// Définition des variables statiques
std::unordered_map<AudioFormat, AudioFormatInfo> AudioFormats::s_formatInfos;
bool AudioFormats::s_initialized = false;

AudioFormats::AudioFormats() {
    if (!s_initialized) {
        initializeFormatInfos();
        s_initialized = true;
    }
    std::cout << "[AudioFormats] Constructeur" << std::endl;
}

AudioFormats::~AudioFormats() {
    std::cout << "[AudioFormats] Destructeur" << std::endl;
}

AudioFormat AudioFormats::detectFormatFromExtension(const std::string& filePath) {
    if (filePath.empty()) {
        return AudioFormat::UNKNOWN;
    }
    
    // Extraction de l'extension
    size_t dotPos = filePath.find_last_of('.');
    if (dotPos == std::string::npos) {
        return AudioFormat::UNKNOWN;
    }
    
    std::string extension = filePath.substr(dotPos + 1);
    
    // Conversion en minuscules
    std::transform(extension.begin(), extension.end(), extension.begin(), ::tolower);
    
    // Détection par extension
    if (extension == "wav") return AudioFormat::WAV;
    if (extension == "mp3") return AudioFormat::MP3;
    if (extension == "aac") return AudioFormat::AAC;
    if (extension == "flac") return AudioFormat::FLAC;
    if (extension == "ogg") return AudioFormat::OGG;
    if (extension == "m4a") return AudioFormat::M4A;
    if (extension == "aiff" || extension == "aif") return AudioFormat::AIFF;
    
    return AudioFormat::UNKNOWN;
}

AudioFormat AudioFormats::detectFormatFromData(const std::vector<uint8_t>& data) {
    if (data.size() < 12) {
        return AudioFormat::UNKNOWN;
    }
    
    // Détection par signature de fichier (magic numbers)
    
    // WAV: "RIFF" + 4 bytes + "WAVE"
    if (data.size() >= 12 &&
        data[0] == 'R' && data[1] == 'I' && data[2] == 'F' && data[3] == 'F' &&
        data[8] == 'W' && data[9] == 'A' && data[10] == 'V' && data[11] == 'E') {
        return AudioFormat::WAV;
    }
    
    // MP3: commence par 0xFF 0xFB ou similaire
    if (data[0] == 0xFF && (data[1] & 0xE0) == 0xE0) {
        return AudioFormat::MP3;
    }
    
    // FLAC: "fLaC"
    if (data.size() >= 4 &&
        data[0] == 'f' && data[1] == 'L' && data[2] == 'a' && data[3] == 'C') {
        return AudioFormat::FLAC;
    }
    
    // OGG: "OggS"
    if (data.size() >= 4 &&
        data[0] == 'O' && data[1] == 'g' && data[2] == 'g' && data[3] == 'S') {
        return AudioFormat::OGG;
    }
    
    // M4A/AAC: "ftyp" à l'offset 4
    if (data.size() >= 8 &&
        data[4] == 'f' && data[5] == 't' && data[6] == 'y' && data[7] == 'p') {
        return AudioFormat::M4A;
    }
    
    // AIFF: "FORM" + 4 bytes + "AIFF"
    if (data.size() >= 12 &&
        data[0] == 'F' && data[1] == 'O' && data[2] == 'R' && data[3] == 'M' &&
        data[8] == 'A' && data[9] == 'I' && data[10] == 'F' && data[11] == 'F') {
        return AudioFormat::AIFF;
    }
    
    return AudioFormat::UNKNOWN;
}

const AudioFormatInfo* AudioFormats::getFormatInfo(AudioFormat format) {
    if (!s_initialized) {
        initializeFormatInfos();
        s_initialized = true;
    }
    
    auto it = s_formatInfos.find(format);
    return (it != s_formatInfos.end()) ? &it->second : nullptr;
}

bool AudioFormats::isFormatSupported(AudioFormat format) {
    return getFormatInfo(format) != nullptr;
}

std::vector<AudioFormat> AudioFormats::getSupportedFormats() {
    if (!s_initialized) {
        initializeFormatInfos();
        s_initialized = true;
    }
    
    std::vector<AudioFormat> formats;
    for (const auto& pair : s_formatInfos) {
        formats.push_back(pair.first);
    }
    
    return formats;
}

std::vector<std::string> AudioFormats::getSupportedExtensions() {
    if (!s_initialized) {
        initializeFormatInfos();
        s_initialized = true;
    }
    
    std::vector<std::string> extensions;
    for (const auto& pair : s_formatInfos) {
        extensions.push_back(pair.second.extension);
    }
    
    return extensions;
}

std::string AudioFormats::formatToString(AudioFormat format) {
    switch (format) {
        case AudioFormat::WAV: return "WAV";
        case AudioFormat::MP3: return "MP3";
        case AudioFormat::AAC: return "AAC";
        case AudioFormat::FLAC: return "FLAC";
        case AudioFormat::OGG: return "OGG";
        case AudioFormat::M4A: return "M4A";
        case AudioFormat::AIFF: return "AIFF";
        default: return "UNKNOWN";
    }
}

AudioFormat AudioFormats::stringToFormat(const std::string& formatStr) {
    std::string upperStr = formatStr;
    std::transform(upperStr.begin(), upperStr.end(), upperStr.begin(), ::toupper);
    
    if (upperStr == "WAV") return AudioFormat::WAV;
    if (upperStr == "MP3") return AudioFormat::MP3;
    if (upperStr == "AAC") return AudioFormat::AAC;
    if (upperStr == "FLAC") return AudioFormat::FLAC;
    if (upperStr == "OGG") return AudioFormat::OGG;
    if (upperStr == "M4A") return AudioFormat::M4A;
    if (upperStr == "AIFF") return AudioFormat::AIFF;
    
    return AudioFormat::UNKNOWN;
}

AudioCodec AudioFormats::getDefaultCodec(AudioFormat format) {
    switch (format) {
        case AudioFormat::WAV: return AudioCodec::PCM;
        case AudioFormat::MP3: return AudioCodec::MP3;
        case AudioFormat::AAC: return AudioCodec::AAC;
        case AudioFormat::FLAC: return AudioCodec::FLAC;
        case AudioFormat::OGG: return AudioCodec::VORBIS;
        case AudioFormat::M4A: return AudioCodec::AAC;
        case AudioFormat::AIFF: return AudioCodec::PCM;
        default: return AudioCodec::UNKNOWN;
    }
}

AudioQuality AudioFormats::determineQuality(int bitrate, AudioFormat format) {
    // Pour les formats sans perte
    if (format == AudioFormat::FLAC || format == AudioFormat::WAV || format == AudioFormat::AIFF) {
        return AudioQuality::LOSSLESS;
    }
    
    // Pour les formats avec perte
    if (bitrate <= 128) return AudioQuality::LOW;
    if (bitrate <= 256) return AudioQuality::MEDIUM;
    return AudioQuality::HIGH;
}

bool AudioFormats::supportsSampleRate(AudioFormat format, int sampleRate) {
    const AudioFormatInfo* info = getFormatInfo(format);
    if (!info) return false;
    
    return sampleRate <= info->maxSampleRate;
}

bool AudioFormats::supportsChannels(AudioFormat format, int channels) {
    const AudioFormatInfo* info = getFormatInfo(format);
    if (!info) return false;
    
    return channels <= info->maxChannels;
}

std::vector<int> AudioFormats::getRecommendedBitrates(AudioFormat format) {
    switch (format) {
        case AudioFormat::MP3:
            return {128, 160, 192, 256, 320};
        case AudioFormat::AAC:
        case AudioFormat::M4A:
            return {96, 128, 160, 192, 256};
        case AudioFormat::OGG:
            return {112, 160, 192, 256, 320};
        default:
            return {128, 192, 256, 320};
    }
}

bool AudioFormats::areFormatsCompatible(AudioFormat source, AudioFormat target) {
    // Tous les formats peuvent être convertis vers WAV (PCM)
    if (target == AudioFormat::WAV) return true;
    
    // Les formats sans perte sont compatibles entre eux
    bool sourceLossless = (source == AudioFormat::FLAC || source == AudioFormat::WAV || source == AudioFormat::AIFF);
    bool targetLossless = (target == AudioFormat::FLAC || target == AudioFormat::WAV || target == AudioFormat::AIFF);
    
    if (sourceLossless && targetLossless) return true;
    
    // Conversion générale possible (avec perte éventuelle)
    return true;
}

std::string AudioFormats::getMimeType(AudioFormat format) {
    switch (format) {
        case AudioFormat::WAV: return "audio/wav";
        case AudioFormat::MP3: return "audio/mpeg";
        case AudioFormat::AAC: return "audio/aac";
        case AudioFormat::FLAC: return "audio/flac";
        case AudioFormat::OGG: return "audio/ogg";
        case AudioFormat::M4A: return "audio/mp4";
        case AudioFormat::AIFF: return "audio/aiff";
        default: return "application/octet-stream";
    }
}

bool AudioFormats::extractMetadata(const std::string& filePath, AudioMetadata& metadata) {
    // Placeholder - nécessiterait une bibliothèque de métadonnées comme TagLib
    std::cout << "[AudioFormats] Extraction de métadonnées: " << filePath 
              << " (non implémenté)" << std::endl;
    
    // Valeurs par défaut
    metadata = {
        "Titre Inconnu",    // title
        "Artiste Inconnu",  // artist
        "Album Inconnu",    // album
        "Inconnu",          // genre
        0,                  // year
        0,                  // track
        0,                  // duration
        "",                 // comment
        "",                 // albumArtist
        ""                  // composer
    };
    
    return false;
}

bool AudioFormats::extractTechnicalInfo(const std::string& filePath, AudioTechnicalInfo& info) {
    // Placeholder - nécessiterait FFmpeg ou une bibliothèque similaire
    std::cout << "[AudioFormats] Extraction d'infos techniques: " << filePath 
              << " (non implémenté)" << std::endl;
    
    AudioFormat format = detectFormatFromExtension(filePath);
    
    // Valeurs par défaut
    info = {
        format,             // format
        getDefaultCodec(format), // codec
        44100,              // sampleRate
        192,                // bitrate
        2,                  // channels
        16,                 // bitsPerSample
        0,                  // fileSize
        0.0,                // duration
        false,              // isVbr
        AudioQuality::MEDIUM // quality
    };
    
    return false;
}

void AudioFormats::initializeFormatInfos() {
    // WAV
    s_formatInfos[AudioFormat::WAV] = {
        AudioFormat::WAV, AudioCodec::PCM, "wav", "audio/wav",
        "WAV (Waveform Audio File Format)", true, true, 8, 192000,
        {705, 1411, 2822, 4233}  // bitrates pour différents sample rates
    };
    
    // MP3
    s_formatInfos[AudioFormat::MP3] = {
        AudioFormat::MP3, AudioCodec::MP3, "mp3", "audio/mpeg",
        "MP3 (MPEG-1 Layer 3)", false, true, 2, 48000,
        {128, 160, 192, 256, 320}
    };
    
    // AAC
    s_formatInfos[AudioFormat::AAC] = {
        AudioFormat::AAC, AudioCodec::AAC, "aac", "audio/aac",
        "AAC (Advanced Audio Coding)", false, true, 8, 96000,
        {96, 128, 160, 192, 256}
    };
    
    // FLAC
    s_formatInfos[AudioFormat::FLAC] = {
        AudioFormat::FLAC, AudioCodec::FLAC, "flac", "audio/flac",
        "FLAC (Free Lossless Audio Codec)", true, true, 8, 192000,
        {400, 600, 800, 1000, 1200}  // bitrates approximatifs pour FLAC
    };
    
    // OGG
    s_formatInfos[AudioFormat::OGG] = {
        AudioFormat::OGG, AudioCodec::VORBIS, "ogg", "audio/ogg",
        "OGG Vorbis", false, true, 8, 192000,
        {112, 160, 192, 256, 320}
    };
    
    // M4A
    s_formatInfos[AudioFormat::M4A] = {
        AudioFormat::M4A, AudioCodec::AAC, "m4a", "audio/mp4",
        "M4A (MPEG-4 Audio)", false, true, 8, 96000,
        {96, 128, 160, 192, 256}
    };
    
    // AIFF
    s_formatInfos[AudioFormat::AIFF] = {
        AudioFormat::AIFF, AudioCodec::PCM, "aiff", "audio/aiff",
        "AIFF (Audio Interchange File Format)", true, true, 8, 192000,
        {705, 1411, 2822, 4233}
    };
    
    std::cout << "[AudioFormats] Informations de formats initialisées" << std::endl;
}

} // namespace facebook::react