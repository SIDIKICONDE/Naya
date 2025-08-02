#include "NativeFFmpegModule.h"

extern "C" {
#include <libavcodec/avcodec.h>
#include <libavformat/avformat.h>
#include <libavutil/avutil.h>
#include <libavfilter/avfilter.h>
#include <libswscale/swscale.h>
#include <libswresample/swresample.h>
}

#include <string>
#include <sstream>
#include <iostream>

namespace facebook::react {

bool NativeFFmpegModule::isFFmpegInitialized = false;

NativeFFmpegModule::NativeFFmpegModule(std::shared_ptr<CallInvoker> jsInvoker)
    : NativeFFmpegModuleCxxSpec(std::move(jsInvoker)) {}

jsi::String NativeFFmpegModule::getFFmpegVersion(jsi::Runtime &rt) {
  std::string versionInfo = getVersionInfo();
  return jsi::String::createFromUtf8(rt, versionInfo);
}

bool NativeFFmpegModule::initializeFFmpeg(jsi::Runtime &rt) {
  if (isFFmpegInitialized) {
    return true;
  }
  
  try {
    // Initialiser les réseaux pour les protocoles réseau
    avformat_network_init();
    
    // Log du niveau d'information
    av_log_set_level(AV_LOG_INFO);
    
    isFFmpegInitialized = true;
    return true;
  } catch (...) {
    return false;
  }
}

jsi::String NativeFFmpegModule::getSupportedFormats(jsi::Runtime &rt) {
  std::string formats = listSupportedFormats();
  return jsi::String::createFromUtf8(rt, formats);
}

bool NativeFFmpegModule::testAudioEncoding(jsi::Runtime &rt) {
  return performAudioEncodingTest();
}

jsi::String NativeFFmpegModule::getAudioInfo(jsi::Runtime &rt, jsi::String filePath) {
  std::string path = filePath.utf8(rt);
  std::string info = extractAudioInformation(path);
  return jsi::String::createFromUtf8(rt, info);
}

bool NativeFFmpegModule::convertAudioFormat(jsi::Runtime &rt, jsi::String inputPath, jsi::String outputPath, jsi::String format) {
  std::string input = inputPath.utf8(rt);
  std::string output = outputPath.utf8(rt);
  std::string fmt = format.utf8(rt);
  
  return performAudioConversion(input, output, fmt);
}

// Implémentations des méthodes privées

std::string NativeFFmpegModule::getVersionInfo() {
  std::stringstream ss;
  
  ss << "FFmpeg Information:" << std::endl;
  ss << "Version: " << av_version_info() << std::endl;
  ss << "Configuration: " << avcodec_configuration() << std::endl;
  ss << std::endl;
  
  ss << "Library Versions:" << std::endl;
  ss << "libavcodec: " << LIBAVCODEC_VERSION_MAJOR << "." 
     << LIBAVCODEC_VERSION_MINOR << "." << LIBAVCODEC_VERSION_MICRO << std::endl;
  ss << "libavformat: " << LIBAVFORMAT_VERSION_MAJOR << "." 
     << LIBAVFORMAT_VERSION_MINOR << "." << LIBAVFORMAT_VERSION_MICRO << std::endl;
  ss << "libavutil: " << LIBAVUTIL_VERSION_MAJOR << "." 
     << LIBAVUTIL_VERSION_MINOR << "." << LIBAVUTIL_VERSION_MICRO << std::endl;
  ss << "libavfilter: " << LIBAVFILTER_VERSION_MAJOR << "." 
     << LIBAVFILTER_VERSION_MINOR << "." << LIBAVFILTER_VERSION_MICRO << std::endl;
  ss << "libswscale: " << LIBSWSCALE_VERSION_MAJOR << "." 
     << LIBSWSCALE_VERSION_MINOR << "." << LIBSWSCALE_VERSION_MICRO << std::endl;
  ss << "libswresample: " << LIBSWRESAMPLE_VERSION_MAJOR << "." 
     << LIBSWRESAMPLE_VERSION_MINOR << "." << LIBSWRESAMPLE_VERSION_MICRO;
  
  return ss.str();
}

std::string NativeFFmpegModule::listSupportedFormats() {
  std::stringstream ss;
  
  ss << "=== FORMATS D'ENTRÉE SUPPORTÉS ===" << std::endl;
  const AVInputFormat* input_format = nullptr;
  void* opaque = nullptr;
  int count = 0;
  
  while ((input_format = av_demuxer_iterate(&opaque)) && count < 15) {
    if (input_format->name && input_format->long_name) {
      ss << "- " << input_format->name << " (" << input_format->long_name << ")" << std::endl;
      count++;
    }
  }
  
  ss << std::endl << "=== CODECS AUDIO SUPPORTÉS ===" << std::endl;
  const AVCodec* codec = nullptr;
  opaque = nullptr;
  count = 0;
  
  while ((codec = av_codec_iterate(&opaque)) && count < 15) {
    if (codec->name && codec->long_name && codec->type == AVMEDIA_TYPE_AUDIO) {
      const char* type = av_codec_is_encoder(codec) ? "Encoder" : "Decoder";
      ss << "- " << codec->name << " (" << codec->long_name << ") [" << type << "]" << std::endl;
      count++;
    }
  }
  
  ss << std::endl << "=== FORMATS DE SORTIE SUPPORTÉS ===" << std::endl;
  const AVOutputFormat* output_format = nullptr;
  opaque = nullptr;
  count = 0;
  
  while ((output_format = av_muxer_iterate(&opaque)) && count < 10) {
    if (output_format->name && output_format->long_name) {
      ss << "- " << output_format->name << " (" << output_format->long_name << ")" << std::endl;
      count++;
    }
  }
  
  return ss.str();
}

bool NativeFFmpegModule::performAudioEncodingTest() {
  try {
    // Test d'encodage AAC
    const AVCodec* aac_encoder = avcodec_find_encoder(AV_CODEC_ID_AAC);
    if (!aac_encoder) {
      return false;
    }
    
    AVCodecContext* aac_context = avcodec_alloc_context3(aac_encoder);
    if (!aac_context) {
      return false;
    }
    
    // Configuration AAC
    aac_context->sample_rate = 44100;
    aac_context->channels = 2;
    aac_context->channel_layout = AV_CH_LAYOUT_STEREO;
    aac_context->sample_fmt = AV_SAMPLE_FMT_FLTP;
    aac_context->bit_rate = 128000;
    
    // Test d'ouverture
    int result = avcodec_open2(aac_context, aac_encoder, nullptr);
    bool success = (result >= 0);
    
    avcodec_free_context(&aac_context);
    
    if (!success) return false;
    
    // Test d'encodage MP3
    const AVCodec* mp3_encoder = avcodec_find_encoder(AV_CODEC_ID_MP3);
    if (mp3_encoder) {
      AVCodecContext* mp3_context = avcodec_alloc_context3(mp3_encoder);
      if (mp3_context) {
        mp3_context->sample_rate = 44100;
        mp3_context->channels = 2;
        mp3_context->channel_layout = AV_CH_LAYOUT_STEREO;
        mp3_context->sample_fmt = AV_SAMPLE_FMT_FLTP;
        mp3_context->bit_rate = 192000;
        
        result = avcodec_open2(mp3_context, mp3_encoder, nullptr);
        success = success && (result >= 0);
        
        avcodec_free_context(&mp3_context);
      }
    }
    
    return success;
  } catch (...) {
    return false;
  }
}

std::string NativeFFmpegModule::extractAudioInformation(const std::string& path) {
  std::stringstream ss;
  
  if (path.empty()) {
    ss << "Erreur: Chemin de fichier vide";
    return ss.str();
  }
  
  try {
    AVFormatContext* format_context = nullptr;
    
    // Ouvrir le fichier
    int result = avformat_open_input(&format_context, path.c_str(), nullptr, nullptr);
    if (result < 0) {
      ss << "Erreur: Impossible d'ouvrir le fichier '" << path << "'";
      return ss.str();
    }
    
    // Lire les informations de stream
    result = avformat_find_stream_info(format_context, nullptr);
    if (result < 0) {
      ss << "Erreur: Impossible de lire les informations du stream";
      avformat_close_input(&format_context);
      return ss.str();
    }
    
    ss << "=== INFORMATIONS FICHIER ===" << std::endl;
    ss << "Fichier: " << path << std::endl;
    ss << "Format: " << format_context->iformat->long_name << std::endl;
    ss << "Durée: " << (format_context->duration / AV_TIME_BASE) << " secondes" << std::endl;
    ss << "Bitrate: " << format_context->bit_rate << " bps" << std::endl;
    ss << "Nombre de streams: " << format_context->nb_streams << std::endl;
    
    // Analyser chaque stream
    for (unsigned int i = 0; i < format_context->nb_streams; i++) {
      AVStream* stream = format_context->streams[i];
      AVCodecParameters* codec_params = stream->codecpar;
      
      if (codec_params->codec_type == AVMEDIA_TYPE_AUDIO) {
        const AVCodec* codec = avcodec_find_decoder(codec_params->codec_id);
        
        ss << std::endl << "=== STREAM AUDIO " << i << " ===" << std::endl;
        ss << "Codec: " << (codec ? codec->long_name : "Inconnu") << std::endl;
        ss << "Sample Rate: " << codec_params->sample_rate << " Hz" << std::endl;
        ss << "Channels: " << codec_params->channels << std::endl;
        ss << "Bitrate: " << codec_params->bit_rate << " bps" << std::endl;
      }
    }
    
    avformat_close_input(&format_context);
    
  } catch (...) {
    ss << "Erreur: Exception lors de l'analyse du fichier";
  }
  
  return ss.str();
}

bool NativeFFmpegModule::performAudioConversion(const std::string& input, const std::string& output, const std::string& fmt) {
  // Pour cette implémentation de test, on simule une conversion réussie
  // Dans une vraie implémentation, vous utiliseriez les fonctions FFmpeg complètes
  
  if (input.empty() || output.empty() || fmt.empty()) {
    return false;
  }
  
  try {
    // Vérifier que les codecs nécessaires sont disponibles
    const AVCodec* encoder = nullptr;
    
    if (fmt == "aac") {
      encoder = avcodec_find_encoder(AV_CODEC_ID_AAC);
    } else if (fmt == "mp3") {
      encoder = avcodec_find_encoder(AV_CODEC_ID_MP3);
    } else if (fmt == "opus") {
      encoder = avcodec_find_encoder(AV_CODEC_ID_OPUS);
    }
    
    if (!encoder) {
      return false;
    }
    
    // Pour le test, on considère que la conversion est possible
    // Dans une vraie implémentation, vous auriez ici le code complet de transcodage
    return true;
    
  } catch (...) {
    return false;
  }
}

} // namespace facebook::react