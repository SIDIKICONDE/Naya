#include "gtest/gtest.h"
#include "gmock/gmock.h"
#include "../AudioEncoders.h"
#include "../AudioEncoderInterface.h"
#include <filesystem>
#include <fstream>

using namespace audio;
using namespace testing;

// ========================================
// TESTS POUR AUDIO ENCODER INTERFACE
// ========================================

class AudioEncoderInterfaceTest : public Test {
protected:
    void SetUp() override {
        config_.sample_rate = 44100;
        config_.channels = 2;
        config_.bit_depth = 16;
        config_.buffer_size = 1024;
        
        encoder_config_.format = AudioFormat::WAV;
        encoder_config_.quality = AudioQuality::HIGH;
        encoder_config_.write_metadata = true;
        
        test_output_path_ = "test_encoder_output.wav";
        
        // Supprimer fichier précédent si existant
        if (std::filesystem::exists(test_output_path_)) {
            std::filesystem::remove(test_output_path_);
        }
    }
    
    void TearDown() override {
        if (std::filesystem::exists(test_output_path_)) {
            std::filesystem::remove(test_output_path_);
        }
    }
    
    AudioConfig config_;
    EncoderConfig encoder_config_;
    std::string test_output_path_;
};

TEST_F(AudioEncoderInterfaceTest, GetFileExtension) {
    EXPECT_EQ(AudioEncoderInterface::GetFileExtension(AudioFormat::WAV), "wav");
    EXPECT_EQ(AudioEncoderInterface::GetFileExtension(AudioFormat::FLAC), "flac");
    EXPECT_EQ(AudioEncoderInterface::GetFileExtension(AudioFormat::OGG), "ogg");
    EXPECT_EQ(AudioEncoderInterface::GetFileExtension(AudioFormat::AAC), "m4a");
    EXPECT_EQ(AudioEncoderInterface::GetFileExtension(AudioFormat::MP3), "mp3");
    EXPECT_EQ(AudioEncoderInterface::GetFileExtension(AudioFormat::OPUS), "opus");
}

TEST_F(AudioEncoderInterfaceTest, GetFormatName) {
    EXPECT_EQ(AudioEncoderInterface::GetFormatName(AudioFormat::WAV), "WAV PCM");
    EXPECT_EQ(AudioEncoderInterface::GetFormatName(AudioFormat::FLAC), "FLAC Lossless");
    EXPECT_EQ(AudioEncoderInterface::GetFormatName(AudioFormat::OGG), "Ogg Vorbis");
    EXPECT_EQ(AudioEncoderInterface::GetFormatName(AudioFormat::AAC), "AAC (Advanced Audio Coding)");
}

TEST_F(AudioEncoderInterfaceTest, EstimateFileSize) {
    // Test WAV size estimation
    double duration = 10.0; // 10 secondes
    size_t estimated_size = AudioEncoderInterface::EstimateFileSize(config_, encoder_config_, duration);
    
    // WAV: sample_rate * channels * (bit_depth/8) * duration + header
    size_t expected_size = 44100 * 2 * 2 * 10 + 44; // 1764044 bytes
    EXPECT_EQ(estimated_size, expected_size);
    
    // Test FLAC size estimation (environ 60% du WAV)
    encoder_config_.format = AudioFormat::FLAC;
    size_t flac_size = AudioEncoderInterface::EstimateFileSize(config_, encoder_config_, duration);
    EXPECT_LT(flac_size, estimated_size);
    EXPECT_GT(flac_size, estimated_size / 2); // Au moins 50% du WAV
}

// ========================================
// TESTS POUR WAV ENCODER
// ========================================

class WAVEncoderTest : public AudioEncoderInterfaceTest {
protected:
    void SetUp() override {
        AudioEncoderInterfaceTest::SetUp();
        encoder_ = std::make_unique<WAVEncoder>();
    }
    
    std::unique_ptr<WAVEncoder> encoder_;
};

TEST_F(WAVEncoderTest, InitializeWithValidConfig) {
    EXPECT_TRUE(encoder_->Initialize(config_, encoder_config_, test_output_path_));
    EXPECT_TRUE(encoder_->SupportsFormat(AudioFormat::WAV));
    EXPECT_FALSE(encoder_->SupportsFormat(AudioFormat::FLAC));
}

TEST_F(WAVEncoderTest, InitializeWithInvalidFormat) {
    encoder_config_.format = AudioFormat::FLAC; // WAVEncoder ne supporte que WAV
    EXPECT_FALSE(encoder_->Initialize(config_, encoder_config_, test_output_path_));
}

