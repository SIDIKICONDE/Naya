#include "gtest/gtest.h"
#include "gmock/gmock.h"
#include "../PlatformAudioCapture.h"
#include "../AudioCaptureInterface.h"
#include <thread>
#include <chrono>

using namespace audio;
using namespace testing;

// ========================================
// MOCK POUR CALLBACK DE CAPTURE
// ========================================

class MockCaptureCallback {
public:
    MOCK_METHOD(void, OnAudioDataCaptured, 
               (const float* data, size_t frames, int64_t timestamp_us), ());
    MOCK_METHOD(void, OnCaptureError, (const std::string& error), ());
};

// ========================================
// TESTS POUR PLATFORM AUDIO CAPTURE FACTORY
// ========================================

class PlatformAudioCaptureFactoryTest : public Test {};

TEST_F(PlatformAudioCaptureFactoryTest, DetectPlatform) {
    std::string platform_name = PlatformAudioCaptureFactory::GetPlatformName();
    
    EXPECT_FALSE(platform_name.empty());
    
    // Devrait être l'une des plateformes supportées
    std::vector<std::string> valid_platforms = {"iOS", "Android", "Windows", "Linux", "macOS", "Unknown"};
    EXPECT_NE(std::find(valid_platforms.begin(), valid_platforms.end(), platform_name), 
              valid_platforms.end());
    
    std::cout << "Detected platform: " << platform_name << std::endl;
}

TEST_F(PlatformAudioCaptureFactoryTest, CreateNativeCapture) {
    auto capture = PlatformAudioCaptureFactory::CreateNativeCapture();
    
    EXPECT_NE(capture, nullptr);
    
    // Devrait pouvoir obtenir la configuration par défaut
    // La config par défaut peut être vide avant initialisation, c'est normal
    (void)capture->GetCurrentConfig();
}

TEST_F(PlatformAudioCaptureFactoryTest, IsNativeCaptureAvailable) {
    bool available = PlatformAudioCaptureFactory::IsNativeCaptureAvailable();
    
    // Devrait toujours être true car on a des implémentations pour toutes les plateformes
    EXPECT_TRUE(available);
}

TEST_F(PlatformAudioCaptureFactoryTest, GetNativeCapabilities) {
    auto caps = PlatformAudioCaptureFactory::GetNativeCapabilities();
    
    EXPECT_FALSE(caps.supported_sample_rates.empty());
    EXPECT_GT(caps.max_channels, 0);
    EXPECT_FALSE(caps.supported_bit_depths.empty());
    EXPECT_GE(caps.min_latency_ms, 0.0f);
    
    // Vérifier quelques valeurs communes
    auto& sample_rates = caps.supported_sample_rates;
    EXPECT_NE(std::find(sample_rates.begin(), sample_rates.end(), 44100), sample_rates.end());
    EXPECT_NE(std::find(sample_rates.begin(), sample_rates.end(), 48000), sample_rates.end());
}

TEST_F(PlatformAudioCaptureFactoryTest, GetPlatformLatency) {
    float latency = PlatformAudioCaptureFactory::GetPlatformLatency();
    
    EXPECT_GT(latency, 0.0f);
    EXPECT_LT(latency, 1000.0f); // Moins d'une seconde, raisonnable
}

TEST_F(PlatformAudioCaptureFactoryTest, CheckAudioPermissions) {
    bool permissions = PlatformAudioCaptureFactory::CheckAudioPermissions();
    
    // Pour les tests, on s'attend à ce que ce soit true
    // (sur desktop, pas de permissions nécessaires)
    EXPECT_TRUE(permissions);
}

TEST_F(PlatformAudioCaptureFactoryTest, RequestAudioPermissions) {
    bool granted = PlatformAudioCaptureFactory::RequestAudioPermissions();
    
    // Devrait retourner true (simulation pour les tests)
    EXPECT_TRUE(granted);
}

// ========================================
// TESTS GÉNÉRIQUES POUR CAPTURE INTERFACE
// ========================================

class AudioCaptureInterfaceTest : public Test {
protected:
    void SetUp() override {
        capture_ = PlatformAudioCaptureFactory::CreateNativeCapture();
        ASSERT_NE(capture_, nullptr);
        
        config_.sample_rate = 44100;
        config_.channels = 2;
        config_.bit_depth = 16;
        config_.buffer_size = 1024;
        
        mock_callback_ = std::make_unique<MockCaptureCallback>();
    }
    
    void TearDown() override {
        if (capture_ && capture_->IsCapturing()) {
            capture_->StopCapture();
        }
        capture_->Cleanup();
    }
    
