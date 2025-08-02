#include "gtest/gtest.h"
#include "gmock/gmock.h"
#include "../AudioDSPInterface.h"
#include "../AudioDSPProcessors.h"
#include <cmath>
#include <algorithm>

using namespace audio::dsp;
using namespace testing;

// ========================================
// TESTS POUR DSP PARAMETER
// ========================================

class DSPParameterTest : public Test {};

TEST_F(DSPParameterTest, BasicFunctionality) {
    DSPParameter param("gain", 0.5f, 0.0f, 1.0f, "linear", "Test gain parameter");
    
    EXPECT_EQ(param.name, "gain");
    EXPECT_FLOAT_EQ(param.value, 0.5f);
    EXPECT_FLOAT_EQ(param.min_value, 0.0f);
    EXPECT_FLOAT_EQ(param.max_value, 1.0f);
    EXPECT_EQ(param.unit, "linear");
    EXPECT_EQ(param.description, "Test gain parameter");
    EXPECT_TRUE(param.IsValid());
}

TEST_F(DSPParameterTest, Validation) {
    DSPParameter param("test", 0.5f, 0.0f, 1.0f);
    
    EXPECT_TRUE(param.IsValid());
    
    param.value = -0.1f;
    EXPECT_FALSE(param.IsValid());
    
    param.value = 1.1f;
    EXPECT_FALSE(param.IsValid());
    
    param.value = 0.5f;
    EXPECT_TRUE(param.IsValid());
}

TEST_F(DSPParameterTest, Clamping) {
    DSPParameter param("test", 0.5f, 0.0f, 1.0f);
    
    param.value = -0.5f;
    param.Clamp();
    EXPECT_FLOAT_EQ(param.value, 0.0f);
    
    param.value = 1.5f;
    param.Clamp();
    EXPECT_FLOAT_EQ(param.value, 1.0f);
    
    param.value = 0.3f;
    param.Clamp();
    EXPECT_FLOAT_EQ(param.value, 0.3f);
}

TEST_F(DSPParameterTest, NormalizedValues) {
    DSPParameter param("test", 0.5f, 0.0f, 1.0f);
    
    // Test GetNormalized
    EXPECT_FLOAT_EQ(param.GetNormalized(), 0.5f);
    
    param.value = 0.0f;
    EXPECT_FLOAT_EQ(param.GetNormalized(), 0.0f);
    
    param.value = 1.0f;
    EXPECT_FLOAT_EQ(param.GetNormalized(), 1.0f);
    
    // Test SetFromNormalized
    param.SetFromNormalized(0.75f);
    EXPECT_FLOAT_EQ(param.value, 0.75f);
    
    param.SetFromNormalized(0.0f);
    EXPECT_FLOAT_EQ(param.value, 0.0f);
    
    param.SetFromNormalized(1.0f);
    EXPECT_FLOAT_EQ(param.value, 1.0f);
}

TEST_F(DSPParameterTest, LogarithmicScale) {
    DSPParameter param("frequency", 1000.0f, 20.0f, 20000.0f, "Hz", "Frequency parameter");
    param.is_logarithmic = true;
    
    // Test avec échelle logarithmique
    param.value = 200.0f; // 10x la fréquence minimale
    float normalized = param.GetNormalized();
    EXPECT_GT(normalized, 0.0f);
    EXPECT_LT(normalized, 1.0f);
    
    // Vérifier la cohérence
    param.SetFromNormalized(normalized);
    EXPECT_NEAR(param.value, 200.0f, 0.1f);
}

// ========================================
// TESTS POUR DSP PRESET
// ========================================

class DSPPresetTest : public Test {};

TEST_F(DSPPresetTest, BasicCreation) {
    DSPPreset preset("Voice Boost", EffectType::EQUALIZER, "Voice");
    
    EXPECT_EQ(preset.name, "Voice Boost");
    EXPECT_EQ(preset.effect_type, EffectType::EQUALIZER);
    EXPECT_EQ(preset.category, "Voice");
    EXPECT_TRUE(preset.parameters.empty());
}

