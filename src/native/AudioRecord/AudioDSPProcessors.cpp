#include "AudioDSPProcessors.h"
#include <algorithm>
#include <cstring>
#include <random>

namespace audio::dsp {

// ========================================
// UTILITAIRES DSP COMMUNS
// ========================================

namespace dsp_utils {

float FrequencyToCoefficient(float frequency, float sample_rate) {
    return std::clamp(frequency / (sample_rate * 0.5f), 0.001f, 0.999f);
}

float DbToGain(float db) {
    return std::pow(10.0f, db / 20.0f);
}

float GainToDb(float gain) {
    return 20.0f * std::log10(std::max(gain, 1e-10f));
}

void ApplyFade(float* data, size_t frames, size_t channels, 
               size_t fade_samples, bool fade_in) {
    size_t samples_to_fade = std::min(frames * channels, fade_samples * channels);
    
    for (size_t i = 0; i < samples_to_fade; ++i) {
        float progress = static_cast<float>(i) / static_cast<float>(samples_to_fade - 1);
        float gain = fade_in ? progress : (1.0f - progress);
        data[i] *= gain;
    }
}

void ApplyGainRamp(float* data, size_t frames, size_t channels,
                   float old_gain, float new_gain) {
    size_t total_samples = frames * channels;
    float gain_diff = new_gain - old_gain;
    
    for (size_t i = 0; i < total_samples; ++i) {
        float progress = static_cast<float>(i) / static_cast<float>(total_samples - 1);
        float current_gain = old_gain + (gain_diff * progress);
        data[i] *= current_gain;
    }
}

float CalculateRMS(const float* data, size_t frames, size_t channels) {
    double sum_squares = 0.0;
    size_t total_samples = frames * channels;
    
    for (size_t i = 0; i < total_samples; ++i) {
        sum_squares += data[i] * data[i];
    }
    
    return static_cast<float>(std::sqrt(sum_squares / total_samples));
}

float CalculatePeak(const float* data, size_t frames, size_t channels) {
    float peak = 0.0f;
    size_t total_samples = frames * channels;
    
    for (size_t i = 0; i < total_samples; ++i) {
        peak = std::max(peak, std::abs(data[i]));
    }
    
    return peak;
}

} // namespace dsp_utils

// ========================================
// BIQUAD FILTER IMPLEMENTATION
// ========================================

void BiquadFilter::Configure(Type type, float frequency, float sample_rate, 
                            float Q, float gain_db) {
    float omega = 2.0f * M_PI * frequency / sample_rate;
    float sin_omega = std::sin(omega);
    float cos_omega = std::cos(omega);
    float alpha = sin_omega / (2.0f * Q);
    float A = std::pow(10.0f, gain_db / 40.0f);
    
    float b0, b1, b2, a0, a1, a2;
    
    switch (type) {
        case LOWPASS:
            b0 = (1.0f - cos_omega) / 2.0f;
            b1 = 1.0f - cos_omega;
            b2 = (1.0f - cos_omega) / 2.0f;
            a0 = 1.0f + alpha;
            a1 = -2.0f * cos_omega;
            a2 = 1.0f - alpha;
            break;
            
        case HIGHPASS:
            b0 = (1.0f + cos_omega) / 2.0f;
            b1 = -(1.0f + cos_omega);
            b2 = (1.0f + cos_omega) / 2.0f;
            a0 = 1.0f + alpha;
            a1 = -2.0f * cos_omega;
            a2 = 1.0f - alpha;
            break;
            
        case PEAK: // Pour EQ paramétrique
            b0 = 1.0f + alpha * A;
            b1 = -2.0f * cos_omega;
            b2 = 1.0f - alpha * A;
            a0 = 1.0f + alpha / A;
            a1 = -2.0f * cos_omega;
            a2 = 1.0f - alpha / A;
            break;
            
        case LOWSHELF:
            {
                                 // float S = 1.0f;
                 float beta = std::sqrt(A) / Q;
                
                b0 = A * ((A + 1.0f) - (A - 1.0f) * cos_omega + beta * sin_omega);
                b1 = 2.0f * A * ((A - 1.0f) - (A + 1.0f) * cos_omega);
                b2 = A * ((A + 1.0f) - (A - 1.0f) * cos_omega - beta * sin_omega);
                a0 = (A + 1.0f) + (A - 1.0f) * cos_omega + beta * sin_omega;
                a1 = -2.0f * ((A - 1.0f) + (A + 1.0f) * cos_omega);
                a2 = (A + 1.0f) + (A - 1.0f) * cos_omega - beta * sin_omega;
            }
            break;
            
        case HIGHSHELF:
            {
                                 // float S = 1.0f;
                 float beta = std::sqrt(A) / Q;
                
                b0 = A * ((A + 1.0f) + (A - 1.0f) * cos_omega + beta * sin_omega);
                b1 = -2.0f * A * ((A - 1.0f) + (A + 1.0f) * cos_omega);
                b2 = A * ((A + 1.0f) + (A - 1.0f) * cos_omega - beta * sin_omega);
                a0 = (A + 1.0f) - (A - 1.0f) * cos_omega + beta * sin_omega;
                a1 = 2.0f * ((A - 1.0f) - (A + 1.0f) * cos_omega);
                a2 = (A + 1.0f) - (A - 1.0f) * cos_omega - beta * sin_omega;
            }
            break;
            
        default: // Bypass
            b0 = 1.0f; b1 = 0.0f; b2 = 0.0f;
            a0 = 1.0f; a1 = 0.0f; a2 = 0.0f;
            break;
    }
    
    // Normaliser par a0
    b0_ = b0 / a0;
    b1_ = b1 / a0;
    b2_ = b2 / a0;
    a1_ = a1 / a0;
    a2_ = a2 / a0;
}

float BiquadFilter::Process(float input) {
    float output = b0_ * input + b1_ * x1_ + b2_ * x2_ - a1_ * y1_ - a2_ * y2_;
    
    // Mettre à jour l'historique
    x2_ = x1_;
    x1_ = input;
    y2_ = y1_;
    y1_ = output;
    
    return output;
}

void BiquadFilter::ProcessBuffer(const float* input, float* output, size_t samples) {
    for (size_t i = 0; i < samples; ++i) {
        output[i] = Process(input[i]);
    }
}

void BiquadFilter::ProcessBufferInPlace(float* data, size_t samples) {
    for (size_t i = 0; i < samples; ++i) {
        data[i] = Process(data[i]);
    }
}

void BiquadFilter::Reset() {
    x1_ = x2_ = y1_ = y2_ = 0.0f;
}

// ========================================
// DELAY LINE IMPLEMENTATION
// ========================================

DelayLine::DelayLine(size_t max_delay_samples)
    : buffer_(max_delay_samples, 0.0f), max_delay_(max_delay_samples) {}

void DelayLine::SetDelay(float delay_samples) {
    delay_samples_ = std::clamp(delay_samples, 0.0f, static_cast<float>(max_delay_ - 1));
}

float DelayLine::Read() const {
    size_t delay_int = static_cast<size_t>(delay_samples_);
    size_t read_pos = (write_pos_ + buffer_.size() - delay_int) % buffer_.size();
    return buffer_[read_pos];
}

float DelayLine::ReadInterpolated() const {
    float delay_frac = delay_samples_ - std::floor(delay_samples_);
    size_t delay_int = static_cast<size_t>(delay_samples_);
    
    size_t read_pos1 = (write_pos_ + buffer_.size() - delay_int) % buffer_.size();
    size_t read_pos2 = (read_pos1 + buffer_.size() - 1) % buffer_.size();
    
    float sample1 = buffer_[read_pos1];
    float sample2 = buffer_[read_pos2];
    
    return sample1 + delay_frac * (sample2 - sample1);
}

void DelayLine::Write(float sample) {
    buffer_[write_pos_] = sample;
    write_pos_ = (write_pos_ + 1) % buffer_.size();
}

float DelayLine::Process(float input, float delay_samples) {
    SetDelay(delay_samples);
    float output = ReadInterpolated();
    Write(input);
    return output;
}

void DelayLine::Clear() {
    std::fill(buffer_.begin(), buffer_.end(), 0.0f);
    write_pos_ = 0;
}

// ========================================
// PARAMETRIC EQUALIZER IMPLEMENTATION
// ========================================

ParametricEqualizer::ParametricEqualizer() {
    InitializeDefaultBands();
}

bool ParametricEqualizer::Initialize(const AudioConfig& config) {
    config_ = config;
    UpdateFilters();
    return true;
}

void ParametricEqualizer::Process(float* data, size_t frames) {
    if (!enabled_) {
        return;
    }
    
    CheckFrameCount(frames);
    
    for (size_t band = 0; band < kNumBands; ++band) {
        if (!bands_[band].enabled) {
            continue;
        }
        
        // Traiter chaque canal
        for (size_t ch = 0; ch < config_.channels; ++ch) {
            for (size_t frame = 0; frame < frames; ++frame) {
                size_t sample_idx = frame * config_.channels + ch;
                data[sample_idx] = filters_[band][ch].Process(data[sample_idx]);
            }
        }
    }
}

void ParametricEqualizer::Reset() {
    for (auto& band_filters : filters_) {
        for (auto& filter : band_filters) {
            filter.Reset();
        }
    }
}

std::unordered_map<std::string, DSPParameter> ParametricEqualizer::GetParameters() const {
    std::unordered_map<std::string, DSPParameter> params;
    
    for (size_t i = 0; i < kNumBands; ++i) {
        std::string prefix = "band" + std::to_string(i) + "_";
        
        params.emplace(prefix + "frequency", DSPParameter(
            prefix + "frequency", bands_[i].frequency, 20.0f, 20000.0f, "Hz"
        ));
        params.at(prefix + "frequency").is_logarithmic = true;
        
        params.emplace(prefix + "gain", DSPParameter(
            prefix + "gain", bands_[i].gain_db, -24.0f, 24.0f, "dB"
        ));
        
        params.emplace(prefix + "q", DSPParameter(
            prefix + "q", bands_[i].q_factor, 0.1f, 10.0f, ""
        ));
        params.at(prefix + "q").is_logarithmic = true;
        
        params.emplace(prefix + "enabled", DSPParameter(
            prefix + "enabled", bands_[i].enabled ? 1.0f : 0.0f, 0.0f, 1.0f, ""
        ));
    }
    
    return params;
}

bool ParametricEqualizer::SetParameter(const std::string& name, float value) {
    // Parser le nom du paramètre
    size_t band_pos = name.find("band");
    if (band_pos == std::string::npos) {
        return false;
    }
    
    size_t underscore_pos = name.find("_", band_pos);
    if (underscore_pos == std::string::npos) {
        return false;
    }
    
    size_t band_num = std::stoul(name.substr(band_pos + 4, underscore_pos - band_pos - 4));
    if (band_num >= kNumBands) {
        return false;
    }
    
    std::string param_name = name.substr(underscore_pos + 1);
    
    if (param_name == "frequency") {
        bands_[band_num].frequency = std::clamp(value, 20.0f, 20000.0f);
    } else if (param_name == "gain") {
        bands_[band_num].gain_db = std::clamp(value, -24.0f, 24.0f);
    } else if (param_name == "q") {
        bands_[band_num].q_factor = std::clamp(value, 0.1f, 10.0f);
    } else if (param_name == "enabled") {
        bands_[band_num].enabled = value > 0.5f;
    } else {
        return false;
    }
    
    UpdateFilters();
    return true;
}

float ParametricEqualizer::GetParameter(const std::string& name) const {
    // Même logique de parsing que SetParameter
    size_t band_pos = name.find("band");
    if (band_pos == std::string::npos) return 0.0f;
    
    size_t underscore_pos = name.find("_", band_pos);
    if (underscore_pos == std::string::npos) return 0.0f;
    
    size_t band_num = std::stoul(name.substr(band_pos + 4, underscore_pos - band_pos - 4));
    if (band_num >= kNumBands) return 0.0f;
    
    std::string param_name = name.substr(underscore_pos + 1);
    
    if (param_name == "frequency") {
        return bands_[band_num].frequency;
    } else if (param_name == "gain") {
        return bands_[band_num].gain_db;
    } else if (param_name == "q") {
        return bands_[band_num].q_factor;
    } else if (param_name == "enabled") {
        return bands_[band_num].enabled ? 1.0f : 0.0f;
    }
    
    return 0.0f;
}

std::vector<DSPPreset> ParametricEqualizer::GetAvailablePresets() const {
    return {
        DSPPreset("Flat", EffectType::EQUALIZER, "Neutral"),
        DSPPreset("Voice Enhancement", EffectType::EQUALIZER, "Voice"),
        DSPPreset("Music Master", EffectType::EQUALIZER, "Music"),
        DSPPreset("Bass Boost", EffectType::EQUALIZER, "Bass"),
        DSPPreset("Presence Boost", EffectType::EQUALIZER, "Presence")
    };
}

void ParametricEqualizer::SetBand(size_t band_index, float frequency, float gain_db, float q) {
    if (band_index < kNumBands) {
        bands_[band_index].frequency = frequency;
        bands_[band_index].gain_db = gain_db;
        bands_[band_index].q_factor = q;
        UpdateFilters();
    }
}

ParametricEqualizer::EQBand ParametricEqualizer::GetBand(size_t band_index) const {
    if (band_index < kNumBands) {
        return bands_[band_index];
    }
    return {0.0f, 0.0f, 0.0f, false, BiquadFilter::PEAK};
}

void ParametricEqualizer::SetBandEnabled(size_t band_index, bool enabled) {
    if (band_index < kNumBands) {
        bands_[band_index].enabled = enabled;
    }
}

void ParametricEqualizer::UpdateFilters() {
    for (size_t band = 0; band < kNumBands; ++band) {
        for (size_t ch = 0; ch < 2; ++ch) { // Stéréo max
            filters_[band][ch].Configure(
                bands_[band].type,
                bands_[band].frequency,
                config_.sample_rate,
                bands_[band].q_factor,
                bands_[band].gain_db
            );
        }
    }
}

void ParametricEqualizer::InitializeDefaultBands() {
    // Configuration 10 bandes typique
    const std::array<float, kNumBands> default_frequencies = {
        31.25f, 62.5f, 125.0f, 250.0f, 500.0f, 
        1000.0f, 2000.0f, 4000.0f, 8000.0f, 16000.0f
    };
    
    for (size_t i = 0; i < kNumBands; ++i) {
        bands_[i].frequency = default_frequencies[i];
        bands_[i].gain_db = 0.0f;
        bands_[i].q_factor = 0.707f;
        bands_[i].enabled = true;
        bands_[i].type = BiquadFilter::PEAK;
    }
    
    // Ajuster les types pour les bandes extrêmes
    bands_[0].type = BiquadFilter::LOWSHELF;
    bands_[kNumBands - 1].type = BiquadFilter::HIGHSHELF;
}

void ParametricEqualizer::ApplyVoicePreset() {
    // Preset optimisé pour la voix
    for (size_t i = 0; i < kNumBands; ++i) {
        bands_[i].gain_db = 0.0f;
    }
    
    // Boost présence (2-4kHz)
    SetBand(6, 2000.0f, 3.0f, 1.0f);  // 2kHz
    SetBand(7, 4000.0f, 2.0f, 1.0f);  // 4kHz
    
    // Cut léger dans les graves
    SetBand(0, 80.0f, -2.0f, 0.7f);
    SetBand(1, 120.0f, -1.0f, 0.7f);
}

void ParametricEqualizer::ApplyMusicPreset() {
    // Preset "smile curve" pour la musique
    for (size_t i = 0; i < kNumBands; ++i) {
        bands_[i].gain_db = 0.0f;
    }
    
    // Boost graves
    SetBand(0, 60.0f, 2.0f, 0.7f);
    SetBand(1, 120.0f, 1.5f, 0.7f);
    
    // Boost aigus
    SetBand(8, 8000.0f, 1.5f, 0.7f);
    SetBand(9, 16000.0f, 2.0f, 0.7f);
    
    // Léger cut dans les mediums
    SetBand(4, 500.0f, -0.5f, 1.0f);
    SetBand(5, 1000.0f, -0.5f, 1.0f);
}

void ParametricEqualizer::ApplyBassBoostPreset() {
    for (size_t i = 0; i < kNumBands; ++i) {
        bands_[i].gain_db = 0.0f;
    }
    
    // Boost significatif dans les graves
    SetBand(0, 40.0f, 6.0f, 0.7f);
    SetBand(1, 80.0f, 4.0f, 0.7f);
    SetBand(2, 160.0f, 2.0f, 0.7f);
}

void ParametricEqualizer::ApplyPresencePreset() {
    for (size_t i = 0; i < kNumBands; ++i) {
        bands_[i].gain_db = 0.0f;
    }
    
    // Boost présence et brillance
    SetBand(6, 3000.0f, 3.0f, 1.5f);
    SetBand(7, 5000.0f, 2.0f, 1.5f);
    SetBand(8, 8000.0f, 1.5f, 1.0f);
}

// ========================================
// BASE DSP PROCESSOR IMPLEMENTATION
// ========================================

void AudioDSPProcessor::Process(const float* input, float* output, size_t frames) {
    if (input != output) {
        // Copier l'entrée vers la sortie puis traiter en place
        size_t total_samples = frames * config_.channels;
        std::memcpy(output, input, total_samples * sizeof(float));
    }
    Process(output, frames);
}

bool AudioDSPProcessor::ApplyPreset(const DSPPreset& preset) {
    if (preset.effect_type != GetEffectType()) {
        return false;
    }
    
    for (const auto& param_pair : preset.parameters) {
        if (!SetParameter(param_pair.first, param_pair.second)) {
            return false;
        }
    }
    
    return true;
}

void AudioDSPProcessor::ValidateConfig() const {
    if (config_.sample_rate == 0 || config_.channels == 0) {
        throw std::invalid_argument("Configuration audio invalide");
    }
}

void AudioDSPProcessor::CheckFrameCount(size_t frames) const {
    if (frames == 0) {
        throw std::invalid_argument("Nombre de frames invalide");
    }
}

// NOTE: Les autres implémentations (DynamicsProcessor, AlgorithmicReverb, etc.) 
// suivraient le même pattern. Pour l'instant, on se concentre sur les bases.

} // namespace audio::dsp