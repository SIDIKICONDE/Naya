#pragma once

#include "AudioDSPInterface.h"
#include <array>
#include <cmath>

namespace audio::dsp {

// ========================================
// FILTRES DE BASE (BUILDING BLOCKS)
// ========================================

/**
 * Filtre biquad générique pour EQ et autres effets
 */
class BiquadFilter {
public:
    enum Type {
        LOWPASS,
        HIGHPASS,
        BANDPASS,
        NOTCH,
        PEAK,      // Pour EQ paramétrique
        LOWSHELF,
        HIGHSHELF
    };
    
    BiquadFilter() = default;
    
    void Configure(Type type, float frequency, float sample_rate, 
                   float Q = 0.707f, float gain_db = 0.0f);
    
    float Process(float input);
    void ProcessBuffer(const float* input, float* output, size_t samples);
    void ProcessBufferInPlace(float* data, size_t samples);
    
    void Reset();
    
private:
    // Coefficients du filtre
    // float a0_ = 1.0f;
    float a1_ = 0.0f, a2_ = 0.0f;
    float b0_ = 1.0f, b1_ = 0.0f, b2_ = 0.0f;
    
    // État interne
    float x1_ = 0.0f, x2_ = 0.0f;  // Entrées précédentes
    float y1_ = 0.0f, y2_ = 0.0f;  // Sorties précédentes
};

/**
 * Délai avec interpolation pour reverb et delay
 */
class DelayLine {
public:
    explicit DelayLine(size_t max_delay_samples = 192000); // 4s à 48kHz
    
    void SetDelay(float delay_samples);
    float Read() const;
    float ReadInterpolated() const;
    void Write(float sample);
    float Process(float input, float delay_samples);
    
    void Clear();
    
private:
    std::vector<float> buffer_;
    size_t write_pos_ = 0;
    float delay_samples_ = 0.0f;
    size_t max_delay_;
};

// ========================================
// ÉGALISEUR PARAMÉTRIQUE
// ========================================

/**
 * Égaliseur paramétrique multi-bandes
 */
class ParametricEqualizer : public AudioDSPProcessor {
public:
    static constexpr size_t kNumBands = 10;
    
    struct EQBand {
        float frequency = 1000.0f;    // Fréquence centrale en Hz
        float gain_db = 0.0f;         // Gain en dB
        float q_factor = 0.707f;      // Facteur Q
        bool enabled = true;          // Bande activée
        BiquadFilter::Type type = BiquadFilter::PEAK;  // Type de filtre
    };
    
    ParametricEqualizer();
    ~ParametricEqualizer() override = default;
    
    bool Initialize(const AudioConfig& config) override;
    void Process(float* data, size_t frames) override;
    void Reset() override;
    
    EffectType GetEffectType() const override { return EffectType::EQUALIZER; }
    std::string GetEffectName() const override { return "Parametric Equalizer"; }
    
    std::unordered_map<std::string, DSPParameter> GetParameters() const override;
    bool SetParameter(const std::string& name, float value) override;
    float GetParameter(const std::string& name) const override;
    
    std::vector<DSPPreset> GetAvailablePresets() const override;
    
    // Interface spécifique EQ
    void SetBand(size_t band_index, float frequency, float gain_db, float q = 0.707f);
    EQBand GetBand(size_t band_index) const;
    void SetBandEnabled(size_t band_index, bool enabled);
    
    // Presets communs
    void ApplyVoicePreset();
    void ApplyMusicPreset();
    void ApplyBassBoostPreset();
    void ApplyPresencePreset();
    
private:
    std::array<EQBand, kNumBands> bands_;
    std::array<std::array<BiquadFilter, 2>, kNumBands> filters_; // Stéréo
    
    void UpdateFilters();
    void InitializeDefaultBands();
};

// ========================================
// COMPRESSEUR DYNAMIQUE
// ========================================

/**
 * Compresseur/limiteur avec détection de pic et RMS
 */
class DynamicsProcessor : public AudioDSPProcessor {
public:
    enum Mode {
        COMPRESSOR,
        LIMITER,
        GATE,
        EXPANDER
    };
    
    DynamicsProcessor();
    ~DynamicsProcessor() override = default;
    
    bool Initialize(const AudioConfig& config) override;
    void Process(float* data, size_t frames) override;
    void Reset() override;
    
    EffectType GetEffectType() const override { return EffectType::COMPRESSOR; }
    std::string GetEffectName() const override { return "Dynamics Processor"; }
    
    std::unordered_map<std::string, DSPParameter> GetParameters() const override;
    bool SetParameter(const std::string& name, float value) override;
    float GetParameter(const std::string& name) const override;
    
    std::vector<DSPPreset> GetAvailablePresets() const override;
    