TEST_F(DSPPresetTest, ParameterManagement) {
    DSPPreset preset("Test Preset", EffectType::COMPRESSOR);
    
    preset.parameters["threshold"] = -12.0f;
    preset.parameters["ratio"] = 4.0f;
    preset.parameters["attack"] = 5.0f;
    
    EXPECT_EQ(preset.parameters.size(), 3);
    EXPECT_FLOAT_EQ(preset.parameters["threshold"], -12.0f);
    EXPECT_FLOAT_EQ(preset.parameters["ratio"], 4.0f);
    EXPECT_FLOAT_EQ(preset.parameters["attack"], 5.0f);
}

// ========================================
// TESTS POUR BIQUAD FILTER
// ========================================

class BiquadFilterTest : public Test {
protected:
    void SetUp() override {
        filter_.Configure(BiquadFilter::LOWPASS, 1000.0f, 44100.0f, 0.707f, 0.0f);
    }
    
    BiquadFilter filter_;
};

TEST_F(BiquadFilterTest, InitialState) {
    // Filter devrait être initialisé et prêt
    float output = filter_.Process(1.0f);
    EXPECT_FALSE(std::isnan(output));
    EXPECT_FALSE(std::isinf(output));
}

TEST_F(BiquadFilterTest, ProcessSingleSample) {
    // Test avec signal DC
    float dc_input = 1.0f;
    float output = filter_.Process(dc_input);
    
    // Pour un passe-bas, le signal DC devrait passer
    EXPECT_GT(output, 0.0f);
    EXPECT_LT(output, 2.0f); // Pas d'amplification excessive
}

TEST_F(BiquadFilterTest, ProcessBuffer) {
    const size_t buffer_size = 1024;
    std::vector<float> input(buffer_size);
    std::vector<float> output(buffer_size);
    
    // Générer signal test (sine wave à 500Hz)
    for (size_t i = 0; i < buffer_size; ++i) {
        input[i] = std::sin(2.0 * M_PI * 500.0 * i / 44100.0);
    }
    
    filter_.ProcessBuffer(input.data(), output.data(), buffer_size);
    
    // Vérifier que la sortie est valide
    for (size_t i = 0; i < buffer_size; ++i) {
        EXPECT_FALSE(std::isnan(output[i]));
        EXPECT_FALSE(std::isinf(output[i]));
    }
}

TEST_F(BiquadFilterTest, ProcessBufferInPlace) {
    const size_t buffer_size = 512;
    std::vector<float> data(buffer_size);
    
    // Générer signal test
    for (size_t i = 0; i < buffer_size; ++i) {
        data[i] = std::sin(2.0 * M_PI * 200.0 * i / 44100.0);
    }
    
    // Sauvegarder original pour comparaison
    std::vector<float> original = data;
    
    filter_.ProcessBufferInPlace(data.data(), buffer_size);
    
    // Le signal devrait être modifié par le filtre
    bool signal_changed = false;
    for (size_t i = 0; i < buffer_size; ++i) {
        if (std::abs(data[i] - original[i]) > 1e-6f) {
            signal_changed = true;
            break;
        }
    }
    EXPECT_TRUE(signal_changed);
}

TEST_F(BiquadFilterTest, Reset) {
    // Traiter quelques échantillons pour charger l'état interne
    for (int i = 0; i < 10; ++i) {
        filter_.Process(1.0f);
    }
    
    // Reset
    filter_.Reset();
    
    // Après reset, réponse devrait être cohérente
    float output1 = filter_.Process(1.0f);
    
    filter_.Reset();
    float output2 = filter_.Process(1.0f);
    
    EXPECT_FLOAT_EQ(output1, output2);
}

