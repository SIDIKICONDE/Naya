/**
 * DefaultPresets.cpp
 * Implémentation des presets par défaut
 */

#include "DefaultPresets.h"
#include <iostream>

namespace facebook::react {

DefaultPresets::DefaultPresets() {
    std::cout << "[DefaultPresets] Constructeur" << std::endl;
}

DefaultPresets::~DefaultPresets() {
    std::cout << "[DefaultPresets] Destructeur" << std::endl;
}

void DefaultPresets::initialize() {
    createDefaultPresets();
    std::cout << "[DefaultPresets] " << m_presets.size() << " presets initialisés" << std::endl;
}

const SimplePreset* DefaultPresets::findPreset(const std::string& id) const {
    for (const auto& preset : m_presets) {
        if (preset.id == id) {
            return &preset;
        }
    }
    return nullptr;
}

std::vector<std::string> DefaultPresets::getPresetNames() const {
    std::vector<std::string> names;
    for (const auto& preset : m_presets) {
        names.push_back(preset.name);
    }
    return names;
}

void DefaultPresets::createDefaultPresets() {
    m_presets.clear();
    
    // Preset Flat (neutre)
    m_presets.push_back({
        "flat",
        "Plat",
        "Aucune modification - réponse plate",
        {0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0}
    });
    
    // Preset Vocal Enhancement
    m_presets.push_back({
        "vocal",
        "Amélioration Vocale",
        "Optimisé pour les voix et dialogues",
        {-2.0, -1.0, 1.0, 3.0, 4.0, 3.0, 2.0, 1.0, -1.0, -2.0}
    });
    
    // Preset Bass Boost
    m_presets.push_back({
        "bass_boost",
        "Renforcement Basses",
        "Améliore les fréquences graves",
        {6.0, 4.0, 2.0, 1.0, 0.0, -1.0, -1.0, -1.0, 0.0, 0.0}
    });
    
    // Preset Treble Boost
    m_presets.push_back({
        "treble_boost",
        "Renforcement Aigus",
        "Améliore les fréquences aiguës",
        {0.0, 0.0, -1.0, -1.0, 0.0, 1.0, 2.0, 4.0, 6.0, 4.0}
    });
    
    // Preset Classical
    m_presets.push_back({
        "classical",
        "Musique Classique",
        "Optimisé pour la musique orchestrale",
        {2.0, 1.0, 0.0, 0.0, -1.0, -1.0, 0.0, 1.0, 2.0, 1.0}
    });
    
    // Preset Rock
    m_presets.push_back({
        "rock",
        "Rock/Metal",
        "Optimisé pour la musique rock",
        {3.0, 2.0, -1.0, -2.0, -1.0, 1.0, 3.0, 4.0, 3.0, 2.0}
    });
    
    // Preset Pop
    m_presets.push_back({
        "pop",
        "Pop/Dance",
        "Optimisé pour la musique pop moderne",
        {1.0, 2.0, 1.0, 0.0, -1.0, -1.0, 0.0, 2.0, 3.0, 2.0}
    });
    
    // Preset Podcast
    m_presets.push_back({
        "podcast",
        "Podcast/Radio",
        "Optimisé pour la parole et les podcasts",
        {-3.0, -2.0, 0.0, 2.0, 4.0, 3.0, 2.0, 1.0, -1.0, -3.0}
    });
}

} // namespace facebook::react