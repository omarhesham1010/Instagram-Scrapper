import { create } from "zustand";
import { db, Friend, Activity } from "../lib/db";
import { logger } from "../core/observability/logger";
import { seedDatabase } from "../lib/dbSeeder";

interface AppState {
  // UI State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  
  // Data State
  friends: Friend[];
  activities: Activity[];
  isDataLoaded: boolean;
  
  // Actions
  loadInitialData: () => Promise<void>;
  loadActivitiesForFriend: (friendId: string) => Promise<Activity[]>;
  getGlobalActivities: (limit?: number) => Promise<Activity[]>;
  
  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Extension specific
  isExtensionConnected: boolean;
  setExtensionConnected: (status: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  friends: [],
  activities: [],
  isDataLoaded: false,
  
  loadInitialData: async () => {
    try {
      logger.info("AppStore", "Initializing database and loading data...");
      await seedDatabase(); // Ensure dummy data exists for development
      
      const allFriends = await db.friends.orderBy("lastSyncAt").reverse().toArray();
      set({ friends: allFriends, isDataLoaded: true });
      logger.info("AppStore", `Loaded ${allFriends.length} friends from DB.`);
    } catch (error) {
      logger.error("AppStore", "Failed to load initial data", error);
    }
  },

  loadActivitiesForFriend: async (friendId: string) => {
    try {
      const activities = await db.activities
        .where("friendId")
        .equals(friendId)
        .reverse()
        .sortBy("timestamp");
      return activities;
    } catch (error) {
      logger.error("AppStore", `Failed to load activities for friend ${friendId}`, error);
      return [];
    }
  },

  getGlobalActivities: async (limit = 100) => {
    try {
      const activities = await db.activities
        .orderBy("timestamp")
        .reverse()
        .limit(limit)
        .toArray();
      return activities;
    } catch (error) {
      logger.error("AppStore", "Failed to load global activities", error);
      return [];
    }
  },
  
  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  
  isExtensionConnected: false,
  setExtensionConnected: (isExtensionConnected) => set({ isExtensionConnected }),
}));