TEST_F(BiquadFilterTest, DifferentFilterTypes) {
    // Test lowpass
    BiquadFilter lowpass;
    lowpass.Configure(BiquadFilter::LOWPASS, 1000.0f, 44100.0f);
    
    // Test highpass
    BiquadFilter highpass;
    highpass.Configure(BiquadFilter::HIGHPASS, 1000.0f, 44100.0f);
    
    // Test peak (pour EQ)
    BiquadFilter peak;
    peak.Configure(BiquadFilter::PEAK, 1000.0f, 44100.0f, 0.707f, 6.0f);
    
    // Tous devraient produire des sorties valides
    float test_input = 0.5f;
    EXPECT_FALSE(std::isnan(lowpass.Process(test_input)));
    EXPECT_FALSE(std::isnan(highpass.Process(test_input)));
    EXPECT_FALSE(std::isnan(peak.Process(test_input)));
}

// ========================================
// TESTS POUR PARAMETRIC EQUALIZER
// ========================================

class ParametricEqualizerTest : public Test {
protected:
    void SetUp() override {
        config_.sample_rate = 44100;
        config_.channels = 2;
        config_.bit_depth = 16;
        config_.buffer_size = 1024;
        
        eq_ = std::make_unique<ParametricEqualizer>();
    }
    
    audio::AudioConfig config_;
    std::unique_ptr<ParametricEqualizer> eq_;
};

TEST_F(ParametricEqualizerTest, Initialization) {
    EXPECT_TRUE(eq_->Initialize(config_));
    EXPECT_EQ(eq_->GetEffectType(), EffectType::EQUALIZER);
    EXPECT_EQ(eq_->GetEffectName(), "Parametric Equalizer");
    EXPECT_TRUE(eq_->IsEnabled());
}

TEST_F(ParametricEqualizerTest, GetParameters) {
    ASSERT_TRUE(eq_->Initialize(config_));
    
    auto params = eq_->GetParameters();
    
    // Devrait avoir 10 bandes * 4 paramètres par bande = 40 paramètres
    size_t expected_params = ParametricEqualizer::kNumBands * 4; // freq, gain, q, enabled
    EXPECT_EQ(params.size(), expected_params);
    
    // Vérifier quelques paramètres spécifiques
    EXPECT_NE(params.find("band0_frequency"), params.end());
    EXPECT_NE(params.find("band0_gain"), params.end());
    EXPECT_NE(params.find("band0_q"), params.end());
    EXPECT_NE(params.find("band0_enabled"), params.end());
    
    EXPECT_NE(params.find("band9_frequency"), params.end());
}

TEST_F(ParametricEqualizerTest, SetGetParameter) {
    ASSERT_TRUE(eq_->Initialize(config_));
    
    // Test paramètre fréquence
    EXPECT_TRUE(eq_->SetParameter("band0_frequency", 100.0f));
    EXPECT_FLOAT_EQ(eq_->GetParameter("band0_frequency"), 100.0f);
    
    // Test paramètre gain
    EXPECT_TRUE(eq_->SetParameter("band1_gain", 6.0f));
    EXPECT_FLOAT_EQ(eq_->GetParameter("band1_gain"), 6.0f);
    
    // Test paramètre Q
    EXPECT_TRUE(eq_->SetParameter("band2_q", 2.0f));
    EXPECT_FLOAT_EQ(eq_->GetParameter("band2_q"), 2.0f);
    
    // Test paramètre enabled
    EXPECT_TRUE(eq_->SetParameter("band3_enabled", 0.0f));
    EXPECT_FLOAT_EQ(eq_->GetParameter("band3_enabled"), 0.0f);
    
    // Test paramètre inexistant
    EXPECT_FALSE(eq_->SetParameter("invalid_param", 1.0f));
    EXPECT_FLOAT_EQ(eq_->GetParameter("invalid_param"), 0.0f);
}

