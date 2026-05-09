"use client";

import { useState } from "react";
import { SearchInput } from "@/components/friends/SearchInput";
import { FriendCard } from "@/components/friends/FriendCard";
import { motion, AnimatePresence } from "framer-motion";

// Temporary mock data
const MOCK_FRIENDS: any[] = [
  { id: "1", name: "Ahmed Youssef", username: "ahmed.y", avatar: "https://i.pravatar.cc/150?u=ahmed", lastActive: "2m ago", recentActivityType: "like", activityCount: 142 },
  { id: "2", name: "Sara Ahmed", username: "sara.design", avatar: "https://i.pravatar.cc/150?u=sara", lastActive: "1h ago", recentActivityType: "repost", activityCount: 56 },
  { id: "3", name: "Omar Hesham", username: "omar.dev", avatar: "https://i.pravatar.cc/150?u=omar", lastActive: "Active now", recentActivityType: "watch", activityCount: 890 },
  { id: "4", name: "Nour Ali", username: "nour.a", avatar: "https://i.pravatar.cc/150?u=nour", lastActive: "5h ago", recentActivityType: "like", activityCount: 12 },
  { id: "5", name: "Youssef Tarek", username: "jo.tarek", avatar: "https://i.pravatar.cc/150?u=jo", lastActive: "1d ago", recentActivityType: "repost", activityCount: 5 },
  { id: "6", name: "Laila Magdy", username: "laila.m", avatar: "https://i.pravatar.cc/150?u=laila", lastActive: "3m ago", recentActivityType: "like", activityCount: 304 },
];

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFriends = MOCK_FRIENDS.filter((friend) => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10 flex flex-col min-h-full">
      <div className="text-center space-y-4 pt-4">
        <h1 className="text-3xl font-bold tracking-tight text-white">Friends Activity</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Search and select a friend to view their detailed Instagram activity timeline, including likes, reposts, and watched reels.
        </p>
      </div>

      <div className="sticky top-0 z-20 pt-4 pb-8 bg-black/80 backdrop-blur-md">
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
      </div>

      <div className="flex-1">
        <AnimatePresence mode="popLayout">
          {filteredFriends.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              layout
            >
              {filteredFriends.map((friend, index) => (
                <FriendCard
                  key={friend.id}
                  {...friend}
                  delay={index * 0.05}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center h-64 text-center"
            >
              <div className="w-24 h-24 mb-6 rounded-full bg-white/5 flex items-center justify-center border border-[var(--glass-border)]">
                <Search className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No friends found</h3>
              <p className="text-gray-400">We couldn't find anyone matching "{searchQuery}"</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
