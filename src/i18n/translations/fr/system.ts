/**
 * Traductions françaises - Système
 * Messages système, notifications et états de l'application
 */

export default {
  // États de l'application
  appState: {
    starting: 'Démarrage de l\'application...',
    initializing: 'Initialisation...',
    loading: 'Chargement...',
    ready: 'Prêt',
    updating: 'Mise à jour...',
    restarting: 'Redémarrage...',
    shutting_down: 'Arrêt en cours...',
    offline: 'Mode hors ligne',
    online: 'Mode en ligne',
    syncing: 'Synchronisation...',
    maintenance: 'Maintenance en cours',
  },

  // Notifications système
  notifications: {
    welcome: 'Bienvenue dans Naya !',
    newUpdate: 'Une nouvelle mise à jour est disponible',
    updateInstalled: 'Mise à jour installée avec succès',
    backupCompleted: 'Sauvegarde terminée',
    backupFailed: 'Échec de la sauvegarde',
    settingsSaved: 'Paramètres sauvegardés',
    settingsRestored: 'Paramètres restaurés',
    cacheCleared: 'Cache vidé',
    dataExported: 'Données exportées',
    dataImported: 'Données importées',
    profileUpdated: 'Profil mis à jour',
    passwordChanged: 'Mot de passe modifié',
    emailVerified: 'Email vérifié',
    phoneVerified: 'Téléphone vérifié',
    subscriptionActivated: 'Abonnement activé',
    subscriptionExpired: 'Abonnement expiré',
    paymentSuccessful: 'Paiement réussi',
    paymentFailed: 'Échec du paiement',
    trialExpired: 'Période d\'essai expirée',
    licenseExpired: 'Licence expirée',
    lowStorage: 'Espace de stockage faible',
    highMemoryUsage: 'Utilisation mémoire élevée',
    connectionLost: 'Connexion perdue',
    connectionRestored: 'Connexion rétablie',
    syncConflict: 'Conflit de synchronisation',
    securityAlert: 'Alerte de sécurité',
    newDevice: 'Nouvel appareil détecté',
    suspiciousActivity: 'Activité suspecte détectée',
    maintenanceScheduled: 'Maintenance programmée',
    featureDeprecated: 'Fonctionnalité obsolète',
    experimentalFeature: 'Fonctionnalité expérimentale',
  },

  // Types de notifications
  notificationTypes: {
    info: 'Information',
    success: 'Succès',
    warning: 'Attention',
    error: 'Erreur',
    critical: 'Critique',
    update: 'Mise à jour',
    security: 'Sécurité',
    system: 'Système',
    user: 'Utilisateur',
    payment: 'Paiement',
    sync: 'Synchronisation',
    backup: 'Sauvegarde',
    maintenance: 'Maintenance',
  },

  // Permissions
  permissions: {
    camera: 'Appareil photo',
    microphone: 'Microphone',
    storage: 'Stockage',
    location: 'Localisation',
    contacts: 'Contacts',
    calendar: 'Calendrier',
    photos: 'Photos',
    notifications: 'Notifications',
    bluetooth: 'Bluetooth',
    wifi: 'Wi-Fi',
    cellular: 'Données cellulaires',
    biometric: 'Biométrie',
    background: 'Arrière-plan',
    system_settings: 'Paramètres système',
    
    // Messages de demande
    requestCamera: 'Cette application a besoin d\'accéder à votre appareil photo',
    requestMicrophone: 'Cette application a besoin d\'accéder à votre microphone',
    requestStorage: 'Cette application a besoin d\'accéder au stockage',
    requestLocation: 'Cette application a besoin d\'accéder à votre localisation',
    requestNotifications: 'Cette application souhaite vous envoyer des notifications',
    
    // États des permissions
    granted: 'Accordé',
    denied: 'Refusé',
    restricted: 'Restreint',
    undetermined: 'Non déterminé',
    provisional: 'Provisoire',
  },

  // Diagnostics
  diagnostics: {
    systemInfo: 'Informations système',
    appVersion: 'Version de l\'application',
    buildNumber: 'Numéro de build',
    platform: 'Plateforme',
    osVersion: 'Version OS',
    deviceModel: 'Modèle d\'appareil',
    screenResolution: 'Résolution d\'écran',
    availableMemory: 'Mémoire disponible',
    usedStorage: 'Stockage utilisé',
    batteryLevel: 'Niveau de batterie',
    networkType: 'Type de réseau',
    connectionSpeed: 'Vitesse de connexion',
    lastSync: 'Dernière synchronisation',
    crashReports: 'Rapports de crash',
    performanceMetrics: 'Métriques de performance',
    debugLogs: 'Journaux de debug',
    errorLogs: 'Journaux d\'erreur',
    analytics: 'Analytiques',
    telemetry: 'Télémétrie',
  },

  // Performance
  performance: {
    excellent: 'Excellente',
    good: 'Bonne',
    average: 'Moyenne',
    poor: 'Faible',
    critical: 'Critique',
    
    metrics: {
      fps: 'Images par seconde',
      cpu: 'Utilisation CPU',
      memory: 'Utilisation mémoire',
      battery: 'Consommation batterie',
      network: 'Utilisation réseau',
      storage: 'Utilisation stockage',
      latency: 'Latence',
      throughput: 'Débit',
      responsiveness: 'Réactivité',
      stability: 'Stabilité',
    },
  },

  // Sécurité
  security: {
    encrypted: 'Chiffré',
    decrypted: 'Déchiffré',
    authenticated: 'Authentifié',
    authorized: 'Autorisé',
    verified: 'Vérifié',
    secured: 'Sécurisé',
    compromised: 'Compromis',
    vulnerable: 'Vulnérable',
    
    events: {
      loginSuccess: 'Connexion réussie',
      loginFailed: 'Échec de connexion',
      logoutSuccess: 'Déconnexion réussie',
      passwordChanged: 'Mot de passe modifié',
      accountLocked: 'Compte verrouillé',
      accountUnlocked: 'Compte déverrouillé',
      suspiciousLogin: 'Connexion suspecte',
      newDeviceLogin: 'Connexion depuis un nouvel appareil',
      twoFactorEnabled: 'Authentification à deux facteurs activée',
      twoFactorDisabled: 'Authentification à deux facteurs désactivée',
      dataExport: 'Exportation de données',
      dataImport: 'Importation de données',
      permissionGranted: 'Permission accordée',
      permissionRevoked: 'Permission révoquée',
    },
  },

  // États de connectivité
  connectivity: {
    wifi: 'Wi-Fi',
    cellular: 'Cellulaire',
    ethernet: 'Ethernet',
    bluetooth: 'Bluetooth',
    offline: 'Hors ligne',
    poor: 'Faible',
    good: 'Bonne',
    excellent: 'Excellente',
    
    status: {
      connected: 'Connecté',
      connecting: 'Connexion...',
      disconnected: 'Déconnecté',
      reconnecting: 'Reconnexion...',
      failed: 'Échec',
      timeout: 'Délai dépassé',
      unstable: 'Instable',
      limited: 'Limitée',
    },
  },

  // Maintenance et mises à jour
  maintenance: {
    scheduledMaintenance: 'Maintenance programmée',
    emergencyMaintenance: 'Maintenance d\'urgence',
    systemUpdate: 'Mise à jour système',
    securityUpdate: 'Mise à jour de sécurité',
    featureUpdate: 'Mise à jour fonctionnelle',
    bugFix: 'Correction de bugs',
    performanceImprovement: 'Amélioration des performances',
    
    updateAvailable: 'Mise à jour disponible',
    updateRequired: 'Mise à jour requise',
    updateOptional: 'Mise à jour optionnelle',
    updateDownloading: 'Téléchargement de la mise à jour...',
    updateInstalling: 'Installation de la mise à jour...',
    updateComplete: 'Mise à jour terminée',
    updateFailed: 'Échec de la mise à jour',
    restartRequired: 'Redémarrage requis',
  },
} as const;