TEST_F(WAVEncoderTest, FullEncodingCycle) {
    // Mock du callback d'erreur
    bool error_occurred = false;
    std::string last_error;
    encoder_->SetErrorCallback([&](const std::string& error) {
        error_occurred = true;
        last_error = error;
    });
    
    // Mock du callback de progression
    float last_progress = 0.0f;
    size_t last_bytes_written = 0;
    encoder_->SetProgressCallback([&](float progress, size_t bytes_written) {
        last_progress = progress;
        last_bytes_written = bytes_written;
    });
    
    // Initialiser
    ASSERT_TRUE(encoder_->Initialize(config_, encoder_config_, test_output_path_));
    
    // Démarrer l'encodage
    ASSERT_TRUE(encoder_->StartEncoding());
    EXPECT_TRUE(encoder_->IsEncoding());
    
    // Encoder quelques buffers
    const size_t frames = 1024;
    std::vector<float> audio_data(frames * config_.channels);
    
    // Générer signal test (sine wave)
    for (size_t frame = 0; frame < frames; ++frame) {
        float sample = 0.5f * std::sin(2.0 * M_PI * 440.0 * frame / config_.sample_rate);
        for (size_t ch = 0; ch < config_.channels; ++ch) {
            audio_data[frame * config_.channels + ch] = sample;
        }
    }
    
    // Encoder plusieurs buffers
    for (int i = 0; i < 10; ++i) {
        EXPECT_TRUE(encoder_->EncodeAudio(audio_data.data(), frames));
    }
    
    // Vérifier métriques
    auto stats = encoder_->GetStats();
    EXPECT_EQ(stats.total_frames_encoded, frames * 10);
    EXPECT_GT(stats.output_file_size, 0);
    EXPECT_EQ(stats.output_format, AudioFormat::WAV);
    EXPECT_NEAR(stats.compression_ratio, 1.0f, 0.01f); // WAV non compressé
    
    // Finaliser
    std::string result_path = encoder_->FinishEncoding();
    EXPECT_EQ(result_path, test_output_path_);
    EXPECT_FALSE(encoder_->IsEncoding());
    
    // Vérifier que le fichier existe et a une taille raisonnable
    EXPECT_TRUE(std::filesystem::exists(test_output_path_));
    auto file_size = std::filesystem::file_size(test_output_path_);
    EXPECT_GT(file_size, 44); // Au moins la taille du header WAV
    
    // Vérifier qu'aucune erreur n'est survenue
    EXPECT_FALSE(error_occurred);
}

TEST_F(WAVEncoderTest, CancelEncoding) {
    ASSERT_TRUE(encoder_->Initialize(config_, encoder_config_, test_output_path_));
    ASSERT_TRUE(encoder_->StartEncoding());
    
    // Encoder un peu de données
    std::vector<float> audio_data(1024 * config_.channels, 0.5f);
    EXPECT_TRUE(encoder_->EncodeAudio(audio_data.data(), 1024));
    
    // Annuler l'encodage
    encoder_->CancelEncoding();
    EXPECT_FALSE(encoder_->IsEncoding());
    
    // Le fichier partiel devrait être supprimé
    EXPECT_FALSE(std::filesystem::exists(test_output_path_));
}

TEST_F(WAVEncoderTest, GetCurrentConfig) {
    ASSERT_TRUE(encoder_->Initialize(config_, encoder_config_, test_output_path_));
    
    auto current_config = encoder_->GetCurrentConfig();
    EXPECT_EQ(current_config.format, encoder_config_.format);
    EXPECT_EQ(current_config.quality, encoder_config_.quality);
    EXPECT_EQ(current_config.write_metadata, encoder_config_.write_metadata);
}

// ========================================
// TESTS POUR UNIVERSAL ENCODER
// ========================================

class UniversalEncoderTest : public AudioEncoderInterfaceTest {
protected:
    void SetUp() override {
        AudioEncoderInterfaceTest::SetUp();
        encoder_ = std::make_unique<UniversalEncoder>(AudioFormat::WAV);
    }
    
    std::unique_ptr<UniversalEncoder> encoder_;
};

TEST_F(UniversalEncoderTest, InitializeWithSupportedFormat) {
    encoder_config_.format = AudioFormat::WAV;
    EXPECT_TRUE(encoder_->Initialize(config_, encoder_config_, test_output_path_));
    
    auto* current_encoder = encoder_->GetCurrentEncoder();
    EXPECT_NE(current_encoder, nullptr);
    EXPECT_TRUE(current_encoder->SupportsFormat(AudioFormat::WAV));
}

