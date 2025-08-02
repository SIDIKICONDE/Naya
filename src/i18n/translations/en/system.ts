/**
 * English translations - System
 * System messages, notifications and application states
 */

export default {
  // Application states
  appState: {
    starting: 'Starting application...',
    initializing: 'Initializing...',
    loading: 'Loading...',
    ready: 'Ready',
    updating: 'Updating...',
    restarting: 'Restarting...',
    shutting_down: 'Shutting down...',
    offline: 'Offline mode',
    online: 'Online mode',
    syncing: 'Syncing...',
    maintenance: 'Maintenance in progress',
  },

  // System notifications
  notifications: {
    welcome: 'Welcome to Naya!',
    newUpdate: 'A new update is available',
    updateInstalled: 'Update installed successfully',
    backupCompleted: 'Backup completed',
    backupFailed: 'Backup failed',
    settingsSaved: 'Settings saved',
    settingsRestored: 'Settings restored',
    cacheCleared: 'Cache cleared',
    dataExported: 'Data exported',
    dataImported: 'Data imported',
    profileUpdated: 'Profile updated',
    passwordChanged: 'Password changed',
    emailVerified: 'Email verified',
    phoneVerified: 'Phone verified',
    subscriptionActivated: 'Subscription activated',
    subscriptionExpired: 'Subscription expired',
    paymentSuccessful: 'Payment successful',
    paymentFailed: 'Payment failed',
    trialExpired: 'Trial period expired',
    licenseExpired: 'License expired',
    lowStorage: 'Low storage space',
    highMemoryUsage: 'High memory usage',
    connectionLost: 'Connection lost',
    connectionRestored: 'Connection restored',
    syncConflict: 'Sync conflict',
    securityAlert: 'Security alert',
    newDevice: 'New device detected',
    suspiciousActivity: 'Suspicious activity detected',
    maintenanceScheduled: 'Maintenance scheduled',
    featureDeprecated: 'Feature deprecated',
    experimentalFeature: 'Experimental feature',
  },

  // Notification types
  notificationTypes: {
    info: 'Information',
    success: 'Success',
    warning: 'Warning',
    error: 'Error',
    critical: 'Critical',
    update: 'Update',
    security: 'Security',
    system: 'System',
    user: 'User',
    payment: 'Payment',
    sync: 'Sync',
    backup: 'Backup',
    maintenance: 'Maintenance',
  },

  // Permissions
  permissions: {
    camera: 'Camera',
    microphone: 'Microphone',
    storage: 'Storage',
    location: 'Location',
    contacts: 'Contacts',
    calendar: 'Calendar',
    photos: 'Photos',
    notifications: 'Notifications',
    bluetooth: 'Bluetooth',
    wifi: 'Wi-Fi',
    cellular: 'Cellular Data',
    biometric: 'Biometric',
    background: 'Background',
    system_settings: 'System Settings',
    
    // Request messages
    requestCamera: 'This app needs access to your camera',
    requestMicrophone: 'This app needs access to your microphone',
    requestStorage: 'This app needs access to storage',
    requestLocation: 'This app needs access to your location',
    requestNotifications: 'This app would like to send you notifications',
    
    // Permission states
    granted: 'Granted',
    denied: 'Denied',
    restricted: 'Restricted',
    undetermined: 'Undetermined',
    provisional: 'Provisional',
  },

  // Diagnostics
  diagnostics: {
    systemInfo: 'System Information',
    appVersion: 'App Version',
    buildNumber: 'Build Number',
    platform: 'Platform',
    osVersion: 'OS Version',
    deviceModel: 'Device Model',
    screenResolution: 'Screen Resolution',
    availableMemory: 'Available Memory',
    usedStorage: 'Used Storage',
    batteryLevel: 'Battery Level',
    networkType: 'Network Type',
    connectionSpeed: 'Connection Speed',
    lastSync: 'Last Sync',
    crashReports: 'Crash Reports',
    performanceMetrics: 'Performance Metrics',
    debugLogs: 'Debug Logs',
    errorLogs: 'Error Logs',
    analytics: 'Analytics',
    telemetry: 'Telemetry',
  },

  // Performance
  performance: {
    excellent: 'Excellent',
    good: 'Good',
    average: 'Average',
    poor: 'Poor',
    critical: 'Critical',
    
    metrics: {
      fps: 'Frames per second',
      cpu: 'CPU Usage',
      memory: 'Memory Usage',
      battery: 'Battery Usage',
      network: 'Network Usage',
      storage: 'Storage Usage',
      latency: 'Latency',
      throughput: 'Throughput',
      responsiveness: 'Responsiveness',
      stability: 'Stability',
    },
  },

  // Security
  security: {
    encrypted: 'Encrypted',
    decrypted: 'Decrypted',
    authenticated: 'Authenticated',
    authorized: 'Authorized',
    verified: 'Verified',
    secured: 'Secured',
    compromised: 'Compromised',
    vulnerable: 'Vulnerable',
    
    events: {
      loginSuccess: 'Login successful',
      loginFailed: 'Login failed',
      logoutSuccess: 'Logout successful',
      passwordChanged: 'Password changed',
      accountLocked: 'Account locked',
      accountUnlocked: 'Account unlocked',
      suspiciousLogin: 'Suspicious login',
      newDeviceLogin: 'Login from new device',
      twoFactorEnabled: 'Two-factor authentication enabled',
      twoFactorDisabled: 'Two-factor authentication disabled',
      dataExport: 'Data export',
      dataImport: 'Data import',
      permissionGranted: 'Permission granted',
      permissionRevoked: 'Permission revoked',
    },
  },

  // Connectivity states
  connectivity: {
    wifi: 'Wi-Fi',
    cellular: 'Cellular',
    ethernet: 'Ethernet',
    bluetooth: 'Bluetooth',
    offline: 'Offline',
    poor: 'Poor',
    good: 'Good',
    excellent: 'Excellent',
    
    status: {
      connected: 'Connected',
      connecting: 'Connecting...',
      disconnected: 'Disconnected',
      reconnecting: 'Reconnecting...',
      failed: 'Failed',
      timeout: 'Timeout',
      unstable: 'Unstable',
      limited: 'Limited',
    },
  },

  // Maintenance and updates
  maintenance: {
    scheduledMaintenance: 'Scheduled maintenance',
    emergencyMaintenance: 'Emergency maintenance',
    systemUpdate: 'System update',
    securityUpdate: 'Security update',
    featureUpdate: 'Feature update',
    bugFix: 'Bug fix',
    performanceImprovement: 'Performance improvement',
    
    updateAvailable: 'Update available',
    updateRequired: 'Update required',
    updateOptional: 'Optional update',
    updateDownloading: 'Downloading update...',
    updateInstalling: 'Installing update...',
    updateComplete: 'Update complete',
    updateFailed: 'Update failed',
    restartRequired: 'Restart required',
  },
} as const;