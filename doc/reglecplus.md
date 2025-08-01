# C++ Style Guide & Best Practices
*Basé sur Google C++ Style Guide, ISO C++ Core Guidelines, et Microsoft Learn*

## 1. Conventions de nommage

### Variables et fonctions
- **Variables locales** : `snake_case`
- **Fonctions** : `PascalCase()` ou `snake_case()` selon la convention du projet
- **Membres privés** : suffixe `_` (ex. `size_`, `data_`)
- **Constantes globales** : `kPascalCase` ou `ALL_CAPS`
- **Macros** : `ALL_CAPS_WITH_UNDERSCORES`

### Types et classes
- **Classes/Structs** : `PascalCase`
- **Enums** : `PascalCase` avec `enum class`
- **Typedefs/Aliases** : `PascalCase`
- **Namespaces** : `snake_case`

```cpp
// Exemples
class DatabaseConnection {
private:
    std::string connection_string_;
    int timeout_;
public:
    bool ConnectToDatabase();
};

enum class Status { kSuccess, kError, kPending };
namespace network_utils { /* ... */ }
```

## 2. Gestion des constantes

### Règles fondamentales
- **Toujours** utiliser `const` ou `constexpr` pour les valeurs immuables
- **Jamais** de `#define` pour les constantes
- Centraliser dans un namespace ou fichier dédié
- Préférer `enum class` pour les valeurs discrètes

```cpp
// ✅ Bon
constexpr int kMaxRetries = 3;
constexpr double kPi = 3.14159265359;

enum class HttpStatus { 
    kOk = 200, 
    kNotFound = 404, 
    kInternalError = 500 
};

// ❌ Éviter
#define MAX_RETRIES 3
const int magic_number = 42; // Sans contexte
```

## 3. Élimination des "Magic Numbers"

### Principe
Toute valeur numérique doit avoir une signification explicite.

```cpp
// ❌ Magic numbers
if (attempts > 3) { /* retry logic */ }
buffer.resize(1024);
sleep(5000);

// ✅ Valeurs nommées
constexpr int kMaxRetries = 3;
constexpr size_t kDefaultBufferSize = 1024;
constexpr int kTimeoutMs = 5000;

if (attempts > kMaxRetries) { /* retry logic */ }
buffer.resize(kDefaultBufferSize);
sleep(kTimeoutMs);
```

## 4. Documentation et commentaires

### Philosophie
- Commenter **pourquoi**, pas **comment**
- Le code doit être auto-documenté autant que possible
- Éviter les commentaires évidents

```cpp
// ❌ Commentaire inutile
i++; // Incrémente i

// ✅ Commentaire utile
// Utilise un algorithme de retry exponentiel pour éviter 
// la surcharge du serveur lors de pics de trafic
backoff_time *= 2;

/**
 * Calcule la distance de Levenshtein entre deux chaînes.
 * Complexité: O(m*n) en temps et espace.
 * 
 * @param str1 Première chaîne à comparer
 * @param str2 Seconde chaîne à comparer
 * @return Distance d'édition entre les deux chaînes
 */
int CalculateEditDistance(const std::string& str1, const std::string& str2);
```

## 5. Design des fonctions

### Principes SOLID
- **Une fonction = une responsabilité**
- Fonctions courtes et lisibles (< 50 lignes idéalement)
- Éviter les effets de bord cachés
- Noms explicites qui décrivent l'intention

```cpp
// ❌ Fonction trop complexe
void ProcessUserData(User& user) {
    // Validation
    // Formatage
    // Sauvegarde en base
    // Envoi d'email
    // Logging
}

// ✅ Responsabilités séparées
bool ValidateUser(const User& user);
void FormatUserData(User& user);
void SaveUserToDatabase(const User& user);
void SendWelcomeEmail(const User& user);
void LogUserRegistration(const User& user);
```

## 6. Initialisation des variables

### Règles strictes
- **Toujours** initialiser lors de la déclaration
- Utiliser l'initialisation uniforme `{}`
- Ne déclarer que quand la valeur est connue
- Éviter la réutilisation de variables

