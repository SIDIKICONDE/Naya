/**
 * Tests unitaires pour le module AudioRecorder
 * Utilise Google Test framework
 */

#include <gtest/gtest.h>
#include <gmock/gmock.h>
#include "../AudioRecorder.h"
#include "../AudioCaptureCpp.h"
#include <thread>
#include <chrono>
#include <fstream>
#include <filesystem>

using namespace audio;
using namespace testing;
using namespace std::chrono_literals;

// ========================================
// Mock Classes
// ========================================

class MockAudioRecorderCallback : public AudioRecorderCallback {
public:
    MOCK_METHOD(void, OnAudioData, (const AudioBuffer& buffer), (override));
    MOCK_METHOD(void, OnError, (const std::string& error), (override));
    MOCK_METHOD(void, OnRecordingStarted, (), (override));
    MOCK_METHOD(void, OnRecordingStopped, (const std::string& file_path), (override));
};

class MockAudioCapture : public AudioCaptureInterface {
public:
    MOCK_METHOD(bool, Initialize, (const AudioConfig& config), (override));
    MOCK_METHOD(bool, StartCapture, (), (override));
    MOCK_METHOD(void, StopCapture, (), (override));
    MOCK_METHOD(bool, PauseCapture, (), (override));
    MOCK_METHOD(bool, ResumeCapture, (), (override));
    MOCK_METHOD(void, SetCaptureCallback, (CaptureCallback callback), (override));
    MOCK_METHOD(void, SetErrorCallback, (ErrorCallback callback), (override));
    MOCK_METHOD(bool, IsCapturing, (), (const, override));
    MOCK_METHOD(AudioConfig, GetCurrentConfig, (), (const, override));
    MOCK_METHOD(float, GetCurrentLevel, (), (const, override));
    MOCK_METHOD(float, GetCaptureLatency, (), (const, override));
    MOCK_METHOD(void, Cleanup, (), (override));
};

// ========================================
// Test Fixtures
// ========================================

class AudioRecorderTest : public Test {
protected:
    void SetUp() override {
        recorder = AudioRecorderFactory::CreateRecorder();
        mock_callback = std::make_shared<MockAudioRecorderCallback>();
        
        // Configuration par défaut pour les tests
        default_config.sample_rate = 44100;
        default_config.channels = 2;
        default_config.bit_depth = 16;
        default_config.buffer_size = 4096;
        
        // Créer un répertoire temporaire pour les tests
        test_dir = std::filesystem::temp_directory_path() / "audio_recorder_tests";
        std::filesystem::create_directories(test_dir);
    }
    
    void TearDown() override {
        // Nettoyer les fichiers de test
        std::filesystem::remove_all(test_dir);
    }
    
    std::unique_ptr<AudioRecorder> recorder;
    std::shared_ptr<MockAudioRecorderCallback> mock_callback;
    AudioConfig default_config;
    std::filesystem::path test_dir;
};

// ========================================
// Tests de Configuration
// ========================================

TEST_F(AudioRecorderTest, InitializeWithValidConfig) {
    EXPECT_TRUE(recorder->Initialize(default_config));
}

TEST_F(AudioRecorderTest, InitializeWithInvalidSampleRate) {
    AudioConfig invalid_config = default_config;
    invalid_config.sample_rate = 200000; // Non supporté
    
    recorder->SetCallback(mock_callback);
    EXPECT_CALL(*mock_callback, OnError(_)).Times(1);
    
    EXPECT_FALSE(recorder->Initialize(invalid_config));
}

TEST_F(AudioRecorderTest, InitializeWithInvalidBitDepth) {
    AudioConfig invalid_config = default_config;
    invalid_config.bit_depth = 8; // Non supporté
    
    recorder->SetCallback(mock_callback);
    EXPECT_CALL(*mock_callback, OnError(_)).Times(1);
    
    EXPECT_FALSE(recorder->Initialize(invalid_config));
}

TEST_F(AudioRecorderTest, InitializeWithInvalidChannels) {
    AudioConfig invalid_config = default_config;
    invalid_config.channels = 0;
    
    recorder->SetCallback(mock_callback);
    EXPECT_CALL(*mock_callback, OnError(_)).Times(1);
    
    EXPECT_FALSE(recorder->Initialize(invalid_config));
}

