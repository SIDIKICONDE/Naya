#include "AudioEncoders.h"
#include <algorithm>
#include <cstring>
#include <filesystem>

namespace audio {

// ========================================
// FONCTIONS UTILITAIRES COMMUNES
// ========================================

std::string AudioEncoderInterface::GetFileExtension(AudioFormat format) {
    switch (format) {
        case AudioFormat::WAV:  return "wav";
        case AudioFormat::FLAC: return "flac";
        case AudioFormat::OGG:  return "ogg";
        case AudioFormat::AAC:  return "m4a";
        case AudioFormat::MP3:  return "mp3";
        case AudioFormat::OPUS: return "opus";
        default: return "wav";
    }
}

std::string AudioEncoderInterface::GetFormatName(AudioFormat format) {
    switch (format) {
        case AudioFormat::WAV:  return "WAV PCM";
        case AudioFormat::FLAC: return "FLAC Lossless";
        case AudioFormat::OGG:  return "Ogg Vorbis";
        case AudioFormat::AAC:  return "AAC (Advanced Audio Coding)";
        case AudioFormat::MP3:  return "MP3 (MPEG-1 Audio Layer III)";
        case AudioFormat::OPUS: return "Opus";
        default: return "Unknown";
    }
}

size_t AudioEncoderInterface::EstimateFileSize(const AudioConfig& audio_config,
                                              const EncoderConfig& encoder_config,
                                              double duration_seconds) {
    switch (encoder_config.format) {
        case AudioFormat::WAV: {
            // PCM non compressé
            size_t bytes_per_sample = audio_config.bit_depth / 8;
            size_t bytes_per_second = audio_config.sample_rate * audio_config.channels * bytes_per_sample;
            return static_cast<size_t>(bytes_per_second * duration_seconds) + 44; // +header
        }
        
        case AudioFormat::FLAC: {
            // FLAC: ~50-70% de la taille PCM selon le contenu
            EncoderConfig wav_encoder_config = {
                .format = AudioFormat::WAV, 
                .quality = AudioQuality::EXTREME, 
                .use_variable_bitrate = false, 
                .compression_level = 0, 
                .write_metadata = false
            };
            size_t wav_size = EstimateFileSize(audio_config, wav_encoder_config, duration_seconds);
            return static_cast<size_t>(wav_size * 0.6); // 60% en moyenne
        }
        
        case AudioFormat::OGG:
        case AudioFormat::AAC: {
            // Codecs avec perte: basé sur le bitrate
            int bitrate = format_utils::QualityToBitrate(encoder_config.quality, encoder_config.format);
            return static_cast<size_t>((bitrate * 1000 / 8) * duration_seconds); // bitrate en bits/s -> bytes
        }
        
        default:
            EncoderConfig wav_encoder_config = {
                .format = AudioFormat::WAV, 
                .quality = AudioQuality::EXTREME, 
                .use_variable_bitrate = false, 
                .compression_level = 0, 
                .write_metadata = false
            };
            return EstimateFileSize(audio_config, wav_encoder_config, duration_seconds);
    }
}

// ========================================
// WAV ENCODER IMPLEMENTATION
// ========================================

WAVEncoder::WAVEncoder() {
    start_time_ = std::chrono::steady_clock::now();
}

WAVEncoder::~WAVEncoder() {
    if (is_encoding_) {
        CancelEncoding();
    }
}

bool WAVEncoder::Initialize(const AudioConfig& audio_config,
                           const EncoderConfig& encoder_config,
                           const std::string& output_path) {
    if (is_encoding_) {
        return false;
    }
    
    if (encoder_config.format != AudioFormat::WAV) {
        if (error_callback_) {
            error_callback_("Format non supporté par WAVEncoder: " + GetFormatName(encoder_config.format));
        }
        return false;
    }
    
    audio_config_ = audio_config;
    encoder_config_ = encoder_config;
    output_path_ = output_path;
    
    return true;
}

bool WAVEncoder::StartEncoding() {
    if (is_encoding_ || output_path_.empty()) {
        return false;
    }
    
    try {
        // Créer le fichier avec RAII
        file_guard_ = std::make_unique<AudioFileGuard>(output_path_, "wb");
        
        // Écrire l'en-tête WAV initial
        WriteHeader();
        
        // Écrire les métadonnées si demandées
        if (encoder_config_.write_metadata) {
            WriteMetadata();
        }
        
        is_encoding_ = true;
        total_frames_encoded_ = 0;
        data_bytes_written_ = 0;
        start_time_ = std::chrono::steady_clock::now();
        
        return true;
        
    } catch (const std::exception& e) {
        if (error_callback_) {
            error_callback_("Erreur lors du démarrage de l'encodage: " + std::string(e.what()));
        }
        return false;
    }
}

bool WAVEncoder::EncodeAudio(const float* data, size_t frames) {
    if (!is_encoding_ || !file_guard_) {
        return false;
    }
    
    try {
        // Convertir float32 vers int16
        size_t samples = frames * audio_config_.channels;
        auto int16_data = ConvertToInt16(data, samples);
        
        // Écrire les données
        size_t bytes_to_write = int16_data.size() * sizeof(int16_t);
        size_t written = file_guard_->write(int16_data.data(), bytes_to_write);
        
        if (written != bytes_to_write) {
            if (error_callback_) {
                error_callback_("Erreur d'écriture des données audio");
            }
            return false;
        }
        
        data_bytes_written_ += written;
        total_frames_encoded_ += frames;
        
        // Callback de progression
        if (progress_callback_) {
            float progress = 0.0f; // On ne peut pas calculer sans durée totale
            progress_callback_(progress, data_bytes_written_);
        }
        
        return true;
        
    } catch (const std::exception& e) {
        if (error_callback_) {
            error_callback_("Erreur lors de l'encodage: " + std::string(e.what()));
        }
        return false;
    }
}

std::string WAVEncoder::FinishEncoding() {
    if (!is_encoding_) {
        return "";
    }
    
    try {
        // Mettre à jour l'en-tête avec les tailles finales
        UpdateHeader();
        
        // Forcer l'écriture sur disque
        file_guard_->flush();
        
        is_encoding_ = false;
        
        return output_path_;
        
    } catch (const std::exception& e) {
        if (error_callback_) {
            error_callback_("Erreur lors de la finalisation: " + std::string(e.what()));
        }
        return "";
    }
}

void WAVEncoder::CancelEncoding() {
    if (is_encoding_) {
        is_encoding_ = false;
        file_guard_.reset();
        
        // Supprimer le fichier partiel
        try {
            std::filesystem::remove(output_path_);
        } catch (...) {
            // Ignorer les erreurs de suppression
        }
    }
}

bool WAVEncoder::IsEncoding() const {
    return is_encoding_;
}

AudioEncoderInterface::EncodingStats WAVEncoder::GetStats() const {
    EncodingStats stats;
    stats.total_frames_encoded = total_frames_encoded_;
    stats.output_file_size = data_bytes_written_ + 44; // +header
    stats.output_format = AudioFormat::WAV;
    
    if (total_frames_encoded_ > 0) {
        // Calcul du ratio de compression (WAV = 1.0)
        stats.compression_ratio = 1.0f;
        
        // Durée d'encodage
        auto now = std::chrono::steady_clock::now();
        auto duration = std::chrono::duration<double>(now - start_time_);
        stats.encoding_duration = duration.count();
    }
    
    return stats;
}

void WAVEncoder::SetProgressCallback(ProgressCallback callback) {
    progress_callback_ = callback;
}

void WAVEncoder::SetErrorCallback(ErrorCallback callback) {
    error_callback_ = callback;
}

EncoderConfig WAVEncoder::GetCurrentConfig() const {
    return encoder_config_;
}

bool WAVEncoder::SupportsFormat(AudioFormat format) const {
    return format == AudioFormat::WAV;
}

// Méthodes privées WAVEncoder

void WAVEncoder::WriteHeader() {
    WAVHeader header;
    header.num_channels = audio_config_.channels;
    header.sample_rate = audio_config_.sample_rate;
    header.bits_per_sample = 16; // Force 16-bit pour compatibilité
    
    // Calculer les champs dérivés
    header.byte_rate = header.sample_rate * header.num_channels * (header.bits_per_sample / 8);
    header.block_align = header.num_channels * (header.bits_per_sample / 8);
    
    // Écrire l'en-tête (tailles seront mises à jour plus tard)
    file_guard_->write(&header, sizeof(WAVHeader));
}

void WAVEncoder::UpdateHeader() {
    // Retourner au début du fichier
    file_guard_->seek(0, SEEK_SET);
    
    WAVHeader header;
    header.num_channels = audio_config_.channels;
    header.sample_rate = audio_config_.sample_rate;
    header.bits_per_sample = 16;
    header.byte_rate = header.sample_rate * header.num_channels * (header.bits_per_sample / 8);
    header.block_align = header.num_channels * (header.bits_per_sample / 8);
    
    // Mettre à jour avec les tailles réelles
    header.data_size = static_cast<uint32_t>(data_bytes_written_);
    header.chunk_size = static_cast<uint32_t>(data_bytes_written_ + sizeof(WAVHeader) - 8);
    
    file_guard_->write(&header, sizeof(WAVHeader));
}

void WAVEncoder::WriteMetadata() {
    // TODO: Implémenter l'écriture des chunks de métadonnées WAV
    // LIST/INFO chunks pour titre, artiste, etc.
}

std::vector<int16_t> WAVEncoder::ConvertToInt16(const float* data, size_t samples) {
    std::vector<int16_t> result;
    result.reserve(samples);
    
    for (size_t i = 0; i < samples; ++i) {
        // Limiter et convertir
        float clamped = std::clamp(data[i], -1.0f, 1.0f);
        int16_t sample = static_cast<int16_t>(clamped * 32767.0f);
        result.push_back(sample);
    }
    
    return result;
}

// ========================================
// STUBS POUR LES AUTRES ENCODEURS
// ========================================

// FLAC Encoder Stub
FLACEncoder::FLACEncoder() = default;
FLACEncoder::~FLACEncoder() = default;

bool FLACEncoder::Initialize(const AudioConfig&, const EncoderConfig& /*config*/, const std::string&) {
    if (error_callback_) {
        error_callback_("FLAC encoder non encore implémenté. TODO: Intégrer libFLAC");
    }
    return false;
}

bool FLACEncoder::StartEncoding() { return false; }
bool FLACEncoder::EncodeAudio(const float*, size_t) { return false; }
std::string FLACEncoder::FinishEncoding() { return ""; }
void FLACEncoder::CancelEncoding() {}
bool FLACEncoder::IsEncoding() const { return false; }
AudioEncoderInterface::EncodingStats FLACEncoder::GetStats() const { return {}; }
void FLACEncoder::SetProgressCallback(ProgressCallback callback) { progress_callback_ = callback; }
void FLACEncoder::SetErrorCallback(ErrorCallback callback) { error_callback_ = callback; }
EncoderConfig FLACEncoder::GetCurrentConfig() const { return encoder_config_; }
bool FLACEncoder::SupportsFormat(AudioFormat /*format*/) const { return false; } // Pas encore implémenté

// OGG Encoder Stub
OGGEncoder::OGGEncoder() = default;
OGGEncoder::~OGGEncoder() = default;

bool OGGEncoder::Initialize(const AudioConfig&, const EncoderConfig&, const std::string&) {
    if (error_callback_) {
        error_callback_("OGG encoder non encore implémenté. TODO: Intégrer libvorbis");
    }
    return false;
}

bool OGGEncoder::StartEncoding() { return false; }
bool OGGEncoder::EncodeAudio(const float*, size_t) { return false; }
std::string OGGEncoder::FinishEncoding() { return ""; }
void OGGEncoder::CancelEncoding() {}
bool OGGEncoder::IsEncoding() const { return false; }
AudioEncoderInterface::EncodingStats OGGEncoder::GetStats() const { return {}; }
void OGGEncoder::SetProgressCallback(ProgressCallback callback) { progress_callback_ = callback; }
void OGGEncoder::SetErrorCallback(ErrorCallback callback) { error_callback_ = callback; }
EncoderConfig OGGEncoder::GetCurrentConfig() const { return encoder_config_; }
bool OGGEncoder::SupportsFormat(AudioFormat /*format*/) const { return false; }

// AAC Encoder Stub
AACEncoder::AACEncoder() = default;
AACEncoder::~AACEncoder() = default;

bool AACEncoder::Initialize(const AudioConfig&, const EncoderConfig&, const std::string&) {
    if (error_callback_) {
        error_callback_("AAC encoder non encore implémenté. TODO: Intégrer libfdk-aac");
    }
    return false;
}

bool AACEncoder::StartEncoding() { return false; }
bool AACEncoder::EncodeAudio(const float*, size_t) { return false; }
std::string AACEncoder::FinishEncoding() { return ""; }
void AACEncoder::CancelEncoding() {}
bool AACEncoder::IsEncoding() const { return false; }
AudioEncoderInterface::EncodingStats AACEncoder::GetStats() const { return {}; }
void AACEncoder::SetProgressCallback(ProgressCallback callback) { progress_callback_ = callback; }
void AACEncoder::SetErrorCallback(ErrorCallback callback) { error_callback_ = callback; }
EncoderConfig AACEncoder::GetCurrentConfig() const { return encoder_config_; }
bool AACEncoder::SupportsFormat(AudioFormat /*format*/) const { return false; }

// ========================================
// UNIVERSAL ENCODER IMPLEMENTATION
// ========================================

UniversalEncoder::UniversalEncoder(AudioFormat preferred_format)
    : preferred_format_(preferred_format) {}

bool UniversalEncoder::Initialize(const AudioConfig& audio_config,
                                 const EncoderConfig& encoder_config,
                                 const std::string& output_path) {
    // Créer l'encodeur approprié
    current_encoder_ = CreateEncoderForFormat(encoder_config.format);
    
    if (current_encoder_ && current_encoder_->Initialize(audio_config, encoder_config, output_path)) {
        return true; // Succès avec l'encodeur demandé
    }
    
    // Si l'initialisation échoue et que ce n'est pas déjà un WAV, fallback vers WAV
    if (encoder_config.format != AudioFormat::WAV) {
        current_encoder_ = CreateEncoderForFormat(AudioFormat::WAV);
        if (current_encoder_) {
            EncoderConfig wav_config = encoder_config;
            wav_config.format = AudioFormat::WAV;
            return current_encoder_->Initialize(audio_config, wav_config, output_path);
        }
    }
    
    return false; // Échec final
}

bool UniversalEncoder::StartEncoding() {
    return current_encoder_ ? current_encoder_->StartEncoding() : false;
}

bool UniversalEncoder::EncodeAudio(const float* data, size_t frames) {
    return current_encoder_ ? current_encoder_->EncodeAudio(data, frames) : false;
}

std::string UniversalEncoder::FinishEncoding() {
    return current_encoder_ ? current_encoder_->FinishEncoding() : "";
}

void UniversalEncoder::CancelEncoding() {
    if (current_encoder_) {
        current_encoder_->CancelEncoding();
    }
}

bool UniversalEncoder::IsEncoding() const {
    return current_encoder_ ? current_encoder_->IsEncoding() : false;
}

AudioEncoderInterface::EncodingStats UniversalEncoder::GetStats() const {
    return current_encoder_ ? current_encoder_->GetStats() : EncodingStats{};
}

void UniversalEncoder::SetProgressCallback(ProgressCallback callback) {
    if (current_encoder_) {
        current_encoder_->SetProgressCallback(callback);
    }
}

void UniversalEncoder::SetErrorCallback(ErrorCallback callback) {
    if (current_encoder_) {
        current_encoder_->SetErrorCallback(callback);
    }
}

EncoderConfig UniversalEncoder::GetCurrentConfig() const {
    return current_encoder_ ? current_encoder_->GetCurrentConfig() : EncoderConfig{};
}

bool UniversalEncoder::SupportsFormat(AudioFormat format) const {
    auto encoder = CreateEncoderForFormat(format);
    return encoder && encoder->SupportsFormat(format);
}

bool UniversalEncoder::SetFormat(AudioFormat format) {
    if (IsEncoding() || current_encoder_) {
        return false; // Ne peut pas changer pendant l'encodage ou après initialisation
    }
    
    preferred_format_ = format;
    return true;
}

AudioEncoderInterface* UniversalEncoder::GetCurrentEncoder() const {
    return current_encoder_.get();
}

std::unique_ptr<AudioEncoderInterface> UniversalEncoder::CreateEncoderForFormat(AudioFormat format) const {
    switch (format) {
        case AudioFormat::WAV:
            return std::make_unique<WAVEncoder>();
        case AudioFormat::FLAC:
            return std::make_unique<FLACEncoder>();
        case AudioFormat::OGG:
            return std::make_unique<OGGEncoder>();
        case AudioFormat::AAC:
            return std::make_unique<AACEncoder>();
        default:
            return nullptr;
    }
}

// ========================================
// AUDIO ENCODER FACTORY IMPLEMENTATION
// ========================================

std::unique_ptr<AudioEncoderInterface> AudioEncoderFactory::CreateEncoder(AudioFormat format) {
    switch (format) {
        case AudioFormat::WAV:
            return std::make_unique<WAVEncoder>();
        case AudioFormat::FLAC:
            return std::make_unique<FLACEncoder>();
        case AudioFormat::OGG:
            return std::make_unique<OGGEncoder>();
        case AudioFormat::AAC:
            return std::make_unique<AACEncoder>();
        default:
            // Fallback vers Universal qui essaiera WAV
            return std::make_unique<UniversalEncoder>(AudioFormat::WAV);
    }
}

bool AudioEncoderFactory::IsFormatSupported(AudioFormat format) {
    auto encoder = CreateEncoder(format);
    return encoder && encoder->SupportsFormat(format);
}

std::vector<AudioFormat> AudioEncoderFactory::GetSupportedFormats() {
    std::vector<AudioFormat> formats;
    
    // Tester chaque format
    std::vector<AudioFormat> all_formats = {
        AudioFormat::WAV, AudioFormat::FLAC, AudioFormat::OGG, AudioFormat::AAC
    };
    
    for (auto format : all_formats) {
        if (IsFormatSupported(format)) {
            formats.push_back(format);
        }
    }
    
    return formats;
}

AudioEncoderFactory::EncodingCapabilities AudioEncoderFactory::GetCapabilities() {
    EncodingCapabilities caps;
    
    caps.supported_formats = GetSupportedFormats();
    caps.supported_sample_rates = {8000, 16000, 22050, 44100, 48000, 88200};
    caps.supported_channels = {1, 2, 4, 6, 8};
    caps.supports_metadata = true;
    caps.supports_variable_bitrate = true;
    caps.max_file_size = SIZE_MAX;
    
    return caps;
}

EncoderConfig AudioEncoderFactory::CreateOptimizedConfig(AudioFormat format, const std::string& usage) {
    EncoderConfig config;
    config.format = format;
    
    if (usage == "music") {
        config.quality = AudioQuality::HIGH;
        config.use_variable_bitrate = true;
        config.write_metadata = true;
    } else if (usage == "voice" || usage == "podcast") {
        config.quality = AudioQuality::MEDIUM;
        config.use_variable_bitrate = true;
        config.write_metadata = true;
    } else if (usage == "archive") {
        if (format == AudioFormat::FLAC || format == AudioFormat::WAV) {
            config.compression_level = 8; // Max compression pour FLAC
        } else {
            config.quality = AudioQuality::VERY_HIGH;
        }
        config.write_metadata = true;
    } else {
        // Default
        config.quality = AudioQuality::HIGH;
        config.write_metadata = true;
    }
    
    return config;
}

// ========================================
// FORMAT UTILITIES IMPLEMENTATION
// ========================================

namespace format_utils {

AudioFormat DetectFormatFromFilename(const std::string& filename) {
    std::filesystem::path path(filename);
    std::string ext = path.extension().string();
    
    // Convertir en minuscules
    std::transform(ext.begin(), ext.end(), ext.begin(), ::tolower);
    
    if (ext == ".wav") return AudioFormat::WAV;
    if (ext == ".flac") return AudioFormat::FLAC;
    if (ext == ".ogg") return AudioFormat::OGG;
    if (ext == ".aac" || ext == ".m4a") return AudioFormat::AAC;
    if (ext == ".mp3") return AudioFormat::MP3;
    if (ext == ".opus") return AudioFormat::OPUS;
    
    return AudioFormat::WAV; // Default
}

bool IsConfigurationValid(const AudioConfig& audio_config, AudioFormat format) {
    // Vérifications spécifiques par format
    switch (format) {
        case AudioFormat::WAV:
            // WAV supporte presque tout
            return audio_config.sample_rate <= 192000 && audio_config.channels <= 8;
            
        case AudioFormat::FLAC:
            // FLAC limitations
            return audio_config.sample_rate <= 655350 && audio_config.channels <= 8;
            
        case AudioFormat::OGG:
            // Vorbis limitations
            return audio_config.sample_rate <= 48000 && audio_config.channels <= 8;
            
        case AudioFormat::AAC:
            // AAC limitations
            return audio_config.sample_rate <= 96000 && audio_config.channels <= 8;
            
        default:
            return true;
    }
}

AudioQuality GetRecommendedQuality(AudioFormat format, const std::string& usage) {
    if (format == AudioFormat::WAV || format == AudioFormat::FLAC) {
        return AudioQuality::EXTREME; // Lossless
    }
    
    if (usage == "music") {
        return AudioQuality::HIGH;
    } else if (usage == "voice") {
        return AudioQuality::MEDIUM;
    } else if (usage == "archive") {
        return AudioQuality::VERY_HIGH;
    }
    
    return AudioQuality::HIGH;
}

int QualityToBitrate(AudioQuality quality, AudioFormat format) {
    // Bitrates approximatifs en kbps
    switch (format) {
        case AudioFormat::OGG:
            switch (quality) {
                case AudioQuality::LOW: return 96;
                case AudioQuality::MEDIUM: return 128;
                case AudioQuality::HIGH: return 192;
                case AudioQuality::VERY_HIGH: return 256;
                case AudioQuality::EXTREME: return 320;
            }
            break;
            
        case AudioFormat::AAC:
            switch (quality) {
                case AudioQuality::LOW: return 80;
                case AudioQuality::MEDIUM: return 128;
                case AudioQuality::HIGH: return 192;
                case AudioQuality::VERY_HIGH: return 256;
                case AudioQuality::EXTREME: return 320;
            }
            break;
            
        default:
            return 192; // Default
    }
    
    return 192;
}

} // namespace format_utils

} // namespace audio