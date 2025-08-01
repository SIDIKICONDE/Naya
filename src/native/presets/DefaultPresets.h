/**
 * DefaultPresets.h
 * Module minimal pour les presets par défaut
 */

#pragma once

#include <vector>
#include <string>
#include <array>

namespace facebook::react {

/**
 * Structure d'un preset simple
 */
struct SimplePreset {
    std::string id;
    std::string name;
    std::string description;
    std::array<double, 10> bandGains; // 10 bandes d'égaliseur
};

/**
 * Gestionnaire des presets par défaut
 */
class DefaultPresets {
public:
    DefaultPresets();
    ~DefaultPresets();

    /**
     * Initialise les presets par défaut
     */
    void initialize();

    /**
     * Obtient tous les presets par défaut
     */
    const std::vector<SimplePreset>& getAllPresets() const { return m_presets; }

    /**
     * Trouve un preset par ID
     */
    const SimplePreset* findPreset(const std::string& id) const;

    /**
     * Obtient les noms de tous les presets
     */
    std::vector<std::string> getPresetNames() const;

private:
    std::vector<SimplePreset> m_presets;
    
    void createDefaultPresets();
};

} // namespace facebook::react