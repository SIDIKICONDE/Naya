#pragma once

#include <memory>
#include <vector>
#include <string>
#include <unordered_map>
#include <functional>
#include "AudioStructs.h"

namespace audio::dsp {

/**
 * Types d'effets DSP disponibles
 */
enum class EffectType {
    EQUALIZER,       // Égaliseur paramétrique/graphique
    COMPRESSOR,      // Compresseur/limiteur
    REVERB,          // Réverbération
    DELAY,           // Delay/echo
    DISTORTION,      // Saturation/distortion
    GATE,            // Noise gate
    FILTER,          // Filtres passe-haut/bas/bande
    CHORUS,          // Chorus/flanger
    PHASER,          // Phaser
    BITCRUSHER,      // Bitcrusher/lo-fi
    STEREO_ENHANCER, // Élargissement stéréo
    LIMITER          // Limiteur de pic
};

/**
 * Paramètre DSP générique avec validation
 */
struct DSPParameter {
    std::string name;           // Nom du paramètre
    float value;                // Valeur actuelle
    float min_value;            // Valeur minimale
    float max_value;            // Valeur maximale
    float default_value;        // Valeur par défaut
    std::string unit;           // Unité (dB, Hz, %, ms, etc.)
    std::string description;    // Description lisible
    
    // Validation et contraintes
    bool is_logarithmic = false;    // Échelle logarithmique
    float step_size = 0.01f;        // Incrément recommandé
    std::vector<float> preset_values;  // Valeurs prédéfinies
    
    DSPParameter() = default;
    
    DSPParameter(const std::string& name, float value, float min_val, float max_val,
                const std::string& unit = "", const std::string& desc = "")
        : name(name), value(value), min_value(min_val), max_value(max_val)
        , default_value(value), unit(unit), description(desc) {}
    
    bool IsValid() const {
        return value >= min_value && value <= max_value;
    }
    
    void Clamp() {
        value = std::clamp(value, min_value, max_value);
    }
    
    float GetNormalized() const {
        if (is_logarithmic) {
            float log_min = std::log10(min_value);
            float log_max = std::log10(max_value);
            float log_val = std::log10(value);
            return (log_val - log_min) / (log_max - log_min);
        } else {
            return (value - min_value) / (max_value - min_value);
        }
    }
    
    void SetFromNormalized(float normalized) {
        normalized = std::clamp(normalized, 0.0f, 1.0f);
        
        if (is_logarithmic) {
            float log_min = std::log10(min_value);
            float log_max = std::log10(max_value);
            float log_val = log_min + normalized * (log_max - log_min);
            value = std::pow(10.0f, log_val);
        } else {
            value = min_value + normalized * (max_value - min_value);
        }
    }
};

/**
 * Configuration de preset DSP
 */
struct DSPPreset {
    std::string name;           // Nom du preset
    std::string description;    // Description
    std::string category;       // Catégorie (Music, Voice, etc.)
    EffectType effect_type;     // Type d'effet
    std::unordered_map<std::string, float> parameters;  // Valeurs des paramètres
    
    DSPPreset(const std::string& name, EffectType type, const std::string& category = "")
        : name(name), category(category), effect_type(type) {}
};

/**
 * Interface de base pour tous les effets DSP
 */
class AudioDSPProcessor {
public:
    virtual ~AudioDSPProcessor() = default;
    
    /**
     * Initialise le processeur avec la configuration audio
     * @param config Configuration audio (sample rate, channels, etc.)
     * @return true si l'initialisation réussit
     */
    virtual bool Initialize(const AudioConfig& config) = 0;
    
    /**
     * Traite un buffer audio en place
     * @param data Données audio float32 entrelacé (in/out)
     * @param frames Nombre de frames audio
     */
    virtual void Process(float* data, size_t frames) = 0;
    
    /**
     * Traite un buffer audio séparé entrée/sortie
     * @param input Données d'entrée
     * @param output Données de sortie (peut être == input)
     * @param frames Nombre de frames
     */
    virtual void Process(const float* input, float* output, size_t frames);
    
    /**
     * Active ou désactive l'effet (bypass)
     * @param enabled true pour activer
     */
    virtual void SetEnabled(bool enabled) { enabled_ = enabled; }
    
    /**
     * Vérifie si l'effet est activé
     * @return true si activé
     */
    virtual bool IsEnabled() const { return enabled_; }
    
    /**
     * Remet à zéro l'état interne (buffers, délais, etc.)
     */
    virtual void Reset() = 0;
    
    /**
     * Obtient le type d'effet
     * @return Type de cet effet
     */
    virtual EffectType GetEffectType() const = 0;
    