TEST_F(AudioRecorderTest, InitializeWithZeroBufferSize) {
    AudioConfig invalid_config = default_config;
    invalid_config.buffer_size = 0;
    
    recorder->SetCallback(mock_callback);
    EXPECT_CALL(*mock_callback, OnError(_)).Times(1);
    
    EXPECT_FALSE(recorder->Initialize(invalid_config));
}

TEST_F(AudioRecorderTest, CannotInitializeWhileRecording) {
    ASSERT_TRUE(recorder->Initialize(default_config));
    
    std::string test_file = (test_dir / "test.wav").string();
    ASSERT_TRUE(recorder->StartRecording(test_file));
    
    AudioConfig new_config = default_config;
    new_config.sample_rate = 48000;
    
    EXPECT_FALSE(recorder->Initialize(new_config));
    
    recorder->StopRecording();
}

// ========================================
// Tests d'Enregistrement
// ========================================

TEST_F(AudioRecorderTest, StartAndStopRecording) {
    ASSERT_TRUE(recorder->Initialize(default_config));
    recorder->SetCallback(mock_callback);
    
    std::string test_file = (test_dir / "test.wav").string();
    
    EXPECT_CALL(*mock_callback, OnRecordingStarted()).Times(1);
    EXPECT_TRUE(recorder->StartRecording(test_file));
    EXPECT_TRUE(recorder->IsRecording());
    
    // Attendre un peu pour capturer des données
    std::this_thread::sleep_for(100ms);
    
    EXPECT_CALL(*mock_callback, OnRecordingStopped(test_file)).Times(1);
    std::string result_path = recorder->StopRecording();
    
    EXPECT_EQ(result_path, test_file);
    EXPECT_FALSE(recorder->IsRecording());
    
    // Vérifier que le fichier existe
    EXPECT_TRUE(std::filesystem::exists(test_file));
}

TEST_F(AudioRecorderTest, CannotStartRecordingWithoutInitialization) {
    std::string test_file = (test_dir / "test.wav").string();
    EXPECT_FALSE(recorder->StartRecording(test_file));
}

TEST_F(AudioRecorderTest, CannotStartRecordingTwice) {
    ASSERT_TRUE(recorder->Initialize(default_config));
    
    std::string test_file1 = (test_dir / "test1.wav").string();
    ASSERT_TRUE(recorder->StartRecording(test_file1));
    
    std::string test_file2 = (test_dir / "test2.wav").string();
    EXPECT_FALSE(recorder->StartRecording(test_file2));
    
    recorder->StopRecording();
}

TEST_F(AudioRecorderTest, StopRecordingWhenNotRecording) {
    ASSERT_TRUE(recorder->Initialize(default_config));
    
    std::string result = recorder->StopRecording();
    EXPECT_TRUE(result.empty());
}

// ========================================
// Tests de Pause/Resume
// ========================================

TEST_F(AudioRecorderTest, PauseAndResumeRecording) {
    ASSERT_TRUE(recorder->Initialize(default_config));
    
    std::string test_file = (test_dir / "test_pause.wav").string();
    ASSERT_TRUE(recorder->StartRecording(test_file));
    
    // Enregistrer pendant 100ms
    std::this_thread::sleep_for(100ms);
    
    // Pause
    EXPECT_TRUE(recorder->PauseRecording());
    EXPECT_FALSE(recorder->IsRecording()); // IsRecording retourne false en pause
    
    // Attendre en pause
    std::this_thread::sleep_for(100ms);
    
    // Resume
    EXPECT_TRUE(recorder->ResumeRecording());
    EXPECT_TRUE(recorder->IsRecording());
    
    // Enregistrer encore 100ms
    std::this_thread::sleep_for(100ms);
    
    recorder->StopRecording();
}

TEST_F(AudioRecorderTest, CannotPauseWhenNotRecording) {
    ASSERT_TRUE(recorder->Initialize(default_config));
    EXPECT_FALSE(recorder->PauseRecording());
}

TEST_F(AudioRecorderTest, CannotPauseTwice) {
    ASSERT_TRUE(recorder->Initialize(default_config));
    
    std::string test_file = (test_dir / "test.wav").string();
    ASSERT_TRUE(recorder->StartRecording(test_file));
    
    ASSERT_TRUE(recorder->PauseRecording());
    EXPECT_FALSE(recorder->PauseRecording());
    
    recorder->StopRecording();
}

TEST_F(AudioRecorderTest, CannotResumeWhenNotPaused) {
    ASSERT_TRUE(recorder->Initialize(default_config));
    
    std::string test_file = (test_dir / "test.wav").string();
    ASSERT_TRUE(recorder->StartRecording(test_file));
    
    EXPECT_FALSE(recorder->ResumeRecording());
    
    recorder->StopRecording();
}