TEST_F(ParametricEqualizerTest, BandInterface) {
    ASSERT_TRUE(eq_->Initialize(config_));
    
    // Test SetBand
    eq_->SetBand(0, 80.0f, 3.0f, 1.5f);
    
    auto band = eq_->GetBand(0);
    EXPECT_FLOAT_EQ(band.frequency, 80.0f);
    EXPECT_FLOAT_EQ(band.gain_db, 3.0f);
    EXPECT_FLOAT_EQ(band.q_factor, 1.5f);
    
    // Test SetBandEnabled
    eq_->SetBandEnabled(1, false);
    auto disabled_band = eq_->GetBand(1);
    EXPECT_FALSE(disabled_band.enabled);
    
    // Test index hors limites
    eq_->SetBand(999, 1000.0f, 0.0f, 1.0f);
    auto invalid_band = eq_->GetBand(999);
    EXPECT_NE(invalid_band.frequency, 1000.0f); // Ne devrait pas changer
}

TEST_F(ParametricEqualizerTest, ProcessAudio) {
    ASSERT_TRUE(eq_->Initialize(config_));
    
    const size_t frames = 512;
    std::vector<float> audio_data(frames * config_.channels);
    
    // Générer signal test (mix de fréquences)
    for (size_t frame = 0; frame < frames; ++frame) {
        float sample = 0.3f * std::sin(2.0 * M_PI * 100.0 * frame / config_.sample_rate)  // Graves
                     + 0.3f * std::sin(2.0 * M_PI * 1000.0 * frame / config_.sample_rate) // Mediums
                     + 0.3f * std::sin(2.0 * M_PI * 5000.0 * frame / config_.sample_rate); // Aigus
        
        for (size_t ch = 0; ch < config_.channels; ++ch) {
            audio_data[frame * config_.channels + ch] = sample;
        }
    }
    
    // Sauvegarder original
    std::vector<float> original = audio_data;
    
    // Appliquer un boost dans les graves
    eq_->SetBand(0, 100.0f, 6.0f, 0.7f); // Boost à 100Hz
    
    // Traiter
    eq_->Process(audio_data.data(), frames);
    
    // Le signal devrait être modifié
    bool signal_changed = false;
    for (size_t i = 0; i < audio_data.size(); ++i) {
        if (std::abs(audio_data[i] - original[i]) > 1e-6f) {
            signal_changed = true;
            break;
        }
    }
    EXPECT_TRUE(signal_changed);
}

TEST_F(ParametricEqualizerTest, ProcessAudioBypass) {
    ASSERT_TRUE(eq_->Initialize(config_));
    
    const size_t frames = 256;
    std::vector<float> audio_data(frames * config_.channels, 0.5f);
    std::vector<float> original = audio_data;
    
    // Désactiver l'effet
    eq_->SetEnabled(false);
    
    // Traiter
    eq_->Process(audio_data.data(), frames);
    
    // Le signal ne devrait pas être modifié
    for (size_t i = 0; i < audio_data.size(); ++i) {
        EXPECT_FLOAT_EQ(audio_data[i], original[i]);
    }
}

TEST_F(ParametricEqualizerTest, Reset) {
    ASSERT_TRUE(eq_->Initialize(config_));
    
    // Traiter quelques données pour charger l'état interne
    std::vector<float> audio_data(256 * config_.channels, 0.5f);
    eq_->Process(audio_data.data(), 256);
    
    // Reset ne devrait pas planter
    EXPECT_NO_THROW(eq_->Reset());
    
    // Après reset, traitement devrait fonctionner normalement
    eq_->Process(audio_data.data(), 256);
}

TEST_F(ParametricEqualizerTest, VoicePreset) {
    ASSERT_TRUE(eq_->Initialize(config_));
    
    eq_->ApplyVoicePreset();
    
    // Vérifier que certaines bandes ont été modifiées
    bool preset_applied = false;
    for (size_t i = 0; i < ParametricEqualizer::kNumBands; ++i) {
        auto band = eq_->GetBand(i);
        if (std::abs(band.gain_db) > 0.1f) {
            preset_applied = true;
            break;
        }
    }
    EXPECT_TRUE(preset_applied);
}

TEST_F(ParametricEqualizerTest, GetAvailablePresets) {
    auto presets = eq_->GetAvailablePresets();
    
    EXPECT_FALSE(presets.empty());
    
    // Vérifier que tous les presets sont pour EQ
    for (const auto& preset : presets) {
        EXPECT_EQ(preset.effect_type, EffectType::EQUALIZER);
        EXPECT_FALSE(preset.name.empty());
    }
}