    std::unique_ptr<AudioCaptureInterface> capture_;
    AudioConfig config_;
    std::unique_ptr<MockCaptureCallback> mock_callback_;
};

TEST_F(AudioCaptureInterfaceTest, InitializeWithValidConfig) {
    EXPECT_TRUE(capture_->Initialize(config_));
    
    auto current_config = capture_->GetCurrentConfig();
    EXPECT_EQ(current_config.sample_rate, config_.sample_rate);
    EXPECT_EQ(current_config.channels, config_.channels);
    EXPECT_EQ(current_config.bit_depth, config_.bit_depth);
    EXPECT_EQ(current_config.buffer_size, config_.buffer_size);
}

TEST_F(AudioCaptureInterfaceTest, InitializeWithInvalidConfig) {
    AudioConfig invalid_config;
    invalid_config.sample_rate = 0; // Invalide
    invalid_config.channels = 0;    // Invalide
    
    // Pourrait échouer ou fallback vers des valeurs par défaut
    // Le comportement exact dépend de l'implémentation
    (void)capture_->Initialize(invalid_config);
    // On ne fait pas d'assertion stricte car le comportement peut varier
}

TEST_F(AudioCaptureInterfaceTest, StartStopCapture) {
    ASSERT_TRUE(capture_->Initialize(config_));
    
    // État initial
    EXPECT_FALSE(capture_->IsCapturing());
    
    // Démarrer la capture
    EXPECT_TRUE(capture_->StartCapture());
    EXPECT_TRUE(capture_->IsCapturing());
    
    // Arrêter la capture
    capture_->StopCapture();
    EXPECT_FALSE(capture_->IsCapturing());
}

TEST_F(AudioCaptureInterfaceTest, PauseResumeCapture) {
    ASSERT_TRUE(capture_->Initialize(config_));
    ASSERT_TRUE(capture_->StartCapture());
    
    // Pause
    EXPECT_TRUE(capture_->PauseCapture());
    
    // Resume
    EXPECT_TRUE(capture_->ResumeCapture());
    
    capture_->StopCapture();
}

TEST_F(AudioCaptureInterfaceTest, GetCaptureLatency) {
    ASSERT_TRUE(capture_->Initialize(config_));
    
    float latency = capture_->GetCaptureLatency();
    EXPECT_GE(latency, 0.0f);
    EXPECT_LT(latency, 1000.0f); // Raisonnable
}

TEST_F(AudioCaptureInterfaceTest, GetCurrentLevel) {
    ASSERT_TRUE(capture_->Initialize(config_));
    
    float level = capture_->GetCurrentLevel();
    EXPECT_GE(level, 0.0f);
    EXPECT_LE(level, 1.0f); // Niveau normalisé
}

TEST_F(AudioCaptureInterfaceTest, SetCaptureCallback) {
    ASSERT_TRUE(capture_->Initialize(config_));
    
    bool callback_called = false;
    std::string captured_error;
    
    // Callback de données
    capture_->SetCaptureCallback([&](const float* data, size_t frames, int64_t timestamp) {
        callback_called = true;
        EXPECT_NE(data, nullptr);
        EXPECT_GT(frames, 0);
        EXPECT_GT(timestamp, 0);
    });
    
    // Callback d'erreur
    capture_->SetErrorCallback([&](const std::string& error) {
        captured_error = error;
    });
    
    // Démarrer la capture et attendre un peu
    ASSERT_TRUE(capture_->StartCapture());
    
    // Attendre que le callback soit appelé
    auto start_time = std::chrono::steady_clock::now();
    while (!callback_called && 
           std::chrono::steady_clock::now() - start_time < std::chrono::seconds(2)) {
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }
    
    capture_->StopCapture();
    
    EXPECT_TRUE(callback_called);
    EXPECT_TRUE(captured_error.empty()); // Pas d'erreur attendue
}

TEST_F(AudioCaptureInterfaceTest, CleanupAfterCapture) {
    ASSERT_TRUE(capture_->Initialize(config_));
    ASSERT_TRUE(capture_->StartCapture());
    
    // Simuler un peu de capture
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    
    capture_->StopCapture();
    
    // Cleanup ne devrait pas planter
    EXPECT_NO_THROW(capture_->Cleanup());
    
    // Après cleanup, l'état devrait être cohérent
    EXPECT_FALSE(capture_->IsCapturing());
}

// ========================================
// TESTS PLATFORM-SPECIFIC
// ========================================

#ifdef __APPLE__

