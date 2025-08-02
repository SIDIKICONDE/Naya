# CompressorView - Architecture Refactorisée

## 📁 Structure

```
CompressorView/
├── CompressorView.tsx          # Composant principal
├── types.ts                    # Interfaces TypeScript
├── constants.ts                # Constantes et configurations
├── utils.ts                   # Fonctions utilitaires
├── hooks/
│   └── useCompressorState.ts  # Hook de gestion d'état
├── components/
│   ├── CompressorHeader.tsx   # Header avec VU-mètres
│   ├── CompressorControl.tsx  # Contrôle réutilisable
│   ├── CompressorControls.tsx # Section des contrôles
│   ├── CompressionGraph.tsx   # Graphique SVG
│   ├── CompressorPresets.tsx  # Presets intelligents
│   └── index.ts              # Export des composants
├── index.ts                   # Export principal
└── README.md                  # Cette documentation
```

## 🚀 Utilisation

```tsx
import { CompressorView } from './CompressorView';

// Utilisation simple
<CompressorView moduleId="compressor-1" />
```

## 🔧 Architecture

### Hook Principal : `useCompressorState`
Gère tout l'état et la logique métier du compresseur :
- États des paramètres (threshold, ratio, attack, etc.)
- Synchronisation avec le module audio
- Animations des VU-mètres
- Application des presets

### Composants Modulaires

#### `CompressorHeader`
- Titre et bouton power
- VU-mètre de gain reduction avec échelle
- Affichage du niveau I/O

#### `CompressorControl`
Composant réutilisable pour tous les contrôles slider :
- Formatage intelligent des valeurs
- Couleurs dynamiques selon les valeurs
- Steps adaptatifs

#### `CompressorControls`
Section complète des paramètres principaux :
- Threshold, Ratio, Attack, Release
- Knee et Makeup Gain
- Couleurs contextuelles

#### `CompressionGraph`
Graphique SVG interactif :
- Courbe de compression temps réel
- Grille graduée
- Point de seuil visuel

#### `CompressorPresets`
Grid de presets professionnels :
- 6 presets spécialisés avec emojis
- Descriptions contextuelles
- Application instantanée

## ⚙️ Configuration

### Constants (`constants.ts`)
- `DEFAULT_PARAMS` : Valeurs par défaut
- `PARAM_RANGES` : Limites et steps
- `CONTROL_COLORS` : Palette de couleurs
- `COMPRESSOR_PRESETS` : Presets professionnels
- `ANIMATION_CONFIG` : Configuration animations
- `GRAPH_CONFIG` : Configuration graphique

### Types (`types.ts`)
Interfaces TypeScript complètes pour :
- Props des composants
- État du compresseur
- Presets
- Contrôles

### Utils (`utils.ts`)
Fonctions pures pour :
- Calculs de compression
- Formatage des valeurs
- Génération de courbes SVG
- Couleurs dynamiques

## 🎨 Personnalisation

### Ajouter un Preset
```tsx
// Dans constants.ts
export const COMPRESSOR_PRESETS = [
  // ... presets existants
  {
    name: '🎸 Guitar Crunch',
    threshold: -14,
    ratio: 5,
    attack: 2,
    release: 80,
    knee: 1.5,
    description: 'Guitare rock saturée',
  },
];
```

### Personnaliser les Couleurs
```tsx
// Dans constants.ts
export const CONTROL_COLORS = {
  // ... couleurs existantes
  myCustomColor: '#YOUR_COLOR',
};
```

### Étendre les Contrôles
```tsx
// Nouveau contrôle personnalisé
<CompressorControl
  label="Mon Paramètre"
  value={myValue}
  min={0}
  max={100}
  onChange={setMyValue}
  onComplete={updateMyParam}
  color="#YOUR_COLOR"
  formatValue={(v) => `${v.toFixed(1)}%`}
/>
```

## 📊 Performance

### Optimisations Implémentées
- ✅ Hooks mémorisés (`useCallback`, `useMemo`)
- ✅ Composants séparés pour éviter re-renders
- ✅ États locaux isolés
- ✅ Animations natives optimisées

### Métriques
- Bundle size réduit grâce au tree shaking
- Re-renders minimisés
- Smooth 60fps animations
- Responsive design

## 🧪 Tests

### Structure de Test Recommandée
```
__tests__/
├── CompressorView.test.tsx
├── hooks/
│   └── useCompressorState.test.ts
├── components/
│   ├── CompressorHeader.test.tsx
│   ├── CompressorControl.test.tsx
│   └── ...
└── utils/
    └── utils.test.ts
```

### Exemple de Test
```tsx
import { renderHook } from '@testing-library/react-hooks';
import { useCompressorState } from './hooks/useCompressorState';

test('should initialize with default params', () => {
  const { result } = renderHook(() => useCompressorState('test-id'));
  expect(result.current.state.threshold).toBe(-12);
  expect(result.current.state.ratio).toBe(4);
});
```

## 🔄 Migration

L'ancien `CompressorView.tsx` fait maintenant un re-export vers cette version, assurant une **compatibilité totale** avec le code existant.

## 🎯 Roadmap

- [ ] Ajout de modes de compression (Peak, RMS, etc.)
- [ ] Presets utilisateur sauvegardables
- [ ] Automation et modulation
- [ ] Spectrogramme temps réel
- [ ] Export/Import de configurations