// ========================================
// TESTS POUR AUDIO DSP PIPELINE
// ========================================

class AudioDSPPipelineTest : public Test {
protected:
    void SetUp() override {
        config_.sample_rate = 44100;
        config_.channels = 2;
        config_.bit_depth = 16;
        config_.buffer_size = 1024;
        
        pipeline_ = std::make_unique<AudioDSPPipeline>();
    }
    
    audio::AudioConfig config_;
    std::unique_ptr<AudioDSPPipeline> pipeline_;
};

TEST_F(AudioDSPPipelineTest, Initialization) {
    EXPECT_TRUE(pipeline_->Initialize(config_));
    EXPECT_TRUE(pipeline_->IsEnabled());
    EXPECT_TRUE(pipeline_->GetActiveEffects().empty());
    EXPECT_EQ(pipeline_->GetTotalLatency(), 0);
}

TEST_F(AudioDSPPipelineTest, AddEffect) {
    ASSERT_TRUE(pipeline_->Initialize(config_));
    
    auto eq = std::make_unique<ParametricEqualizer>();
    size_t effect_id = pipeline_->AddEffect(std::move(eq));
    
    EXPECT_NE(effect_id, 0);
    EXPECT_EQ(pipeline_->GetActiveEffects().size(), 1);
    EXPECT_EQ(pipeline_->GetActiveEffects()[0], effect_id);
    
    // Récupérer l'effet
    auto* retrieved_eq = pipeline_->GetEffect(effect_id);
    EXPECT_NE(retrieved_eq, nullptr);
    EXPECT_EQ(retrieved_eq->GetEffectType(), EffectType::EQUALIZER);
}

TEST_F(AudioDSPPipelineTest, InsertEffect) {
    ASSERT_TRUE(pipeline_->Initialize(config_));
    
    // Ajouter d'abord un effet
    auto eq1 = std::make_unique<ParametricEqualizer>();
    size_t eq1_id = pipeline_->AddEffect(std::move(eq1));
    
    // Insérer un autre effet au début
    auto eq2 = std::make_unique<ParametricEqualizer>();
    size_t eq2_id = pipeline_->InsertEffect(0, std::move(eq2));
    
    EXPECT_NE(eq2_id, 0);
    EXPECT_EQ(pipeline_->GetActiveEffects().size(), 2);
    
    // eq2 devrait être maintenant en première position
    auto active_effects = pipeline_->GetActiveEffects();
    EXPECT_EQ(active_effects[0], eq2_id);
    EXPECT_EQ(active_effects[1], eq1_id);
}

TEST_F(AudioDSPPipelineTest, RemoveEffect) {
    ASSERT_TRUE(pipeline_->Initialize(config_));
    
    auto eq = std::make_unique<ParametricEqualizer>();
    size_t effect_id = pipeline_->AddEffect(std::move(eq));
    
    EXPECT_EQ(pipeline_->GetActiveEffects().size(), 1);
    
    EXPECT_TRUE(pipeline_->RemoveEffect(effect_id));
    EXPECT_TRUE(pipeline_->GetActiveEffects().empty());
    
    // Tentative de suppression d'un effet inexistant
    EXPECT_FALSE(pipeline_->RemoveEffect(999));
}

