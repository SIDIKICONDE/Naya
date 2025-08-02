#pragma once

#include <atomic>
#include <chrono>
#include <memory>
#include <mutex>
#include <string>
#include <thread>
#include <vector>
#include <queue>
#include <condition_variable>
#include <algorithm>
#include <sys/statvfs.h>
#include "AudioStructs.h"

namespace audio {

// Forward declaration
class AudioCaptureInterface;

// Extension de AudioConfig avec méthodes utilitaires
struct AudioConfigExtended : public AudioConfig {
    // Méthodes utilitaires pour valider la configuration
    bool IsValidSampleRate() const {
        // Support des taux d'échantillonnage standards jusqu'à 88.2 kHz
        const std::vector<uint32_t> valid_rates = {
            8000,   // Téléphonie
            16000,  // Voix large bande
            22050,  // Qualité radio
            44100,  // CD standard
            48000,  // DAT/DVD standard
            88200   // Hi-Res (2x CD) - Maximum supporté
        };
        return std::find(valid_rates.begin(), valid_rates.end(), sample_rate) != valid_rates.end();
    }
    
    bool IsValidBitDepth() const {
        return bit_depth == 16 || bit_depth == 24 || bit_depth == 32;
    }
    
    bool IsValidChannels() const {
        return channels >= 1 && channels <= 8; // Support jusqu'à 7.1
    }
};

// Classe principale d'enregistrement audio
class AudioRecorder {
public:
    AudioRecorder();
    ~AudioRecorder();
    
    // Configuration
    bool Initialize(const AudioConfig& config);
    bool Configure(const AudioConfig& config);
    
    // Contrôle d'enregistrement
    bool StartRecording(const std::string& output_path);
    std::string StopRecording();
    bool PauseRecording();
    bool ResumeRecording();
    
    // État et statistiques
    bool IsRecording() const;
    RecordingStats GetRecordingStats() const;
    float GetAudioLevel() const;
    
    // Gestion des buffers
    std::unique_ptr<AudioBuffer> GetAudioBuffer();
    void ClearBuffers();
    
    // Callbacks
    void SetCallback(std::shared_ptr<AudioRecorderCallback> callback);
    
    // Utilitaires
    std::vector<std::string> GetSupportedFormats() const;
    void Cleanup();
    
private:
    // Thread d'enregistrement
    void RecordingThread();
    
    // Callback de capture audio
    void OnCaptureData(const float* data, size_t frames, int64_t timestamp);
    void OnCaptureError(const std::string& error);
    
    // Traitement audio
    void ProcessAudioData(const AudioBuffer& buffer);
    float CalculateRMS(const std::vector<float>& data) const;
    std::vector<int16_t> ConvertToInt16(const std::vector<float>& float_data) const;
    
    // Gestion des fichiers
    bool OpenOutputFile(const std::string& path);
    void CloseOutputFile();
    void WriteWAVHeader();
    void UpdateWAVHeader();
    
    // Validation système
    bool CheckDiskSpace(const std::string& path, size_t required_bytes) const;
    size_t EstimateRequiredSpace(double duration_seconds) const;
    
    // État interne
    AudioConfig config_;
    std::atomic<bool> is_recording_{false};
    std::atomic<bool> is_paused_{false};
    std::atomic<bool> should_stop_{false};
    
    // Thread et synchronisation
    std::unique_ptr<std::thread> recording_thread_;
    mutable std::mutex state_mutex_;
    mutable std::mutex buffer_mutex_;
    std::condition_variable buffer_cv_;
    
    // Buffers audio
    std::queue<AudioBuffer> audio_queue_;
    std::atomic<float> current_audio_level_{0.0f};
    
    // Fichier de sortie
    std::string output_path_;
    FILE* output_file_ = nullptr;
    size_t bytes_written_ = 0;
    
    // Timing
    std::chrono::steady_clock::time_point recording_start_time_;
    std::chrono::duration<double> total_recording_duration_{0};
    
    // Callback
    std::shared_ptr<AudioRecorderCallback> callback_;
    
    // Capture audio
    std::unique_ptr<AudioCaptureInterface> audio_capture_;
    
    // Constantes
    static constexpr size_t kMaxQueueSize = 100;
    static constexpr float kSilenceThreshold = 0.001f;
    static constexpr size_t kWAVHeaderSize = 44;
    static constexpr size_t kMinFreeDiskSpace = 100 * 1024 * 1024;  // 100 MB minimum
    static constexpr double kDiskSpaceSafetyFactor = 1.2;  // 20% de marge
};

// Factory pour créer des instances
class AudioRecorderFactory {
public:
    static std::unique_ptr<AudioRecorder> CreateRecorder();
};

} // namespace audio