    /**
     * Obtient le nom de l'effet
     * @return Nom lisible
     */
    virtual std::string GetEffectName() const = 0;
    
    /**
     * Obtient tous les paramètres disponibles
     * @return Map des paramètres par nom
     */
    virtual std::unordered_map<std::string, DSPParameter> GetParameters() const = 0;
    
    /**
     * Définit la valeur d'un paramètre
     * @param name Nom du paramètre
     * @param value Nouvelle valeur
     * @return true si le paramètre existe et a été mis à jour
     */
    virtual bool SetParameter(const std::string& name, float value) = 0;
    
    /**
     * Obtient la valeur d'un paramètre
     * @param name Nom du paramètre
     * @return Valeur actuelle, ou 0.0f si non trouvé
     */
    virtual float GetParameter(const std::string& name) const = 0;
    
    /**
     * Applique un preset
     * @param preset Configuration à appliquer
     * @return true si appliqué avec succès
     */
    virtual bool ApplyPreset(const DSPPreset& preset);
    
    /**
     * Obtient les presets disponibles pour cet effet
     * @return Vector des presets
     */
    virtual std::vector<DSPPreset> GetAvailablePresets() const = 0;
    
    /**
     * Obtient la latence introduite par l'effet
     * @return Latence en échantillons
     */
    virtual size_t GetLatency() const { return 0; }
    
    /**
     * Obtient les métriques de performance en temps réel
     */
    struct ProcessingMetrics {
        double cpu_usage_percent = 0.0;    // Usage CPU
        size_t memory_usage_bytes = 0;     // Mémoire utilisée
        double average_process_time_us = 0.0;  // Temps moyen de traitement
        size_t buffers_processed = 0;      // Buffers traités
    };
    
    virtual ProcessingMetrics GetMetrics() const { return {}; }
    
protected:
    bool enabled_ = true;
    AudioConfig config_;
    
    // Utilitaires pour les sous-classes
    void ValidateConfig() const;
    void CheckFrameCount(size_t frames) const;
};

/**
 * Pipeline de traitement DSP - chaîne d'effets
 */
class AudioDSPPipeline {
public:
    AudioDSPPipeline() = default;
    ~AudioDSPPipeline() = default;
    
    /**
     * Initialise le pipeline avec la configuration audio
     * @param config Configuration audio
     * @return true si l'initialisation réussit
     */
    bool Initialize(const AudioConfig& config);
    
    /**
     * Ajoute un effet à la fin du pipeline
     * @param processor Effet à ajouter
     * @return ID de l'effet dans le pipeline
     */
    size_t AddEffect(std::unique_ptr<AudioDSPProcessor> processor);
    
    /**
     * Insère un effet à une position spécifique
     * @param position Position d'insertion (0 = début)
     * @param processor Effet à insérer
     * @return ID de l'effet
     */
    size_t InsertEffect(size_t position, std::unique_ptr<AudioDSPProcessor> processor);
    
    /**
     * Supprime un effet par ID
     * @param effect_id ID de l'effet
     * @return true si supprimé
     */
    bool RemoveEffect(size_t effect_id);
    
    /**
     * Déplace un effet dans le pipeline
     * @param effect_id ID de l'effet
     * @param new_position Nouvelle position
     * @return true si déplacé
     */
    bool MoveEffect(size_t effect_id, size_t new_position);
    
    /**
     * Obtient un effet par ID
     * @param effect_id ID de l'effet
     * @return Pointeur vers l'effet, ou nullptr
     */
    AudioDSPProcessor* GetEffect(size_t effect_id);
    
    /**
     * Obtient un effet par type (premier trouvé)
     * @param type Type d'effet recherché
     * @return Pointeur vers l'effet, ou nullptr
     */
    AudioDSPProcessor* GetEffectByType(EffectType type);
    
    /**
     * Traite un buffer audio à travers tout le pipeline
     * @param data Données audio (in/out)
     * @param frames Nombre de frames
     */
    void Process(float* data, size_t frames);
    
    /**
     * Active ou désactive le pipeline entier
     * @param enabled true pour activer
     */
    void SetEnabled(bool enabled) { enabled_ = enabled; }
    
    /**
     * Vérifie si le pipeline est activé
     * @return true si activé
     */
    bool IsEnabled() const { return enabled_; }
    
    /**
     * Remet à zéro tous les effets
     */
    void Reset();
    
    /**
     * Obtient la liste des effets actifs
     * @return Vector des IDs d'effets
     */
    std::vector<size_t> GetActiveEffects() const;
    