```cpp
// ✅ Initialisation correcte
int count{0};
std::string name{"Default"};
std::vector<int> numbers{1, 2, 3, 4, 5};

// Déclaration proche de l'utilisation
auto connection = CreateDatabaseConnection();
if (connection.IsValid()) {
    // Utilisation immédiate
}

// ❌ À éviter
int count; // Non initialisé
std::string temp; // Réutilisé pour différents usages
```

## 7. Gestion mémoire moderne

### Smart Pointers et RAII
- Éviter les pointeurs nus sauf cas spéciaux
- Utiliser `std::unique_ptr` pour la propriété exclusive
- Utiliser `std::shared_ptr` pour la propriété partagée
- Respecter le principe RAII

```cpp
// ✅ Gestion automatique de la mémoire
class FileManager {
private:
    std::unique_ptr<FileHandle> file_;
    
public:
    explicit FileManager(const std::string& filename) 
        : file_{std::make_unique<FileHandle>(filename)} {}
    
    // Pas besoin de destructeur explicite - RAII
};

// ✅ Factory pattern avec smart pointers
std::unique_ptr<Database> CreateDatabase(const Config& config) {
    return std::make_unique<PostgreSQLDatabase>(config);
}

// ❌ Gestion manuelle risquée
Database* db = new PostgreSQLDatabase(); // Risque de fuite
```

## 8. Formatting et lisibilité

### Standards de présentation
- Indentation cohérente (2 ou 4 espaces)
- Espaces autour des opérateurs
- Lignes ≤ 100 caractères
- Séparation logique des blocs

```cpp
// ✅ Formatage correct
class Calculator {
public:
    double Add(double a, double b) const {
        return a + b;
    }
    
    double Multiply(double a, double b) const {
        if (a == 0.0 || b == 0.0) {
            return 0.0;
        }
        
        return a * b;
    }
};

// Opérateurs bien espacés
result = (a + b) * (c - d) / (e + f);
```

## 9. Organisation des namespaces

### Structure modulaire
- Namespaces clairs et hiérarchiques
- Éviter `using namespace` dans les headers
- `using` déclarations locales quand approprié

```cpp
// header.h
namespace company {
namespace project {
namespace utils {

class StringHelper {
public:
    static std::string Trim(const std::string& input);
};

} // namespace utils
} // namespace project
} // namespace company

// implementation.cpp
namespace company::project::utils {

std::string StringHelper::Trim(const std::string& input) {
    using std::string;  // Usage local acceptable
    // implémentation...
}

} // namespace company::project::utils
```

## 10. Architecture modulaire

### Séparation des responsabilités
- Headers (`.h`/`.hpp`) pour les déclarations
- Sources (`.cpp`) pour les implémentations
- Modules logiques indépendants
- Interfaces claires entre composants

```cpp
// DatabaseInterface.h - Interface abstraite
class DatabaseInterface {
public:
    virtual ~DatabaseInterface() = default;
    virtual bool Connect(const std::string& connection_string) = 0;
    virtual std::optional<User> FindUser(int id) = 0;
};

// PostgreSQLDatabase.h - Implémentation spécifique
class PostgreSQLDatabase : public DatabaseInterface {
public:
    bool Connect(const std::string& connection_string) override;
    std::optional<User> FindUser(int id) override;
private:
    std::unique_ptr<PGConnection> connection_;
};

// UserService.h - Service métier
class UserService {
public:
    explicit UserService(std::unique_ptr<DatabaseInterface> db);
    std::optional<User> GetUserById(int id);
private:
    std::unique_ptr<DatabaseInterface> database_;
};
```

## Checklist qualité

### Avant chaque commit
- [ ] Noms explicites et cohérents
- [ ] Aucun magic number
- [ ] Fonctions courtes et focalisées
- [ ] Variables initialisées
- [ ] Gestion mémoire sécurisée
- [ ] Commentaires pertinents
- [ ] Formatage cohérent
- [ ] Tests unitaires passants
- [ ] Aucun warning de compilation

---

