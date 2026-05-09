"use client";

import { Heart, Repeat, PlaySquare, TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

const stats = [
  { label: "Total Likes Tracked", value: "1,248", icon: Heart, color: "text-rose-500", bgColor: "bg-rose-500/10" },
  { label: "Total Reposts", value: "342", icon: Repeat, color: "text-green-500", bgColor: "bg-green-500/10" },
  { label: "Reels Watched", value: "892", icon: PlaySquare, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { label: "Engagement Rate", value: "14.2%", icon: TrendingUp, color: "text-purple-500", bgColor: "bg-purple-500/10" },
];

export default function Home() {
  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Overview of your friends' Instagram activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <GlassCard hoverEffect>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="h-[400px]">
            <ActivityChart />
          </GlassCard>
        </div>
        
        <div className="space-y-6">
          <GlassCard className="h-[400px] flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="flex-1 overflow-hidden">
              <RecentActivity />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