    /**
     * Obtient la latence totale du pipeline
     * @return Latence en échantillons
     */
    size_t GetTotalLatency() const;
    
    /**
     * Applique un preset de pipeline complet
     * @param preset_name Nom du preset
     * @return true si appliqué
     */
    bool ApplyPipelinePreset(const std::string& preset_name);
    
    /**
     * Sauvegarde la configuration actuelle comme preset
     * @param preset_name Nom du nouveau preset
     * @return true si sauvegardé
     */
    bool SaveCurrentAsPreset(const std::string& preset_name);
    
    /**
     * Obtient les métriques de performance du pipeline
     * @return Métriques agrégées
     */
    AudioDSPProcessor::ProcessingMetrics GetPipelineMetrics() const;
    
private:
    struct EffectSlot {
        size_t id;
        std::unique_ptr<AudioDSPProcessor> processor;
        bool enabled = true;
    };
    
    std::vector<EffectSlot> effects_;
    size_t next_effect_id_ = 1;
    bool enabled_ = true;
    bool initialized_ = false;
    AudioConfig config_;
    
    // Buffer temporaire pour le traitement
    std::vector<float> temp_buffer_;
};

/**
 * Factory pour créer les processeurs DSP
 */
class AudioDSPFactory {
public:
    /**
     * Crée un processeur pour le type d'effet spécifié
     * @param type Type d'effet
     * @return Instance unique_ptr du processeur
     */
    static std::unique_ptr<AudioDSPProcessor> CreateProcessor(EffectType type);
    
    /**
     * Obtient la liste des types d'effets supportés
     * @return Vector des types disponibles
     */
    static std::vector<EffectType> GetSupportedEffects();
    
    /**
     * Crée un pipeline avec des effets prédéfinis
     * @param preset_name Nom du preset de pipeline
     * @return Pipeline configuré
     */
    static std::unique_ptr<AudioDSPPipeline> CreatePipelinePreset(const std::string& preset_name);
    
    /**
     * Obtient les presets de pipeline disponibles
     * @return Vector des noms de presets
     */
    static std::vector<std::string> GetAvailablePipelinePresets();
    
    /**
     * Vérifie si un type d'effet est supporté
     * @param type Type à vérifier
     * @return true si supporté
     */
    static bool IsEffectSupported(EffectType type);
    
    /**
     * Obtient le nom lisible d'un type d'effet
     * @param type Type d'effet
     * @return Nom lisible
     */
    static std::string GetEffectTypeName(EffectType type);
};

/**
 * Utilitaires DSP communs
 */
namespace dsp_utils {
    
    /**
     * Convertit une fréquence en coefficient de filtre
     * @param frequency Fréquence en Hz
     * @param sample_rate Taux d'échantillonnage
     * @return Coefficient normalisé
     */
    float FrequencyToCoefficient(float frequency, float sample_rate);
    
    /**
     * Convertit des dB en gain linéaire
     * @param db Gain en décibels
     * @return Gain linéaire
     */
    float DbToGain(float db);
    
    /**
     * Convertit un gain linéaire en dB
     * @param gain Gain linéaire
     * @return Gain en décibels
     */
    float GainToDb(float gain);
    
    /**
     * Applique un fade in/out linéaire
     * @param data Buffer audio
     * @param frames Nombre de frames
     * @param channels Nombre de canaux
     * @param fade_samples Nombre d'échantillons de fade
     * @param fade_in true pour fade in, false pour fade out
     */
    void ApplyFade(float* data, size_t frames, size_t channels, 
                   size_t fade_samples, bool fade_in);
    
    /**
     * Applique un gain avec ramping pour éviter les clics
     * @param data Buffer audio
     * @param frames Nombre de frames
     * @param channels Nombre de canaux
     * @param old_gain Ancien gain
     * @param new_gain Nouveau gain
     */
    void ApplyGainRamp(float* data, size_t frames, size_t channels,
                       float old_gain, float new_gain);
    
    /**
     * Calcule le niveau RMS d'un buffer
     * @param data Buffer audio
     * @param frames Nombre de frames
     * @param channels Nombre de canaux
     * @return Niveau RMS
     */
    float CalculateRMS(const float* data, size_t frames, size_t channels);
    
    /**
     * Calcule le niveau de pic d'un buffer
     * @param data Buffer audio
     * @param frames Nombre de frames
     * @param channels Nombre de canaux
     * @return Niveau de pic
     */
    float CalculatePeak(const float* data, size_t frames, size_t channels);
    
} // namespace dsp_utils

} // namespace audio::dsp