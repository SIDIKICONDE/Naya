

#import "AudioEqualizerProvider.h"
#import <ReactCommon/CallInvoker.h>
#import <ReactCommon/TurboModule.h>
#import "../src/native/NativeAudioEqualizer.h"

@implementation AudioEqualizerProvider

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeAudioEqualizer>(params.jsInvoker);
}

@end