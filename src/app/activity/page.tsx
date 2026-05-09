"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { TimelineCard } from "@/components/friends/TimelineCard";
import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "@/lib/db";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Filter } from "lucide-react";

export default function GlobalActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "like" | "repost" | "watch">("all");
  
  const getGlobalActivities = useAppStore(state => state.getGlobalActivities);
  const isDataLoaded = useAppStore(state => state.isDataLoaded);

  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const data = await getGlobalActivities(500); // Load latest 500
      setActivities(data);
      setLoading(false);
    }

    if (isDataLoaded) {
      load();
    }
  }, [getGlobalActivities, isDataLoaded]);

  const filteredTimeline = filter === "all" 
    ? activities 
    : activities.filter(t => t.type === filter);

  // Pre-calculate binge sessions (>= 3 activities within 10 minutes)
  const bingeFlags = useMemo(() => {
    const flags = new Array(filteredTimeline.length).fill(false);
    for (let i = 0; i < filteredTimeline.length - 2; i++) {
      const t1 = filteredTimeline[i].timestamp;
      const t3 = filteredTimeline[i + 2].timestamp;
      // If 3 consecutive activities happened within 10 minutes (600000 ms)
      if (Math.abs(t1 - t3) <= 600000) {
        flags[i] = true;
        flags[i + 1] = true;
        flags[i + 2] = true;
      }
    }
    return flags;
  }, [filteredTimeline]);

  const rowVirtualizer = useVirtualizer({
    count: filteredTimeline.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180,
    overscan: 5,
  });

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Global Activity Feed</h1>
          <p className="text-gray-400">A unified timeline of all your friends' interactions.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-black/40 border border-[var(--glass-border)] rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#e1306c] appearance-none cursor-pointer hover:bg-white/5 transition-colors"
          >
            <option value="all">All Activities ({activities.length})</option>
            <option value="like">Likes Only</option>
            <option value="repost">Reposts Only</option>
            <option value="watch">Watches Only</option>
          </select>
        </div>
      </div>

      <div 
        ref={parentRef} 
        className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth relative bg-black/20 rounded-2xl border border-[var(--glass-border)] p-6"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-t-[#e1306c] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div 
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = filteredTimeline[virtualRow.index];
              const prevItem = virtualRow.index > 0 ? filteredTimeline[virtualRow.index - 1] : null;
              const isBingeSession = bingeFlags[virtualRow.index];
              
              let isFirstInSession = false;
              let showDateHeader = false;
              
              if (!prevItem) {
                isFirstInSession = true;
                showDateHeader = true;
              } else {
                const diffHours = (prevItem.timestamp - item.timestamp) / (1000 * 60 * 60);
                if (diffHours > 2) isFirstInSession = true;
                if (new Date(prevItem.timestamp).toDateString() !== new Date(item.timestamp).toDateString()) {
                  showDateHeader = true;
                  isFirstInSession = true;
                }
              }

              const itemDate = new Date(item.timestamp);

              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {showDateHeader && (
                    <div className="sticky top-0 z-10 w-fit backdrop-blur-md bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-mono text-gray-400 mb-6 shadow-xl">
                      {itemDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                  )}
                  <TimelineCard 
                    {...item}
                    timestamp={itemDate}
                    delay={0}
                    isFirstInSession={isFirstInSession}
                    isBingeSession={isBingeSession}
                  />
                </div>
              );
            })}

            {filteredTimeline.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 glass-card mt-8"
              >
                <p className="text-gray-400">No activity found.</p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
