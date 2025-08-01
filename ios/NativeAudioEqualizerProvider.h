//
// AudioEqualizerProvider.h
// Provider iOS pour l'égaliseur audio professionnel
//

#import <Foundation/Foundation.h>
#import <ReactCommon/RCTTurboModule.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * Provider iOS pour le module AudioEqualizer
 * Connecte le module C++ à l'écosystème iOS React Native
 */
@interface AudioEqualizerProvider : NSObject <RCTModuleProvider>

@end

NS_ASSUME_NONNULL_END