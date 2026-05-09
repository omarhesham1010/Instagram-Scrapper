"use client";

import { motion } from "framer-motion";
import { Heart, Repeat, PlaySquare, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TimelineCardProps {
  type: "like" | "repost" | "watch";
  timestamp: Date;
  contentUrl: string;
  thumbnailUrl: string;
  authorUsername: string;
  authorAvatar: string;
  caption: string;
  delay?: number;
}

export function TimelineCard({ type, timestamp, contentUrl, thumbnailUrl, authorUsername, authorAvatar, caption, delay = 0 }: TimelineCardProps) {
  const getIcon = () => {
    switch (type) {
      case "like": return <Heart className="w-5 h-5 text-rose-500" />;
      case "repost": return <Repeat className="w-5 h-5 text-green-500" />;
      case "watch": return <PlaySquare className="w-5 h-5 text-blue-500" />;
    }
  };

  const getActionText = () => {
    switch (type) {
      case "like": return "Liked a post by";
      case "repost": return "Reposted from";
      case "watch": return "Watched a reel by";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative pl-8 pb-8 group"
    >
      {/* Timeline Line */}
      <div className="absolute left-3 top-2 bottom-0 w-px bg-gradient-to-b from-white/20 to-transparent group-last:hidden" />
      
      {/* Timeline Dot */}
      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-black border border-[var(--glass-border)] flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.1)] z-10">
        {getIcon()}
      </div>

      <div className="glass-card p-4 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">{getActionText()}</span>
            <div className="flex items-center gap-1.5 bg-white/5 rounded-full px-2 py-0.5 border border-white/10">
              <img src={authorAvatar} alt={authorUsername} className="w-4 h-4 rounded-full" />
              <span className="text-xs font-medium text-white">@{authorUsername}</span>
            </div>
          </div>
          <span className="text-xs text-gray-500">{formatDistanceToNow(timestamp, { addSuffix: true })}</span>
        </div>

        <div className="flex gap-4">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-[var(--glass-border)] group/img cursor-pointer">
            <img src={thumbnailUrl} alt="Content thumbnail" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity duration-300">
              <ExternalLink className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">
              {caption}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
