/**
 * Traductions françaises - Audio
 * Traductions spécifiques au domaine audio et aux modules de traitement
 */

export default {
  
  // Interface principale
  interface: {
    title: 'Interface Pro',
    metrics: {
      cpu: 'CPU',
      buffer: 'BUF',
      latency: 'LAT',
      units: {
        ms: 'ms',
        percent: '%',
      },
    },
    status: {
      initializing: 'Initialisation en cours...',
      unavailable: 'Interface audio non disponible',
      moduleError: 'Erreur de chargement du module',
    },
    actions: {
      presets: 'Presets',
      close: '✕',
    },
  },

  // Gestionnaire de presets
  presetManager: {
    title: '🎛️ Gestionnaire de Presets',
    actions: {
      save: 'Sauvegarder',
      import: 'Importer',
      load: 'Charger',
      delete: 'Supprimer',
    },
    categories: {
      all: 'Tous',
      favorites: '⭐ Favoris',
      user: '👤 Utilisateur',
      factory: '🏭 Usine',
      recent: '🕒 Récents',
    },
    emptyState: {
      title: 'Aucun preset',
      description: 'Créez ou importez des presets pour commencer',
    },
    saveModal: {
      title: 'Sauvegarder le preset',
      nameLabel: 'Nom du preset',
      categoryLabel: 'Catégorie',
      cancel: 'Annuler',
      confirm: 'Sauvegarder',
    },
    messages: {
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer ce preset ?',
      saveSuccess: 'Preset sauvegardé avec succès',
      deleteSuccess: 'Preset supprimé avec succès',
      error: 'Une erreur est survenue',
    },
  },

  // Section spécifique à l'égaliseur
  equalizer: {
    // Titres et labels
    title: 'Égaliseur Audio',
    audioFile: 'Fichier Audio',
    presets: 'Presets',
    frequencyResponse: 'Courbe de réponse en fréquence',

    // Actions
    selectFile: 'Sélectionner un fichier',
    loading: 'Chargement...',
    enabled: 'Activé',
    disabled: 'Désactivé',
    fileLoaded: 'Chargé',
    reset: 'Reset',
    save: 'Sauver',
    selectPreset: 'Sélectionner',
    custom: 'Personnalisé',

    // Informations fichier
    duration: 'Durée',
    sampleRate: 'Échantillonnage',
    channels: {
      title: 'Canaux',
      mono: 'Mono',
      stereo: 'Stéréo',
    },
    fileSize: 'Taille',

    // Messages
    errors: {
      fileSelect: 'Impossible de sélectionner le fichier audio',
      fileLoad: 'Impossible de charger le fichier audio',
      bandChange: 'Impossible de modifier la bande de fréquence',
      toggleEqualizer: 'Impossible de modifier l\'état de l\'égaliseur',
      presetApply: 'Impossible d\'appliquer le preset',
    },

    // Presets par défaut
    defaultPresets: {
      flat: {
        name: 'Plat',
        description: 'Aucune modification',
      },
      vocal: {
        name: 'Voix',
        description: 'Amélioration des voix',
      },
      bassBoost: {
        name: 'Bass Boost',
        description: 'Renforcement des basses',
      },
      trebleBoost: {
        name: 'Treble Boost',
        description: 'Renforcement des aigus',
      },
    },

    // Messages du gestionnaire de presets
    presetManager: {
      // Messages d'erreur
      errors: {
        loadPresets: 'Impossible de charger les presets',
        savePreset: 'Impossible de sauvegarder le preset',
        deletePreset: 'Impossible de supprimer le preset',
        emptyName: 'Veuillez entrer un nom pour le preset',
        import: 'Impossible d\'importer le preset',
      },
      
      // Messages de succès
      success: {
        presetSaved: 'Preset sauvegardé avec succès',
        presetDeleted: 'Preset supprimé avec succès',
        presetImported: 'Preset importé avec succès',
      },
      
      // Confirmations
      confirmations: {
        deleteTitle: 'Confirmer la suppression',
        deleteMessage: 'Voulez-vous vraiment supprimer le preset "{{name}}" ?',
        deleteConfirm: 'Supprimer',
        deleteCancel: 'Annuler',
      },
      
      // Fonctionnalités
      features: {
        importComingSoon: 'Fonctionnalité d\'import en cours de développement',
        importTitle: 'Import de preset',
      },
    },

    // Dialogue de sauvegarde
    savePreset: {
      title: 'Sauvegarder le preset',
      message: 'Voulez-vous sauvegarder la configuration actuelle comme nouveau preset ?',
      cancel: 'Annuler',
      confirm: 'Sauvegarder',
      success: 'Preset sauvegardé !',
    },
  },

  // Modules audio
  modules: {
    // Chorus
    chorus: {
      title: 'Chorus',
      types: {
        classic: 'Classic',
        ensemble: 'Ensemble',
        vintage: 'Vintage',
        modern: 'Modern',
      },
      controls: {
        rate: 'Rate',
        depth: 'Depth',
        wet: 'Wet',
        dry: 'Dry',
        delay: 'Délai',
        feedback: 'Feedback',
        voices: 'Voix',
        spread: 'Spread',
      },
      modes: {
        compact: 'C',
        compactActive: '✓',
        advanced: '▶',
        advancedActive: '▼',
      },
    },

    // Limiteur
    limiter: {
      title: '🛡️ Limiteur',
      modes: {
        compact: 'Compact',
        compactActive: '✓ Compact',
        advanced: 'Avancé',
        advancedActive: '✓ Avancé',
      },
      display: {
        title: 'Choisir un mode d\'affichage',
        compact: {
          title: '📱 Compact',
          description: 'Contrôles essentiels en 2x2',
        },
        advanced: {
          title: '⚙️ Avancé',
          description: 'Tous contrôles + visualisation',
        },
      },
      controls: {
        title: 'Contrôles principaux',
        threshold: 'Seuil',
        release: 'Release',
        lookAhead: 'Look-Ah',
        output: 'Output',
      },
    },

    // Gate
    gate: {
      title: 'Noise Gate',
      subtitle: 'Suppression automatique du bruit',
      modes: {
        title: 'Mode de fonctionnement',
        gate: 'Gate',
        expander: 'Expander',
      },
      controls: {
        threshold: {
          label: 'Seuil',
          description: 'Niveau en dessous duquel le gate s\'active',
        },
        ratio: {
          label: 'Ratio',
          description: 'Intensité de la réduction',
        },
        attack: {
          label: 'Attaque',
          description: 'Temps d\'ouverture du gate',
        },
        hold: {
          label: 'Maintien',
          description: 'Durée minimum d\'ouverture',
        },
        release: {
          label: 'Relâchement',
          description: 'Temps de fermeture du gate',
        },
        lookAhead: {
          label: 'Anticipation',
          description: 'Délai de prédiction pour transitions fluides',
        },
      },
      status: {
        title: 'État du gate',
        open: 'Ouvert',
      },
    },

    // Distortion
    distortion: {
      title: 'Distorsion',
      types: {
        tube: 'Tube',
        overdrive: 'OD',
        fuzz: 'Fuzz',
        bitcrush: 'Bit',
      },
      controls: {
        drive: 'Drive',
        tone: 'Tone',
        mix: 'Mix',
        gain: 'Gain',
        asymmetry: 'Asymétrie',
        harmonics: 'Harmoniques',
        gate: 'Gate',
      },
    },
    // Compresseur
    compressor: {
      title: 'Compresseur',
      
      // Contrôles
      controls: {
        threshold: 'Seuil',
        ratio: 'Ratio',
        attack: 'Attaque',
        release: 'Relâchement',
        knee: 'Knee',
        makeupGain: 'Gain de compensation',
        gainCompact: 'Gain',
      },
      
      // Modes d'affichage
      modes: {
        compact: 'Compact',
        advanced: 'Avancé',
        compactActive: '✓ Compact',
        advancedCollapsed: '▶ Avancé',
        advancedExpanded: '▼ Avancé',
      },
      
      // Section avancée
      advanced: {
        title: 'Paramètres avancés',
        description: 'Les contrôles avancés permettent un réglage fin des paramètres pour des applications spécialisées.',
      },
      
      // VU-mètres et indicateurs
      meters: {
        gainReduction: 'GR',
        inputOutput: 'I/O',
      },
      
      // Presets
      presets: {
        title: '🎛️ Presets Professionnels',
        categories: {
          vocal: {
            name: '🎤 Voix Lead',
            description: 'Voix principale claire',
          },
          drums: {
            name: '🥁 Frappe Batterie',
            description: 'Percussion dynamique',
          },
          master: {
            name: '🎵 Bus Master',
            description: 'Mix général cohérent',
          },
          bass: {
            name: '🎸 Contrôle Basse',
            description: 'Basse contrôlée',
          },
          piano: {
            name: '🎹 Piano Doux',
            description: 'Piano doux et régulier',
          },
          aggressive: {
            name: '🔥 Agressif',
            description: 'Son agressif et punchant',
          },
          brass: {
            name: '🎺 Section Cuivres',
            description: 'Cuivres brillants et homogènes',
          },
          snare: {
            name: '🥁 Caisse Claire',
            description: 'Caisse claire percutante',
          },
          broadcast: {
            name: '🎤 Voix Radio',
            description: 'Voix radio professionnelle',
          },
        },
        labels: {
          threshold: 'Seuil',
          ratio: 'Ratio',
          attack: 'Attaque',
        },
      },
    },
  },

  // Visualiseurs audio
  visualizers: {
    // Modes de visualisation
    modes: {
      levels: 'Niveaux',
      spectrum: 'Spectre',
      oscilloscope: 'Oscillo',
      '3d': '3D',
    },

    // VU-mètres
    levelMeter: {
      title: 'Niveaux',
      phase: 'Phase',
      left: 'L',
      right: 'R',
    },

    // Analyseur de spectre
    spectrumAnalyzer: {
      title: 'Analyseur de Spectre',
    },

    // Oscilloscope
    oscilloscope: {
      title: 'Oscilloscope',
    },

    // Visualiseur 3D
    visualizer3d: {
      title: 'Visualiseur 3D',
      modes: {
        spectrum: 'Spectre',
        intensity: 'Intensité',
        phase: 'Phase',
      },
    },

    // Contrôles généraux
    controls: {
      grid: 'Grille',
      labels: 'Labels',
      color: 'Couleur',
      settings: 'Paramètres',
    },

    // Schémas de couleurs
    colorSchemes: {
      classic: 'Classique',
      gradient: 'Dégradé',
      heat: 'Thermique',
    },
  },
} as const;