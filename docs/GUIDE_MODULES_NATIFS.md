# 🚀 Guide Complet : Création de TurboModules React Native

## 📋 Vue d'ensemble

Les **TurboModules** représentent la nouvelle architecture de React Native permettant d'exécuter du code natif C++ depuis JavaScript avec des performances optimales. Le code C++ est partagé entre iOS et Android, offrant une approche unifiée pour les modules natifs.

### Architecture
```
JavaScript ↔ JSI (JavaScript Interface) ↔ C++ ↔ iOS/Android
```

## 📁 Structure du projet

```
Naya
├── specs/                          # Spécifications TypeScript
│   └── MonModule.ts
├── src/native/                     # Code C++ partagé
│   ├── MonModule.h
│   └── MonModule.cpp
├── ios/                            # Bridge iOS
│   ├── MonModuleProvider.h
│   ├── MonModuleProvider.mm
│   └── projet.xcodeproj/project.pbxproj
├── android/app/src/main/jni/       # Configuration Android
│   ├── CMakeLists.txt
│   └── OnLoad.cpp
└── package.json                    # Configuration Codegen
```

## 🔄 Processus de création étape par étape

### Étape 1 : Définition de l'interface TypeScript
Créer le fichier de spécification qui définit l'interface entre JavaScript et le code natif.

**Fichier :** `specs/MonModule.ts`

```typescript
import { TurboModule, TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  readonly maMethode: (input: string) => string;
  readonly calculer: (a: number, b: number) => number;
  readonly estValide: (input: string) => boolean;
}

export default TurboModuleRegistry.getEnforcing<Spec>('MonModule');
```

### Étape 2 : Configuration du générateur de code
Configurer Codegen pour générer automatiquement les fichiers de liaison.

**Fichier :** `package.json`

```json
{
  "codegenConfig": {
    "name": "MonProjet",
    "type": "modules",
    "jsSrcsDir": "specs",
    "ios": {
      "modulesProvider": {
        "MonModule": "MonModuleProvider"
      }
    }
  }
}
```

### Étape 3 : Déclaration C++ (Header)
Créer le fichier d'en-tête qui déclare la classe C++ du module.

**Fichier :** `src/native/MonModule.h`

```cpp
#pragma once

#include "MonProjetJSI.h"  // Généré par Codegen
#include <ReactCommon/TurboModule.h>
#include <memory>

namespace facebook::react {

class MonModule : public MonModuleCxxSpec<MonModule> {
public:
  MonModule(std::shared_ptr<CallInvoker> jsInvoker);

  // Méthodes correspondant exactement à l'interface TypeScript
  jsi::String maMethode(jsi::Runtime &rt, jsi::String input);
  double calculer(jsi::Runtime &rt, double a, double b);
  bool estValide(jsi::Runtime &rt, jsi::String input);
};

} // namespace facebook::react
```

### Étape 4 : Implémentation C++
Implémenter la logique métier du module en C++.

**Fichier :** `src/native/MonModule.cpp`

```cpp
#include "MonModule.h"
#include <string>
#include <algorithm>

namespace facebook::react {

MonModule::MonModule(std::shared_ptr<CallInvoker> jsInvoker)
    : MonModuleCxxSpec(std::move(jsInvoker)) {}

jsi::String MonModule::maMethode(jsi::Runtime &rt, jsi::String input) {
  // Conversion JavaScript → C++
  std::string inputStr = input.utf8(rt);
  
  // Logique métier
  std::string result = processString(inputStr);
  
  // Conversion C++ → JavaScript
  return jsi::String::createFromUtf8(rt, result);
}

double MonModule::calculer(jsi::Runtime &rt, double a, double b) {
  return performCalculation(a, b);
}

bool MonModule::estValide(jsi::Runtime &rt, jsi::String input) {
  std::string inputStr = input.utf8(rt);
  return validateInput(inputStr);
}

} // namespace facebook::react
```

### Étape 5 : Provider iOS (Header)
Créer l'interface du provider iOS.

**Fichier :** `ios/MonModuleProvider.h`

```objc
#import <Foundation/Foundation.h>
#import <ReactCommon/RCTTurboModule.h>

NS_ASSUME_NONNULL_BEGIN

@interface MonModuleProvider: NSObject <RCTModuleProvider>

@end

NS_ASSUME_NONNULL_END
```

### Étape 6 : Provider iOS (Implémentation)
Implémenter le provider qui instancie le module C++.

**Fichier :** `ios/MonModuleProvider.mm`

```objc
#import "MonModuleProvider.h"
#import <ReactCommon/CallInvoker.h>
#import <ReactCommon/TurboModule.h>
#import "MonModule.h"

@implementation MonModuleProvider

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::MonModule>(params.jsInvoker);
}

@end
```