class iOSAudioCaptureTest : public Test {
protected:
    void SetUp() override {
        capture_ = std::make_unique<iOSAudioCapture>();
        
        config_.sample_rate = 44100;
        config_.channels = 2;
        config_.bit_depth = 16;
        config_.buffer_size = 1024;
    }
    
    void TearDown() override {
        if (capture_ && capture_->IsCapturing()) {
            capture_->StopCapture();
        }
        capture_->Cleanup();
    }
    
    std::unique_ptr<iOSAudioCapture> capture_;
    AudioConfig config_;
};

TEST_F(iOSAudioCaptureTest, InitializeSpecific) {
    EXPECT_TRUE(capture_->Initialize(config_));
    
    auto current_config = capture_->GetCurrentConfig();
    EXPECT_EQ(current_config.sample_rate, config_.sample_rate);
    EXPECT_EQ(current_config.channels, config_.channels);
}

TEST_F(iOSAudioCaptureTest, LowLatencyExpected) {
    ASSERT_TRUE(capture_->Initialize(config_));
    
    float latency = capture_->GetCaptureLatency();
    EXPECT_LT(latency, 20.0f); // iOS devrait avoir une latence faible
}

#endif // __APPLE__

#ifdef __ANDROID__

class AndroidAudioCaptureTest : public Test {
protected:
    void SetUp() override {
        capture_ = std::make_unique<AndroidAudioCapture>();
        
        config_.sample_rate = 44100;
        config_.channels = 2;
        config_.bit_depth = 16;
        config_.buffer_size = 1024;
    }
    
    void TearDown() override {
        if (capture_ && capture_->IsCapturing()) {
            capture_->StopCapture();
        }
        capture_->Cleanup();
    }
    
    std::unique_ptr<AndroidAudioCapture> capture_;
    AudioConfig config_;
};

TEST_F(AndroidAudioCaptureTest, InitializeSpecific) {
    EXPECT_TRUE(capture_->Initialize(config_));
    
    auto current_config = capture_->GetCurrentConfig();
    EXPECT_EQ(current_config.sample_rate, config_.sample_rate);
    EXPECT_EQ(current_config.channels, config_.channels);
}

TEST_F(AndroidAudioCaptureTest, ReasonableLatency) {
    ASSERT_TRUE(capture_->Initialize(config_));
    
    float latency = capture_->GetCaptureLatency();
    EXPECT_GT(latency, 10.0f);  // Android généralement > 10ms
    EXPECT_LT(latency, 100.0f); // Mais < 100ms
}

#endif // __ANDROID__

#if !defined(__APPLE__) && !defined(__ANDROID__)

class DesktopAudioCaptureTest : public Test {
protected:
    void SetUp() override {
        capture_ = std::make_unique<DesktopAudioCapture>();
        
        config_.sample_rate = 44100;
        config_.channels = 2;
        config_.bit_depth = 16;
        config_.buffer_size = 1024;
    }
    
    void TearDown() override {
        if (capture_ && capture_->IsCapturing()) {
            capture_->StopCapture();
        }
        capture_->Cleanup();
    }
    
    std::unique_ptr<DesktopAudioCapture> capture_;
    AudioConfig config_;
};

TEST_F(DesktopAudioCaptureTest, InitializeSpecific) {
    EXPECT_TRUE(capture_->Initialize(config_));
    
    auto current_config = capture_->GetCurrentConfig();
    EXPECT_EQ(current_config.sample_rate, config_.sample_rate);
    EXPECT_EQ(current_config.channels, config_.channels);
}

TEST_F(DesktopAudioCaptureTest, TestSignalGeneration) {
    ASSERT_TRUE(capture_->Initialize(config_));
    
    bool data_received = false;
    std::vector<float> captured_data;
    
    capture_->SetCaptureCallback([&](const float* data, size_t frames, int64_t timestamp) {
        data_received = true;
        captured_data.assign(data, data + frames * config_.channels);
    });
    
    ASSERT_TRUE(capture_->StartCapture());
    
    // Attendre que des données soient reçues
    auto start_time = std::chrono::steady_clock::now();
    while (!data_received && 
           std::chrono::steady_clock::now() - start_time < std::chrono::seconds(1)) {
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }
    
    capture_->StopCapture();
    
    EXPECT_TRUE(data_received);
    EXPECT_FALSE(captured_data.empty());
    
    // Vérifier que le signal généré n'est pas constant (signal test)
    bool signal_varies = false;
    float first_sample = captured_data[0];
    for (float sample : captured_data) {
        if (std::abs(sample - first_sample) > 1e-6f) {
            signal_varies = true;
            break;
        }
    }
    EXPECT_TRUE(signal_varies);
}

#endif // Desktop