TEST_F(UniversalEncoderTest, FallbackToWAVForUnsupportedFormat) {
    encoder_config_.format = AudioFormat::FLAC; // Pas encore implémenté
    EXPECT_TRUE(encoder_->Initialize(config_, encoder_config_, test_output_path_));
    
    // Devrait avoir fallback vers WAV
    auto* current_encoder = encoder_->GetCurrentEncoder();
    EXPECT_NE(current_encoder, nullptr);
}

TEST_F(UniversalEncoderTest, SetFormatBeforeAndAfterInitialization) {
    EXPECT_TRUE(encoder_->SetFormat(AudioFormat::OGG));
    
    // On peut changer plusieurs fois avant l'initialisation
    EXPECT_TRUE(encoder_->SetFormat(AudioFormat::WAV));
    
    // Initialiser
    encoder_config_.format = AudioFormat::WAV;
    ASSERT_TRUE(encoder_->Initialize(config_, encoder_config_, test_output_path_));
    
    // Ne peut plus changer après initialisation
    EXPECT_FALSE(encoder_->SetFormat(AudioFormat::OGG));
}

// ========================================
// TESTS POUR AUDIO ENCODER FACTORY
// ========================================

class AudioEncoderFactoryTest : public Test {};

TEST_F(AudioEncoderFactoryTest, CreateEncoder) {
    auto wav_encoder = AudioEncoderFactory::CreateEncoder(AudioFormat::WAV);
    EXPECT_NE(wav_encoder, nullptr);
    EXPECT_TRUE(wav_encoder->SupportsFormat(AudioFormat::WAV));
    
    auto flac_encoder = AudioEncoderFactory::CreateEncoder(AudioFormat::FLAC);
    EXPECT_NE(flac_encoder, nullptr);
    EXPECT_FALSE(flac_encoder->SupportsFormat(AudioFormat::FLAC)); // Pas encore implémenté
}

TEST_F(AudioEncoderFactoryTest, IsFormatSupported) {
    EXPECT_TRUE(AudioEncoderFactory::IsFormatSupported(AudioFormat::WAV));
    EXPECT_FALSE(AudioEncoderFactory::IsFormatSupported(AudioFormat::FLAC)); // Stub
    EXPECT_FALSE(AudioEncoderFactory::IsFormatSupported(AudioFormat::OGG));  // Stub
    EXPECT_FALSE(AudioEncoderFactory::IsFormatSupported(AudioFormat::AAC));  // Stub
}

TEST_F(AudioEncoderFactoryTest, GetSupportedFormats) {
    auto formats = AudioEncoderFactory::GetSupportedFormats();
    EXPECT_FALSE(formats.empty());
    
    // WAV devrait être supporté
    EXPECT_NE(std::find(formats.begin(), formats.end(), AudioFormat::WAV), formats.end());
}

TEST_F(AudioEncoderFactoryTest, GetCapabilities) {
    auto caps = AudioEncoderFactory::GetCapabilities();
    
    EXPECT_FALSE(caps.supported_formats.empty());
    EXPECT_FALSE(caps.supported_sample_rates.empty());
    EXPECT_FALSE(caps.supported_channels.empty());
    EXPECT_TRUE(caps.supports_metadata);
    EXPECT_TRUE(caps.supports_variable_bitrate);
    EXPECT_GT(caps.max_file_size, 0);
}

TEST_F(AudioEncoderFactoryTest, CreateOptimizedConfig) {
    // Test config pour musique
    auto music_config = AudioEncoderFactory::CreateOptimizedConfig(AudioFormat::WAV, "music");
    EXPECT_EQ(music_config.format, AudioFormat::WAV);
    EXPECT_EQ(music_config.quality, AudioQuality::HIGH);
    EXPECT_TRUE(music_config.use_variable_bitrate);
    EXPECT_TRUE(music_config.write_metadata);
    
    // Test config pour voix
    auto voice_config = AudioEncoderFactory::CreateOptimizedConfig(AudioFormat::AAC, "voice");
    EXPECT_EQ(voice_config.format, AudioFormat::AAC);
    EXPECT_EQ(voice_config.quality, AudioQuality::MEDIUM);
    
    // Test config pour archive
    auto archive_config = AudioEncoderFactory::CreateOptimizedConfig(AudioFormat::FLAC, "archive");
    EXPECT_EQ(archive_config.format, AudioFormat::FLAC);
    EXPECT_EQ(archive_config.compression_level, 8); // Max compression
}

// ========================================
// TESTS POUR FORMAT UTILS
// ========================================