### Étape 7 : Liens symboliques iOS
Ajouter les références des fichiers dans le projet Xcode.

**Fichier :** `ios/MonProjet.xcodeproj/project.pbxproj`

Ajouter les entrées dans les sections appropriées :
- PBXBuildFile
- PBXFileReference  
- PBXGroup
- PBXSourcesBuildPhase

### Étape 8 : Configuration Android (CMake)
Configurer la compilation du code C++ pour Android.

**Fichier :** `android/app/src/main/jni/CMakeLists.txt`

```cmake
# Ajouter les sources C++
target_sources(${CMAKE_PROJECT_NAME} PRIVATE 
  ../../../../../src/native/MonModule.cpp
)
```

### Étape 9 : Configuration Android (OnLoad)
Enregistrer le module dans le système Android.

**Fichier :** `android/app/src/main/jni/OnLoad.cpp`

```cpp
#include <MonModule.h>  // Ajouter l'include

std::shared_ptr<TurboModule>
cxxModuleProvider(const std::string &name,
                  const std::shared_ptr<CallInvoker> &jsInvoker) {
  
  // Enregistrer le module
  if (name == MonModule::kModuleName) {
    return std::make_shared<MonModule>(jsInvoker);
  }
  
  return autolinking_cxxModuleProvider(name, jsInvoker);
}
```

### Étape 10 : Génération des fichiers
Exécuter Codegen pour générer les fichiers de liaison.

```bash
cd ios && pod install
```

### Étape 11 : Correction des includes
Ajuster les includes après génération pour utiliser le bon nom de fichier JSI.

## 🔧 Compilation et utilisation

### Compilation iOS
```bash
yarn ios
```

### Compilation Android  
```bash
yarn android
```

### Utilisation en JavaScript
```javascript
import MonModule from './specs/MonModule';

// Appels des méthodes
const resultat = MonModule.maMethode("données");
const somme = MonModule.calculer(10, 5);
const valide = MonModule.estValide("test");
```

## 📊 Correspondance des types

| TypeScript | C++ JSI | Conversion JS→C++ | Conversion C++→JS |
|------------|---------|-------------------|-------------------|
| `string` | `jsi::String` | `input.utf8(rt)` | `jsi::String::createFromUtf8(rt, str)` |
| `number` | `double` | Direct | Direct |
| `boolean` | `bool` | Direct | Direct |
| `object` | `jsi::Object` | `input.asObject(rt)` | `jsi::Object::createFromHostObject(rt, obj)` |

## 📂 Fichiers générés automatiquement

Après `pod install`, Codegen génère dans `ios/build/generated/ios/` :

- **MonProjetJSI.h** : Interface C++ principale
- **MonProjetJSI-generated.cpp** : Implémentation JSI
- **MonModule-generated.mm** : Bridge Objective-C
- **RCTModuleProviders.mm** : Enregistrement automatique

## ⚙️ Points critiques

### ✅ Bonnes pratiques
- Maintenir la cohérence des noms dans tous les fichiers
- Respecter exactement les signatures TypeScript en C++
- Utiliser le namespace `facebook::react`
- Ne jamais modifier les fichiers générés
- Exécuter `pod install` après chaque modification de spec

### ⚠️ Pièges courants
- **Noms incohérents** : Le même nom doit être utilisé partout
- **Signatures différentes** : TypeScript et C++ doivent correspondre exactement
- **Includes incorrects** : Utiliser le bon fichier JSI généré
- **Oubli de `pod install`** : Nécessaire pour régénérer les fichiers
- **Identifiants Xcode dupliqués** : Chaque référence doit être unique

## 🐛 Résolution des problèmes

### Erreur "file not found"
1. Vérifier que `pod install` a été exécuté
2. Contrôler la configuration dans `package.json`
3. S'assurer que les chemins sont corrects

### Erreur de compilation C++
1. Vérifier les signatures des méthodes
2. Contrôler les includes et namespaces
3. S'assurer que le fichier JSI est généré

### Module non trouvé en JavaScript
1. Vérifier le nom dans `TurboModuleRegistry.getEnforcing()`
2. Contrôler l'enregistrement Android dans `OnLoad.cpp`
3. Vérifier la configuration iOS du provider

## 🎯 Avantages des TurboModules

- **Performance** : Exécution native optimisée
- **Code partagé** : Une implémentation C++ pour iOS et Android
- **Type safety** : Vérification des types à la compilation
- **Architecture moderne** : Compatible avec la nouvelle architecture React Native
- **Flexibilité** : Possibilité d'implémenter des logiques complexes

---

Ce processus permet de créer des modules natifs performants et maintenables, exploitant pleinement les capacités de la nouvelle architecture React Native.