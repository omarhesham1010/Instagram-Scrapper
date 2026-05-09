"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
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
  isFirstInSession?: boolean;
  isBingeSession?: boolean;
}

const TYPE_CONFIG = {
  like: { icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  repost: { icon: Repeat, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
  watch: { icon: PlaySquare, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
};

import React from "react";

export const TimelineCard = React.memo(function TimelineCard({ 
  type, timestamp, contentUrl, thumbnailUrl, 
  authorUsername, authorAvatar, caption, delay = 0, isFirstInSession = false, isBingeSession = false
}: TimelineCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  // Render logic continues...

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay, ease: [0.23, 1, 0.32, 1] }}
      className={`relative pl-8 mb-4 group ${isFirstInSession ? 'mt-8' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Timeline Line & Dot */}
      <div className={`absolute left-3 top-2 bottom-[-16px] w-px ${isBingeSession ? 'bg-[#e1306c]/30 shadow-[0_0_10px_#e1306c]' : 'bg-white/10'} group-last:hidden`} />
      <div className={`absolute left-[7px] top-2 w-2.5 h-2.5 rounded-full ring-4 ring-black z-10 ${config.bg.replace('/10', '')} ${isBingeSession ? 'shadow-[0_0_10px_#e1306c]' : ''}`} />

      <div className={`glass-card p-4 flex gap-4 transition-all duration-300 ${isHovered ? 'bg-white/5 border-white/20' : ''} ${isBingeSession ? 'border-[#e1306c]/30 shadow-[inset_0_0_20px_rgba(225,48,108,0.05)]' : ''}`}>
        {/* Content Thumbnail */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-black/40 border border-white/10 group-hover:border-white/20 transition-colors">
          <img src={thumbnailUrl} alt="Content thumbnail" className="w-full h-full object-cover" />
          <div className={`absolute top-1 right-1 p-1 rounded-md backdrop-blur-md bg-black/50 ${config.color}`}>
            <Icon className="w-3 h-3" />
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <img src={authorAvatar} alt={authorUsername} className="w-5 h-5 rounded-full border border-white/10" />
              <span className="text-sm font-medium text-white truncate">{authorUsername}</span>
            </div>
            <div className="flex items-center gap-2">
              {isBingeSession && (
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#e1306c] bg-[#e1306c]/10 px-2 py-0.5 rounded-full animate-pulse">
                  Binge Session
                </span>
              )}
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatDistanceToNow(timestamp, { addSuffix: true })}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-400 line-clamp-2 mt-1 mb-2">
            {caption}
          </p>

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <a 
                  href={contentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#e1306c] hover:text-[#fd1d1d] transition-colors mt-1"
                >
                  View on Instagram <ExternalLink className="w-3 h-3" />
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.type === nextProps.type &&
    prevProps.timestamp.getTime() === nextProps.timestamp.getTime() &&
    prevProps.contentUrl === nextProps.contentUrl &&
    prevProps.isFirstInSession === nextProps.isFirstInSession &&
    prevProps.isBingeSession === nextProps.isBingeSession
  );
});
