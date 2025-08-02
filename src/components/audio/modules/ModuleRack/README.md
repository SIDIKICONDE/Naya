# ModuleRack - Architecture Modulaire

Le ModuleRack a été refactorisé en une architecture modulaire pour une meilleure maintenabilité et réutilisabilité.

## Structure des fichiers

```
ModuleRack/
├── index.ts                 # Point d'entrée principal
├── ModuleRack.tsx          # Composant principal orchestrateur  
├── types.ts                # Types et interfaces TypeScript
├── moduleCategories.ts     # Configuration des catégories de modules
├── utils.ts                # Utilitaires et helpers
├── styles.ts               # Styles StyleSheet
├── FloatingButton.tsx      # Bouton flottant d'ajout
├── ModuleModal.tsx         # Modal de sélection
├── CategoryList.tsx        # Liste des catégories
├── ModuleTypeList.tsx      # Liste des types de modules
└── README.md               # Cette documentation
```

## Responsabilités

### `ModuleRack.tsx`
- **Rôle** : Composant orchestrateur principal
- **Responsabilités** : Gestion de l'état, coordination des sous-composants
- **Dépendances** : Tous les sous-composants

### `FloatingButton.tsx`
- **Rôle** : Bouton d'action flottant
- **Responsabilités** : Affichage et interaction du bouton d'ajout
- **Props** : `onPress`, `disabled`

### `ModuleModal.tsx`
- **Rôle** : Modal de sélection de modules
- **Responsabilités** : Affichage du modal, navigation entre catégories
- **Sous-composants** : `CategoryList`, `ModuleTypeList`

### `CategoryList.tsx`
- **Rôle** : Affichage des catégories de modules
- **Responsabilités** : Rendu de la liste des catégories avec couleurs
- **Props** : `categories`, `onSelectCategory`

### `ModuleTypeList.tsx`
- **Rôle** : Affichage des types de modules d'une catégorie
- **Responsabilités** : Rendu de la liste des modules, bouton retour
- **Props** : `category`, `onSelectModule`, `onBack`

### `types.ts`
- **Rôle** : Définitions TypeScript
- **Contenu** : Interfaces pour tous les composants et types métier

### `moduleCategories.ts`
- **Rôle** : Configuration des données
- **Contenu** : Définition des catégories et leurs modules associés

### `utils.ts`
- **Rôle** : Fonctions utilitaires
- **Contenu** : `getModuleDisplayName()` et autres helpers

### `styles.ts`
- **Rôle** : Styles visuels
- **Contenu** : Tous les styles StyleSheet utilisés par les composants

## Avantages de cette architecture

1. **Séparation des préoccupations** : Chaque fichier a une responsabilité claire
2. **Réutilisabilité** : Les composants peuvent être réutilisés individuellement  
3. **Testabilité** : Chaque composant peut être testé en isolation
4. **Maintenabilité** : Modifications localisées selon le besoin
5. **Lisibilité** : Code organisé et plus facile à comprendre
6. **Évolutivité** : Ajout de nouvelles fonctionnalités facilité

## Utilisation

```typescript
import { ModuleRack } from './modules/ModuleRack';

// Le composant fonctionne de manière identique à l'ancienne version
<ModuleRack 
  onAddModule={handleAddModule}
  disabled={isProcessing}
/>
```

## Migration

L'interface publique reste identique. Le changement est transparent pour les composants parents qui utilisent `ModuleRack`.