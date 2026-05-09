import { logger } from "../core/observability/logger";
import { useAppStore } from "../store/useAppStore";
import { eventBus } from "../core/events/EventBus";

/**
 * Worker Manager
 * Orchestrates the real background Web Worker to fetch new activities.
 */
class BackgroundWorkerManager {
  private worker: Worker | null = null;
  private isRunning = false;

  public start() {
    if (this.isRunning) return;
    
    // Check if window is defined to prevent SSR crashes
    if (typeof window === "undefined") return;

    logger.info("WorkerManager", "Initializing background Web Worker...");

    try {
      this.worker = new Worker(new URL("./sync.worker.ts", import.meta.url), { type: "module" });
      
      this.worker.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === "SYNC_COMPLETE") {
          this.handleSyncComplete();
        }
      };

      this.worker.onerror = (error) => {
        logger.error("WorkerManager", "Web Worker encountered an error", error);
      };

      this.worker.postMessage({ type: "START" });
      this.isRunning = true;
      
      eventBus.on("network:intercepted", this.handleNetworkIntercepted);
    } catch (e) {
      logger.error("WorkerManager", "Failed to start Web Worker", e);
    }
  }

  public stop() {
    if (this.worker) {
      this.worker.postMessage({ type: "STOP" });
      this.worker.terminate();
      this.worker = null;
      this.isRunning = false;
      eventBus.off("network:intercepted", this.handleNetworkIntercepted);
      logger.info("WorkerManager", "Terminated background Web Worker.");
    }
  }

  private handleSyncComplete() {
    // Reload friends list to update "Last active" status in UI
    const store = useAppStore.getState();
    if (store.isDataLoaded) {
      store.loadInitialData(); 
    }
  }

  private handleNetworkIntercepted = (data: any) => {
    if (this.worker && this.isRunning) {
      this.worker.postMessage({ type: "PROCESS_PAYLOAD", payload: data });
    }
  };
}

export const backgroundService = new BackgroundWorkerManager();
