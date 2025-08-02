# 🔄 Guide de Migration - Système i18n

## 📋 Vue d'ensemble

Ce guide vous accompagne dans l'intégration du système d'internationalisation dans votre application React Native existante.

## 🚀 Étapes de Migration

### 1. Installation des dépendances

```bash
# Dépendances principales
yarn add i18next react-i18next

# Stockage persistant
yarn add @react-native-async-storage/async-storage

# Optionnel : Détection de langue avancée
yarn add react-native-device-info
```

### 2. Configuration iOS

#### a. Podfile
```ruby
# ios/Podfile
pod 'RNAsyncStorage', :path => '../node_modules/@react-native-async-storage/async-storage'
```

#### b. Info.plist
```xml
<!-- ios/YourApp/Info.plist -->
<key>CFBundleLocalizations</key>
<array>
  <string>fr</string>
  <string>en</string>
  <string>es</string>
  <string>de</string>
  <string>it</string>
</array>
```

### 3. Configuration Android

#### a. settings.gradle
```gradle
// android/settings.gradle
include ':react-native-async-storage_async-storage'
project(':react-native-async-storage_async-storage').projectDir = new File(rootProject.projectDir, '../node_modules/@react-native-async-storage/async-storage/android')
```

#### b. build.gradle
```gradle
// android/app/build.gradle
dependencies {
    implementation project(':react-native-async-storage_async-storage')
}
```

#### c. Locales supportées
```xml
<!-- android/app/src/main/res/values/strings.xml -->
<resources>
    <string name="app_name">Naya</string>
    <!-- Locales supportées -->
    <string-array name="supported_locales">
        <item>fr</item>
        <item>en</item>
        <item>es</item>
        <item>de</item>
        <item>it</item>
    </string-array>
</resources>
```

### 4. Intégration dans App.tsx

#### Avant
```typescript
// App.tsx (avant)
import React from 'react';
import { SafeAreaView } from 'react-native';
import { MyMainComponent } from './src/components';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MyMainComponent />
    </SafeAreaView>
  );
}
```

#### Après
```typescript
// App.tsx (après)
import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text } from 'react-native';
import { TranslationProvider, initI18n } from './src/i18n';
import { MyMainComponent } from './src/components';

export default function App() {
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    const initializeI18n = async () => {
      try {
        await initI18n({
          defaultLanguage: 'fr',
          debug: __DEV__,
        });
        setIsI18nReady(true);
      } catch (error) {
        console.error('Erreur initialisation i18n:', error);
        setIsI18nReady(true); // Continuer même en cas d'erreur
      }
    };

    initializeI18n();
  }, []);

  if (!isI18nReady) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <TranslationProvider
      onLanguageChange={(language) => {
        console.log('Langue changée:', language);
      }}
      onError={(error) => {
        console.error('Erreur i18n:', error);
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <MyMainComponent />
      </SafeAreaView>
    </TranslationProvider>
  );
}
```

### 5. Migration des composants existants

#### Avant (texte en dur)
```typescript
// Composant avant migration
import React from 'react';
import { View, Text, Button } from 'react-native';

export const AudioControls = () => {
  return (
    <View>
      <Text>Contrôles Audio</Text>
      <Button title="Lecture" onPress={() => {}} />
      <Button title="Pause" onPress={() => {}} />
      <Button title="Arrêt" onPress={() => {}} />
    </View>
  );
};
```

#### Après (avec i18n)
```typescript
// Composant après migration
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useTranslation } from '@/i18n';

export const AudioControls = () => {
  const { t } = useTranslation('audio');

  return (
    <View>
      <Text>{t('interface.controls')}</Text>
      <Button title={t('interface.play')} onPress={() => {}} />
      <Button title={t('interface.pause')} onPress={() => {}} />
      <Button title={t('interface.stop')} onPress={() => {}} />
    </View>
  );
};
```

### 6. Migration des formulaires

#### Avant
```typescript
// Formulaire avant migration
const LoginForm = () => {
  return (
    <View>
      <TextInput placeholder="Email" />
      <TextInput placeholder="Mot de passe" secureTextEntry />
      <Button title="Se connecter" onPress={() => {}} />
      <Text style={{ color: 'red' }}>Email requis</Text>
    </View>
  );
};
```

#### Après
```typescript
// Formulaire après migration
import { useTranslation } from '@/i18n';

const LoginForm = () => {
  const { t } = useTranslation('forms');

  return (
    <View>
      <TextInput placeholder={t('placeholders.enterEmail')} />
      <TextInput 
        placeholder={t('placeholders.enterPassword')} 
        secureTextEntry 
      />
      <Button title={t('buttons.submit')} onPress={() => {}} />
      <Text style={{ color: 'red' }}>
        {t('validation.required')}
      </Text>
    </View>
  );
};
```

