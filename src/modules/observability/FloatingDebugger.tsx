"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bug, Activity, ShieldAlert, Cpu } from "lucide-react";
import { featureFlags } from "../../core/observability/featureFlags";
import { eventBus, SystemEvents } from "../../core/events/EventBus";

export function FloatingDebugger() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({
    requests: 0,
    parserErrors: 0,
    cacheHits: 0,
  });

  useEffect(() => {
    if (!featureFlags.isEnabled("debugMode")) return;

    const handleReq = () => setStats(s => ({ ...s, requests: s.requests + 1 }));
    const handleErr = () => setStats(s => ({ ...s, parserErrors: s.parserErrors + 1 }));
    const handleCache = () => setStats(s => ({ ...s, cacheHits: s.cacheHits + 1 }));

    eventBus.on("network:request_intercepted", handleReq);
    eventBus.on("parser:drift_detected", handleErr);
    eventBus.on("cache:hit", handleCache);

    return () => {
      eventBus.off("network:request_intercepted", handleReq);
      eventBus.off("parser:drift_detected", handleErr);
      eventBus.off("cache:hit", handleCache);
    };
  }, []);

  if (!featureFlags.isEnabled("debugMode")) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 bg-black/90 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl w-64"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <h3 className="text-xs font-mono text-gray-400">System Telemetry</h3>
              <a href="/dev" className="text-xs text-blue-400 hover:text-blue-300">Open Full Panel</a>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-300">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span className="text-xs">Requests</span>
                </div>
                <span className="text-xs font-mono">{stats.requests}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-300">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span className="text-xs">Parser Alerts</span>
                </div>
                <span className="text-xs font-mono text-amber-400">{stats.parserErrors}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-300">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span className="text-xs">Cache Hits</span>
                </div>
                <span className="text-xs font-mono">{stats.cacheHits}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-full shadow-xl transition-colors ${
          stats.parserErrors > 0 ? "bg-amber-500 hover:bg-amber-400" : "bg-blue-600 hover:bg-blue-500"
        }`}
      >
        <Bug className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}