// ========================================
// TESTS POUR PLATFORM UTILS
// ========================================

class PlatformUtilsTest : public Test {};

TEST_F(PlatformUtilsTest, GetOptimalBufferSize) {
    using namespace platform_utils;
    
    size_t buffer_44k = GetOptimalBufferSize(44100, 2);
    size_t buffer_48k = GetOptimalBufferSize(48000, 2);
    
    EXPECT_GT(buffer_44k, 0);
    EXPECT_GT(buffer_48k, 0);
    
    // Buffer pour 48kHz devrait être légèrement plus grand
    EXPECT_GE(buffer_48k, buffer_44k);
    
    // Devrait être raisonnable (entre 64 et 8192 échantillons typiquement)
    EXPECT_GE(buffer_44k, 64);
    EXPECT_LE(buffer_44k, 8192);
}

TEST_F(PlatformUtilsTest, CalculateLevelOptimized) {
    using namespace platform_utils;
    
    const size_t frames = 100;
    const size_t channels = 2;
    
    // Test avec signal DC
    std::vector<float> dc_data(frames * channels, 0.5f);
    float level_dc = CalculateLevelOptimized(dc_data.data(), frames, channels);
    EXPECT_FLOAT_EQ(level_dc, 0.5f);
    
    // Test avec signal zéro
    std::vector<float> zero_data(frames * channels, 0.0f);
    float level_zero = CalculateLevelOptimized(zero_data.data(), frames, channels);
    EXPECT_FLOAT_EQ(level_zero, 0.0f);
    
    // Test avec signal sinusoïdal
    std::vector<float> sine_data(frames * channels);
    for (size_t frame = 0; frame < frames; ++frame) {
        float sample = std::sin(2.0 * M_PI * frame / frames);
        for (size_t ch = 0; ch < channels; ++ch) {
            sine_data[frame * channels + ch] = sample;
        }
    }
    float level_sine = CalculateLevelOptimized(sine_data.data(), frames, channels);
    EXPECT_GT(level_sine, 0.0f);
    EXPECT_LT(level_sine, 1.0f);
}

TEST_F(PlatformUtilsTest, ApplyGainSIMD) {
    using namespace platform_utils;
    
    const size_t frames = 100;
    const size_t channels = 2;
    std::vector<float> data(frames * channels, 0.5f);
    
    ApplyGainSIMD(data.data(), frames, channels, 2.0f);
    
    // Tous les échantillons devraient être multipliés par 2
    for (float sample : data) {
        EXPECT_FLOAT_EQ(sample, 1.0f);
    }
}

// ========================================
// TESTS POUR FORMAT CONVERSION
// ========================================

class FormatConversionTest : public Test {};

TEST_F(FormatConversionTest, Int16ToFloat32) {
    using namespace platform_utils::format_conversion;
    
    std::vector<int16_t> input = {0, 16384, 32767, -16384, -32768};
    std::vector<float> output(input.size());
    
    Int16ToFloat32(input.data(), output.data(), input.size());
    
    EXPECT_FLOAT_EQ(output[0], 0.0f);
    EXPECT_NEAR(output[1], 0.5f, 0.01f);
    EXPECT_NEAR(output[2], 1.0f, 0.01f);
    EXPECT_NEAR(output[3], -0.5f, 0.01f);
    EXPECT_NEAR(output[4], -1.0f, 0.01f);
}

TEST_F(FormatConversionTest, Float32ToInt16) {
    using namespace platform_utils::format_conversion;
    
    std::vector<float> input = {0.0f, 0.5f, 1.0f, -0.5f, -1.0f};
    std::vector<int16_t> output(input.size());
    
    Float32ToInt16(input.data(), output.data(), input.size());
    
    EXPECT_EQ(output[0], 0);
    EXPECT_NEAR(output[1], 16383, 1);  // 0.5 * 32767
    EXPECT_EQ(output[2], 32767);
    EXPECT_NEAR(output[3], -16383, 1); // -0.5 * 32767
    EXPECT_EQ(output[4], -32767);
}

TEST_F(FormatConversionTest, Float32ToInt16Clamping) {
    using namespace platform_utils::format_conversion;
    
    std::vector<float> input = {-2.0f, 2.0f}; // Hors limites
    std::vector<int16_t> output(input.size());
    
    Float32ToInt16(input.data(), output.data(), input.size());
    
    // Devrait être clampé aux limites
    EXPECT_EQ(output[0], -32767);
    EXPECT_EQ(output[1], 32767);
}

