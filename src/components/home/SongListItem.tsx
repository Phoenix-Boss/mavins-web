// src/components/home/SongListItem.tsx
'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';

interface SongListItemProps {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  plays: number;
  duration?: number;
  index: number;
  onClick: () => void;
  isPlaying?: boolean;
}

const formatDuration = (seconds?: number): string => {
  if (!seconds) return '2:30';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const SongListItem = ({ 
  id, 
  title, 
  artist, 
  albumArt, 
  plays,
  duration,
  index, 
  onClick,
  isPlaying = false
}: SongListItemProps) => {
  const { theme } = useTheme();
  const defaultAlbumArt = '/images/default-album.jpg';

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 p-3 rounded-xl transition-all duration-200 cursor-pointer group',
        theme.mode === 'dark' ? 'hover:bg-white/10' : 'hover:bg-purple-50',
        isPlaying && (theme.mode === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100/50')
      )}
    >
      <span className={cn(
        'w-8 text-center text-sm font-medium',
        isPlaying ? 'text-amber-500' : theme.textSecondary
      )}>
        {isPlaying ? '🎵' : `${index + 1}`}
      </span>

      <div className={cn(
        'w-10 h-10 rounded-md overflow-hidden shadow-md transition-all duration-200',
        'ring-2 ring-transparent group-hover:ring-amber-500/50',
        isPlaying && 'ring-amber-500'
      )}>
        <img 
          src={albumArt || defaultAlbumArt} 
          alt={title} 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultAlbumArt;
          }}
        />
      </div>

      <div className="flex-1">
        <h3 className={cn('font-medium text-sm', theme.text)}>{title}</h3>
        <p className={cn('text-xs', theme.textSecondary)}>{artist}</p>
      </div>

      <div className="hidden sm:block text-xs text-neutral-500 min-w-[60px]">
        {plays.toLocaleString()} plays
      </div>

      <div className="flex items-center gap-3">
        <span className={cn('text-xs', theme.textSecondary)}>{formatDuration(duration)}</span>
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
          theme.mode === 'dark' ? 'bg-white/10 group-hover:bg-purple-500' : 'bg-purple-100 group-hover:bg-purple-500',
          'opacity-0 group-hover:opacity-100'
        )}>
          <span className="text-xs text-purple-400 group-hover:text-white">▶</span>
        </div>
      </div>
    </div>
  );
};