TEST_F(AudioDSPPipelineTest, MoveEffect) {
    ASSERT_TRUE(pipeline_->Initialize(config_));
    
    // Ajouter plusieurs effets
    auto eq1 = std::make_unique<ParametricEqualizer>();
    auto eq2 = std::make_unique<ParametricEqualizer>();
    auto eq3 = std::make_unique<ParametricEqualizer>();
    
    size_t eq1_id = pipeline_->AddEffect(std::move(eq1));
    size_t eq2_id = pipeline_->AddEffect(std::move(eq2));
    size_t eq3_id = pipeline_->AddEffect(std::move(eq3));
    
    // Ordre initial: eq1, eq2, eq3
    auto initial_effects = pipeline_->GetActiveEffects();
    EXPECT_EQ(initial_effects[0], eq1_id);
    EXPECT_EQ(initial_effects[1], eq2_id);
    EXPECT_EQ(initial_effects[2], eq3_id);
    
    // Déplacer eq1 à la fin
    EXPECT_TRUE(pipeline_->MoveEffect(eq1_id, 2));
    
    // Nouvel ordre: eq2, eq3, eq1
    auto new_effects = pipeline_->GetActiveEffects();
    EXPECT_EQ(new_effects[0], eq2_id);
    EXPECT_EQ(new_effects[1], eq3_id);
    EXPECT_EQ(new_effects[2], eq1_id);
}

TEST_F(AudioDSPPipelineTest, GetEffectByType) {
    ASSERT_TRUE(pipeline_->Initialize(config_));
    
    auto eq = std::make_unique<ParametricEqualizer>();
    pipeline_->AddEffect(std::move(eq));
    
    auto* found_eq = pipeline_->GetEffectByType(EffectType::EQUALIZER);
    EXPECT_NE(found_eq, nullptr);
    EXPECT_EQ(found_eq->GetEffectType(), EffectType::EQUALIZER);
    
    auto* not_found = pipeline_->GetEffectByType(EffectType::COMPRESSOR);
    EXPECT_EQ(not_found, nullptr);
}

TEST_F(AudioDSPPipelineTest, ProcessAudio) {
    ASSERT_TRUE(pipeline_->Initialize(config_));
    
    // Ajouter un EQ avec boost
    auto eq = std::make_unique<ParametricEqualizer>();
    eq->Initialize(config_);
    eq->SetBand(0, 100.0f, 6.0f, 0.7f); // Boost à 100Hz
    
    pipeline_->AddEffect(std::move(eq));
    
    const size_t frames = 256;
    std::vector<float> audio_data(frames * config_.channels);
    
    // Générer signal test
    for (size_t frame = 0; frame < frames; ++frame) {
        float sample = 0.5f * std::sin(2.0 * M_PI * 100.0 * frame / config_.sample_rate);
        for (size_t ch = 0; ch < config_.channels; ++ch) {
            audio_data[frame * config_.channels + ch] = sample;
        }
    }
    
    std::vector<float> original = audio_data;
    
    // Traiter
    pipeline_->Process(audio_data.data(), frames);
    
    // Le signal devrait être modifié
    bool signal_changed = false;
    for (size_t i = 0; i < audio_data.size(); ++i) {
        if (std::abs(audio_data[i] - original[i]) > 1e-6f) {
            signal_changed = true;
            break;
        }
    }
    EXPECT_TRUE(signal_changed);
}

TEST_F(AudioDSPPipelineTest, ProcessAudioBypass) {
    ASSERT_TRUE(pipeline_->Initialize(config_));
    
    auto eq = std::make_unique<ParametricEqualizer>();
    eq->Initialize(config_);
    pipeline_->AddEffect(std::move(eq));
    
    const size_t frames = 256;
    std::vector<float> audio_data(frames * config_.channels, 0.5f);
    std::vector<float> original = audio_data;
    
    // Désactiver le pipeline
    pipeline_->SetEnabled(false);
    
    // Traiter
    pipeline_->Process(audio_data.data(), frames);
    
    // Le signal ne devrait pas être modifié
    for (size_t i = 0; i < audio_data.size(); ++i) {
        EXPECT_FLOAT_EQ(audio_data[i], original[i]);
    }
}

TEST_F(AudioDSPPipelineTest, Reset) {
    ASSERT_TRUE(pipeline_->Initialize(config_));
    
    auto eq = std::make_unique<ParametricEqualizer>();
    eq->Initialize(config_);
    pipeline_->AddEffect(std::move(eq));
    
    // Traiter quelques données pour charger l'état
    std::vector<float> audio_data(256 * config_.channels, 0.5f);
    pipeline_->Process(audio_data.data(), 256);
    
    // Reset ne devrait pas planter
    EXPECT_NO_THROW(pipeline_->Reset());
}

