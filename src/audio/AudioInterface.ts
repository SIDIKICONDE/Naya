/**
 * Interface Audio Professionnelle - Version refactorisée
 * Point d'entrée principal pour le système audio modulaire
 */

// Re-export de la nouvelle architecture modulaire
export { audioInterface, AudioInterface } from './AudioInterface.refactored';

// Re-export des types
export * from './types';

// Re-export des énumérations
export * from './enums';

// Re-export des utilitaires
export { getModuleParameters } from './moduleParameters';