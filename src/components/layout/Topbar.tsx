"use client";

import { Bell, Search, User } from "lucide-react";

export function Topbar() {
  return (
    <header className="h-20 flex items-center justify-between px-8 glass border-b border-[var(--glass-border)] sticky top-0 z-30">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#e1306c] transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-[var(--glass-border)] rounded-2xl leading-5 bg-black/20 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#e1306c] focus:border-[#e1306c] sm:text-sm transition-all shadow-inner"
            placeholder="Search activities, friends, or hashtags..."
          />
        </div>
      </div>

      <div className="ml-4 flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-[#fd1d1d] ring-2 ring-black"></span>
        </button>
        <div className="h-8 w-px bg-white/10 mx-2"></div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#833ab4] to-[#fd1d1d] p-[2px]">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
              <User className="h-5 w-5 text-gray-300" />
            </div>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-white">Current User</p>
            <p className="text-xs text-gray-400">Connected</p>
          </div>
        </div>
      </div>
    </header>
  );
}