// ========================================
// TESTS POUR AUDIO DSP FACTORY
// ========================================

class AudioDSPFactoryTest : public Test {};

TEST_F(AudioDSPFactoryTest, CreateProcessor) {
    auto eq = AudioDSPFactory::CreateProcessor(EffectType::EQUALIZER);
    EXPECT_NE(eq, nullptr);
    EXPECT_EQ(eq->GetEffectType(), EffectType::EQUALIZER);
    
    // Les autres types devraient retourner nullptr pour l'instant (pas encore implémentés)
    auto comp = AudioDSPFactory::CreateProcessor(EffectType::COMPRESSOR);
    EXPECT_EQ(comp, nullptr);
    
    auto rev = AudioDSPFactory::CreateProcessor(EffectType::REVERB);
    EXPECT_EQ(rev, nullptr);
}

TEST_F(AudioDSPFactoryTest, GetSupportedEffects) {
    auto effects = AudioDSPFactory::GetSupportedEffects();
    
    EXPECT_FALSE(effects.empty());
    EXPECT_NE(std::find(effects.begin(), effects.end(), EffectType::EQUALIZER), effects.end());
}

TEST_F(AudioDSPFactoryTest, IsEffectSupported) {
    EXPECT_TRUE(AudioDSPFactory::IsEffectSupported(EffectType::EQUALIZER));
    EXPECT_FALSE(AudioDSPFactory::IsEffectSupported(EffectType::COMPRESSOR)); // Pas encore implémenté
}

TEST_F(AudioDSPFactoryTest, GetEffectTypeName) {
    EXPECT_EQ(AudioDSPFactory::GetEffectTypeName(EffectType::EQUALIZER), "Parametric Equalizer");
    EXPECT_EQ(AudioDSPFactory::GetEffectTypeName(EffectType::COMPRESSOR), "Dynamics Processor");
    EXPECT_EQ(AudioDSPFactory::GetEffectTypeName(EffectType::REVERB), "Algorithmic Reverb");
    EXPECT_EQ(AudioDSPFactory::GetEffectTypeName(EffectType::DELAY), "Multi-Tap Delay");
}

TEST_F(AudioDSPFactoryTest, CreatePipelinePreset) {
    auto pipeline = AudioDSPFactory::CreatePipelinePreset("Voice Processing");
    EXPECT_NE(pipeline, nullptr);
    
    auto pipeline2 = AudioDSPFactory::CreatePipelinePreset("Music Master");
    EXPECT_NE(pipeline2, nullptr);
    
    auto pipeline3 = AudioDSPFactory::CreatePipelinePreset("Unknown Preset");
    EXPECT_NE(pipeline3, nullptr); // Devrait retourner un pipeline par défaut
}

TEST_F(AudioDSPFactoryTest, GetAvailablePipelinePresets) {
    auto presets = AudioDSPFactory::GetAvailablePipelinePresets();
    
    EXPECT_FALSE(presets.empty());
    EXPECT_NE(std::find(presets.begin(), presets.end(), "Voice Processing"), presets.end());
    EXPECT_NE(std::find(presets.begin(), presets.end(), "Music Master"), presets.end());
}

// ========================================
// TESTS POUR DSP UTILS
// ========================================

class DSPUtilsTest : public Test {};

TEST_F(DSPUtilsTest, FrequencyToCoefficient) {
    using namespace dsp_utils;
    
    // Test fréquences valides
    EXPECT_FLOAT_EQ(FrequencyToCoefficient(0.0f, 44100.0f), 0.001f); // Clamping min
    EXPECT_FLOAT_EQ(FrequencyToCoefficient(22050.0f, 44100.0f), 0.999f); // Clamping max
    EXPECT_FLOAT_EQ(FrequencyToCoefficient(11025.0f, 44100.0f), 0.5f); // Milieu
}

