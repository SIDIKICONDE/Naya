/**
 * PresetManager.h
 * Module de gestion avancée des presets d'égaliseur
 */

#pragma once

#include <vector>
#include <string>
#include <unordered_map>
#include <memory>
#include <array>
#include "DefaultPresets.h"

namespace facebook::react {

/**
 * Catégories de presets
 */
enum class PresetCategory {
    MUSIC,          // Presets musicaux
    VOICE,          // Presets vocaux
    BROADCAST,      // Presets broadcast/radio
    PROFESSIONAL,   // Presets professionnels
    CUSTOM,         // Presets personnalisés
    GAME,           // Presets gaming
    PODCAST         // Presets podcast
};

/**
 * Preset complet avec métadonnées
 */
struct ManagedPreset {
    std::string id;
    std::string name;
    std::string description;
    PresetCategory category;
    std::array<double, 10> bandGains;
    
    // Métadonnées avancées
    std::string author;
    std::string version;
    double rating;              // Note utilisateur (0.0 à 5.0)
    int usageCount;             // Nombre d'utilisations
    bool isBuiltIn;             // Preset intégré ou personnalisé
    bool isFavorite;            // Preset favori
    
    // Paramètres d'effets additionnels
    struct {
        bool compressorEnabled;
        double compressorRatio;
        bool noiseReductionEnabled;
        double noiseReductionIntensity;
        bool enhancerEnabled;
        double bassEnhancement;
        double trebleEnhancement;
    } effects;
};

/**
 * Résultat de recherche de presets
 */
struct PresetSearchResult {
    std::vector<ManagedPreset> presets;
    int totalFound;
    std::string searchQuery;
};

/**
 * Gestionnaire avancé de presets
 */
class PresetManager {
public:
    PresetManager();
    ~PresetManager();

    /**
     * Initialise le gestionnaire avec les presets par défaut
     */
    bool initialize();

    /**
     * Ajoute un preset personnalisé
     */
    bool addCustomPreset(const ManagedPreset& preset);

    /**
     * Supprime un preset (uniquement les personnalisés)
     */
    bool removePreset(const std::string& presetId);

    /**
     * Met à jour un preset existant
     */
    bool updatePreset(const std::string& presetId, const ManagedPreset& preset);

    /**
     * Obtient un preset par ID
     */
    const ManagedPreset* getPreset(const std::string& presetId) const;

    /**
     * Obtient tous les presets
     */
    std::vector<ManagedPreset> getAllPresets() const;

    /**
     * Obtient les presets par catégorie
     */
    std::vector<ManagedPreset> getPresetsByCategory(PresetCategory category) const;

    /**
     * Recherche des presets par nom/description
     */
    PresetSearchResult searchPresets(const std::string& query) const;

    /**
     * Obtient les presets favoris
     */
    std::vector<ManagedPreset> getFavoritePresets() const;

    /**
     * Obtient les presets les plus utilisés
     */
    std::vector<ManagedPreset> getMostUsedPresets(int count = 10) const;

    /**
     * Marque/démarque un preset comme favori
     */
    bool setPresetFavorite(const std::string& presetId, bool isFavorite);

    /**
     * Note un preset
     */
    bool ratePreset(const std::string& presetId, double rating);

    /**
     * Incrémente le compteur d'usage d'un preset
     */
    void incrementUsage(const std::string& presetId);

    /**
     * Importe des presets depuis un fichier JSON
     */
    bool importPresets(const std::string& filePath);

    /**
     * Exporte des presets vers un fichier JSON
     */
    bool exportPresets(const std::string& filePath, const std::vector<std::string>& presetIds) const;

    /**
     * Sauvegarde les presets personnalisés
     */
    bool saveCustomPresets(const std::string& filePath) const;

    /**
     * Charge les presets personnalisés
     */
    bool loadCustomPresets(const std::string& filePath);

    /**
     * Crée un preset basé sur la configuration actuelle de l'égaliseur
     */
    ManagedPreset createPresetFromCurrentSettings(
        const std::string& name,
        const std::string& description,
        const std::array<double, 10>& currentGains,
        PresetCategory category = PresetCategory::CUSTOM
    ) const;

    /**
     * Obtient le nombre total de presets
     */
    size_t getPresetCount() const { return m_presets.size(); }

    /**
     * Obtient les catégories disponibles
     */
    std::vector<PresetCategory> getAvailableCategories() const;

    /**
     * Obtient le nom d'une catégorie
     */
    static std::string getCategoryName(PresetCategory category);

private:
    std::unordered_map<std::string, ManagedPreset> m_presets;
    std::unique_ptr<DefaultPresets> m_defaultPresets;
    bool m_initialized;
    
    /**
     * Génère un ID unique pour un preset
     */
    std::string generatePresetId(const std::string& name) const;
    
    /**
     * Valide un preset avant ajout
     */
    bool validatePreset(const ManagedPreset& preset) const;
    
    /**
     * Charge les presets par défaut
     */
    void loadDefaultPresets();
    
    /**
     * Convertit un SimplePreset en ManagedPreset
     */
    ManagedPreset convertSimplePreset(const SimplePreset& simple, PresetCategory category) const;
    
    /**
     * Sérialise un preset en JSON (simplifié)
     */
    std::string serializePreset(const ManagedPreset& preset) const;
    
    /**
     * Désérialise un preset depuis JSON (simplifié)
     */
    bool deserializePreset(const std::string& json, ManagedPreset& preset) const;
    
    /**
     * Normalise une chaîne pour la recherche
     */
    std::string normalizeForSearch(const std::string& text) const;
};

} // namespace facebook::react