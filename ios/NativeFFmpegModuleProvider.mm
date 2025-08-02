<<<<<<<< HEAD:ios/NativeAudioEqualizerProvider.mm


#import "AudioEqualizerProvider.h"
#import <ReactCommon/CallInvoker.h>
#import <ReactCommon/TurboModule.h>
#import "../src/native/NativeAudioEqualizer.h"

@implementation AudioEqualizerProvider
========
#import "NativeFFmpegModuleProvider.h"
#import <ReactCommon/CallInvoker.h>
#import <ReactCommon/TurboModule.h>
#import "NativeFFmpegModule.h"

@implementation NativeFFmpegModuleProvider
>>>>>>>> retour-commit-5c76a0f:ios/NativeFFmpegModuleProvider.mm

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
<<<<<<<< HEAD:ios/NativeAudioEqualizerProvider.mm
  return std::make_shared<facebook::react::NativeAudioEqualizer>(params.jsInvoker);
========
  return std::make_shared<facebook::react::NativeFFmpegModule>(params.jsInvoker);
>>>>>>>> retour-commit-5c76a0f:ios/NativeFFmpegModuleProvider.mm
}

@end