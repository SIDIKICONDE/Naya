#pragma once

#include "NativeModuleEQJSI.h"
#include <ReactCommon/TurboModule.h>
#include <memory>

namespace facebook::react {

class NativeModuleEQ : public NativeModuleEQCxxSpec<NativeModuleEQ> {
public:
  NativeModuleEQ(std::shared_ptr<CallInvoker> jsInvoker);

  jsi::String reverseString(jsi::Runtime &rt, jsi::String input);
  double countCharacters(jsi::Runtime &rt, jsi::String input);
  jsi::String toUpperCase(jsi::Runtime &rt, jsi::String input);
  jsi::String toLowerCase(jsi::Runtime &rt, jsi::String input);
  jsi::String removeSpaces(jsi::Runtime &rt, jsi::String input);
  bool isPalindrome(jsi::Runtime &rt, jsi::String input);
  double getRandomNumber(jsi::Runtime &rt, double min, double max);
  double calculateFactorial(jsi::Runtime &rt, double n);
};

} // namespace facebook::react
