/**
 * Strongly Typed Event Bus
 * Acts as the central nervous system of the platform, decoupling modules.
 */

import mitt, { Emitter } from "mitt";
import { logger } from "../observability/logger";

// Define all system events and their payload types here
export type SystemEvents = {
  // Network & Interception
  "network:request_intercepted": { url: string; method: string; timestamp: number };
  "network:intercepted": any; // InterceptedPayload
  "network:graphql_detected": { operationName: string; confidence: number };
  
  // Parsers & Data
  "parser:drift_detected": { schemaName: string; errors: any };
  "parser:success": { schemaName: string; durationMs: number };
  
  // Cache & Storage
  "cache:miss": { key: string; context: string };
  "cache:hit": { key: string; context: string };
  "cache:compacted": { itemsRemoved: number };

  // UI & Lifecycle
  "ui:timeline_rendered": { itemCount: number; renderTimeMs: number };
  "system:idle": void;
};

class TypedEventBus {
  private emitter: Emitter<SystemEvents>;
  private history: Array<{ event: keyof SystemEvents; payload: any; timestamp: number }> = [];
  private readonly MAX_HISTORY = 500; // For the Developer Panel Time Travel / Replay

  constructor() {
    this.emitter = mitt<SystemEvents>();
  }

  /**
   * Emit an event with type safety and automatic tracing
   */
  public emit<Key extends keyof SystemEvents>(type: Key, payload: SystemEvents[Key]) {
    const timestamp = Date.now();
    
    // 1. Tracing Hook
    this.history.push({ event: type, payload, timestamp });
    if (this.history.length > this.MAX_HISTORY) {
      this.history.shift();
    }

    // 2. Logging integration
    logger.debug("EventBus", `[Emitted] ${String(type)}`, payload);

    // 3. Emit
    this.emitter.emit(type, payload);
  }

  /**
   * Subscribe to an event
   */
  public on<Key extends keyof SystemEvents>(type: Key, handler: (payload: SystemEvents[Key]) => void) {
    this.emitter.on(type, handler);
  }

  /**
   * Unsubscribe from an event
   */
  public off<Key extends keyof SystemEvents>(type: Key, handler: (payload: SystemEvents[Key]) => void) {
    this.emitter.off(type, handler);
  }

  /**
   * Expose history for the Developer Panel / Debugging
   */
  public getHistory() {
    return [...this.history];
  }
}

export const eventBus = new TypedEventBus();
