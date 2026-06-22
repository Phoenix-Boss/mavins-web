// src/components/home/SongList.tsx
'use client';

import React, { useState } from 'react';
import { SongListItem } from './SongListItem';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';

interface Track {
  id: string;
  title: string;
  artistName: string;
  coverArt?: string;
  plays: number;
  duration?: number;
}

interface SongListProps {
  tracks: Track[];
  isLoading?: boolean;
  onTrackClick: (trackId: string) => void;
  title?: string;
}

export const SongList = ({ tracks, isLoading = false, onTrackClick, title = "Featured Songs" }: SongListProps) => {
  const { theme } = useTheme();
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handleClick = (trackId: string) => {
    setPlayingId(trackId);
    onTrackClick(trackId);
    setTimeout(() => setPlayingId(null), 1000);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {title && <h2 className={cn('text-lg font-semibold mb-4', theme.text)}>{title}</h2>}
        {[1, 2, 3, 4, 5].map((i: any) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-xl animate-pulse">
            <div className="w-8 h-4 bg-neutral-700 rounded" />
            <div className="w-10 h-10 rounded-md bg-neutral-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-neutral-700 rounded w-32" />
              <div className="h-3 bg-neutral-700 rounded w-24" />
            </div>
            <div className="w-16 h-3 bg-neutral-700 rounded hidden sm:block" />
            <div className="w-12 h-3 bg-neutral-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="space-y-2">
        {title && <h2 className={cn('text-lg font-semibold mb-4', theme.text)}>{title}</h2>}
        <div className={cn('text-center py-8', theme.textSecondary)}>
          No songs available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {title && <h2 className={cn('text-lg font-semibold mb-4', theme.text)}>{title}</h2>}
      <div className="space-y-1">
        {tracks.map((track, index) => (
          <SongListItem
            key={track.id}
            id={track.id}
            title={track.title}
            artist={track.artistName}
            albumArt={track.coverArt || ''}
            plays={track.plays}
            duration={track.duration}
            index={index}
            onClick={() => handleClick(track.id)}
            isPlaying={playingId === track.id}
          />
        ))}
      </div>
    </div>
  );
};
