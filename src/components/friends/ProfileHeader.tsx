"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Activity, Heart, Repeat, PlaySquare } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  username: string;
  avatar: string;
  stats: {
    totalLikes: number;
    totalReposts: number;
    totalWatches: number;
  };
}

export function ProfileHeader({ name, username, avatar, stats }: ProfileHeaderProps) {
  return (
    <div className="relative mb-8">
      {/* Cover Background */}
      <div className="h-48 rounded-2xl bg-gradient-to-r from-[#833ab4]/20 via-[#fd1d1d]/20 to-[#fcb045]/20 overflow-hidden relative">
        <div className="absolute inset-0 backdrop-blur-3xl"></div>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative"
          >
            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-[#833ab4] to-[#fd1d1d]">
              <div className="w-full h-full rounded-full border-4 border-black overflow-hidden bg-black">
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-black rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
          </motion.div>

          <div className="flex-1 text-center md:text-left mb-2">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-bold text-white"
            >
              {name}
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 font-medium"
            >
              @{username}
            </motion.p>
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 mb-2"
          >
            <GlassCard className="!p-3 flex items-center gap-3">
              <div className="p-2 bg-rose-500/10 rounded-lg">
                <Heart className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{stats.totalLikes}</p>
                <p className="text-xs text-gray-500">Likes</p>
              </div>
            </GlassCard>
            
            <GlassCard className="!p-3 flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Repeat className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{stats.totalReposts}</p>
                <p className="text-xs text-gray-500">Reposts</p>
              </div>
            </GlassCard>

            <GlassCard className="!p-3 flex items-center gap-3 hidden sm:flex">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <PlaySquare className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{stats.totalWatches}</p>
                <p className="text-xs text-gray-500">Watched</p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