    // Interface spécifique compresseur
    void SetMode(Mode mode) { mode_ = mode; }
    void SetThreshold(float threshold_db) { threshold_db_ = threshold_db; }
    void SetRatio(float ratio) { ratio_ = ratio; }
    void SetAttack(float attack_ms);
    void SetRelease(float release_ms);
    void SetKnee(float knee_db) { knee_db_ = knee_db; }
    void SetMakeupGain(float gain_db) { makeup_gain_db_ = gain_db; }
    
    // Métriques
    float GetGainReduction() const { return gain_reduction_db_; }
    float GetInputLevel() const { return input_level_db_; }
    float GetOutputLevel() const { return output_level_db_; }
    
private:
    Mode mode_ = COMPRESSOR;
    
    // Paramètres
    float threshold_db_ = -12.0f;
    float ratio_ = 4.0f;
    float knee_db_ = 2.0f;
    float makeup_gain_db_ = 0.0f;
    
    // Enveloppes
    float attack_coeff_ = 0.0f;
    float release_coeff_ = 0.0f;
    float envelope_ = 0.0f;
    
    // Métriques temps réel
    float gain_reduction_db_ = 0.0f;
    float input_level_db_ = -96.0f;
    float output_level_db_ = -96.0f;
    
    // Buffers pour stéréo linking
    std::vector<float> side_chain_buffer_;
    
    void CalculateCoefficients();
    float CalculateGainReduction(float input_level_db);
    float ProcessEnvelope(float target_gain);
    void UpdateMetrics(const float* data, size_t frames);
};

// ========================================
// RÉVERBÉRATION ALGORITHMIQUE
// ========================================

/**
 * Réverbération basée sur Freeverb avec améliorations
 */
class AlgorithmicReverb : public AudioDSPProcessor {
public:
    AlgorithmicReverb();
    ~AlgorithmicReverb() override = default;
    
    bool Initialize(const AudioConfig& config) override;
    void Process(float* data, size_t frames) override;
    void Reset() override;
    
    EffectType GetEffectType() const override { return EffectType::REVERB; }
    std::string GetEffectName() const override { return "Algorithmic Reverb"; }
    
    std::unordered_map<std::string, DSPParameter> GetParameters() const override;
    bool SetParameter(const std::string& name, float value) override;
    float GetParameter(const std::string& name) const override;
    
    std::vector<DSPPreset> GetAvailablePresets() const override;
    
    size_t GetLatency() const override { return pre_delay_samples_; }
    
    // Interface spécifique reverb
    void SetRoomSize(float size) { room_size_ = std::clamp(size, 0.0f, 1.0f); UpdateParameters(); }
    void SetDamping(float damping) { damping_ = std::clamp(damping, 0.0f, 1.0f); UpdateParameters(); }
    void SetWetLevel(float wet) { wet_level_ = std::clamp(wet, 0.0f, 1.0f); }
    void SetDryLevel(float dry) { dry_level_ = std::clamp(dry, 0.0f, 1.0f); }
    void SetPreDelay(float pre_delay_ms);
    void SetWidth(float width) { width_ = std::clamp(width, 0.0f, 1.0f); }
    
private:
    // Paramètres
    float room_size_ = 0.5f;
    float damping_ = 0.5f;
    float wet_level_ = 0.3f;
    float dry_level_ = 0.7f;
    float width_ = 1.0f;
    
    // Pre-delay
    size_t pre_delay_samples_ = 0;
    std::array<DelayLine, 2> pre_delay_;
    
    // Comb filters (pour la réverbération)
    static constexpr size_t kNumCombs = 8;
    static constexpr size_t kNumAllpass = 4;
    
    struct CombFilter {
        DelayLine delay;
        float feedback = 0.0f;
        float damping = 0.0f;
        float filter_store = 0.0f;
        
        explicit CombFilter(size_t delay_samples) : delay(delay_samples) {}
        
        float Process(float input) {
            float output = delay.Read();
            filter_store = (output * damping) + (filter_store * (1.0f - damping));
            delay.Write(input + (filter_store * feedback));
            return output;
        }
    };
    
    struct AllpassFilter {
        DelayLine delay;
        float feedback = 0.5f;
        
        explicit AllpassFilter(size_t delay_samples) : delay(delay_samples) {}
        
        float Process(float input) {
            float delayed = delay.Read();
            float output = -input + delayed;
            delay.Write(input + (delayed * feedback));
            return output;
        }
    };
    
    // Filtres par canal (stéréo)
    std::array<std::array<CombFilter, kNumCombs>, 2> combs_;
    std::array<std::array<AllpassFilter, kNumAllpass>, 2> allpass_;
    