### 7. Migration des messages d'erreur

#### Avant
```typescript
// Gestion d'erreurs avant
const handleError = (error: any) => {
  if (error.code === 'NETWORK_ERROR') {
    Alert.alert('Erreur', 'Problème de connexion réseau');
  } else if (error.code === 'AUTH_FAILED') {
    Alert.alert('Erreur', 'Échec de l\'authentification');
  } else {
    Alert.alert('Erreur', 'Une erreur inconnue s\'est produite');
  }
};
```

#### Après
```typescript
// Gestion d'erreurs après
import { useTranslation } from '@/i18n';

const useErrorHandler = () => {
  const { t } = useTranslation('errors');

  const handleError = (error: any) => {
    if (error.code === 'NETWORK_ERROR') {
      Alert.alert(t('common.error'), t('network.connectionFailed'));
    } else if (error.code === 'AUTH_FAILED') {
      Alert.alert(t('common.error'), t('auth.invalidCredentials'));
    } else {
      Alert.alert(t('common.error'), t('system.unknownError'));
    }
  };

  return { handleError };
};
```

## 🎯 Bonnes Pratiques de Migration

### 1. Migration progressive
- Migrez namespace par namespace
- Commencez par les éléments UI les plus visibles
- Gardez les anciennes chaînes en fallback temporairement

### 2. Validation des traductions
```typescript
// Fonction de validation
const validateTranslations = () => {
  const { t, missingKeys } = useTranslation('common');
  
  if (__DEV__ && missingKeys.length > 0) {
    console.warn('Clés de traduction manquantes:', missingKeys);
  }
};
```

### 3. Tests de régression
```typescript
// Test simple
describe('Migration i18n', () => {
  it('devrait afficher les textes traduits', () => {
    const { getByText } = render(<MonComposant />);
    expect(getByText('Enregistrer')).toBeTruthy();
  });
});
```

## 🔧 Configuration TypeScript

### tsconfig.json
```json
{
  "compilerOptions": {
    "paths": {
      "@/i18n": ["./src/i18n"],
      "@/i18n/*": ["./src/i18n/*"]
    }
  }
}
```

### types/i18n.d.ts
```typescript
// types/i18n.d.ts
declare module '@/i18n' {
  export * from '../src/i18n';
}
```

## 📱 Tests sur appareils

### iOS
```bash
# Simulator iOS
npx react-native run-ios

# Test avec différentes langues
# Réglages → Général → Langue et région
```

### Android
```bash
# Emulator Android
npx react-native run-android

# Test avec différentes langues
# Settings → System → Languages & input
```

## 🚨 Points d'attention

### Performance
- ⚠️ Évitez de créer de nouveaux hooks à chaque render
- ✅ Utilisez des namespaces spécifiques pour optimiser
- ✅ Préchargez les langues fréquemment utilisées

### Sécurité
- ⚠️ Validez toujours les entrées utilisateur
- ✅ Utilisez l'échappement automatique
- ✅ Évitez l'interpolation avec du contenu non sûr

### Accessibilité
- ✅ Testez avec les lecteurs d'écran
- ✅ Vérifiez la taille des textes
- ✅ Supportez les modes RTL si nécessaire

## 🔄 Checklist de Migration

### Phase 1 - Préparation
- [ ] Installation des dépendances
- [ ] Configuration iOS/Android
- [ ] Initialisation dans App.tsx
- [ ] Tests de base

### Phase 2 - Migration progressive
- [ ] Migration des textes statiques
- [ ] Migration des formulaires
- [ ] Migration des messages d'erreur
- [ ] Migration des notifications

### Phase 3 - Optimisation
- [ ] Tests de performance
- [ ] Optimisation du cache
- [ ] Tests sur différentes langues
- [ ] Documentation mise à jour

### Phase 4 - Finalisation
- [ ] Tests de régression complets
- [ ] Validation avec utilisateurs
- [ ] Déploiement progressif
- [ ] Monitoring post-déploiement

## 📞 Support

En cas de problème lors de la migration :

1. **Consultez les logs** : Le mode debug fournit des informations détaillées
2. **Vérifiez la configuration** : Assurez-vous que les dépendances sont correctement installées
3. **Testez progressivement** : Migrez composant par composant
4. **Documentez les problèmes** : Créez des issues pour les problèmes récurrents

---

**Bonne migration ! 🚀**