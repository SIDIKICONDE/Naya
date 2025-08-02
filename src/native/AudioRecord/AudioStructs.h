#pragma once

#include <cstdint>
#include <chrono>
#include <vector>

namespace audio {

/**
 * Configuration audio de base
 */
struct AudioConfig {
    uint32_t sample_rate = 44100;    // Taux d'échantillonnage en Hz
    uint16_t channels = 2;           // Nombre de canaux
    uint16_t bit_depth = 16;         // Profondeur en bits
    size_t buffer_size = 1024;       // Taille du buffer en frames
};

/**
 * Buffer audio avec métadonnées
 */
struct AudioBuffer {
    std::vector<float> data;                           // Données audio (float32)
    std::chrono::steady_clock::time_point timestamp;   // Timestamp de capture
    double duration_ms = 0.0;                         // Durée du buffer en ms
    
    AudioBuffer() = default;
    explicit AudioBuffer(size_t size) : data(size) {}
};

/**
 * Statistiques d'enregistrement
 */
struct RecordingStats {
    size_t total_frames = 0;         // Frames totales enregistrées
    double total_duration_ms = 0.0;  // Durée totale en ms
    size_t dropped_frames = 0;       // Frames perdues
    double average_level = 0.0;      // Niveau audio moyen
    size_t file_size_bytes = 0;      // Taille du fichier
    
    // Champs additionnels pour compatibilité avec les tests existants
    bool is_recording = false;       // État d'enregistrement
    double duration_seconds = 0.0;   // Durée en secondes (= total_duration_ms/1000)
    size_t total_bytes = 0;          // Bytes totaux (= file_size_bytes)
    float buffer_fill_percentage = 0.0f; // Pourcentage de remplissage du buffer
};

/**
 * Interface pour les callbacks d'enregistrement
 */
class AudioRecorderCallback {
public:
    virtual ~AudioRecorderCallback() = default;
    
    virtual void OnAudioData(const AudioBuffer& buffer) = 0;
    virtual void OnError(const std::string& error) = 0;
    virtual void OnRecordingStarted() = 0;
    virtual void OnRecordingStopped(const std::string& file_path) = 0;
};

} // namespace audio