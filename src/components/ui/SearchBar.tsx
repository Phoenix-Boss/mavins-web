// src/components/ui/SearchBar.tsx
'use client';

import { useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils/cn";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  showFilter?: boolean;
}

export function SearchBar({ 
  onSearch, 
  placeholder = "Search songs, artists, albums...",
  showFilter = true 
}: SearchBarProps) {
  const { theme } = useTheme();
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch?.("");
  };

  return (
    <div className="w-full">
      <div className={cn(
        'relative flex items-center rounded-full border focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent transition-all',
        theme.bgTertiary,
        theme.border
      )}>
        <span className={cn('pl-3 sm:pl-4', theme.textSecondary)}>
          🔍
        </span>
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          className={cn(
            'w-full py-2 sm:py-2.5 px-2 sm:px-4 bg-transparent placeholder-neutral-500 focus:outline-none text-sm sm:text-base',
            theme.text
          )}
        />
        {showFilter && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn('pr-3 sm:pr-4 hover:text-amber-400 transition-colors', theme.textSecondary)}
            aria-label="Toggle filters"
          >
            ⚙️
          </button>
        )}
        {query && (
          <button
            onClick={handleClear}
            className={cn('absolute right-10 sm:right-12 hover:text-amber-400 transition-colors', theme.textSecondary)}
            aria-label="Clear"
          >
            ✕
          </button>
        )}
      </div>

      {showFilters && showFilter && (
        <div className={cn('mt-2 p-3 sm:p-4 rounded-xl border shadow-lg', theme.bgCard, theme.border)}>
          <div className="flex flex-wrap gap-2">
            {["All", "Songs", "Artists", "Albums", "Playlists"].map((filter) => (
              <button
                key={filter}
                className={cn(
                  'px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors',
                  filter === "All" 
                    ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white' 
                    : `${theme.bgTertiary} ${theme.textSecondary} hover:bg-white/10`
                )}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className={cn('mt-3 pt-3 border-t flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm', theme.border, theme.textSecondary)}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded accent-amber-500 w-3 h-3 sm:w-4 sm:h-4" />
              <span>Explicit content</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded accent-amber-500 w-3 h-3 sm:w-4 sm:h-4" defaultChecked />
              <span>High quality only</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}