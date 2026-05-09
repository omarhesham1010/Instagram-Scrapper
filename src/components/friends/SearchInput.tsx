"use client";

import { Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = "Search friends..." }: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut to focus search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto group">
      <motion.div
        animate={{
          boxShadow: isFocused ? "0 0 0 2px rgba(225, 48, 108, 0.3)" : "0 0 0 1px rgba(255, 255, 255, 0.1)",
        }}
        className="relative flex items-center glass rounded-2xl overflow-hidden transition-colors"
      >
        <div className="pl-4">
          <Search className={`w-5 h-5 transition-colors duration-300 ${isFocused ? "text-[#e1306c]" : "text-gray-500"}`} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-transparent border-none py-4 pl-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-0"
          placeholder={placeholder}
        />

        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                onChange("");
                inputRef.current?.focus();
              }}
              className="absolute right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>

        <div className={`absolute right-4 text-xs font-mono text-gray-500 pointer-events-none transition-opacity duration-300 ${value ? "opacity-0" : "opacity-100"}`}>
          <kbd className="px-2 py-1 bg-white/5 rounded-md border border-white/10 hidden sm:inline-block">⌘K</kbd>
        </div>
      </motion.div>
    </div>
  );
}
