/**
 * Background Orchestration Engine
 * Manages task queues, adaptive polling, and idle-time processing.
 * Runs in the Chrome Extension Service Worker (Background Script).
 */

import { logger } from "../core/observability/logger";
import { eventBus } from "../core/events/EventBus";
import { db } from "../lib/db";

type TaskPriority = "high" | "normal" | "low" | "idle";

interface BackgroundTask {
  id: string;
  type: string;
  priority: TaskPriority;
  payload: any;
  retryCount: number;
}

export class BackgroundOrchestrator {
  private queue: BackgroundTask[] = [];
  private isProcessing = false;
  private readonly MAX_RETRIES = 3;

  constructor() {
    this.setupListeners();
    this.startPeriodicSync();
  }

  private setupListeners() {
    // Listen for manual sync requests from UI
    eventBus.on("system:idle", () => {
      this.processIdleTasks();
    });
  }

  public scheduleTask(type: string, payload: any, priority: TaskPriority = "normal") {
    this.queue.push({
      id: `${type}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type,
      priority,
      payload,
      retryCount: 0
    });
    
    // Sort queue by priority: high > normal > low > idle
    const priorityWeights = { high: 3, normal: 2, low: 1, idle: 0 };
    this.queue.sort((a, b) => priorityWeights[b.priority] - priorityWeights[a.priority]);

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const task = this.queue[0];
      if (task.priority === "idle") break; // Don't process idle tasks here
      
      try {
        await this.executeTask(task);
        this.queue.shift(); // Remove on success
      } catch (error) {
        logger.error("BackgroundEngine", `Task ${task.id} failed`, error);
        
        task.retryCount++;
        if (task.retryCount >= this.MAX_RETRIES) {
          logger.warn("BackgroundEngine", `Task ${task.id} dropped after max retries.`);
          this.queue.shift(); // Drop it
        } else {
          // Move to back of normal priority
          this.queue.push(this.queue.shift()!); 
          // Adaptive sleep before next retry
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, task.retryCount) * 1000));
        }
      }
    }

    this.isProcessing = false;
  }

  private async processIdleTasks() {
    const idleTasks = this.queue.filter(t => t.priority === "idle");
    for (const task of idleTasks) {
      try {
        await this.executeTask(task);
        // Remove from original queue
        const idx = this.queue.findIndex(t => t.id === task.id);
        if (idx !== -1) this.queue.splice(idx, 1);
      } catch (e) {
        // Idle tasks fail silently usually
      }
    }
  }

  private async executeTask(task: BackgroundTask) {
    logger.debug("BackgroundEngine", `Executing Task: ${task.type}`);
    
    switch (task.type) {
      case "SYNC_USER_FOLLOWING":
        // Simulated network request
        await new Promise(r => setTimeout(r, 1000));
        break;
      case "COMPACT_DATABASE":
        await db.compactDatabase();
        eventBus.emit("cache:compacted", { itemsRemoved: 1 }); // Mock count
        break;
      default:
        throw new Error("Unknown task type");
    }
  }

  private startPeriodicSync() {
    // Run DB compaction during idle time every hour
    setInterval(() => {
      this.scheduleTask("COMPACT_DATABASE", {}, "idle");
    }, 1000 * 60 * 60);

    // Simulate idle detector
    setInterval(() => {
      eventBus.emit("system:idle", undefined);
    }, 1000 * 60 * 5); // Fire idle event every 5 mins for now
  }
}

export const orchestrator = new BackgroundOrchestrator();
