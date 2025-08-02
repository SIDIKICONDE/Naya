#include "AudioRecorder.h"
#include <cmath>
#include <cstring>
#include <algorithm>
#include <iostream>
#include <fstream>
#include <sys/statvfs.h>
#include <filesystem>
#include "AudioCaptureCpp.h"

namespace audio {

// Helpers pour l'écriture WAV
namespace {

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

void UpdateWAVHeaderSizes(WAVHeader& header, size_t data_bytes) {
    header.data_size = static_cast<uint32_t>(data_bytes);
    header.chunk_size = static_cast<uint32_t>(data_bytes + sizeof(WAVHeader) - 8);
    header.byte_rate = header.sample_rate * header.num_channels * (header.bits_per_sample / 8);
    header.block_align = header.num_channels * (header.bits_per_sample / 8);
}

} // namespace

// AudioRecorder Implementation
AudioRecorder::AudioRecorder() {
    recording_start_time_ = std::chrono::steady_clock::now();
    
    // Créer l'instance de capture audio
    audio_capture_ = AudioCaptureFactory::CreatePlatformCapture();
}

AudioRecorder::~AudioRecorder() {
    Cleanup();
}

bool AudioRecorder::Initialize(const AudioConfig& config) {
    std::lock_guard<std::mutex> lock(state_mutex_);
    
    if (is_recording_) {
        return false;
    }
    
    // Validation complète de la configuration
    if (config.sample_rate == 0 || config.sample_rate > 192000) {
        if (callback_) {
            callback_->OnError("Taux d'échantillonnage non supporté: " + std::to_string(config.sample_rate));
        }
        return false;
    }
    
    if (config.bit_depth != 16 && config.bit_depth != 24 && config.bit_depth != 32) {
        if (callback_) {
            callback_->OnError("Profondeur de bits non supportée: " + std::to_string(config.bit_depth));
        }
        return false;
    }
    
    if (config.channels == 0 || config.channels > 8) {
        if (callback_) {
            callback_->OnError("Nombre de canaux non supporté: " + std::to_string(config.channels));
        }
        return false;
    }
    
    if (config.buffer_size == 0) {
        if (callback_) {
            callback_->OnError("Taille de buffer invalide");
        }
        return false;
    }
    
    config_ = config;
    
    // Initialiser la capture audio
    if (!audio_capture_) {
        if (callback_) {
            callback_->OnError("Aucun module de capture audio disponible");
        }
        return false;
    }
    
    // Configurer les callbacks de capture
    audio_capture_->SetCaptureCallback(
        [this](const float* data, size_t frames, int64_t timestamp) {
            OnCaptureData(data, frames, timestamp);
        }
    );
    
    audio_capture_->SetErrorCallback(
        [this](const std::string& error) {
            OnCaptureError(error);
        }
    );
    
    if (!audio_capture_->Initialize(config)) {
        if (callback_) {
            callback_->OnError("Échec d'initialisation de la capture audio");
        }
        return false;
    }
    
    return true;
}

bool AudioRecorder::Configure(const AudioConfig& config) {
    std::lock_guard<std::mutex> lock(state_mutex_);
    
    if (is_recording_) {
        return false; // Ne peut pas reconfigurer pendant l'enregistrement
    }
    
    config_ = config;
    return true;
}

bool AudioRecorder::StartRecording(const std::string& output_path) {
    std::lock_guard<std::mutex> lock(state_mutex_);
    
    if (is_recording_) {
        return false;
    }
    
    output_path_ = output_path;
    
    // Vérifier l'espace disque disponible
    // Estimation : 10 minutes d'enregistrement par défaut
    size_t estimated_size = EstimateRequiredSpace(600.0);  // 10 minutes
    
    if (!CheckDiskSpace(output_path, estimated_size)) {
        if (callback_) {
            callback_->OnError("Espace disque insuffisant. Requis: " + 
                             std::to_string(estimated_size / (1024 * 1024)) + " MB");
        }
        return false;
    }
    
    // Créer le répertoire si nécessaire
    std::filesystem::path file_path(output_path);
    std::filesystem::path dir_path = file_path.parent_path();
    
    if (!dir_path.empty() && !std::filesystem::exists(dir_path)) {
        try {
            std::filesystem::create_directories(dir_path);
        } catch (const std::filesystem::filesystem_error& e) {
            if (callback_) {
                callback_->OnError(std::string("Impossible de créer le répertoire: ") + e.what());
            }
            return false;
        }
    }
    
    // Ouvrir le fichier de sortie
    if (!OpenOutputFile(output_path)) {
        if (callback_) {
            callback_->OnError("Failed to open output file: " + output_path);
        }
        return false;
    }
    
    // Réinitialiser l'état
    is_recording_ = true;
    is_paused_ = false;
    should_stop_ = false;
    bytes_written_ = 0;
    total_recording_duration_ = std::chrono::duration<double>(0);
    recording_start_time_ = std::chrono::steady_clock::now();
    
    // Écrire l'en-tête WAV (sera mis à jour à la fin)
    WriteWAVHeader();
    
    // Démarrer la capture audio si disponible
    if (audio_capture_ && !audio_capture_->StartCapture()) {
        if (callback_) {
            callback_->OnError("Échec du démarrage de la capture audio");
        }
        CloseOutputFile();
        is_recording_ = false;
        return false;
    }
    
    // Démarrer le thread d'enregistrement (pour gérer les buffers et l'écriture)
    recording_thread_ = std::make_unique<std::thread>(&AudioRecorder::RecordingThread, this);
    
    if (callback_) {
        callback_->OnRecordingStarted();
    }
    
    return true;
}

std::string AudioRecorder::StopRecording() {
    {
        std::lock_guard<std::mutex> lock(state_mutex_);
        
        if (!is_recording_) {
            return "";
        }
        
        should_stop_ = true;
        is_recording_ = false;
    }
    
    // Arrêter la capture audio
    if (audio_capture_) {
        audio_capture_->StopCapture();
    }
    
    // Réveiller le thread s'il est en attente
    buffer_cv_.notify_all();
    
    // Attendre la fin du thread
    if (recording_thread_ && recording_thread_->joinable()) {
        recording_thread_->join();
    }
    
    // Mettre à jour l'en-tête WAV avec les tailles finales
    UpdateWAVHeader();
    
    // Fermer le fichier
    CloseOutputFile();
    
    if (callback_) {
        callback_->OnRecordingStopped(output_path_);
    }
    
    return output_path_;
}

bool AudioRecorder::PauseRecording() {
    std::lock_guard<std::mutex> lock(state_mutex_);
    
    if (!is_recording_ || is_paused_) {
        return false;
    }
    
    // Mettre en pause la capture
    if (audio_capture_ && !audio_capture_->PauseCapture()) {
        return false;
    }
    
    is_paused_ = true;
    return true;
}

bool AudioRecorder::ResumeRecording() {
    std::lock_guard<std::mutex> lock(state_mutex_);
    
    if (!is_recording_ || !is_paused_) {
        return false;
    }
    
    // Reprendre la capture
    if (audio_capture_ && !audio_capture_->ResumeCapture()) {
        return false;
    }
    
    is_paused_ = false;
    buffer_cv_.notify_all();
    return true;
}

bool AudioRecorder::IsRecording() const {
    std::lock_guard<std::mutex> lock(state_mutex_);
    return is_recording_ && !is_paused_;
}

RecordingStats AudioRecorder::GetRecordingStats() const {
    std::lock_guard<std::mutex> lock(state_mutex_);
    
    RecordingStats stats;
    stats.is_recording = is_recording_;
    stats.total_bytes = bytes_written_;
    
    if (is_recording_) {
        auto now = std::chrono::steady_clock::now();
        auto current_duration = std::chrono::duration<double>(now - recording_start_time_);
        stats.duration_seconds = (total_recording_duration_ + current_duration).count();
    } else {
        stats.duration_seconds = total_recording_duration_.count();
    }
    
    // Calcul du niveau de remplissage du buffer
    {
        std::lock_guard<std::mutex> buffer_lock(buffer_mutex_);
        stats.buffer_fill_percentage = static_cast<float>(audio_queue_.size()) / kMaxQueueSize;
    }
    
    return stats;
}

float AudioRecorder::GetAudioLevel() const {
    // Utiliser le niveau de la capture si disponible
    if (audio_capture_ && audio_capture_->IsCapturing()) {
        return audio_capture_->GetCurrentLevel();
    }
    return current_audio_level_.load();
}

std::unique_ptr<AudioBuffer> AudioRecorder::GetAudioBuffer() {
    std::lock_guard<std::mutex> lock(buffer_mutex_);
    
    if (audio_queue_.empty()) {
        return nullptr;
    }
    
    auto buffer = std::make_unique<AudioBuffer>(std::move(audio_queue_.front()));
    audio_queue_.pop();
    
    return buffer;
}

void AudioRecorder::ClearBuffers() {
    std::lock_guard<std::mutex> lock(buffer_mutex_);
    
    // Vider la queue
    while (!audio_queue_.empty()) {
        audio_queue_.pop();
    }
    
    current_audio_level_ = 0.0f;
}

void AudioRecorder::SetCallback(std::shared_ptr<AudioRecorderCallback> callback) {
    callback_ = callback;
}

std::vector<std::string> AudioRecorder::GetSupportedFormats() const {
    return {"wav", "pcm"};
}

void AudioRecorder::Cleanup() {
    StopRecording();
    ClearBuffers();
    callback_.reset();
}

void AudioRecorder::RecordingThread() {
    // Thread pour gérer l'écriture des buffers sur disque
    // Les données viennent maintenant de OnCaptureData
    
    while (!should_stop_) {
        std::unique_lock<std::mutex> lock(buffer_mutex_);
        
        // Attendre qu'il y ait des données à traiter
        buffer_cv_.wait_for(lock, std::chrono::milliseconds(100), [this] {
            return !audio_queue_.empty() || should_stop_;
        });
        
        // Traiter tous les buffers disponibles
        while (!audio_queue_.empty() && !should_stop_) {
            AudioBuffer buffer = std::move(audio_queue_.front());
            audio_queue_.pop();
            
            // Déverrouiller pendant le traitement
            lock.unlock();
            
            // Écrire dans le fichier
            if (output_file_ && !is_paused_) {
                std::vector<int16_t> int16_data = ConvertToInt16(buffer.data);
                size_t bytes_to_write = int16_data.size() * sizeof(int16_t);
                size_t written = fwrite(int16_data.data(), 1, bytes_to_write, output_file_);
                
                if (written == bytes_to_write) {
                    bytes_written_ += written;
                } else {
                    if (callback_) {
                        callback_->OnError("Échec d'écriture des données audio");
                    }
                }
            }
            
            // Reverrouiller pour la prochaine itération
            lock.lock();
        }
    }
}

void AudioRecorder::ProcessAudioData(const AudioBuffer& buffer) {
    // Calculer le niveau audio
    float rms = CalculateRMS(buffer.data);
    current_audio_level_ = rms;
    
    // Ajouter au buffer queue si pas plein
    {
        std::lock_guard<std::mutex> lock(buffer_mutex_);
        
        if (audio_queue_.size() < kMaxQueueSize) {
            audio_queue_.push(buffer);
        } else {
            if (callback_) {
                callback_->OnError("Audio buffer overflow");
            }
        }
    }
    
    // Écrire dans le fichier
    if (output_file_) {
        std::vector<int16_t> int16_data = ConvertToInt16(buffer.data);
        size_t bytes_to_write = int16_data.size() * sizeof(int16_t);
        size_t written = fwrite(int16_data.data(), 1, bytes_to_write, output_file_);
        
        if (written == bytes_to_write) {
            bytes_written_ += written;
        } else {
            if (callback_) {
                callback_->OnError("Failed to write audio data");
            }
        }
    }
    
    // Notifier le callback
    if (callback_) {
        callback_->OnAudioData(buffer);
    }
}

float AudioRecorder::CalculateRMS(const std::vector<float>& data) const {
    if (data.empty()) {
        return 0.0f;
    }
    
    double sum_squares = 0.0;
    for (float sample : data) {
        sum_squares += sample * sample;
    }
    
    return static_cast<float>(std::sqrt(sum_squares / data.size()));
}

std::vector<int16_t> AudioRecorder::ConvertToInt16(const std::vector<float>& float_data) const {
    std::vector<int16_t> int16_data;
    int16_data.reserve(float_data.size());
    
    for (float sample : float_data) {
        // Limiter entre -1.0 et 1.0
        float clamped = std::clamp(sample, -1.0f, 1.0f);
        
        // Convertir en int16
        int16_t int_sample = static_cast<int16_t>(clamped * 32767.0f);
        int16_data.push_back(int_sample);
    }
    
    return int16_data;
}

bool AudioRecorder::OpenOutputFile(const std::string& path) {
    output_file_ = fopen(path.c_str(), "wb");
    return output_file_ != nullptr;
}

void AudioRecorder::CloseOutputFile() {
    if (output_file_) {
        fclose(output_file_);
        output_file_ = nullptr;
    }
}

void AudioRecorder::WriteWAVHeader() {
    if (!output_file_) {
        return;
    }
    
    WAVHeader header;
    header.num_channels = config_.channels;
    header.sample_rate = config_.sample_rate;
    header.bits_per_sample = config_.bit_depth;
    
    UpdateWAVHeaderSizes(header, 0); // Taille de données à 0 pour l'instant
    
    fwrite(&header, sizeof(WAVHeader), 1, output_file_);
}

void AudioRecorder::UpdateWAVHeader() {
    if (!output_file_) {
        return;
    }
    
    // Retourner au début du fichier
    fseek(output_file_, 0, SEEK_SET);
    
    WAVHeader header;
    header.num_channels = config_.channels;
    header.sample_rate = config_.sample_rate;
    header.bits_per_sample = config_.bit_depth;
    
    // Mettre à jour avec la taille réelle des données
    UpdateWAVHeaderSizes(header, bytes_written_ - sizeof(WAVHeader));
    
    fwrite(&header, sizeof(WAVHeader), 1, output_file_);
    
    // Retourner à la fin du fichier
    fseek(output_file_, 0, SEEK_END);
}

bool AudioRecorder::CheckDiskSpace(const std::string& path, size_t required_bytes) const {
    // Extraire le répertoire du chemin
    std::filesystem::path file_path(path);
    std::filesystem::path check_path = file_path.parent_path();
    
    // Si pas de répertoire parent, utiliser le répertoire courant
    if (check_path.empty()) {
        check_path = ".";
    }
    
    struct statvfs stat;
    if (statvfs(check_path.c_str(), &stat) != 0) {
        // En cas d'échec, considérer qu'il y a assez d'espace
        // pour éviter de bloquer l'enregistrement
        return true;
    }
    
    // Calculer l'espace disponible
    size_t available_bytes = static_cast<size_t>(stat.f_bavail) * static_cast<size_t>(stat.f_frsize);
    
    // Vérifier avec marge de sécurité
    size_t required_with_margin = static_cast<size_t>(required_bytes * kDiskSpaceSafetyFactor);
    
    // S'assurer qu'il reste au moins kMinFreeDiskSpace après l'enregistrement
    return available_bytes > (required_with_margin + kMinFreeDiskSpace);
}

size_t AudioRecorder::EstimateRequiredSpace(double duration_seconds) const {
    // Calcul : sample_rate * channels * bytes_per_sample * duration
    size_t bytes_per_sample = config_.bit_depth / 8;
    size_t bytes_per_second = config_.sample_rate * config_.channels * bytes_per_sample;
    
    // Ajouter l'overhead du header WAV
    return static_cast<size_t>(bytes_per_second * duration_seconds) + kWAVHeaderSize;
}

void AudioRecorder::OnCaptureData(const float* data, size_t frames, int64_t timestamp) {
    if (!is_recording_ || is_paused_) {
        return;
    }
    
    // Créer un buffer audio à partir des données capturées
    const size_t samples = frames * config_.channels;
    AudioBuffer buffer(samples);
    
    // Copier les données
    std::memcpy(buffer.data.data(), data, samples * sizeof(float));
    
    // Configurer le timestamp
    buffer.timestamp = recording_start_time_ + std::chrono::microseconds(timestamp);
    buffer.duration_ms = (frames * 1000.0) / config_.sample_rate;
    
    // Calculer le niveau RMS
    float rms = CalculateRMS(buffer.data);
    current_audio_level_ = rms;
    
    // Ajouter au buffer queue
    {
        std::lock_guard<std::mutex> lock(buffer_mutex_);
        
        if (audio_queue_.size() < kMaxQueueSize) {
            audio_queue_.push(std::move(buffer));
            buffer_cv_.notify_one();
        } else {
            if (callback_) {
                callback_->OnError("Buffer audio saturé");
            }
        }
    }
    
    // Notifier le callback
    if (callback_) {
        AudioBuffer callback_buffer(samples);
        std::memcpy(callback_buffer.data.data(), data, samples * sizeof(float));
        callback_buffer.timestamp = buffer.timestamp;
        callback_buffer.duration_ms = buffer.duration_ms;
        callback_->OnAudioData(callback_buffer);
    }
}

void AudioRecorder::OnCaptureError(const std::string& error) {
    if (callback_) {
        callback_->OnError("Erreur de capture: " + error);
    }
}

// AudioRecorderFactory Implementation
std::unique_ptr<AudioRecorder> AudioRecorderFactory::CreateRecorder() {
    return std::make_unique<AudioRecorder>();
}

} // namespace audio