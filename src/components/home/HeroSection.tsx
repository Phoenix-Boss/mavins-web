// src/components/home/HeroSection.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [animatedCount, setAnimatedCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const stepTime = 16;
    const totalSteps = duration / stepTime;
    const increment = playCount / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= playCount) {
        setAnimatedCount(playCount);
        clearInterval(timer);
      } else {
        setAnimatedCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [playCount]);

  useEffect(() => {
    if (!hasWelcomeBonus) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [hasWelcomeBonus]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFocused(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const defaultAlbumArt = '/images/default-album.jpg';

  return (
    <div ref={heroRef}>
      <Card 
        glass={true}
        className={cn(
          'relative overflow-hidden transition-all duration-700',
          isFocused && 'ring-4 ring-purple-500/50 shadow-2xl scale-[1.01]'
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none z-0" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
          <div className="relative">
            <div className={cn(
              'w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-2xl transition-all duration-500',
              'ring-4 ring-amber-500/30',
              isFocused && 'ring-8 ring-purple-500/50 scale-105'
            )}>
              <img 
                src={albumArt || defaultAlbumArt} 
                alt={songTitle} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultAlbumArt;
                }}
              />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <Badge variant="accent" className="mb-3">Featured Artist</Badge>
            <h2 className={cn(
              'text-2xl md:text-4xl font-bold transition-all duration-500',
              isFocused && 'md:scale-105 md:origin-left'
            )}>
              {artistName || 'Loading...'}
            </h2>
            <p className={cn('text-sm md:text-base mt-1', theme.textSecondary)}>{songTitle || 'Loading...'}</p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Button onClick={onPlay} icon="▶" iconPosition="left">Play Featured Song</Button>
              {hasWelcomeBonus && timeLeft > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <span className="text-amber-400">🎁</span>
                  <span className="text-sm">Bonus expires: {formatTime(timeLeft)}</span>
                </div>
              )}
            </div>
          </div>

          <div className={cn(
            'transform transition-all duration-700',
            isFocused ? '-rotate-3 scale-110 translate-x-2' : '-rotate-6'
          )}>
            <div className="text-center md:text-right">
              <div className="text-5xl md:text-7xl font-black bg-gradient-to-r from-amber-400 via-purple-500 to-sky-400 bg-clip-text text-transparent">
                {animatedCount.toLocaleString()}
              </div>
              <div className="text-xs uppercase tracking-wider text-gray-400 mt-1">Plays Today</div>
              <div className="flex items-center gap-1 justify-center md:justify-end mt-2">
                <span className="text-amber-400 animate-pulse">🔥</span>
                <span className="text-sm">Trending</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};