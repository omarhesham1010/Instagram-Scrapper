"use client";

import { useState, useEffect } from "react";
import { ProfileHeader } from "@/components/friends/ProfileHeader";
import { TimelineCard } from "@/components/friends/TimelineCard";
import { Filter } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/Skeleton";

// Temporary Mock Data for specific friend
const MOCK_PROFILE = {
  name: "Ahmed Youssef",
  username: "ahmed.y",
  avatar: "https://i.pravatar.cc/150?u=ahmed",
  stats: {
    totalLikes: 142,
    totalReposts: 23,
    totalWatches: 450,
  },
  timeline: [
    {
      id: "t1",
      type: "like" as const,
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      contentUrl: "#",
      thumbnailUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&q=80",
      authorUsername: "design_tips",
      authorAvatar: "https://i.pravatar.cc/150?u=design",
      caption: "Top 5 UI design tips for 2024! Make sure to save this reel for later 🔥 #uiux #design #figma",
    },
    {
      id: "t2",
      type: "repost" as const,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      contentUrl: "#",
      thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80",
      authorUsername: "startup_quotes",
      authorAvatar: "https://i.pravatar.cc/150?u=startup",
      caption: "Consistency is key. 🔑 Keep building.",
    },
    {
      id: "t3",
      type: "watch" as const,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      contentUrl: "#",
      thumbnailUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80",
      authorUsername: "tech_insider",
      authorAvatar: "https://i.pravatar.cc/150?u=tech",
      caption: "The new framework everyone is talking about. Is it worth the hype? 🚀",
    },
  ]
};

export function FriendProfileClient({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "like" | "repost" | "watch">("all");

  useEffect(() => {
    // Simulate network request
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [id]);

  if (loading) {
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

  const filteredTimeline = filter === "all" 
    ? MOCK_PROFILE.timeline 
    : MOCK_PROFILE.timeline.filter(t => t.type === filter);

  return (
    <div className="pb-10 min-h-full">
      <ProfileHeader 
        name={MOCK_PROFILE.name}
        username={MOCK_PROFILE.username}
        avatar={MOCK_PROFILE.avatar}
        stats={MOCK_PROFILE.stats}
      />

      <div className="max-w-3xl mx-auto px-4 mt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Activity Timeline</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-black/40 border border-[var(--glass-border)] rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#e1306c] appearance-none"
            >
              <option value="all">All Activities</option>
              <option value="like">Likes Only</option>
              <option value="repost">Reposts Only</option>
              <option value="watch">Watches Only</option>
            </select>
          </div>
        </div>

        <div className="space-y-6 relative">
          {filteredTimeline.length > 0 ? (
            filteredTimeline.map((item, index) => (
              <TimelineCard 
                key={item.id}
                {...item}
                delay={index * 0.1}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 glass-card"
            >
              <p className="text-gray-400">No activity found for this filter.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
