"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { motion, AnimatePresence } from "framer-motion";
import { backgroundService } from "@/workers/backgroundService";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const loadInitialData = useAppStore((state) => state.loadInitialData);
  const isDataLoaded = useAppStore((state) => state.isDataLoaded);

  useEffect(() => {
    loadInitialData().then(() => {
      // Start background polling when data is loaded
      backgroundService.start();
    });

    return () => {
      backgroundService.stop();
    };
  }, [loadInitialData]);

  return (
    <AnimatePresence mode="wait">
      {!isDataLoaded ? (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-t-[#fd1d1d] border-r-[#e1306c] border-b-[#833ab4] border-l-transparent animate-spin" />
            <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#833ab4] to-[#fd1d1d]">
              Initializing Database...
            </h2>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-full w-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
