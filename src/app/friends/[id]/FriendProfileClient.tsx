"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ProfileHeader } from "@/components/friends/ProfileHeader";
import { TimelineCard } from "@/components/friends/TimelineCard";
import { Filter } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/Skeleton";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useAppStore } from "@/store/useAppStore";
import { Friend, Activity } from "@/lib/db";

export function FriendProfileClient({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "like" | "repost" | "watch">("all");
  
  const friends = useAppStore((state) => state.friends);
  const loadActivitiesForFriend = useAppStore((state) => state.loadActivitiesForFriend);
  
  const [friend, setFriend] = useState<Friend | null>(null);
  const [timeline, setTimeline] = useState<Activity[]>([]);
  const [vector, setVector] = useState<any>(null);
  
  // The scrollable element for the virtualizer
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      const foundFriend = friends.find(f => f.id === id);
      if (foundFriend) {
        setFriend(foundFriend);
        const acts = await loadActivitiesForFriend(id);
        setTimeline(acts);
        
        // Dynamically load IntelligenceEngine to avoid SSR issues
        import("@/modules/intelligence/IntelligenceEngine").then(async ({ intelligenceEngine }) => {
          const v = await intelligenceEngine.generateVector(id);
          setVector(v);
        });
      }
      setLoading(false);
    }
    
    if (friends.length > 0) {
      loadData();
    }
  }, [id, friends, loadActivitiesForFriend]);

  const filteredTimeline = filter === "all" 
    ? timeline 
    : timeline.filter(t => t.type === filter);

  // Pre-calculate binge sessions
  const bingeFlags = useMemo(() => {
    const flags = new Array(filteredTimeline.length).fill(false);
    for (let i = 0; i < filteredTimeline.length - 2; i++) {
      const t1 = filteredTimeline[i].timestamp;
      const t3 = filteredTimeline[i + 2].timestamp;
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
    estimateSize: () => 180, // estimated height of TimelineCard
    overscan: 5,
  });

  if (loading || !friend) {
    return (
      <div className="space-y-8 pb-10">
        {/* Skeleton Header */}
        <div className="relative mb-8">
          <Skeleton className="h-48 rounded-2xl w-full" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              <Skeleton className="w-32 h-32 rounded-full" />
              <div className="flex-1 text-center md:text-left mb-2">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex gap-4 mb-2">
                <Skeleton className="h-16 w-24 rounded-xl" />
                <Skeleton className="h-16 w-24 rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton Timeline */}
        <div className="max-w-3xl mx-auto px-4">
          <Skeleton className="h-8 w-32 mb-6" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-8 pl-8 relative">
              <div className="absolute left-3 top-2 bottom-0 w-px bg-white/10" />
              <Skeleton className="absolute left-0 top-1 w-6 h-6 rounded-full" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={parentRef} 
      className="h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar scroll-smooth relative"
      style={{
        scrollBehavior: "smooth",
        WebkitOverflowScrolling: "touch"
      }}
    >
      <div className="pb-10 min-h-full max-w-7xl mx-auto">
        <ProfileHeader 
          name={friend.fullName}
          username={friend.username}
          avatar={friend.profilePicUrl}
          stats={{
            totalLikes: timeline.filter(t => t.type === 'like').length,
            totalReposts: timeline.filter(t => t.type === 'repost').length,
            totalWatches: timeline.filter(t => t.type === 'watch').length,
          }}
        />

        {/* AI Intelligence Layer */}
        {vector && (
          <div className="max-w-3xl mx-auto px-4 mt-8">
            <div className="glass-card p-6 border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.05)]">
              <h3 className="text-sm font-bold text-purple-400 mb-4 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </span>
                Behavioral Intelligence
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/40 rounded-lg p-4 border border-white/5">
                  <p className="text-xs text-gray-500 mb-1">Engagement Score</p>
                  <p className="text-2xl font-black text-white">{vector.engagementScore}<span className="text-sm text-gray-500 font-normal">/100</span></p>
                </div>
                <div className="bg-black/40 rounded-lg p-4 border border-white/5">
                  <p className="text-xs text-gray-500 mb-1">Binge Sessions</p>
                  <p className="text-2xl font-black text-[#e1306c]">{vector.bingeSessionCount}</p>
                </div>
                <div className="col-span-2 bg-black/40 rounded-lg p-4 border border-white/5">
                  <p className="text-xs text-gray-500 mb-2">Top Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {vector.topInterests.length > 0 ? vector.topInterests.map((interest: string) => (
                      <span key={interest} className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300">
                        {interest}
                      </span>
                    )) : <span className="text-xs text-gray-600">Gathering data...</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 mt-8">
          <div className="flex items-center justify-between mb-8 sticky top-0 z-20 bg-black/80 backdrop-blur-md py-4 border-b border-white/5">
            <h2 className="text-2xl font-bold text-white">Activity Timeline</h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="bg-black/40 border border-[var(--glass-border)] rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#e1306c] appearance-none cursor-pointer hover:bg-white/5 transition-colors"
              >
                <option value="all">All Activities ({timeline.length})</option>
                <option value="like">Likes Only</option>
                <option value="repost">Reposts Only</option>
                <option value="watch">Watches Only</option>
              </select>
            </div>
          </div>

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
              
              // Grouping logic (Session reconstruction): 
              // If the time difference between this item and the previous is > 2 hours, it's a new session.
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
                    <div className="sticky top-20 z-10 w-fit backdrop-blur-md bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-mono text-gray-400 mb-6 mt-4 shadow-xl">
                      {itemDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                  )}
                  <TimelineCard 
                    {...item}
                    timestamp={itemDate}
                    delay={0}
                    isFirstInSession={isFirstInSession}
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
                <p className="text-gray-400">No activity found for this filter.</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
