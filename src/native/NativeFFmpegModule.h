#pragma once

#include "NayaJSI.h"  // Généré par Codegen
#include <ReactCommon/TurboModule.h>
#include <memory>

namespace facebook::react {

class NativeFFmpegModule : public NativeFFmpegModuleCxxSpec<NativeFFmpegModule> {
public:
  NativeFFmpegModule(std::shared_ptr<CallInvoker> jsInvoker);

  // Méthodes correspondant exactement à l'interface TypeScript
  jsi::String getFFmpegVersion(jsi::Runtime &rt);
  bool initializeFFmpeg(jsi::Runtime &rt);
  jsi::String getSupportedFormats(jsi::Runtime &rt);
  bool testAudioEncoding(jsi::Runtime &rt);
  jsi::String getAudioInfo(jsi::Runtime &rt, jsi::String filePath);
  bool convertAudioFormat(jsi::Runtime &rt, jsi::String inputPath, jsi::String outputPath, jsi::String format);

private:
  static bool isFFmpegInitialized;
  
  // Méthodes utilitaires privées
  std::string getVersionInfo();
  std::string listSupportedFormats();
  bool performAudioEncodingTest();
  std::string extractAudioInformation(const std::string& path);
  bool performAudioConversion(const std::string& input, const std::string& output, const std::string& fmt);
};

} // namespace facebook::react