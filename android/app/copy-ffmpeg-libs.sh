#!/bin/bash

# Créer les répertoires de destination
mkdir -p android/app/src/main/jniLibs/arm64-v8a
mkdir -p android/app/src/main/jniLibs/armeabi-v7a
mkdir -p android/app/src/main/jniLibs/x86
mkdir -p android/app/src/main/jniLibs/x86_64

# Copier les bibliothèques pour chaque architecture
FFMPEG_ROOT="android/ffmpeg-libs/ffmpeg-7.1-android-lite/lib"

# arm64-v8a
cp $FFMPEG_ROOT/arm64-v8a/*.so android/app/src/main/jniLibs/arm64-v8a/

# armeabi-v7a
cp $FFMPEG_ROOT/armeabi-v7a/*.so android/app/src/main/jniLibs/armeabi-v7a/

# x86
cp $FFMPEG_ROOT/x86/*.so android/app/src/main/jniLibs/x86/

# x86_64
cp $FFMPEG_ROOT/x86_64/*.so android/app/src/main/jniLibs/x86_64/

echo "FFmpeg libraries copied successfully!"