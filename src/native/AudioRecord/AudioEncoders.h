#pragma once

#include "AudioEncoderInterface.h"
#include <fstream>
#include <chrono>
#include <cstdio>
#include <memory>

namespace audio {

// ========================================
// UTILITAIRE RAII POUR FICHIERS AUDIO
// ========================================

/**
 * Gestionnaire RAII pour les fichiers audio avec validation
 */
class AudioFileGuard {
public:
    explicit AudioFileGuard(const std::string& path, const std::string& mode = "wb")
        : path_(path), file_(nullptr) {
        
        // Validation du chemin
        if (path.empty()) {
            throw std::invalid_argument("Chemin de fichier vide");
        }
        
        // Tentative d'ouverture
        file_ = std::fopen(path.c_str(), mode.c_str());
        if (!file_) {
            throw std::runtime_error("Impossible d'ouvrir le fichier: " + path);
        }
    }
    
    ~AudioFileGuard() {
        if (file_) {
            std::fflush(file_);
            std::fclose(file_);
        }
    }
    
    // Non-copiable, movable
    AudioFileGuard(const AudioFileGuard&) = delete;
    AudioFileGuard& operator=(const AudioFileGuard&) = delete;
    
    AudioFileGuard(AudioFileGuard&& other) noexcept
        : path_(std::move(other.path_))
        , file_(std::exchange(other.file_, nullptr)) {}
    
    // Accesseurs
    FILE* get() noexcept { return file_; }
    const std::string& path() const noexcept { return path_; }
    bool is_open() const noexcept { return file_ != nullptr; }
    
    // Opérations sécurisées
    size_t write(const void* data, size_t size) {
        if (!file_) {
            throw std::runtime_error("Tentative d'écriture sur fichier fermé");
        }
        return std::fwrite(data, 1, size, file_);
    }
    
    void flush() {
        if (file_) {
            std::fflush(file_);
        }
    }
    
    void seek(long offset, int whence = SEEK_SET) {
        if (!file_) {
            throw std::runtime_error("Tentative de positionnement sur fichier fermé");
        }
        if (std::fseek(file_, offset, whence) != 0) {
            throw std::runtime_error("Erreur de positionnement dans le fichier");
        }
    }
    
    long tell() {
        if (!file_) {
            throw std::runtime_error("Tentative de lecture position sur fichier fermé");
        }
        return std::ftell(file_);
    }
    
private:
    std::string path_;
    FILE* file_;
};

// ========================================
// ENCODEUR WAV (EXISTANT AMÉLIORÉ)
// ========================================

/**
 * Encodeur WAV avec support métadonnées et optimisations
 */
class WAVEncoder : public AudioEncoderInterface {
public:
    WAVEncoder();
    ~WAVEncoder() override;
    
    bool Initialize(const AudioConfig& audio_config,
                   const EncoderConfig& encoder_config,
                   const std::string& output_path) override;
    
    bool StartEncoding() override;
    bool EncodeAudio(const float* data, size_t frames) override;
    std::string FinishEncoding() override;
    void CancelEncoding() override;
    bool IsEncoding() const override;
    
    EncodingStats GetStats() const override;
    void SetProgressCallback(ProgressCallback callback) override;
    void SetErrorCallback(ErrorCallback callback) override;
    EncoderConfig GetCurrentConfig() const override;
    bool SupportsFormat(AudioFormat format) const override;
    
private:
    struct WAVHeader {
        char riff[4] = {'R', 'I', 'F', 'F'};
        uint32_t chunk_size = 0;
        char wave[4] = {'W', 'A', 'V', 'E'};
        
        char fmt[4] = {'f', 'm', 't', ' '};
        uint32_t fmt_size = 16;
        uint16_t audio_format = 1; // PCM
        uint16_t num_channels = 2;
        uint32_t sample_rate = 44100;
        uint32_t byte_rate = 0;
        uint16_t block_align = 0;
        uint16_t bits_per_sample = 16;
        
        char data[4] = {'d', 'a', 't', 'a'};
        uint32_t data_size = 0;
    };
    
    void WriteHeader();
    void UpdateHeader();
    void WriteMetadata();
    std::vector<int16_t> ConvertToInt16(const float* data, size_t samples);
    
    AudioConfig audio_config_;
    EncoderConfig encoder_config_;
    std::string output_path_;
    
    std::unique_ptr<AudioFileGuard> file_guard_;
    bool is_encoding_ = false;
    
    size_t total_frames_encoded_ = 0;
    size_t data_bytes_written_ = 0;
    std::chrono::steady_clock::time_point start_time_;
    
    ProgressCallback progress_callback_;
    ErrorCallback error_callback_;
};

// ========================================
// ENCODEUR FLAC (LOSSLESS)
// ========================================

/**
 * Encodeur FLAC pour compression lossless
 * TODO: Intégrer libFLAC quand disponible
 */
class FLACEncoder : public AudioEncoderInterface {
public:
    FLACEncoder();
    ~FLACEncoder() override;
    
    bool Initialize(const AudioConfig& audio_config,
                   const EncoderConfig& encoder_config,
                   const std::string& output_path) override;
    
    bool StartEncoding() override;
    bool EncodeAudio(const float* data, size_t frames) override;
    std::string FinishEncoding() override;
    void CancelEncoding() override;
    bool IsEncoding() const override;
    
