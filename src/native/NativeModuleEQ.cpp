#include "NativeModuleEQ.h"
#include <algorithm>
#include <cctype>
#include <chrono>
#include <random>
#include <string>

namespace facebook::react {

NativeModuleEQ::NativeModuleEQ(std::shared_ptr<CallInvoker> jsInvoker)
    : NativeModuleEQCxxSpec(std::move(jsInvoker)) {}

jsi::String NativeModuleEQ::reverseString(jsi::Runtime &rt, jsi::String input) {
  std::string inputStr = input.utf8(rt);
  std::string reversed = inputStr;
  std::reverse(reversed.begin(), reversed.end());
  return jsi::String::createFromUtf8(rt, reversed);
}

double NativeModuleEQ::countCharacters(jsi::Runtime &rt, jsi::String input) {
  std::string inputStr = input.utf8(rt);
  return static_cast<double>(inputStr.length());
}

jsi::String NativeModuleEQ::toUpperCase(jsi::Runtime &rt, jsi::String input) {
  std::string inputStr = input.utf8(rt);
  std::transform(inputStr.begin(), inputStr.end(), inputStr.begin(), ::toupper);
  return jsi::String::createFromUtf8(rt, inputStr);
}

jsi::String NativeModuleEQ::toLowerCase(jsi::Runtime &rt, jsi::String input) {
  std::string inputStr = input.utf8(rt);
  std::transform(inputStr.begin(), inputStr.end(), inputStr.begin(), ::tolower);
  return jsi::String::createFromUtf8(rt, inputStr);
}

jsi::String NativeModuleEQ::removeSpaces(jsi::Runtime &rt, jsi::String input) {
  std::string inputStr = input.utf8(rt);
  inputStr.erase(std::remove_if(inputStr.begin(), inputStr.end(), ::isspace),
                 inputStr.end());
  return jsi::String::createFromUtf8(rt, inputStr);
}

bool NativeModuleEQ::isPalindrome(jsi::Runtime &rt, jsi::String input) {
  std::string inputStr = input.utf8(rt);
  std::string cleaned = inputStr;
  std::transform(cleaned.begin(), cleaned.end(), cleaned.begin(), ::tolower);
  cleaned.erase(std::remove_if(cleaned.begin(), cleaned.end(), ::isspace),
                cleaned.end());

  std::string reversed = cleaned;
  std::reverse(reversed.begin(), reversed.end());

  return cleaned == reversed;
}

double NativeModuleEQ::getRandomNumber(jsi::Runtime &rt, double min,
                                       double max) {
  int minVal = static_cast<int>(min);
  int maxVal = static_cast<int>(max);

  unsigned seed = std::chrono::system_clock::now().time_since_epoch().count();
  std::mt19937 generator(seed);
  std::uniform_int_distribution<int> distribution(minVal, maxVal);

  return static_cast<double>(distribution(generator));
}

double NativeModuleEQ::calculateFactorial(jsi::Runtime &rt, double n) {
  int num = static_cast<int>(n);

  if (num < 0) {
    return -1.0; // Erreur
  }

  if (num == 0 || num == 1) {
    return 1.0;
  }

  long long result = 1;
  for (int i = 2; i <= num; ++i) {
    result *= i;
  }

  return static_cast<double>(result);
}

} // namespace facebook::react