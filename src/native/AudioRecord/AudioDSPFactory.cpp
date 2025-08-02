#include "AudioDSPInterface.h"
#include "AudioDSPProcessors.h"

namespace audio::dsp {

// ========================================
// AUDIO DSP FACTORY IMPLEMENTATION
// ========================================

std::unique_ptr<AudioDSPProcessor> AudioDSPFactory::CreateProcessor(EffectType type) {
    switch (type) {
        case EffectType::EQUALIZER:
            return std::make_unique<ParametricEqualizer>();
            
        case EffectType::COMPRESSOR:
            // return std::make_unique<DynamicsProcessor>();
            // TODO: Implémenter DynamicsProcessor
            return nullptr;
            
        case EffectType::REVERB:
            // return std::make_unique<AlgorithmicReverb>();
            // TODO: Implémenter AlgorithmicReverb
            return nullptr;
            
        case EffectType::DELAY:
            // return std::make_unique<MultiTapDelay>();
            // TODO: Implémenter MultiTapDelay
            return nullptr;
            
        case EffectType::DISTORTION:
            // return std::make_unique<DistortionProcessor>();
            // TODO: Implémenter DistortionProcessor
            return nullptr;
            
        default:
            return nullptr;
    }
}

std::vector<EffectType> AudioDSPFactory::GetSupportedEffects() {
    return {
        EffectType::EQUALIZER
        // TODO: Ajouter les autres types quand implémentés
        // EffectType::COMPRESSOR,
        // EffectType::REVERB,
        // EffectType::DELAY,
        // EffectType::DISTORTION
    };
}

std::unique_ptr<AudioDSPPipeline> AudioDSPFactory::CreatePipelinePreset(const std::string& preset_name) {
    auto pipeline = std::make_unique<AudioDSPPipeline>();
    
    if (preset_name == "Voice Processing") {
        // Pipeline optimisé pour la voix
        auto eq = CreateProcessor(EffectType::EQUALIZER);
        if (eq) {
            auto* param_eq = static_cast<ParametricEqualizer*>(eq.get());
            param_eq->ApplyVoicePreset();
            pipeline->AddEffect(std::move(eq));
        }
        
        // TODO: Ajouter compresseur et gate pour la voix
        
    } else if (preset_name == "Music Master") {
        // Pipeline pour mastering musical
        auto eq = CreateProcessor(EffectType::EQUALIZER);
        if (eq) {
            auto* param_eq = static_cast<ParametricEqualizer*>(eq.get());
            param_eq->ApplyMusicPreset();
            pipeline->AddEffect(std::move(eq));
        }
        
        // TODO: Ajouter compresseur et limiteur
        
    } else if (preset_name == "Podcast") {
        // Pipeline optimisé podcast
        auto eq = CreateProcessor(EffectType::EQUALIZER);
        if (eq) {
            pipeline->AddEffect(std::move(eq));
        }
        
        // TODO: Ajouter gate, compresseur, de-esser
        
    } else if (preset_name == "Live Performance") {
        // Pipeline pour performance live
        
        // TODO: EQ + compresseur + reverb + limiteur
        
    } else {
        // Pipeline par défaut (EQ flat)
        auto eq = CreateProcessor(EffectType::EQUALIZER);
        if (eq) {
            pipeline->AddEffect(std::move(eq));
        }
    }
    
    return pipeline;
}

std::vector<std::string> AudioDSPFactory::GetAvailablePipelinePresets() {
    return {
        "Voice Processing",
        "Music Master", 
        "Podcast",
        "Live Performance",
        "Default"
    };
}

bool AudioDSPFactory::IsEffectSupported(EffectType type) {
    auto supported = GetSupportedEffects();
    return std::find(supported.begin(), supported.end(), type) != supported.end();
}

std::string AudioDSPFactory::GetEffectTypeName(EffectType type) {
    switch (type) {
        case EffectType::EQUALIZER: return "Parametric Equalizer";
        case EffectType::COMPRESSOR: return "Dynamics Processor";
        case EffectType::REVERB: return "Algorithmic Reverb";
        case EffectType::DELAY: return "Multi-Tap Delay";
        case EffectType::DISTORTION: return "Distortion/Saturation";
        case EffectType::GATE: return "Noise Gate";
        case EffectType::FILTER: return "Filter";
        case EffectType::CHORUS: return "Chorus/Flanger";
        case EffectType::PHASER: return "Phaser";
        case EffectType::BITCRUSHER: return "Bitcrusher";
        case EffectType::STEREO_ENHANCER: return "Stereo Enhancer";
        case EffectType::LIMITER: return "Peak Limiter";
        default: return "Unknown Effect";
    }
}

// ========================================
// AUDIO DSP PIPELINE IMPLEMENTATION
// ========================================

bool AudioDSPPipeline::Initialize(const AudioConfig& config) {
    config_ = config;
    
    // Réserver un buffer temporaire pour le traitement
    temp_buffer_.resize(config.buffer_size * config.channels);
    
    // Initialiser tous les effets existants
    for (auto& slot : effects_) {
        if (slot.processor && !slot.processor->Initialize(config)) {
            return false;
        }
    }
    
    initialized_ = true;
    return true;
}

size_t AudioDSPPipeline::AddEffect(std::unique_ptr<AudioDSPProcessor> processor) {
    if (!processor) {
        return 0;
    }
    
    size_t effect_id = next_effect_id_++;
    
    EffectSlot slot;
    slot.id = effect_id;
    slot.processor = std::move(processor);
    slot.enabled = true;
    
    if (initialized_) {
        slot.processor->Initialize(config_);
    }
    
    effects_.push_back(std::move(slot));
    
    return effect_id;
}

size_t AudioDSPPipeline::InsertEffect(size_t position, std::unique_ptr<AudioDSPProcessor> processor) {
    if (!processor) {
        return 0;
    }
    
    size_t effect_id = next_effect_id_++;
    
    EffectSlot slot;
    slot.id = effect_id;
    slot.processor = std::move(processor);
    slot.enabled = true;
    
    if (initialized_) {
        slot.processor->Initialize(config_);
    }
    
    position = std::min(position, effects_.size());
    effects_.insert(effects_.begin() + position, std::move(slot));
    
    return effect_id;
}

bool AudioDSPPipeline::RemoveEffect(size_t effect_id) {
    auto it = std::find_if(effects_.begin(), effects_.end(),
        [effect_id](const EffectSlot& slot) { return slot.id == effect_id; });
    
    if (it != effects_.end()) {
        effects_.erase(it);
        return true;
    }
    
    return false;
}

bool AudioDSPPipeline::MoveEffect(size_t effect_id, size_t new_position) {
    auto it = std::find_if(effects_.begin(), effects_.end(),
        [effect_id](const EffectSlot& slot) { return slot.id == effect_id; });
    
    if (it == effects_.end()) {
        return false;
    }
    
    EffectSlot slot = std::move(*it);
    effects_.erase(it);
    
    new_position = std::min(new_position, effects_.size());
    effects_.insert(effects_.begin() + new_position, std::move(slot));
    
    return true;
}

AudioDSPProcessor* AudioDSPPipeline::GetEffect(size_t effect_id) {
    auto it = std::find_if(effects_.begin(), effects_.end(),
        [effect_id](const EffectSlot& slot) { return slot.id == effect_id; });
    
    return (it != effects_.end()) ? it->processor.get() : nullptr;
}

AudioDSPProcessor* AudioDSPPipeline::GetEffectByType(EffectType type) {
    for (auto& slot : effects_) {
        if (slot.processor && slot.processor->GetEffectType() == type) {
            return slot.processor.get();
        }
    }
    return nullptr;
}

void AudioDSPPipeline::Process(float* data, size_t frames) {
    if (!enabled_ || !initialized_) {
        return;
    }
    
    // Traiter séquentiellement chaque effet
    for (auto& slot : effects_) {
        if (slot.enabled && slot.processor && slot.processor->IsEnabled()) {
            slot.processor->Process(data, frames);
        }
    }
}

void AudioDSPPipeline::Reset() {
    for (auto& slot : effects_) {
        if (slot.processor) {
            slot.processor->Reset();
        }
    }
}

std::vector<size_t> AudioDSPPipeline::GetActiveEffects() const {
    std::vector<size_t> active_ids;
    
    for (const auto& slot : effects_) {
        if (slot.enabled && slot.processor && slot.processor->IsEnabled()) {
            active_ids.push_back(slot.id);
        }
    }
    
    return active_ids;
}

size_t AudioDSPPipeline::GetTotalLatency() const {
    size_t total_latency = 0;
    
    for (const auto& slot : effects_) {
        if (slot.enabled && slot.processor && slot.processor->IsEnabled()) {
            total_latency += slot.processor->GetLatency();
        }
    }
    
    return total_latency;
}

bool AudioDSPPipeline::ApplyPipelinePreset(const std::string& preset_name) {
    // Sauvegarder la config actuelle
    AudioConfig saved_config = config_;
    bool was_initialized = initialized_;
    
    // Vider le pipeline
    effects_.clear();
    next_effect_id_ = 1;
    
    // Créer le nouveau pipeline
    auto new_pipeline = AudioDSPFactory::CreatePipelinePreset(preset_name);
    if (!new_pipeline) {
        return false;
    }
    
    // Copier les effets du nouveau pipeline
    effects_ = std::move(new_pipeline->effects_);
    next_effect_id_ = new_pipeline->next_effect_id_;
    
    // Réinitialiser si nécessaire
    if (was_initialized) {
        return Initialize(saved_config);
    }
    
    return true;
}

bool AudioDSPPipeline::SaveCurrentAsPreset(const std::string& /*preset_name*/) {
    // TODO: Implémenter la sauvegarde de presets
    // Nécessiterait un système de persistance
    return false;
}

AudioDSPProcessor::ProcessingMetrics AudioDSPPipeline::GetPipelineMetrics() const {
    AudioDSPProcessor::ProcessingMetrics aggregated;
    
    for (const auto& slot : effects_) {
        if (slot.processor) {
            auto metrics = slot.processor->GetMetrics();
            aggregated.cpu_usage_percent += metrics.cpu_usage_percent;
            aggregated.memory_usage_bytes += metrics.memory_usage_bytes;
            aggregated.average_process_time_us += metrics.average_process_time_us;
            aggregated.buffers_processed = std::max(aggregated.buffers_processed, metrics.buffers_processed);
        }
    }
    
    return aggregated;
}

} // namespace audio::dsp