TEST_F(DSPUtilsTest, DbGainConversion) {
    using namespace dsp_utils;
    
    // Test conversions dB ↔ gain
    EXPECT_FLOAT_EQ(DbToGain(0.0f), 1.0f);
    EXPECT_NEAR(DbToGain(6.0f), 2.0f, 0.01f);
    EXPECT_NEAR(DbToGain(-6.0f), 0.5f, 0.01f);
    EXPECT_NEAR(DbToGain(-20.0f), 0.1f, 0.01f);
    
    EXPECT_FLOAT_EQ(GainToDb(1.0f), 0.0f);
    EXPECT_NEAR(GainToDb(2.0f), 6.0f, 0.03f);
    EXPECT_NEAR(GainToDb(0.5f), -6.0f, 0.03f);
    EXPECT_NEAR(GainToDb(0.1f), -20.0f, 0.03f);
    
    // Test roundtrip
    float original_db = 3.5f;
    float roundtrip_db = GainToDb(DbToGain(original_db));
    EXPECT_NEAR(roundtrip_db, original_db, 0.001f);
}

TEST_F(DSPUtilsTest, ApplyFade) {
    using namespace dsp_utils;
    
    const size_t frames = 100;
    const size_t channels = 2;
    std::vector<float> data(frames * channels, 1.0f);
    
    // Test fade in
    ApplyFade(data.data(), frames, channels, 20, true); // 20 échantillons de fade in
    
    // Les premiers échantillons devraient être proche de 0
    EXPECT_LT(data[0], 0.1f);
    EXPECT_LT(data[1], 0.1f);
    
    // Les derniers échantillons devraient être proche de 1
    EXPECT_GT(data[(frames-1) * channels], 0.9f);
    EXPECT_GT(data[(frames-1) * channels + 1], 0.9f);
}

TEST_F(DSPUtilsTest, ApplyGainRamp) {
    using namespace dsp_utils;
    
    const size_t frames = 100;
    const size_t channels = 2;
    std::vector<float> data(frames * channels, 1.0f);
    
    ApplyGainRamp(data.data(), frames, channels, 0.5f, 1.5f);
    
    // Le premier échantillon devrait être proche de 0.5
    EXPECT_NEAR(data[0], 0.5f, 0.1f);
    
    // Le dernier échantillon devrait être proche de 1.5
    EXPECT_NEAR(data[(frames-1) * channels], 1.5f, 0.1f);
}

TEST_F(DSPUtilsTest, CalculateRMS) {
    using namespace dsp_utils;
    
    const size_t frames = 100;
    const size_t channels = 2;
    
    // Test avec signal DC
    std::vector<float> dc_data(frames * channels, 0.5f);
    float rms_dc = CalculateRMS(dc_data.data(), frames, channels);
    EXPECT_FLOAT_EQ(rms_dc, 0.5f);
    
    // Test avec signal zéro
    std::vector<float> zero_data(frames * channels, 0.0f);
    float rms_zero = CalculateRMS(zero_data.data(), frames, channels);
    EXPECT_FLOAT_EQ(rms_zero, 0.0f);
    
    // Test avec signal connu
    std::vector<float> test_data(frames * channels);
    for (size_t i = 0; i < frames * channels; ++i) {
        test_data[i] = (i % 2 == 0) ? 1.0f : -1.0f; // Alternant ±1
    }
    float rms_test = CalculateRMS(test_data.data(), frames, channels);
    EXPECT_FLOAT_EQ(rms_test, 1.0f);
}

TEST_F(DSPUtilsTest, CalculatePeak) {
    using namespace dsp_utils;
    
    const size_t frames = 100;
    const size_t channels = 2;
    std::vector<float> data(frames * channels);
    
    // Remplir avec des valeurs variées
    for (size_t i = 0; i < frames * channels; ++i) {
        data[i] = std::sin(2.0 * M_PI * i / 10.0) * 0.8f;
    }
    
    // Ajouter un pic
    data[50] = 1.5f;
    
    float peak = CalculatePeak(data.data(), frames, channels);
    EXPECT_FLOAT_EQ(peak, 1.5f);
}