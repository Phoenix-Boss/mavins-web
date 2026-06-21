// src/components/home/HeroSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';

interface HeroSectionProps {
  artistName: string;
  songTitle: string;
  albumArt: string;
  playCount: number;
  onPlay: () => void;
  hasWelcomeBonus?: boolean;
  bonusExpiresIn?: number;
}

export const HeroSection = ({
  artistName,
  songTitle,
  albumArt,
  playCount,
  onPlay,
  hasWelcomeBonus = false,
  bonusExpiresIn = 86400,
}: HeroSectionProps) => {
  const { theme } = useTheme();
  const [timeLeft, setTimeLeft] = useState(bonusExpiresIn);

  useEffect(() => {
    if (!hasWelcomeBonus) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [hasWelcomeBonus]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="relative overflow-hidden">
      <div className={cn(
        'absolute inset-0 bg-gradient-to-r',
        theme.mode === 'dark' ? 'from-amber-500/20 to-purple-600/20' : 'from-amber-500/10 to-purple-600/10'
      )} />
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden shadow-2xl">
          <img src={albumArt} alt={songTitle} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <Badge variant="accent" className="mb-3">Featured Artist</Badge>
          <h2 className="text-2xl md:text-4xl font-bold">{artistName}</h2>
          <p className={cn('text-sm md:text-base mt-1', theme.textSecondary)}>{songTitle}</p>
          <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
            <span className="flex items-center gap-1 text-sm">
              <span className="text-amber-400">&#x1F525;</span>
              <span>{playCount.toLocaleString()} plays today</span>
            </span>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <Button onClick={onPlay} icon="&#x25B6;" iconPosition="left">Play Featured Artist</Button>
            {hasWelcomeBonus && timeLeft > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <span className="text-amber-400">&#x1F381;</span>
                <span className="text-sm">Bonus expires: {formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