class FormatUtilsTest : public Test {};

TEST_F(FormatUtilsTest, DetectFormatFromFilename) {
    EXPECT_EQ(format_utils::DetectFormatFromFilename("recording.wav"), AudioFormat::WAV);
    EXPECT_EQ(format_utils::DetectFormatFromFilename("music.flac"), AudioFormat::FLAC);
    EXPECT_EQ(format_utils::DetectFormatFromFilename("song.ogg"), AudioFormat::OGG);
    EXPECT_EQ(format_utils::DetectFormatFromFilename("audio.m4a"), AudioFormat::AAC);
    EXPECT_EQ(format_utils::DetectFormatFromFilename("track.mp3"), AudioFormat::MP3);
    EXPECT_EQ(format_utils::DetectFormatFromFilename("voice.opus"), AudioFormat::OPUS);
    
    // Test avec chemins complets
    EXPECT_EQ(format_utils::DetectFormatFromFilename("/path/to/file.WAV"), AudioFormat::WAV);
    EXPECT_EQ(format_utils::DetectFormatFromFilename("C:\\recordings\\test.FLAC"), AudioFormat::FLAC);
    
    // Test format inconnu (devrait retourner WAV par défaut)
    EXPECT_EQ(format_utils::DetectFormatFromFilename("unknown.xyz"), AudioFormat::WAV);
    EXPECT_EQ(format_utils::DetectFormatFromFilename("no_extension"), AudioFormat::WAV);
}

TEST_F(FormatUtilsTest, IsConfigurationValid) {
    AudioConfig config{44100, 2, 16, 1024};
    
    EXPECT_TRUE(format_utils::IsConfigurationValid(config, AudioFormat::WAV));
    EXPECT_TRUE(format_utils::IsConfigurationValid(config, AudioFormat::FLAC));
    EXPECT_TRUE(format_utils::IsConfigurationValid(config, AudioFormat::OGG));
    EXPECT_TRUE(format_utils::IsConfigurationValid(config, AudioFormat::AAC));
    
    // Test avec configuration extrême
    AudioConfig extreme_config{192000, 8, 32, 4096};
    EXPECT_TRUE(format_utils::IsConfigurationValid(extreme_config, AudioFormat::WAV));
    EXPECT_FALSE(format_utils::IsConfigurationValid(extreme_config, AudioFormat::OGG)); // Limité à 48kHz
}

TEST_F(FormatUtilsTest, GetRecommendedQuality) {
    EXPECT_EQ(format_utils::GetRecommendedQuality(AudioFormat::WAV, "music"), AudioQuality::EXTREME);
    EXPECT_EQ(format_utils::GetRecommendedQuality(AudioFormat::FLAC, "voice"), AudioQuality::EXTREME);
    
    EXPECT_EQ(format_utils::GetRecommendedQuality(AudioFormat::OGG, "music"), AudioQuality::HIGH);
    EXPECT_EQ(format_utils::GetRecommendedQuality(AudioFormat::AAC, "voice"), AudioQuality::MEDIUM);
    EXPECT_EQ(format_utils::GetRecommendedQuality(AudioFormat::MP3, "archive"), AudioQuality::VERY_HIGH);
}

TEST_F(FormatUtilsTest, QualityToBitrate) {
    // Test OGG bitrates
    EXPECT_EQ(format_utils::QualityToBitrate(AudioQuality::LOW, AudioFormat::OGG), 96);
    EXPECT_EQ(format_utils::QualityToBitrate(AudioQuality::MEDIUM, AudioFormat::OGG), 128);
    EXPECT_EQ(format_utils::QualityToBitrate(AudioQuality::HIGH, AudioFormat::OGG), 192);
    EXPECT_EQ(format_utils::QualityToBitrate(AudioQuality::VERY_HIGH, AudioFormat::OGG), 256);
    EXPECT_EQ(format_utils::QualityToBitrate(AudioQuality::EXTREME, AudioFormat::OGG), 320);
    
    // Test AAC bitrates
    EXPECT_EQ(format_utils::QualityToBitrate(AudioQuality::LOW, AudioFormat::AAC), 80);
    EXPECT_EQ(format_utils::QualityToBitrate(AudioQuality::MEDIUM, AudioFormat::AAC), 128);
    EXPECT_EQ(format_utils::QualityToBitrate(AudioQuality::HIGH, AudioFormat::AAC), 192);
    
    // Format non supporté devrait retourner default
    EXPECT_EQ(format_utils::QualityToBitrate(AudioQuality::HIGH, AudioFormat::WAV), 192);
}