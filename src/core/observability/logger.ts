/**
 * Advanced Logging System for Debugging and Request Recording
 */

import { featureFlags } from "./featureFlags";
import { sanitizer } from "../security/sanitizer";

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  context: string;
  message: string;
  data?: any;
}

class Logger {
  private level: LogLevel = LogLevel.INFO;
  private history: LogEntry[] = [];
  private readonly MAX_HISTORY = 1000;

  constructor() {
    if (featureFlags.isEnabled("debugMode")) {
      this.level = LogLevel.DEBUG;
    }
  }

  private log(level: LogLevel, context: string, message: string, data?: any) {
    if (level < this.level) return;

    // Secure the log entry
    const safeData = sanitizer.sanitize(data);

    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      context,
      message,
      data: safeData,
    };

    this.history.push(entry);
    if (this.history.length > this.MAX_HISTORY) {
      this.history.shift();
    }

    if (featureFlags.isEnabled("debugMode")) {
      const styles = this.getStyles(level);
      console.log(`%c[${entry.timestamp}] [${LogLevel[level]}] [${context}] ${message}`, styles, safeData ? safeData : "");
    }
  }

  private getStyles(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return "color: #888;";
      case LogLevel.INFO: return "color: #4CAF50;";
      case LogLevel.WARN: return "color: #FFC107;";
      case LogLevel.ERROR: return "color: #F44336; font-weight: bold;";
      case LogLevel.FATAL: return "color: white; background-color: #F44336; font-weight: bold; padding: 2px 4px;";
      default: return "";
    }
  }

  public debug(context: string, message: string, data?: any) { this.log(LogLevel.DEBUG, context, message, data); }
  public info(context: string, message: string, data?: any) { this.log(LogLevel.INFO, context, message, data); }
  public warn(context: string, message: string, data?: any) { this.log(LogLevel.WARN, context, message, data); }
  public error(context: string, message: string, data?: any) { this.log(LogLevel.ERROR, context, message, data); }
  public fatal(context: string, message: string, data?: any) { this.log(LogLevel.FATAL, context, message, data); }

  // Feature: Request Recording Mode
  public recordRequest(endpoint: string, payload: any, response: any) {
    if (featureFlags.isEnabled("recordRequests")) {
      // Could also push to Dexie or IndexedDB for export later
      this.debug("RequestRecorder", `Intercepted: ${endpoint}`, { payload, response });
    }
  }

  public exportLogs() {
    return JSON.stringify(this.history, null, 2);
  }
}

export const logger = new Logger();
