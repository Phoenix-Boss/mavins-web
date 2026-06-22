'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';

interface HeaderProps {
  onMenuClick: () => void;
  onTaskClick: () => void;
  onNotificationClick: () => void;
  taskCount: number;
  notificationCount: number;
  points: number;
}

export const Header = ({ 
  onMenuClick, 
  onTaskClick, 
  onNotificationClick, 
  taskCount, 
  notificationCount,
  points
}: HeaderProps) => {
  const { theme, mode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { setPoints } = useAppStore();
  // supabase is already imported from '@/lib/supabase/client'
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const fetchPoints = async () => {
      const { data } = await supabase
        .from('wallet_ledger')
        .select('amount')
        .eq('user_id', user.id);

      const total = data?.reduce((sum: number, record: { amount: number | null }) => sum + (record.amount || 0), 0) || 0;
      setPoints(total);
    };

    fetchPoints();

    const pointsChannel = supabase
      .channel('header-points')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wallet_ledger',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchPoints();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(pointsChannel);
    };
  }, [supabase, user?.id, setPoints]);

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled ? `${theme.bgSecondary} shadow-lg border-b ${theme.border}` : theme.bgSecondary,
        'backdrop-blur-xl bg-opacity-80'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-2">
            <button 
              onClick={onMenuClick} 
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">S</span>
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-400 to-purple-500 bg-clip-text text-transparent">
                SoundWave
              </span>
            </div>
          </div>

          <div className="hidden sm:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder="Search songs, artists..." 
                className={cn(
                  'w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-all',
                  theme.bgTertiary, 
                  theme.border, 
                  'focus:ring-amber-500/50'
                )} 
              />
              <svg className="absolute right-3 top-2.5 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <span className="text-amber-400 text-sm">💰</span>
              <span className={cn('font-semibold text-sm', theme.text)}>
                ${points.toFixed(2)}
              </span>
            </div>

            <button 
              onClick={onTaskClick} 
              className="p-2 rounded-full hover:bg-white/10 transition-colors relative"
              aria-label="Tasks"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {taskCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-xs flex items-center justify-center bg-red-500 text-white rounded-full px-1">
                  {taskCount > 99 ? '99+' : taskCount}
                </span>
              )}
            </button>

            <button 
              onClick={onNotificationClick} 
              className="p-2 rounded-full hover:bg-white/10 transition-colors relative"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-xs flex items-center justify-center bg-red-500 text-white rounded-full px-1">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </button>

            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {mode === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M12 19.364l.707.707m0-14.142l.707-.707M6.343 17.657l-.707.707M17.657 6.343l.707-.707M4.95 4.95l.707-.707M19.05 19.05l.707.707" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="sm:hidden pb-3">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Search songs, artists..." 
              className={cn(
                'w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-all',
                theme.bgTertiary, 
                theme.border, 
                'focus:ring-amber-500/50'
              )} 
            />
            <svg className="absolute right-3 top-2.5 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
