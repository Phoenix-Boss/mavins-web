// src/components/layout/Sidebar.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAuth } from '@/hooks/auth/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserStats {
  points: number;
  streak: number;
  tier: string;
  username: string;
  email: string;
}

const navItems = [
  { icon: 'H', label: 'Home', href: '/' },
  { icon: 'T', label: 'Leaderboard', href: '/leaderboard' },
  { icon: 'P', label: 'Profile', href: '/profile' },
  { icon: 'S', label: 'Settings', href: '/settings' },
  { icon: 'E', label: 'Earnings', href: '/earnings' },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const supabase = createClient();
  const { theme } = useTheme();
  const { user: authUser } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!authUser?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username, email, streak')
        .eq('id', authUser.id)
        .single();

      if (userError) {
        console.error('Error fetching user:', userError);
        setIsLoading(false);
        return;
      }

      const { data: pointsData, error: pointsError } = await supabase
        .from('wallet_ledger')
        .select('amount')
        .eq('user_id', authUser.id);

      if (pointsError) {
        console.error('Error fetching points:', pointsError);
      }

      const totalPoints = pointsData?.reduce((sum: number, record: { amount: number | null }) => sum + (record.amount || 0), 0) || 0;

      let tier = 'Bronze';
      if (totalPoints >= 10000) tier = 'Platinum';
      else if (totalPoints >= 5000) tier = 'Gold';
      else if (totalPoints >= 1000) tier = 'Silver';

      setUserStats({
        points: totalPoints,
        streak: userData.streak || 0,
        tier,
        username: userData.username || authUser.email?.split('@')[0] || 'User',
        email: userData.email || authUser.email || '',
      });

      setIsLoading(false);
    };

    fetchUserStats();

    const pointsChannel = supabase
      .channel('sidebar-points')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wallet_ledger',
          filter: `user_id=eq.${authUser?.id}`,
        },
        () => { fetchUserStats(); }
      )
      .subscribe();

    const userChannel = supabase
      .channel('sidebar-user')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${authUser?.id}`,
        },
        () => { fetchUserStats(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(pointsChannel);
      supabase.removeChannel(userChannel);
    };
  }, [supabase, authUser?.id, authUser?.email]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300" onClick={onClose} />
      <aside className={cn(
        'fixed left-0 top-0 bottom-0 w-80 z-50 shadow-2xl transition-transform duration-300 ease-out',
        theme.bgSecondary, 'border-r', theme.border
      )}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-amber-400 to-purple-500 bg-clip-text text-transparent">
                SoundWave
              </span>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {isLoading ? (
            <div className="p-4">
              <div className="animate-pulse">
                <div className="h-24 bg-neutral-800 rounded-xl mb-3"></div>
                <div className="h-16 bg-neutral-800 rounded-xl"></div>
              </div>
            </div>
          ) : userStats ? (
            <div className="p-4 border-b border-neutral-800">
              <div className={cn('rounded-xl p-4', theme.bgCard, 'border', theme.border)}>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {userStats.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{userStats.username}</p>
                      <p className="text-xs text-neutral-400 truncate">{userStats.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-2xl font-bold">{userStats.points.toLocaleString()}</p>
                      <p className="text-xs text-neutral-400">Points</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold flex items-center justify-center gap-1">{userStats.streak}</p>
                      <p className="text-xs text-neutral-400">Streak</p>
                    </div>
                    <div>
                      <span className={cn(
                        'text-xs px-2 py-1 rounded-full',
                        userStats.tier === 'Platinum' ? 'bg-purple-500/20 text-purple-400' :
                        userStats.tier === 'Gold' ? 'bg-amber-500/20 text-amber-400' :
                        userStats.tier === 'Silver' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-amber-600/20 text-amber-400'
                      )}>
                        {userStats.tier}
                      </span>
                      <p className="text-xs text-neutral-400 mt-1">Tier</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className={cn('rounded-xl p-4 text-center', theme.bgCard, 'border', theme.border)}>
                <p className="text-neutral-400 text-sm">Sign in to view stats</p>
              </div>
            </div>
          )}

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-neutral-800">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-neutral-700 hover:bg-white/5 transition-colors">
              <span className="text-lg">📱</span>
              <span className="text-sm">Download App</span>
            </button>
            <p className="text-xs text-center text-neutral-500 mt-4">Version 1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};
