/**
 * Émetteur d'événements simple pour le système i18n
 * Permet la communication entre les différents composants du système
 */

/**
 * Type pour les fonctions d'écoute d'événements
 */
type EventListener = (data?: any) => void;

/**
 * Émetteur d'événements personnalisé
 */
export class EventEmitter {
  private events: Map<string, EventListener[]> = new Map();

  /**
   * Ajoute un écouteur pour un événement
   */
  public on(event: string, listener: EventListener): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    this.events.get(event)!.push(listener);
  }

  /**
   * Supprime un écouteur pour un événement
   */
  public off(event: string, listener: EventListener): void {
    const listeners = this.events.get(event);
    
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
      
      // Supprime l'entrée si plus d'écouteurs
      if (listeners.length === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * Ajoute un écouteur qui ne sera appelé qu'une seule fois
   */
  public once(event: string, listener: EventListener): void {
    const onceListener = (data?: any) => {
      this.off(event, onceListener);
      listener(data);
    };
    
    this.on(event, onceListener);
  }

  /**
   * Émet un événement avec des données optionnelles
   */
  public emit(event: string, data?: any): void {
    const listeners = this.events.get(event);
    
    if (listeners) {
      // Copie du tableau pour éviter les problèmes de concurrence
      const listenersCopy = [...listeners];
      
      listenersCopy.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`[EventEmitter] Error in listener for event '${event}':`, error);
        }
      });
    }
  }

  /**
   * Supprime tous les écouteurs pour un événement
   */
  public removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  /**
   * Récupère le nombre d'écouteurs pour un événement
   */
  public listenerCount(event: string): number {
    const listeners = this.events.get(event);
    return listeners ? listeners.length : 0;
  }

  /**
   * Récupère la liste des événements ayant des écouteurs
   */
  public eventNames(): string[] {
    return Array.from(this.events.keys());
  }

  /**
   * Récupère les écouteurs pour un événement donné
   */
  public listeners(event: string): EventListener[] {
    const listeners = this.events.get(event);
    return listeners ? [...listeners] : [];
  }
}