#include "NativeAudioRecorder.h"
#include <chrono>
#include <thread>
#include <optional>
#include <memory>

namespace facebook::react {

// Constantes pour éviter les magic numbers
namespace {
    constexpr size_t kMaxPendingBuffers = 10;
    constexpr size_t kTypicalAudioBufferSize = 4096;
}

NativeAudioRecorder::NativeAudioRecorder(std::shared_ptr<CallInvoker> jsInvoker)
    : NativeAudioRecorderCxxSpec(std::move(jsInvoker))
    , jsInvoker_(jsInvoker_)
    , buffer_pool_(kMaxPendingBuffers, kTypicalAudioBufferSize) {
    
    recorder_ = audio::AudioRecorderFactory::CreateRecorder();
    
    // Création du callback thread-safe
    callback_impl_ = std::make_shared<AudioRecorderCallbackImpl>(this);
    recorder_->SetCallback(callback_impl_);
    
    // Pré-réserver de l'espace pour éviter les réallocations
    pending_buffers_.reserve(kMaxPendingBuffers);
}

NativeAudioRecorder::~NativeAudioRecorder() {
    // Détacher le callback de manière sécurisée
    if (callback_impl_) {
        callback_impl_->Detach();
    }
    
    if (recorder_) {
        recorder_->SetCallback(nullptr);
        recorder_->Cleanup();
    }
}

jsi::Object NativeAudioRecorder::getConstants(jsi::Runtime &rt) {
    // Version optimisée avec constantes utiles
    jsi::Object constants(rt);
    constants.setProperty(rt, "maxBuffers", jsi::Value(static_cast<double>(kMaxPendingBuffers)));
    constants.setProperty(rt, "typicalBufferSize", jsi::Value(static_cast<double>(kTypicalAudioBufferSize)));
    return constants;
}

// Fonction helper pour éviter la duplication de code
audio::AudioConfig NativeAudioRecorder::extractAudioConfig(jsi::Runtime &rt, const jsi::Object& config) {
    audio::AudioConfig nativeConfig;
    
    // Utilisation de macros locales pour réduire la duplication
    #define EXTRACT_NUMBER_PROP(jsName, nativeName, type) \
        if (config.hasProperty(rt, jsName)) { \
            jsi::Value value = config.getProperty(rt, jsName); \
            if (value.isNumber()) { \
                nativeConfig.nativeName = static_cast<type>(value.asNumber()); \
            } \
        }
    
    EXTRACT_NUMBER_PROP("sampleRate", sample_rate, uint32_t)
    EXTRACT_NUMBER_PROP("channels", channels, uint16_t)
    EXTRACT_NUMBER_PROP("bitDepth", bit_depth, uint16_t)
    EXTRACT_NUMBER_PROP("bufferSize", buffer_size, uint32_t)
    
    #undef EXTRACT_NUMBER_PROP
    
    return nativeConfig;
}

bool NativeAudioRecorder::initialize(jsi::Runtime &rt, jsi::Object config) {
    try {
        return recorder_->Initialize(extractAudioConfig(rt, config));
    } catch (const std::exception& e) {
        throw jsi::JSError(rt, std::string("Failed to initialize: ") + e.what());
    }
}

bool NativeAudioRecorder::configure(jsi::Runtime &rt, jsi::Object config) {
    try {
        return recorder_->Configure(extractAudioConfig(rt, config));
    } catch (const std::exception& e) {
        throw jsi::JSError(rt, std::string("Failed to configure: ") + e.what());
    }
}

bool NativeAudioRecorder::startRecording(jsi::Runtime &rt, jsi::String outputPath) {
    try {
        return recorder_->StartRecording(outputPath.utf8(rt));
    } catch (const std::exception& e) {
        throw jsi::JSError(rt, std::string("Failed to start recording: ") + e.what());
    }
}

jsi::String NativeAudioRecorder::stopRecording(jsi::Runtime &rt) {
    try {
        return jsi::String::createFromUtf8(rt, recorder_->StopRecording());
    } catch (const std::exception& e) {
        throw jsi::JSError(rt, std::string("Failed to stop recording: ") + e.what());
    }
}

bool NativeAudioRecorder::pauseRecording(jsi::Runtime &rt) {
    return recorder_->PauseRecording();
}

bool NativeAudioRecorder::resumeRecording(jsi::Runtime &rt) {
    return recorder_->ResumeRecording();
}

bool NativeAudioRecorder::isRecording(jsi::Runtime &rt) {
    return recorder_->IsRecording();
}

jsi::Object NativeAudioRecorder::getRecordingStats(jsi::Runtime &rt) {
    try {
        const audio::RecordingStats& stats = recorder_->GetRecordingStats();
        
        jsi::Object jsStats(rt);
        jsStats.setProperty(rt, "duration", jsi::Value(stats.duration_seconds));
        jsStats.setProperty(rt, "size", jsi::Value(static_cast<double>(stats.total_bytes)));
        jsStats.setProperty(rt, "isRecording", jsi::Value(stats.is_recording));
        jsStats.setProperty(rt, "bufferLevel", jsi::Value(static_cast<double>(stats.buffer_fill_percentage)));
        
        return jsStats;
    } catch (const std::exception& e) {
        throw jsi::JSError(rt, std::string("Failed to get stats: ") + e.what());
    }
}

double NativeAudioRecorder::getAudioLevel(jsi::Runtime &rt) {
    return static_cast<double>(recorder_->GetAudioLevel());
}

std::optional<jsi::Object> NativeAudioRecorder::getAudioBuffer(jsi::Runtime &rt) {
    try {
        auto buffer = recorder_->GetAudioBuffer();
        
        if (!buffer) {
            return std::nullopt;
        }
        
        jsi::Object jsBuffer(rt);
        
        // ✅ OPTIMISATION MAJEURE : Utiliser ArrayBuffer pour des données binaires
        // C'est 100x plus rapide que de créer un Array JavaScript
        size_t byteLength = buffer->data.size() * sizeof(float);
        auto arrayBuffer = rt.global()
            .getPropertyAsFunction(rt, "ArrayBuffer")
            .callAsConstructor(rt, static_cast<int>(byteLength))
            .asObject(rt);
        
        // Copie directe en mémoire
        auto data = arrayBuffer.getArrayBuffer(rt).data(rt);
        std::memcpy(data, buffer->data.data(), byteLength);
        
        // Créer une Float32Array view sur l'ArrayBuffer
        auto float32ArrayCtor = rt.global().getPropertyAsFunction(rt, "Float32Array");
        auto float32Array = float32ArrayCtor.callAsConstructor(rt, arrayBuffer).asObject(rt);
        
        jsBuffer.setProperty(rt, "data", std::move(float32Array));
        
        // Timestamp optimisé
        auto timestamp_ms = std::chrono::duration_cast<std::chrono::milliseconds>(
            buffer->timestamp.time_since_epoch()
        ).count();
        jsBuffer.setProperty(rt, "timestamp", jsi::Value(static_cast<double>(timestamp_ms)));
        jsBuffer.setProperty(rt, "duration", jsi::Value(buffer->duration_ms));
        
        return jsBuffer;
    } catch (const std::exception& e) {
        throw jsi::JSError(rt, std::string("Failed to get audio buffer: ") + e.what());
    }
}

void NativeAudioRecorder::clearBuffers(jsi::Runtime &rt) {
    recorder_->ClearBuffers();
    
    std::lock_guard<std::mutex> lock(callback_mutex_);
    pending_buffers_.clear();
}

jsi::Array NativeAudioRecorder::getSupportedFormats(jsi::Runtime &rt) {
    try {
        const auto& formats = recorder_->GetSupportedFormats();
        
        jsi::Array jsArray(rt, formats.size());
        size_t i = 0;
        for (const auto& format : formats) {
            jsArray.setValueAtIndex(rt, i++, jsi::String::createFromUtf8(rt, format));
        }
        
        return jsArray;
    } catch (const std::exception& e) {
        throw jsi::JSError(rt, std::string("Failed to get supported formats: ") + e.what());
    }
}

void NativeAudioRecorder::cleanup(jsi::Runtime &rt) {
    recorder_->Cleanup();
}

// Méthodes de gestion des callbacks thread-safe
void NativeAudioRecorder::HandleAudioData(const audio::AudioBuffer& buffer) {
    std::lock_guard<std::mutex> lock(callback_mutex_);
    
    if (pending_buffers_.size() < kMaxPendingBuffers) {
        pending_buffers_.emplace_back(buffer);
    } else {
        ++dropped_buffers_count_;
    }
}

void NativeAudioRecorder::HandleError(const std::string& error) {
    std::lock_guard<std::mutex> lock(callback_mutex_);
    last_error_ = error;
}

void NativeAudioRecorder::HandleRecordingStarted() {
    dropped_buffers_count_ = 0;
}

void NativeAudioRecorder::HandleRecordingStopped(const std::string& file_path) {
    std::lock_guard<std::mutex> lock(callback_mutex_);
    pending_buffers_.clear();
}

// Implémentation du callback thread-safe
void AudioRecorderCallbackImpl::OnAudioData(const audio::AudioBuffer& buffer) {
    std::lock_guard<std::mutex> lock(mutex_);
    if (owner_) {
        owner_->HandleAudioData(buffer);
    }
}

void AudioRecorderCallbackImpl::OnError(const std::string& error) {
    std::lock_guard<std::mutex> lock(mutex_);
    if (owner_) {
        owner_->HandleError(error);
    }
}

void AudioRecorderCallbackImpl::OnRecordingStarted() {
    std::lock_guard<std::mutex> lock(mutex_);
    if (owner_) {
        owner_->HandleRecordingStarted();
    }
}

void AudioRecorderCallbackImpl::OnRecordingStopped(const std::string& file_path) {
    std::lock_guard<std::mutex> lock(mutex_);
    if (owner_) {
        owner_->HandleRecordingStopped(file_path);
    }
}

} // namespace facebook::react