cmake_minimum_required(VERSION 3.14)
project(AudioRecorderTests)

# C++17 requis
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Télécharger et configurer Google Test
include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/refs/tags/v1.14.0.zip
)
# For Windows: Prevent overriding the parent project's compiler/linker settings
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

# Inclure les répertoires nécessaires
include_directories(
  ${CMAKE_CURRENT_SOURCE_DIR}/..
  ${CMAKE_CURRENT_SOURCE_DIR}/../..
  ${CMAKE_CURRENT_SOURCE_DIR}/../../..
)

# Sources du module AudioRecord
set(AUDIO_RECORD_SOURCES
  # Core audio engine
  ../AudioRecorder.cpp
  ../AudioBufferPool.cpp
  
  # Audio capture implementations
  ../AudioCaptureCpp.cpp
  ../PlatformAudioCapture.cpp
  
  # Multi-format encoders
  ../AudioEncoders.cpp
  
  # DSP processors
  ../AudioDSPProcessors.cpp
  ../AudioDSPFactory.cpp
)

# Sources des tests
set(TEST_SOURCES
  AudioRecorderTest.cpp
  AudioEncodersTest.cpp
  AudioDSPTest.cpp
  PlatformAudioCaptureTest.cpp
)

# Créer l'exécutable de test
add_executable(audio_recorder_tests
  ${TEST_SOURCES}
  ${AUDIO_RECORD_SOURCES}
)

# Lier avec Google Test et GMock
target_link_libraries(audio_recorder_tests
  gtest
  gmock
  gtest_main
  pthread
)

# Ajouter les tests au CTest
enable_testing()
add_test(NAME AudioRecorderTests COMMAND audio_recorder_tests)

# Options de compilation pour les warnings
if(CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
  target_compile_options(audio_recorder_tests PRIVATE
    -Wall
    -Wextra
    -Wpedantic
    -Werror
  )
endif()

# Créer un target pour exécuter les tests avec coverage (optionnel)
if(CMAKE_BUILD_TYPE STREQUAL "Debug" AND CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
  target_compile_options(audio_recorder_tests PRIVATE --coverage)
  target_link_libraries(audio_recorder_tests --coverage)
  
  add_custom_target(coverage
    COMMAND ${CMAKE_COMMAND} -E remove_directory ${CMAKE_BINARY_DIR}/coverage
    COMMAND ${CMAKE_COMMAND} -E make_directory ${CMAKE_BINARY_DIR}/coverage
    COMMAND lcov --directory . --zerocounters
    COMMAND audio_recorder_tests
    COMMAND lcov --directory . --capture --output-file ${CMAKE_BINARY_DIR}/coverage/coverage.info
    COMMAND lcov --remove ${CMAKE_BINARY_DIR}/coverage/coverage.info '/usr/*' '*googletest*' --output-file ${CMAKE_BINARY_DIR}/coverage/coverage_filtered.info
    COMMAND genhtml ${CMAKE_BINARY_DIR}/coverage/coverage_filtered.info --output-directory ${CMAKE_BINARY_DIR}/coverage
    COMMAND ${CMAKE_COMMAND} -E echo "Coverage report generated in ${CMAKE_BINARY_DIR}/coverage/index.html"
    WORKING_DIRECTORY ${CMAKE_BINARY_DIR}
    DEPENDS audio_recorder_tests
  )
endif()