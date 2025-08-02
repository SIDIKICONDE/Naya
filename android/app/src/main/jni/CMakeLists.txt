cmake_minimum_required(VERSION 3.13)

# Define the library name here.
project(appmodules)

# This file includes all the necessary to let you build your React Native application
include(${REACT_ANDROID_DIR}/cmake-utils/ReactNative-application.cmake)

# Configuration FFmpeg
set(FFMPEG_ROOT_PATH ${CMAKE_CURRENT_SOURCE_DIR}/../../../ffmpeg-libs/ffmpeg-7.1-android-lite)
set(FFMPEG_INCLUDE_DIR ${FFMPEG_ROOT_PATH}/include)
set(FFMPEG_LIB_DIR ${FFMPEG_ROOT_PATH}/lib/${ANDROID_ABI})

# Include FFmpeg headers
include_directories(${FFMPEG_INCLUDE_DIR})

# Add FFmpeg libraries
add_library(ffmpeg SHARED IMPORTED)
set_target_properties(ffmpeg PROPERTIES IMPORTED_LOCATION ${FFMPEG_LIB_DIR}/libffmpeg.so)

add_library(avcodec SHARED IMPORTED)
set_target_properties(avcodec PROPERTIES IMPORTED_LOCATION ${FFMPEG_LIB_DIR}/libavcodec.so)

add_library(avformat SHARED IMPORTED)
set_target_properties(avformat PROPERTIES IMPORTED_LOCATION ${FFMPEG_LIB_DIR}/libavformat.so)

add_library(avutil SHARED IMPORTED)
set_target_properties(avutil PROPERTIES IMPORTED_LOCATION ${FFMPEG_LIB_DIR}/libavutil.so)

add_library(avfilter SHARED IMPORTED)
set_target_properties(avfilter PROPERTIES IMPORTED_LOCATION ${FFMPEG_LIB_DIR}/libavfilter.so)

add_library(swscale SHARED IMPORTED)
set_target_properties(swscale PROPERTIES IMPORTED_LOCATION ${FFMPEG_LIB_DIR}/libswscale.so)

add_library(swresample SHARED IMPORTED)
set_target_properties(swresample PROPERTIES IMPORTED_LOCATION ${FFMPEG_LIB_DIR}/libswresample.so)

# Configuration Android standard
find_library(log-lib log)

# Ajouter les sources C++ du TurboModule FFmpeg
target_sources(${CMAKE_PROJECT_NAME} PRIVATE 
    ../../../../../src/native/NativeFFmpegModule.cpp
)

# Link all libraries
target_link_libraries(${CMAKE_PROJECT_NAME} 
    ${log-lib}
    ffmpeg
    avcodec
    avformat
    avutil
    avfilter
    swscale
    swresample
)

