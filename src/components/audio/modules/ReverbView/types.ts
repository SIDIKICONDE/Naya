/**
 * Types et interfaces pour le module de réverbération
 */

export type ReverbType = 'ROOM' | 'HALL' | 'PLATE' | 'SPRING' | 'CHAMBER';

export interface ReverbViewProps {
  moduleId: string;
}

export interface ReverbTypeConfig {
  type: ReverbType;
  name: string;
  icon: string;
  params: ReverbParameters;
}

export interface ReverbParameters {
  roomSize: number;
  damping: number;
  wetLevel: number;
  preDelay: number;
  width: number;
}

export interface ReverbPreset extends ReverbParameters {
  name: string;
  type: ReverbType;
}

export interface SpatialVisualizationProps {
  roomSize: number;
  damping: number;
  wetLevel: number;
  width: number;
}