// src/components/home/TrendingArtists.tsx
'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';

interface Artist {
  id: string;
  name: string;
  username: string;
  chartPosition: number;
  avatarUrl?: string;
}

interface TrendingArtistsProps {
  artists: Artist[];
  isLoading?: boolean;
  onArtistClick?: (artistId: string) => void;
}

export const TrendingArtists = ({ artists, isLoading = false, onArtistClick }: TrendingArtistsProps) => {
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 min-w-[80px] animate-pulse">
            <div className="w-20 h-20 rounded-full bg-neutral-700" />
            <div className="h-3 bg-neutral-700 rounded w-16" />
            <div className="h-2 bg-neutral-700 rounded w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <div className={cn('text-center py-8', theme.textSecondary)}>
        No trending artists available
      </div>
    );
  }

  // Generate a consistent color based on artist name (no external images needed)
  const getInitialsColor = (name: string) => {
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
      'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
      'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
      'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
      {artists.map((artist) => (
        <div
          key={artist.id}
          onClick={() => onArtistClick?.(artist.id)}
          className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer group"
        >
          <div className="relative">
            {artist.avatarUrl ? (
              <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-amber-500 transition-all duration-300">
                <img 
                  src={artist.avatarUrl} 
                  alt={artist.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className={cn(
                'w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ring-2 ring-transparent group-hover:ring-amber-500 transition-all duration-300',
                getInitialsColor(artist.name)
              )}>
                {getInitials(artist.name)}
              </div>
            )}
            {artist.chartPosition <= 3 && (
              <span className="absolute -top-1 -right-1 text-lg">🔥</span>
            )}
          </div>
          <span className={cn('text-sm font-medium text-center truncate max-w-[80px]', theme.text)}>
            {artist.name}
          </span>
          <span className={cn('text-xs', theme.textSecondary)}>
            #{artist.chartPosition}
          </span>
        </div>
      ))}
    </div>
  );
};