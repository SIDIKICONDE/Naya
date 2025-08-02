/**
 * @deprecated - Utilisez la version refactorisée dans ./CompressorView/
 * Cette version est conservée pour compatibilité temporaire
 */

import React from 'react';

// Re-export de la nouvelle version refactorisée
export { CompressorView } from './CompressorView/';

// Types pour compatibilité
export interface CompressorViewProps {
  moduleId: string;
}