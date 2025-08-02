# EqualizerView - Architecture Modulaire

L'EqualizerView a été refactorisé en une architecture modulaire pour une meilleure maintenabilité, réutilisabilité et organisation du code.

## Structure des fichiers

```
EqualizerView/
├── index.ts                 # Point d'entrée principal
├── EqualizerView.tsx       # Composant principal orchestrateur
├── types.ts                # Types et interfaces TypeScript
├── utils.ts                # Fonctions utilitaires
├── styles.ts               # Styles StyleSheet
├── EqualizerHeader.tsx     # Header avec bypass et reset
├── ResponseGraph.tsx       # Graphique de courbe de réponse
├── BandSelector.tsx        # Sélecteur de bandes
├── BandControls.tsx        # Contrôles détaillés d'une bande
├── GlobalControls.tsx      # Contrôles globaux
└── README.md               # Cette documentation
```

## Responsabilités des composants

### `EqualizerView.tsx`
- **Rôle** : Composant orchestrateur principal
- **Responsabilités** : 
  - Gestion de l'état global (bandes, bypass, gain global)
  - Communication avec le module audio natif
  - Coordination des sous-composants
- **State** : `bands`, `selectedBand`, `globalGain`, `bypassEnabled`

### `EqualizerHeader.tsx`
- **Rôle** : En-tête avec contrôles globaux
- **Responsabilités** : 
  - Affichage du titre
  - Bouton bypass
  - Bouton reset général
- **Props** : `bypassEnabled`, `onToggleBypass`, `onResetAll`

### `ResponseGraph.tsx`
- **Rôle** : Visualisation graphique de la courbe EQ
- **Responsabilités** :
  - Génération et affichage de la courbe de réponse
  - Grille de référence (fréquences et gains)
  - Points visuels des bandes actives
- **Props** : `bands`, `selectedBand`

### `BandSelector.tsx`
- **Rôle** : Interface de sélection des bandes
- **Responsabilités** :
  - Affichage horizontal des bandes disponibles
  - Sélection de la bande active
  - Toggle des bandes (appui long)
- **Props** : `bands`, `selectedBand`, `onSelectBand`, `onToggleBand`

### `BandControls.tsx`
- **Rôle** : Contrôles détaillés pour une bande
- **Responsabilités** :
  - Sliders pour fréquence, gain, Q
  - Boutons d'activation/désactivation et reset
  - Affichage conditionnel du Q pour les bandes BELL
- **Props** : `band`, `bandIndex`, `onUpdateParameter`, `onToggleBand`, `onResetBand`

### `GlobalControls.tsx`
- **Rôle** : Contrôles globaux de l'égaliseur
- **Responsabilités** :
  - Slider de gain global
  - Affichage de la valeur formatée
- **Props** : `globalGain`, `onGlobalGainChange`

### `types.ts`
- **Rôle** : Définitions TypeScript
- **Contenu** : 
  - `EQBand` : Structure d'une bande EQ
  - Props interfaces pour tous les composants
  - Types pour les filtres EQ

### `utils.ts`
- **Rôle** : Fonctions utilitaires
- **Contenu** :
  - `generateResponseCurve()` : Calcul de la courbe EQ
  - `getFrequencyPosition()` : Position graphique d'une fréquence
  - `formatFrequency()`, `formatGain()` : Formatage d'affichage

### `styles.ts`
- **Rôle** : Styles visuels
- **Contenu** : Tous les styles StyleSheet utilisés par les composants

## Flux de données

```
EqualizerView (orchestrateur)
├── EqualizerHeader
├── ResponseGraph ← bands, selectedBand
├── BandSelector ← bands, selectedBand → onSelectBand, onToggleBand
├── BandControls ← currentBand → onUpdateParameter, onToggleBand, onResetBand
└── GlobalControls ← globalGain → onGlobalGainChange
```

## Avantages de cette architecture

1. **Séparation des préoccupations** : Chaque composant a une responsabilité unique
2. **Réutilisabilité** : Les sous-composants peuvent être réutilisés individuellement
3. **Testabilité** : Chaque composant peut être testé en isolation
4. **Maintenabilité** : Modifications localisées selon la fonctionnalité
5. **Lisibilité** : Code organisé et structure claire
6. **Performance** : Optimisations possibles par composant
7. **Évolutivité** : Ajout de nouvelles fonctionnalités facilité

## Types de bandes EQ supportés

- **BELL** : Filtre en cloche avec contrôle Q
- **LOW_SHELF** : Filtre plateau bas
- **HIGH_SHELF** : Filtre plateau haut
- **HIGH_PASS** : Filtre passe-haut (future extension)
- **LOW_PASS** : Filtre passe-bas (future extension)

## Utilisation

```typescript
import { EqualizerView } from './modules/EqualizerView';

// Le composant fonctionne de manière identique à l'ancienne version
<EqualizerView moduleId="eq_module_1" />
```

## Migration

L'interface publique reste identique. Le changement est transparent pour les composants parents qui utilisent `EqualizerView`.