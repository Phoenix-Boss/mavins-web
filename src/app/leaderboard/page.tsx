// src/app/leaderboard/page.tsx
'use client';

import React, { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { LeaderboardTable, LeaderboardEntry } from '@/components/leaderboard/LeaderboardTable';
import { LeaderboardFilters } from '@/components/leaderboard/LeaderboardFilters';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils/cn';

export default function LeaderboardPage() {
  const { theme } = useTheme();
  const { setIsSidebarOpen, setIsTaskPanelOpen, setIsNotificationPanelOpen, user } = useAppStore();
  const [isSidebarOpen, setIsSidebarOpenState] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'global' | 'weekly' | 'monthly' | 'tier'>('global');
  const [selectedTier, setSelectedTier] = useState('T4');

  const mockLeaderboard: LeaderboardEntry[] = [
    { rank: 1, userId: '1', username: 'DJShadow', points: 12450, tier: 'T1' },
    { rank: 2, userId: '2', username: 'LunaWave', points: 11200, tier: 'T1' },
    { rank: 3, userId: '3', username: 'MayaBeats', points: 10850, tier: 'T2' },
    { rank: 4, userId: '4', username: 'GaryTheGrump', points: 8900, tier: 'T2' },
    { rank: 5, userId: '5', username: 'EleanorWright', points: 7500, tier: 'T3' },
    { rank: 42, userId: user?.id || 'current', username: user?.email?.split('@')[0] || 'You', points: user?.points || 1250, tier: user?.tier || 'T4', isCurrentUser: true }
  ];

  const getTitle = () => {
    if (activeFilter === 'tier') return selectedTier + ' Leaderboard';
    return activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1) + ' Rankings';
  };

  return (
    <div className={cn('min-h-screen pb-16 md:pb-0', theme.bg)}>
      <Header
        onMenuClick={() => setIsSidebarOpenState(true)}
        onTaskClick={() => setIsTaskPanelOpen(true)}
        onNotificationClick={() => setIsNotificationPanelOpen(true)}
      />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpenState(false)} />
      <MobileNav activeTab="leaderboard" />

      <main className="pt-24 pb-8">
        <Container>
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Leaderboard</h1>
              <p className={cn('text-sm mt-1', theme.textSecondary)}>Compete with the community</p>
            </div>
            <LeaderboardFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} selectedTier={selectedTier} onTierChange={setSelectedTier} />
            <LeaderboardTable entries={mockLeaderboard} title={getTitle()} />
          </div>
        </Container>
      </main>
    </div>
  );
}
