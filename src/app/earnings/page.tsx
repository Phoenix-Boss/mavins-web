// src/app/earnings/page.tsx
'use client';

import React, { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { EarnCard } from '@/components/earnings/EarningsSummary';
import { PointsHistory, HistoryEntry } from '@/components/earnings/PointsHistory';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function EarningsPage() {
  const { theme } = useTheme();
  const { user, setIsSidebarOpen, setIsTaskPanelOpen, setIsNotificationPanelOpen } = useAppStore();
  const [isSidebarOpen, setIsSidebarOpenState] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const historyEntries: HistoryEntry[] = [
    { id: '1', action: 'Completed "Play Nocturnal" task', points: 150, timestamp: new Date() },
    { id: '2', action: 'Completed "Play Electronic" task', points: 100, timestamp: new Date(Date.now() - 3600000) },
    { id: '3', action: 'Daily streak bonus (7 days)', points: 100, timestamp: new Date(Date.now() - 86400000) },
    { id: '4', action: 'Welcome bonus', points: 250, timestamp: new Date(Date.now() - 172800000) }
  ];

  return (
    <div className={cn('min-h-screen pb-16 md:pb-0', theme.bg)}>
      <Header onMenuClick={() => setIsSidebarOpenState(true)} onTaskClick={() => setIsTaskPanelOpen(true)} onNotificationClick={() => setIsNotificationPanelOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpenState(false)} />
      <MobileNav activeTab="earnings" />

      <main className="pt-24 pb-8">
        <Container>
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Earnings</h1>
              <p className={cn('text-sm mt-1', theme.textSecondary)}>Track your points and rewards</p>
            </div>

            <EarningsSummary totalPoints={user?.points || 1250} weeklyPoints={450} rank={42} />

            <PointsHistory entries={historyEntries} />

            <Card className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold">Ready to Withdraw?</h3>
                  <p className={cn('text-sm', theme.textSecondary)}>Minimum 1000 points required</p>
                </div>
                <Button variant="primary" onClick={() => setShowWithdrawModal(true)} disabled={(user?.points || 0) < 1000}>
                  Withdraw Points
                </Button>
              </div>
            </Card>
          </div>
        </Container>
      </main>

      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowWithdrawModal(false)} />
          <div className="relative z-10 w-full max-w-md bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
            <h2 className="text-xl font-bold mb-4">Withdraw Points</h2>
            <p className="text-neutral-400 mb-4">Download the SoundWave Creator App to withdraw your points.</p>
            <div className="flex gap-3">
              <Button variant="primary" fullWidth onClick={() => window.open('https://play.google.com/store/apps/details?id=com.soundwave.app', '_blank')}>
                Download App
              </Button>
              <Button variant="ghost" onClick={() => setShowWithdrawModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