// ========================================
// Tests de Statistiques
// ========================================

TEST_F(AudioRecorderTest, GetRecordingStats) {
    ASSERT_TRUE(recorder->Initialize(default_config));
    
    // Stats avant enregistrement
    RecordingStats stats = recorder->GetRecordingStats();
    EXPECT_FALSE(stats.is_recording);
    EXPECT_EQ(stats.duration_seconds, 0.0);
    EXPECT_EQ(stats.total_bytes, 0);
    
    std::string test_file = (test_dir / "test_stats.wav").string();
    ASSERT_TRUE(recorder->StartRecording(test_file));
    
    // Attendre un peu
    std::this_thread::sleep_for(500ms);
    
    stats = recorder->GetRecordingStats();
    EXPECT_TRUE(stats.is_recording);
    EXPECT_GT(stats.duration_seconds, 0.4); // Au moins 400ms
    EXPECT_GT(stats.total_bytes, 0);
    
    recorder->StopRecording();
}

TEST_F(AudioRecorderTest, GetAudioLevel) {
    ASSERT_TRUE(recorder->Initialize(default_config));
    
    // Niveau avant enregistrement
    EXPECT_EQ(recorder->GetAudioLevel(), 0.0f);
    
    std::string test_file = (test_dir / "test_level.wav").string();
    ASSERT_TRUE(recorder->StartRecording(test_file));
    
    // Attendre que des données soient capturées
    std::this_thread::sleep_for(200ms);
    
    float level = recorder->GetAudioLevel();
    EXPECT_GE(level, 0.0f);
    EXPECT_LE(level, 1.0f);
    
    recorder->StopRecording();
}

// ========================================
// Tests de Gestion des Buffers
// ========================================

TEST_F(AudioRecorderTest, GetAudioBuffer) {
    ASSERT_TRUE(recorder->Initialize(default_config));
    
    // Pas de buffer avant l'enregistrement
    EXPECT_EQ(recorder->GetAudioBuffer(), nullptr);
    
    std::string test_file = (test_dir / "test_buffer.wav").string();
    ASSERT_TRUE(recorder->StartRecording(test_file));
    
    // Attendre que des buffers soient disponibles
    std::this_thread::sleep_for(200ms);
    
    // Récupérer un buffer
    auto buffer = recorder->GetAudioBuffer();
    if (buffer) {
        EXPECT_FALSE(buffer->data.empty());
        EXPECT_GT(buffer->duration_ms, 0.0);
    }
    
    recorder->StopRecording();
}

TEST_F(AudioRecorderTest, ClearBuffers) {
    ASSERT_TRUE(recorder->Initialize(default_config));
    
    std::string test_file = (test_dir / "test_clear.wav").string();
    ASSERT_TRUE(recorder->StartRecording(test_file));
    
    // Attendre que des buffers s'accumulent
    std::this_thread::sleep_for(200ms);
    
    // Vider les buffers
    recorder->ClearBuffers();
    
    // Plus de buffers disponibles
    EXPECT_EQ(recorder->GetAudioBuffer(), nullptr);
    
    recorder->StopRecording();
}

// ========================================
// Tests de Formats Supportés
// ========================================

TEST_F(AudioRecorderTest, GetSupportedFormats) {
    auto formats = recorder->GetSupportedFormats();
    
    EXPECT_FALSE(formats.empty());
    EXPECT_THAT(formats, Contains("wav"));
    EXPECT_THAT(formats, Contains("pcm"));
}

// ========================================
// Tests de Validation Espace Disque
// ========================================

TEST_F(AudioRecorderTest, DiskSpaceValidation) {
    ASSERT_TRUE(recorder->Initialize(default_config));
    recorder->SetCallback(mock_callback);
    
    // Créer un chemin dans un répertoire avec peu d'espace (simulation)
    // Pour un vrai test, il faudrait mocker CheckDiskSpace
    std::string test_file = (test_dir / "test_disk.wav").string();
    
    // Le test devrait passer car on a généralement assez d'espace
    EXPECT_TRUE(recorder->StartRecording(test_file));
    
    recorder->StopRecording();
}

