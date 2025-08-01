/**
 * PresetManager.cpp
 * Implémentation du gestionnaire de presets avancé
 */

#include "PresetManager.h"
#include <algorithm>
#include <iostream>
#include <sstream>

namespace facebook::react {

PresetManager::PresetManager() : m_initialized(false) {
    std::cout << "[PresetManager] Constructeur" << std::endl;
    m_defaultPresets = std::make_unique<DefaultPresets>();
}

PresetManager::~PresetManager() {
    std::cout << "[PresetManager] Destructeur" << std::endl;
}

bool PresetManager::initialize() {
    if (m_initialized) {
        return true;
    }
    
    m_defaultPresets->initialize();
    loadDefaultPresets();
    m_initialized = true;
    
    std::cout << "[PresetManager] Initialisé avec " << m_presets.size() << " presets" << std::endl;
    return true;
}

bool PresetManager::addCustomPreset(const ManagedPreset& preset) {
    if (!validatePreset(preset)) {
        return false;
    }
    
    std::string id = generatePresetId(preset.name);
    if (m_presets.find(id) != m_presets.end()) {
        return false;
    }
    
    ManagedPreset managedPreset = preset;
    managedPreset.id = id;
    managedPreset.isBuiltIn = false;
    managedPreset.usageCount = 0;
    
    m_presets[id] = managedPreset;
    return true;
}

const ManagedPreset* PresetManager::getPreset(const std::string& presetId) const {
    auto it = m_presets.find(presetId);
    return (it != m_presets.end()) ? &it->second : nullptr;
}

std::vector<ManagedPreset> PresetManager::getAllPresets() const {
    std::vector<ManagedPreset> result;
    for (const auto& pair : m_presets) {
        result.push_back(pair.second);
    }
    return result;
}

void PresetManager::incrementUsage(const std::string& presetId) {
    auto it = m_presets.find(presetId);
    if (it != m_presets.end()) {
        it->second.usageCount++;
    }
}

std::string PresetManager::getCategoryName(PresetCategory category) {
    switch (category) {
        case PresetCategory::MUSIC: return "Musique";
        case PresetCategory::VOICE: return "Voix";
        case PresetCategory::CUSTOM: return "Personnalisé";
        default: return "Inconnu";
    }
}

bool PresetManager::validatePreset(const ManagedPreset& preset) const {
    if (preset.name.empty()) return false;
    
    for (double gain : preset.bandGains) {
        if (gain < -20.0 || gain > 20.0) return false;
    }
    return true;
}

std::string PresetManager::generatePresetId(const std::string& name) const {
    std::string id = name;
    std::replace(id.begin(), id.end(), ' ', '_');
    return id;
}

void PresetManager::loadDefaultPresets() {
    const auto& defaultPresets = m_defaultPresets->getAllPresets();
    
    for (const auto& simple : defaultPresets) {
        ManagedPreset managed = convertSimplePreset(simple, PresetCategory::MUSIC);
        m_presets[managed.id] = managed;
    }
}

ManagedPreset PresetManager::convertSimplePreset(const SimplePreset& simple, PresetCategory category) const {
    ManagedPreset managed;
    managed.id = simple.id;
    managed.name = simple.name;
    managed.description = simple.description;
    managed.category = category;
    managed.bandGains = simple.bandGains;
    managed.isBuiltIn = true;
    managed.usageCount = 0;
    managed.rating = 4.0;
    managed.isFavorite = false;
    
    // Effets par défaut
    managed.effects = {false, 2.0, false, 0.5, false, 1.0, 1.0};
    
    return managed;
}

// Placeholders pour les autres méthodes
bool PresetManager::removePreset(const std::string& presetId) { return false; }
bool PresetManager::updatePreset(const std::string& presetId, const ManagedPreset& preset) { return false; }
std::vector<ManagedPreset> PresetManager::getPresetsByCategory(PresetCategory category) const { return {}; }
PresetSearchResult PresetManager::searchPresets(const std::string& query) const { return {{}, 0, query}; }
std::vector<ManagedPreset> PresetManager::getFavoritePresets() const { return {}; }
std::vector<ManagedPreset> PresetManager::getMostUsedPresets(int count) const { return {}; }
bool PresetManager::setPresetFavorite(const std::string& presetId, bool isFavorite) { return false; }
bool PresetManager::ratePreset(const std::string& presetId, double rating) { return false; }
bool PresetManager::importPresets(const std::string& filePath) { return false; }
bool PresetManager::exportPresets(const std::string& filePath, const std::vector<std::string>& presetIds) const { return false; }
bool PresetManager::saveCustomPresets(const std::string& filePath) const { return false; }
bool PresetManager::loadCustomPresets(const std::string& filePath) { return false; }

ManagedPreset PresetManager::createPresetFromCurrentSettings(
    const std::string& name,
    const std::string& description,
    const std::array<double, 10>& currentGains,
    PresetCategory category
) const {
    ManagedPreset preset;
    preset.name = name;
    preset.description = description;
    preset.category = category;
    preset.bandGains = currentGains;
    preset.isBuiltIn = false;
    preset.usageCount = 0;
    preset.rating = 0.0;
    preset.isFavorite = false;
    preset.effects = {false, 2.0, false, 0.5, false, 1.0, 1.0};
    return preset;
}

std::vector<PresetCategory> PresetManager::getAvailableCategories() const {
    return {PresetCategory::MUSIC, PresetCategory::VOICE, PresetCategory::CUSTOM};
}

} // namespace facebook::react