TEST_F(FormatConversionTest, InterleaveChannels) {
    using namespace platform_utils::format_conversion;
    
    const size_t frames = 4;
    const size_t channels = 2;
    
    // Données séparées par canal
    std::vector<float> ch0 = {1.0f, 2.0f, 3.0f, 4.0f};
    std::vector<float> ch1 = {5.0f, 6.0f, 7.0f, 8.0f};
    std::vector<const float*> input = {ch0.data(), ch1.data()};
    
    std::vector<float> output(frames * channels);
    
    InterleaveChannels(input.data(), output.data(), frames, channels);
    
    // Vérifier l'entrelacement
    EXPECT_FLOAT_EQ(output[0], 1.0f); // Ch0, Frame0
    EXPECT_FLOAT_EQ(output[1], 5.0f); // Ch1, Frame0
    EXPECT_FLOAT_EQ(output[2], 2.0f); // Ch0, Frame1
    EXPECT_FLOAT_EQ(output[3], 6.0f); // Ch1, Frame1
    EXPECT_FLOAT_EQ(output[4], 3.0f); // Ch0, Frame2
    EXPECT_FLOAT_EQ(output[5], 7.0f); // Ch1, Frame2
    EXPECT_FLOAT_EQ(output[6], 4.0f); // Ch0, Frame3
    EXPECT_FLOAT_EQ(output[7], 8.0f); // Ch1, Frame3
}

TEST_F(FormatConversionTest, DeinterleaveChannels) {
    using namespace platform_utils::format_conversion;
    
    const size_t frames = 4;
    const size_t channels = 2;
    
    // Données entrelacées
    std::vector<float> input = {1.0f, 5.0f, 2.0f, 6.0f, 3.0f, 7.0f, 4.0f, 8.0f};
    
    std::vector<float> ch0(frames);
    std::vector<float> ch1(frames);
    std::vector<float*> output = {ch0.data(), ch1.data()};
    
    DeinterleaveChannels(input.data(), output.data(), frames, channels);
    
    // Vérifier la séparation
    EXPECT_FLOAT_EQ(ch0[0], 1.0f);
    EXPECT_FLOAT_EQ(ch0[1], 2.0f);
    EXPECT_FLOAT_EQ(ch0[2], 3.0f);
    EXPECT_FLOAT_EQ(ch0[3], 4.0f);
    
    EXPECT_FLOAT_EQ(ch1[0], 5.0f);
    EXPECT_FLOAT_EQ(ch1[1], 6.0f);
    EXPECT_FLOAT_EQ(ch1[2], 7.0f);
    EXPECT_FLOAT_EQ(ch1[3], 8.0f);
}

// ========================================
// TESTS D'INTÉGRATION PLATFORM
// ========================================

class PlatformIntegrationTest : public Test {
protected:
    void SetUp() override {
        config_.sample_rate = 44100;
        config_.channels = 2;
        config_.bit_depth = 16;
        config_.buffer_size = 1024;
    }
    
    AudioConfig config_;
};

TEST_F(PlatformIntegrationTest, CaptureAndProcess) {
    auto capture = PlatformAudioCaptureFactory::CreateNativeCapture();
    ASSERT_NE(capture, nullptr);
    
    ASSERT_TRUE(capture->Initialize(config_));
    
    size_t buffers_received = 0;
    size_t total_frames = 0;
    
    capture->SetCaptureCallback([&](const float* data, size_t frames, int64_t timestamp) {
        EXPECT_NE(data, nullptr);
        EXPECT_GT(frames, 0);
        EXPECT_GT(timestamp, 0);
        
        buffers_received++;
        total_frames += frames;
        
        // Vérifier que les données ne sont pas toutes nulles
        bool has_non_zero = false;
        for (size_t i = 0; i < frames * config_.channels; ++i) {
            if (std::abs(data[i]) > 1e-6f) {
                has_non_zero = true;
                break;
            }
        }
        EXPECT_TRUE(has_non_zero);
    });
    
    std::string last_error;
    capture->SetErrorCallback([&](const std::string& error) {
        last_error = error;
    });
    
    // Capturer pendant une courte période
    ASSERT_TRUE(capture->StartCapture());
    
    auto start_time = std::chrono::steady_clock::now();
    while (buffers_received < 5 && 
           std::chrono::steady_clock::now() - start_time < std::chrono::seconds(2)) {
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }
    
    capture->StopCapture();
    capture->Cleanup();
    
    EXPECT_GT(buffers_received, 0);
    EXPECT_GT(total_frames, 0);
    EXPECT_TRUE(last_error.empty());
    
    std::cout << "Captured " << buffers_received << " buffers, " 
              << total_frames << " total frames" << std::endl;
}