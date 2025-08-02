#pragma once

#include "NayaJSI.h"  // Généré par Codegen
#include <ReactCommon/TurboModule.h>
#include <memory>
#include <optional>
#include <mutex>
#include <vector>
#include <cstring>   // Pour std::strerror
#include <cerrno>    // Pour errno
#include "AudioRecorder.h"
#include "AudioBufferPool.h"

namespace facebook::react {

// ========================================
// UTILITAIRES RAII POUR LE MODULE AUDIO
// ========================================

/**
 * Gestionnaire RAII pour les fichiers audio avec validation
 * Utilisé pour une gestion sécurisée des fichiers d'enregistrement
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
            throw std::runtime_error("Impossible d'ouvrir le fichier: " + path + 
                                   " (" + std::strerror(errno) + ")");
        }
    }
    
    ~AudioFileGuard() {
        if (file_) {
            std::fflush(file_);  // Assurer que tout est écrit
            std::fclose(file_);
        }
    }
    
    // Non-copiable, movable
    AudioFileGuard(const AudioFileGuard&) = delete;
    AudioFileGuard& operator=(const AudioFileGuard&) = delete;
    
    AudioFileGuard(AudioFileGuard&& other) noexcept
        : path_(std::move(other.path_))
        , file_(std::exchange(other.file_, nullptr)) {}
    
    AudioFileGuard& operator=(AudioFileGuard&& other) noexcept {
        if (this != &other) {
            if (file_) {
                std::fclose(file_);
            }
            path_ = std::move(other.path_);
            file_ = std::exchange(other.file_, nullptr);
        }
        return *this;
    }
    
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
    
    // Positionnement dans le fichier
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

/**
 * Gestionnaire RAII pour buffers audio avec pool automatique
 * Optimise la gestion mémoire pendant l'enregistrement
 */
class ScopedAudioBuffer {
public:
    explicit ScopedAudioBuffer(AudioBufferPool& pool)
        : pool_(pool), buffer_(pool.acquire()) {}
    
    ~ScopedAudioBuffer() {
        if (buffer_) {
            pool_.release(std::move(buffer_));
        }
    }
    
    // Non-copiable
    ScopedAudioBuffer(const ScopedAudioBuffer&) = delete;
    ScopedAudioBuffer& operator=(const ScopedAudioBuffer&) = delete;
    
    // Movable
    ScopedAudioBuffer(ScopedAudioBuffer&& other) noexcept
        : pool_(other.pool_), buffer_(std::move(other.buffer_)) {}
    
    // Accès au buffer
    audio::AudioBuffer* operator->() { return buffer_.get(); }
    const audio::AudioBuffer* operator->() const { return buffer_.get(); }
    audio::AudioBuffer& operator*() { return *buffer_; }
    const audio::AudioBuffer& operator*() const { return *buffer_; }
    
    audio::AudioBuffer* get() { return buffer_.get(); }
    const audio::AudioBuffer* get() const { return buffer_.get(); }
    
    explicit operator bool() const { return buffer_ != nullptr; }
    
    // Libération anticipée
    void release() {
        if (buffer_) {
            pool_.release(std::move(buffer_));
            buffer_.reset();
        }
    }
    
private:
    AudioBufferPool& pool_;
    std::unique_ptr<audio::AudioBuffer> buffer_;
};

/**
 * Classe callback thread-safe pour éviter les race conditions
 */
class AudioRecorderCallbackImpl : public audio::AudioRecorderCallback {
public:
    explicit AudioRecorderCallbackImpl(NativeAudioRecorder* owner) 
        : owner_(owner) {}
    
    ~AudioRecorderCallbackImpl() override {
        std::lock_guard<std::mutex> lock(mutex_);
        owner_ = nullptr;  // Détachement sécurisé
    }
    
    void OnAudioData(const audio::AudioBuffer& buffer) override;
    void OnError(const std::string& error) override;
    void OnRecordingStarted() override;
    void OnRecordingStopped(const std::string& file_path) override;
    
    void Detach() {
        std::lock_guard<std::mutex> lock(mutex_);
        owner_ = nullptr;
    }
    
private:
    mutable std::mutex mutex_;
    NativeAudioRecorder* owner_ = nullptr;
};

/**
 * TurboModule NativeAudioRecorder avec gestion sécurisée des callbacks
 */
class NativeAudioRecorder : public NativeAudioRecorderCxxSpec<NativeAudioRecorder> {
public:
    static constexpr auto kModuleName = "NativeAudioRecorder";
    
    NativeAudioRecorder(std::shared_ptr<CallInvoker> jsInvoker);
    ~NativeAudioRecorder();
    
    // Méthodes TurboModule - Implémentations dans le .cpp
    jsi::Object getConstants(jsi::Runtime &rt) override;
    bool initialize(jsi::Runtime &rt, jsi::Object config) override;
    bool configure(jsi::Runtime &rt, jsi::Object config) override;
    bool startRecording(jsi::Runtime &rt, jsi::String outputPath) override;
    jsi::String stopRecording(jsi::Runtime &rt) override;
    bool pauseRecording(jsi::Runtime &rt) override;
    bool resumeRecording(jsi::Runtime &rt) override;
    bool isRecording(jsi::Runtime &rt) override;
    jsi::Object getRecordingStats(jsi::Runtime &rt) override;
    double getAudioLevel(jsi::Runtime &rt) override;
    std::optional<jsi::Object> getAudioBuffer(jsi::Runtime &rt) override;
    void clearBuffers(jsi::Runtime &rt) override;
    jsi::Array getSupportedFormats(jsi::Runtime &rt) override;
    void cleanup(jsi::Runtime &rt) override;
    
    // Méthodes pour le callback thread-safe
    void HandleAudioData(const audio::AudioBuffer& buffer);
    void HandleError(const std::string& error);
    void HandleRecordingStarted();
    void HandleRecordingStopped(const std::string& file_path);
    
private:
    // Extraction helper pour éviter duplication
    audio::AudioConfig extractAudioConfig(jsi::Runtime &rt, const jsi::Object& config);
    
    // Membres avec ordre d'initialisation correct
    std::unique_ptr<audio::AudioRecorder> recorder_;
    std::shared_ptr<AudioRecorderCallbackImpl> callback_impl_;
    AudioBufferPool buffer_pool_;
    std::shared_ptr<CallInvoker> jsInvoker_;
    
    // Gestionnaire de fichier RAII (optionnel pour améliorer AudioRecorder future)
    // std::unique_ptr<AudioFileGuard> output_file_guard_;
    
    // Thread safety
    mutable std::mutex callback_mutex_;
    std::vector<audio::AudioBuffer> pending_buffers_;
    std::string last_error_;
    size_t dropped_buffers_count_ = 0;
};

} // namespace facebook::react