    EncodingStats GetStats() const override;
    void SetProgressCallback(ProgressCallback callback) override;
    void SetErrorCallback(ErrorCallback callback) override;
    EncoderConfig GetCurrentConfig() const override;
    bool SupportsFormat(AudioFormat format) const override;
    
private:
    // Membres pour libFLAC (future intégration)
    // FLAC__StreamEncoder* encoder_ = nullptr;
    
    // Implémentation temporaire (stub)
    AudioConfig audio_config_;
    EncoderConfig encoder_config_;
    std::string output_path_;
    // bool is_encoding_ = false;
    
    ProgressCallback progress_callback_;
    ErrorCallback error_callback_;
    
    // Callbacks pour libFLAC
    // static FLAC__StreamEncoderWriteStatus WriteCallback(...);
    // static void MetadataCallback(...);
};

// ========================================
// ENCODEUR OGG VORBIS
// ========================================

/**
 * Encodeur Ogg Vorbis pour compression avec perte optimisée
 * TODO: Intégrer libvorbis quand disponible
 */
class OGGEncoder : public AudioEncoderInterface {
public:
    OGGEncoder();
    ~OGGEncoder() override;
    
    bool Initialize(const AudioConfig& audio_config,
                   const EncoderConfig& encoder_config,
                   const std::string& output_path) override;
    
    bool StartEncoding() override;
    bool EncodeAudio(const float* data, size_t frames) override;
    std::string FinishEncoding() override;
    void CancelEncoding() override;
    bool IsEncoding() const override;
    
    EncodingStats GetStats() const override;
    void SetProgressCallback(ProgressCallback callback) override;
    void SetErrorCallback(ErrorCallback callback) override;
    EncoderConfig GetCurrentConfig() const override;
    bool SupportsFormat(AudioFormat format) const override;
    
private:
    // Membres pour libvorbis (future intégration)
    // vorbis_info vi_;
    // vorbis_comment vc_;
    // vorbis_dsp_state vd_;
    // vorbis_block vb_;
    // ogg_stream_state os_;
    
    AudioConfig audio_config_;
    EncoderConfig encoder_config_;
    std::string output_path_;
    // bool is_encoding_ = false;
    
    ProgressCallback progress_callback_;
    ErrorCallback error_callback_;
};

// ========================================
// ENCODEUR AAC
// ========================================

/**
 * Encodeur AAC pour compression haute qualité
 * TODO: Intégrer libfdk-aac ou FFmpeg AAC quand disponible
 */
class AACEncoder : public AudioEncoderInterface {
public:
    AACEncoder();
    ~AACEncoder() override;
    
    bool Initialize(const AudioConfig& audio_config,
                   const EncoderConfig& encoder_config,
                   const std::string& output_path) override;
    
    bool StartEncoding() override;
    bool EncodeAudio(const float* data, size_t frames) override;
    std::string FinishEncoding() override;
    void CancelEncoding() override;
    bool IsEncoding() const override;
    
    EncodingStats GetStats() const override;
    void SetProgressCallback(ProgressCallback callback) override;
    void SetErrorCallback(ErrorCallback callback) override;
    EncoderConfig GetCurrentConfig() const override;
    bool SupportsFormat(AudioFormat format) const override;
    
private:
    // Membres pour libfdk-aac (future intégration)
    // HANDLE_AACENCODER encoder_handle_ = nullptr;
    // AACENC_InfoStruct enc_info_;
    
    AudioConfig audio_config_;
    EncoderConfig encoder_config_;
    std::string output_path_;
    // bool is_encoding_ = false;
    
    ProgressCallback progress_callback_;
    ErrorCallback error_callback_;
};

// ========================================
// ENCODEUR UNIVERSEL (FALLBACK)
// ========================================

/**
 * Encodeur universel qui délègue au bon encodeur selon le format
 * Utile pour simplifier l'usage et gérer les fallbacks
 */
class UniversalEncoder : public AudioEncoderInterface {
public:
    explicit UniversalEncoder(AudioFormat preferred_format = AudioFormat::WAV);
    ~UniversalEncoder() override = default;
    
    bool Initialize(const AudioConfig& audio_config,
                   const EncoderConfig& encoder_config,
                   const std::string& output_path) override;
    
    bool StartEncoding() override;
    bool EncodeAudio(const float* data, size_t frames) override;
    std::string FinishEncoding() override;
    void CancelEncoding() override;
    bool IsEncoding() const override;
    
    EncodingStats GetStats() const override;
    void SetProgressCallback(ProgressCallback callback) override;
    void SetErrorCallback(ErrorCallback callback) override;
    EncoderConfig GetCurrentConfig() const override;
    bool SupportsFormat(AudioFormat format) const override;
    
    /**
     * Change le format d'encodage (si pas encore démarré)
     * @param format Nouveau format
     * @return true si changement réussi
     */
    bool SetFormat(AudioFormat format);
    
    /**
     * Obtient l'encodeur actuel utilisé
     * @return Pointeur vers l'encodeur, ou nullptr
     */
    AudioEncoderInterface* GetCurrentEncoder() const;
    
private:
    AudioFormat preferred_format_;
    std::unique_ptr<AudioEncoderInterface> current_encoder_;
    
    std::unique_ptr<AudioEncoderInterface> CreateEncoderForFormat(AudioFormat format) const;
};

} // namespace audio