cmake_minimum_required(VERSION 3.22.1)
project(appmodules)

# Add FFmpeg include/lib paths (chemin corrigé depuis jni/)
set(ffmpeg_dir ${CMAKE_SOURCE_DIR}/../../../../../ffmpeg-android-maker/output)
set(ffmpeg_libs ${ffmpeg_dir}/lib/${ANDROID_ABI})
include_directories(${ffmpeg_dir}/include)

set(ffmpeg_libs_names avcodec avdevice avfilter avformat avutil swresample swscale)
foreach(lib ${ffmpeg_libs_names})
  add_library(${lib} SHARED IMPORTED)
  set_target_properties(${lib} PROPERTIES IMPORTED_LOCATION ${ffmpeg_libs}/lib${lib}.so)
endforeach()


# Collecter les sources C++ du projet - avec vérification (chemin corrigé)
file(GLOB_RECURSE AUDIORECORD_SOURCES 
  "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../src/native/AudioRecord/*.cpp"
)

# Exclure les fichiers de test
list(FILTER AUDIORECORD_SOURCES EXCLUDE REGEX ".*tests/.*")

# Vérifier qu'on a des sources
if(NOT AUDIORECORD_SOURCES)
  message(FATAL_ERROR "Aucun fichier source trouvé dans AudioRecord/")
endif()

message(STATUS "Sources trouvées: ${AUDIORECORD_SOURCES}")

# Créer la bibliothèque principale AVEC les sources
add_library(${CMAKE_PROJECT_NAME} SHARED ${AUDIORECORD_SOURCES})

# Inclure les headers du dossier AudioRecord (chemins corrigés)
target_include_directories(${CMAKE_PROJECT_NAME} PRIVATE 
  "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../src/native"
  "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../src/native/AudioRecord"
)

# Lier FFmpeg et les bibliothèques système
target_link_libraries(${CMAKE_PROJECT_NAME}
  ${ffmpeg_libs_names}
  android
  log)
