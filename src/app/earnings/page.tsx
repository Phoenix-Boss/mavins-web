// src/app/earnings/page.tsx
'use client';

import React, { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { EarnCard } from '@/components/earnings/EarningsSummary';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils/cn';

export default function EarningsPage() {
  const { theme } = useTheme();
  const { setIsSidebarOpen, setIsTaskPanelOpen, setIsNotificationPanelOpen } = useAppStore();
  const [isSidebarOpen, setIsSidebarOpenState] = useState(false);

  // Get task and notification counts
  const taskCount = 0;
  const notificationCount = 0;
  const points = 0;

  return (
    <div className={cn('min-h-screen pb-16 md:pb-0', theme.bg)}>
      <Header 
        onMenuClick={() => setIsSidebarOpenState(true)} 
        onTaskClick={() => setIsTaskPanelOpen(true)} 
        onNotificationClick={() => setIsNotificationPanelOpen(true)}
        taskCount={taskCount}
        notificationCount={notificationCount}
        points={points}
      />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpenState(false)} />
      <MobileNav 
        activeTab="earnings"
        taskCount={taskCount}
        notificationCount={notificationCount}
        points={points}
        onTabChange={() => {}}
      />

      <main className="pt-24 pb-8">
        <Container>
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">💰 Earnings</h1>
              <p className={cn('text-sm mt-1', theme.textSecondary)}>Track your earnings and points</p>
            </div>

            {/* Earnings Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <EarnCard
                title="Total Points"
                value="2,450"
                icon="⭐"
                subtitle="+150 this week"
              />
              <EarnCard
                title="Total Earned"
                value="$24.50"
                icon="💰"
                subtitle="+$1.50 this week"
              />
              <EarnCard
                title="Available"
                value="$18.75"
                icon="💳"
                subtitle="Ready for withdrawal"
              />
              <EarnCard
                title="Tasks Completed"
                value="12"
                icon="✅"
                subtitle="3 today"
              />
            </div>

            {/* Recent Earnings */}
            <div className={`p-4 rounded-xl ${theme.bgCard} ${theme.border} border`}>
              <h3 className="font-semibold mb-4">📊 Recent Earnings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className={theme.textSecondary}>Completed "Daily Check-in"</span>
                  <span className="text-emerald-400">+10 pts</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={theme.textSecondary}>Listened to "Midnight Dreams"</span>
                  <span className="text-emerald-400">+5 pts</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={theme.textSecondary}>Shared a track</span>
                  <span className="text-emerald-400">+25 pts</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={theme.textSecondary}>7-day streak bonus</span>
                  <span className="text-emerald-400">+100 pts</span>
                </div>
              </div>
            </div>

            {/* Withdraw Button */}
            <button className={`w-full py-3 rounded-xl ${theme.accentBg} text-white font-semibold hover:opacity-90 transition-opacity`}>
              💸 Withdraw Earnings
            </button>
          </div>
        </Container>
      </main>
    </div>
  );
}
