"use client";

import { motion } from "framer-motion";
import { ChevronRight, Activity, Heart, Repeat } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";

interface FriendCardProps {
  id: string;
  name: string;
  username: string;
  avatar: string;
  lastActive: string;
  recentActivityType: "like" | "repost" | "watch" | null;
  activityCount: number;
  delay?: number;
}

export function FriendCard({ id, name, username, avatar, lastActive, recentActivityType, activityCount, delay = 0 }: FriendCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={`/friends/${id}`}>
        <GlassCard hoverEffect className="cursor-pointer group h-full flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--glass-border)] group-hover:border-[#e1306c] transition-colors duration-300">
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-gradient transition-all">{name}</h3>
                <p className="text-xs text-gray-400">@{username}</p>
              </div>
            </div>
            <div className="text-gray-500 group-hover:text-white transition-colors duration-300 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-[var(--glass-border)] pt-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-400">Active {lastActive}</span>
            </div>
            <div className="flex items-center gap-2">
              {recentActivityType === "like" && <Heart className="w-3.5 h-3.5 text-rose-500" />}
              {recentActivityType === "repost" && <Repeat className="w-3.5 h-3.5 text-green-500" />}
              <span className="text-xs font-medium text-gray-300">{activityCount} activities</span>
            </div>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
}