    void UpdateParameters();
    void InitializeFilters();
    static const std::array<size_t, kNumCombs> kCombDelaySamples;
    static const std::array<size_t, kNumAllpass> kAllpassDelaySamples;
};

// ========================================
// DELAY/ECHO
// ========================================

/**
 * Delay multi-tap avec filtrage et modulation
 */
class MultiTapDelay : public AudioDSPProcessor {
public:
    static constexpr size_t kMaxTaps = 4;
    
    struct DelayTap {
        float delay_ms = 250.0f;      // Délai en millisecondes
        float feedback = 0.3f;        // Retour (0-0.95)
        float level = 0.5f;           // Niveau de sortie
        float pan = 0.0f;             // Panoramique (-1 à 1)
        bool enabled = true;          // Tap activé
        
        // Filtrage
        float low_cut_hz = 80.0f;     // Filtre passe-haut
        float high_cut_hz = 8000.0f;  // Filtre passe-bas
    };
    
    MultiTapDelay();
    ~MultiTapDelay() override = default;
    
    bool Initialize(const AudioConfig& config) override;
    void Process(float* data, size_t frames) override;
    void Reset() override;
    
    EffectType GetEffectType() const override { return EffectType::DELAY; }
    std::string GetEffectName() const override { return "Multi-Tap Delay"; }
    
    std::unordered_map<std::string, DSPParameter> GetParameters() const override;
    bool SetParameter(const std::string& name, float value) override;
    float GetParameter(const std::string& name) const override;
    
    std::vector<DSPPreset> GetAvailablePresets() const override;
    
    size_t GetLatency() const override;
    
    // Interface spécifique delay
    void SetTap(size_t tap_index, const DelayTap& tap);
    DelayTap GetTap(size_t tap_index) const;
    void SetTapEnabled(size_t tap_index, bool enabled);
    
    void SetWetLevel(float wet) { wet_level_ = std::clamp(wet, 0.0f, 1.0f); }
    void SetDryLevel(float dry) { dry_level_ = std::clamp(dry, 0.0f, 1.0f); }
    
private:
    std::array<DelayTap, kMaxTaps> taps_;
    std::array<DelayLine, 2> delay_lines_;  // Stéréo
    std::array<std::array<BiquadFilter, 2>, kMaxTaps> filters_; // Filtres par tap
    
    float wet_level_ = 0.3f;
    float dry_level_ = 0.7f;
    
    void UpdateDelayLines();
    void UpdateFilters();
    size_t CalculateMaxDelaySamples() const;
};

// ========================================
// DISTORSION/SATURATION
// ========================================

/**
 * Distorsion avec différents types de saturation
 */
class DistortionProcessor : public AudioDSPProcessor {
public:
    enum DistortionType {
        SOFT_CLIP,          // Saturation douce
        HARD_CLIP,          // Écrêtage dur
        TUBE_SATURATION,    // Simulation tube
        TAPE_SATURATION,    // Simulation bande
        BITCRUSHER,         // Réduction de bits
        FOLDBACK            // Repliement
    };
    
    DistortionProcessor();
    ~DistortionProcessor() override = default;
    
    bool Initialize(const AudioConfig& config) override;
    void Process(float* data, size_t frames) override;
    void Reset() override;
    
    EffectType GetEffectType() const override { return EffectType::DISTORTION; }
    std::string GetEffectName() const override { return "Distortion Processor"; }
    
    std::unordered_map<std::string, DSPParameter> GetParameters() const override;
    bool SetParameter(const std::string& name, float value) override;
    float GetParameter(const std::string& name) const override;
    
    std::vector<DSPPreset> GetAvailablePresets() const override;
    
    // Interface spécifique distorsion
    void SetDistortionType(DistortionType type) { type_ = type; }
    void SetDrive(float drive) { drive_ = std::clamp(drive, 1.0f, 100.0f); }
    void SetOutputLevel(float level) { output_level_ = std::clamp(level, 0.0f, 2.0f); }
    void SetTone(float tone) { tone_ = std::clamp(tone, 0.0f, 1.0f); UpdateToneFilter(); }
    
private:
    DistortionType type_ = SOFT_CLIP;
    float drive_ = 5.0f;        // Gain d'entrée
    float output_level_ = 0.5f; // Niveau de sortie
    float tone_ = 0.5f;         // Contrôle de timbre
    
    // Filtres de timbre
    std::array<BiquadFilter, 2> tone_filters_; // Stéréo
    
    // Fonctions de saturation
    float ProcessSample(float input);
    float SoftClip(float input);
    float HardClip(float input);
    float TubeSaturation(float input);
    float TapeSaturation(float input);
    float BitCrush(float input);
    float Foldback(float input);
    
    void UpdateToneFilter();
    
    // Variables pour bitcrusher
    float bit_depth_ = 8.0f;
    float sample_rate_reduction_ = 1.0f;
    float phase_accumulator_ = 0.0f;
    float last_sample_ = 0.0f;
};

} // namespace audio::dsp