TEST_F(AudioRecorderTest, CreateDirectoryIfNotExists) {
    ASSERT_TRUE(recorder->Initialize(default_config));
    
    // Créer un chemin avec un nouveau répertoire
    auto new_dir = test_dir / "new_subdir";
    std::string test_file = (new_dir / "test.wav").string();
    
    // Le répertoire ne doit pas exister
    EXPECT_FALSE(std::filesystem::exists(new_dir));
    
    // StartRecording doit créer le répertoire
    EXPECT_TRUE(recorder->StartRecording(test_file));
    
    // Le répertoire doit maintenant exister
    EXPECT_TRUE(std::filesystem::exists(new_dir));
    
    recorder->StopRecording();
}

// ========================================
// Tests de Callbacks
// ========================================

TEST_F(AudioRecorderTest, AudioDataCallback) {
    ASSERT_TRUE(recorder->Initialize(default_config));
    recorder->SetCallback(mock_callback);
    
    std::string test_file = (test_dir / "test_callback.wav").string();
    
    // S'attendre à recevoir des callbacks OnAudioData
    EXPECT_CALL(*mock_callback, OnAudioData(_)).Times(AtLeast(1));
    
    ASSERT_TRUE(recorder->StartRecording(test_file));
    
    // Attendre pour recevoir des données
    std::this_thread::sleep_for(500ms);
    
    recorder->StopRecording();
}

TEST_F(AudioRecorderTest, ErrorCallback) {
    ASSERT_TRUE(recorder->Initialize(default_config));
    recorder->SetCallback(mock_callback);
    
    // Essayer d'écrire dans un répertoire invalide
    std::string invalid_file = "/invalid_path/that/does/not/exist/test.wav";
    
    EXPECT_CALL(*mock_callback, OnError(_)).Times(AtLeast(1));
    
    EXPECT_FALSE(recorder->StartRecording(invalid_file));
}

// ========================================
// Tests de Cleanup
// ========================================

TEST_F(AudioRecorderTest, Cleanup) {
    ASSERT_TRUE(recorder->Initialize(default_config));
    
    std::string test_file = (test_dir / "test_cleanup.wav").string();
    ASSERT_TRUE(recorder->StartRecording(test_file));
    
    // Cleanup doit arrêter l'enregistrement
    recorder->Cleanup();
    
    EXPECT_FALSE(recorder->IsRecording());
    EXPECT_EQ(recorder->GetAudioLevel(), 0.0f);
}

// ========================================
// Tests d'Intégration avec AudioCapture
// ========================================

class AudioCaptureIntegrationTest : public Test {
protected:
    void SetUp() override {
        capture = std::make_unique<AudioCaptureCpp>();
        
        config.sample_rate = 44100;
        config.channels = 2;
        config.bit_depth = 16;
        config.buffer_size = 1024;
    }
    
    std::unique_ptr<AudioCaptureCpp> capture;
    AudioConfig config;
};

TEST_F(AudioCaptureIntegrationTest, InitializeCapture) {
    EXPECT_TRUE(capture->Initialize(config));
}

TEST_F(AudioCaptureIntegrationTest, StartStopCapture) {
    ASSERT_TRUE(capture->Initialize(config));
    
    EXPECT_TRUE(capture->StartCapture());
    EXPECT_TRUE(capture->IsCapturing());
    
    std::this_thread::sleep_for(100ms);
    
    capture->StopCapture();
    EXPECT_FALSE(capture->IsCapturing());
}

TEST_F(AudioCaptureIntegrationTest, CaptureCallback) {
    ASSERT_TRUE(capture->Initialize(config));
    
    std::atomic<int> callback_count{0};
    
    capture->SetCaptureCallback([&callback_count](const float* data, size_t frames, int64_t timestamp) {
        callback_count++;
        EXPECT_NE(data, nullptr);
        EXPECT_GT(frames, 0);
        EXPECT_GE(timestamp, 0);
    });
    
    ASSERT_TRUE(capture->StartCapture());
    
    // Attendre pour recevoir des callbacks
    std::this_thread::sleep_for(500ms);
    
    capture->StopCapture();
    
    EXPECT_GT(callback_count.load(), 0);
}

TEST_F(AudioCaptureIntegrationTest, GetCapabilities) {
    auto caps = AudioCaptureFactory::GetCapabilities();
    
    EXPECT_FALSE(caps.supported_sample_rates.empty());
    EXPECT_GT(caps.max_channels, 0);
    EXPECT_FALSE(caps.supported_bit_depths.empty());
    EXPECT_TRUE(caps.supports_pause);
}

// ========================================
// Main
// ========================================

int main(int argc, char** argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}