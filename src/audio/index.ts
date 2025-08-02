/**
 * Point d'entrée principal pour le système audio
 */

// Export principal
export { audioInterface } from './AudioInterface';

// Export des types
export * from './types';

// Export des énumérations
export * from './enums';

// Export des utilitaires si nécessaire
export { getModuleParameters } from './moduleParameters';

// Note: AudioModuleWrapper n'est pas exporté car c'est une classe interne