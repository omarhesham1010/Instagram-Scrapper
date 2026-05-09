/**
 * Plugin Architecture Manager
 * Allows internal modules (Analytics, AI, Exporters) to register themselves
 * and hook into the event bus dynamically.
 */

import { eventBus } from "../events/EventBus";
import { logger } from "../observability/logger";

export interface IgPlugin {
  name: string;
  version: string;
  initialize: () => void | Promise<void>;
  cleanup?: () => void;
}

class PluginManager {
  private plugins: Map<string, IgPlugin> = new Map();

  public async register(plugin: IgPlugin) {
    if (this.plugins.has(plugin.name)) {
      logger.warn("PluginManager", `Plugin ${plugin.name} is already registered.`);
      return;
    }

    try {
      await plugin.initialize();
      this.plugins.set(plugin.name, plugin);
      logger.info("PluginManager", `Successfully loaded plugin: ${plugin.name} v${plugin.version}`);
    } catch (e) {
      logger.error("PluginManager", `Failed to load plugin: ${plugin.name}`, e);
    }
  }

  public getPlugin(name: string): IgPlugin | undefined {
    return this.plugins.get(name);
  }

  public async shutdownAll() {
    for (const [name, plugin] of this.plugins.entries()) {
      try {
        if (plugin.cleanup) {
          await plugin.cleanup();
        }
        logger.info("PluginManager", `Cleaned up plugin: ${name}`);
      } catch (e) {
        logger.error("PluginManager", `Failed to cleanup plugin: ${name}`, e);
      }
    }
    this.plugins.clear();
  }
}

export const pluginManager = new PluginManager();

// Example of an Internal Plugin:
export const AnomalyDetectionPlugin: IgPlugin = {
  name: "AnomalyDetection",
  version: "1.0.0",
  initialize: () => {
    // Listen to cache hits to analyze data streams
    eventBus.on("cache:hit", (payload) => {
      // Analyze data for anomalies in the background
      // logger.debug("AnomalyDetectionPlugin", "Analyzing payload", payload);
    });
  }
};
