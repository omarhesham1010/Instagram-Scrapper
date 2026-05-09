import { create } from "zustand";

interface AppState {
  // UI State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  
  // Data State
  friends: any[];
  setFriends: (friends: any[]) => void;
  
  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Extension specific
  isExtensionConnected: boolean;
  setExtensionConnected: (status: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  friends: [],
  setFriends: (friends) => set({ friends }),
  
  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  
  isExtensionConnected: false,
  setExtensionConnected: (isExtensionConnected) => set({ isExtensionConnected }),
}));
