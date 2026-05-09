"use client";

import { useState, useEffect } from "react";
import { eventBus, SystemEvents } from "../../core/events/EventBus";
import { featureFlags } from "../../core/observability/featureFlags";
import { ShieldAlert, Activity, Database, Terminal, ArrowLeft } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";

export default function DeveloperPanel() {
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"events" | "network" | "cache" | "storage">("events");
  const [storageStats, setStorageStats] = useState({ friends: 0, activities: 0 });
  const [parserHealth, setParserHealth] = useState({ success: 0, errors: 0 });

  useEffect(() => {
    // Initial history load
    setHistory(eventBus.getHistory());

    const updateHistory = () => {
      const newHistory = eventBus.getHistory();
      setHistory(newHistory);
      
      const success = newHistory.filter(h => h.event === "parser:success").length;
      const errors = newHistory.filter(h => h.event === "parser:drift_detected").length;
      setParserHealth({ success, errors });
    };

    // We can't import db directly at the top if it breaks SSR, but we're in use client.
    // Let's import it dynamically to be safe or rely on standard import.
    import("../../lib/db").then(({ db }) => {
      Promise.all([
        db.friends.count(),
        db.activities.count()
      ]).then(([friends, activities]) => setStorageStats({ friends, activities }));
    });

    // Subscribe to all events to update the UI
    eventBus.on("network:request_intercepted", updateHistory);
    eventBus.on("network:intercepted", updateHistory);
    eventBus.on("parser:drift_detected", updateHistory);
    eventBus.on("cache:hit", updateHistory);

    return () => {
      eventBus.off("network:request_intercepted", updateHistory);
      eventBus.off("network:intercepted", updateHistory);
      eventBus.off("parser:drift_detected", updateHistory);
      eventBus.off("cache:hit", updateHistory);
    };
  }, []);

  if (!featureFlags.isEnabled("debugMode")) {
    return (
      <div className="flex items-center justify-center h-full">
        <GlassCard className="text-center p-8">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400">Debug mode is not enabled.</p>
        </GlassCard>
      </div>
    );
  }

  const networkEvents = history.filter(e => e.event.startsWith("network"));
  const cacheEvents = history.filter(e => e.event.startsWith("cache"));

  return (
    <div className="h-[calc(100vh-80px)] overflow-hidden flex flex-col -mx-4 -my-4 sm:-mx-6 sm:-my-6 lg:-mx-8 lg:-my-8 bg-[#0a0a0a]">
      {/* Dev Header */}
      <div className="bg-black border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Terminal className="w-6 h-6 text-blue-500" />
          <div>
            <h1 className="font-bold font-mono">System Observability</h1>
            <p className="text-xs text-gray-500 font-mono">Internal Developer Tools</p>
          </div>
        </div>
        
        <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab("events")}
            className={`px-4 py-1.5 text-sm font-mono rounded-md transition-colors ${activeTab === "events" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}
          >
            All Events ({history.length})
          </button>
          <button 
            onClick={() => setActiveTab("network")}
            className={`px-4 py-1.5 text-sm font-mono rounded-md transition-colors flex items-center gap-2 ${activeTab === "network" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}
          >
            <Activity className="w-4 h-4" /> Network ({networkEvents.length})
          </button>
          <button 
            onClick={() => setActiveTab("cache")}
            className={`px-4 py-1.5 text-sm font-mono rounded-md transition-colors flex items-center gap-2 ${activeTab === "cache" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}
          >
            <Database className="w-4 h-4" /> Cache ({cacheEvents.length})
          </button>
          <button 
            onClick={() => setActiveTab("storage")}
            className={`px-4 py-1.5 text-sm font-mono rounded-md transition-colors flex items-center gap-2 ${activeTab === "storage" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}
          >
            <Database className="w-4 h-4 text-green-500" /> Dexie Storage
          </button>
        </div>
      </div>

      {/* Dev Content */}
      <div className="flex-1 overflow-y-auto p-6 font-mono text-sm">
        {activeTab === "storage" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <GlassCard className="p-6 flex flex-col items-center justify-center h-48 border-green-500/20">
              <Database className="w-10 h-10 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-white">Friends Synced</h3>
              <p className="text-4xl font-black text-green-400 mt-2">{storageStats.friends}</p>
            </GlassCard>
            
            <GlassCard className="p-6 flex flex-col items-center justify-center h-48 border-blue-500/20">
              <Activity className="w-10 h-10 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-white">Activities Cached</h3>
              <p className="text-4xl font-black text-blue-400 mt-2">{storageStats.activities}</p>
            </GlassCard>
            
            <div className="md:col-span-2">
               <GlassCard className="p-6 border-purple-500/20">
                 <h3 className="text-lg font-bold text-white mb-4">Parsers Health</h3>
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-gray-400">Successful Parses</p>
                     <p className="text-2xl font-bold text-green-400">{parserHealth.success}</p>
                   </div>
                   <div>
                     <p className="text-gray-400">Schema Drifts / Errors</p>
                     <p className="text-2xl font-bold text-red-400">{parserHealth.errors}</p>
                   </div>
                   <div>
                     <p className="text-gray-400">Success Rate</p>
                     <p className="text-2xl font-bold text-purple-400">
                       {parserHealth.success + parserHealth.errors > 0 
                         ? Math.round((parserHealth.success / (parserHealth.success + parserHealth.errors)) * 100) 
                         : 100}%
                     </p>
                   </div>
                 </div>
               </GlassCard>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {(activeTab === "events" ? history : activeTab === "network" ? networkEvents : cacheEvents).slice().reverse().map((entry, idx) => (
              <div key={idx} className="flex gap-4 p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-colors group">
                <div className="text-gray-500 shrink-0 w-24">
                  {new Date(entry.timestamp).toLocaleTimeString(undefined, {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    fractionalSecondDigits: 3
                  })}
                </div>
                
                <div className="shrink-0 w-48">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    entry.event.startsWith("error") || entry.event.includes("drift") ? "bg-red-500/20 text-red-400" :
                    entry.event.startsWith("network") ? "bg-blue-500/20 text-blue-400" :
                    entry.event.startsWith("cache") ? "bg-purple-500/20 text-purple-400" :
                    "bg-green-500/20 text-green-400"
                  }`}>
                    {entry.event}
                  </span>
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <pre className="text-gray-300 overflow-x-auto custom-scrollbar pb-2">
                    {JSON.stringify(entry.payload, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                No telemetry data yet. Interact with the app to generate events.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
