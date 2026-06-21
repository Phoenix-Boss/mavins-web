// src/app/creator/page.tsx
'use client';

import React, { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { CreatorStats } from '@/components/withdrawal/CreatorStats';
import { WithdrawalHistory } from '@/components/withdrawal/WithdrawalHistory';
import { WithdrawalModal } from '@/components/withdrawal/WithdrawalModal';
import { useWithdrawal } from '@/hooks/withdrawal/useWithdrawal';
import { useAuth } from '@/hooks/auth/useAuth';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils/cn';

export default function CreatorPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { setIsSidebarOpen, setIsTaskPanelOpen, setIsNotificationPanelOpen } = useAppStore();
  const [isSidebarOpen, setIsSidebarOpenState] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { stats, history, requestWithdrawal, refresh } = useWithdrawal();

  // Get task and notification counts
  const taskCount = 0; // Replace with actual task count from your data
  const notificationCount = 0; // Replace with actual notification count
  const points = stats?.totalPoints || 0;

  const handleWithdraw = async (amount: number, method: 'paypal' | 'bank' | 'crypto', details: any) => {
    setIsSubmitting(true);
    try {
      await requestWithdrawal(amount, method, details);
      setShowWithdrawModal(false);
      await refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className={cn('min-h-screen flex items-center justify-center', theme.bg)}>
        <div className="text-center">
          <p className={theme.textSecondary}>Please log in to access Creator Dashboard</p>
        </div>
      </div>
    );
  }

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
      <MobileNav activeTab="creator" />

      <main className="pt-24 pb-8">
        <Container>
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Creator Dashboard</h1>
              <p className={cn('text-sm mt-1', theme.textSecondary)}>Manage your earnings and withdrawals</p>
            </div>

            {stats && (
              <CreatorStats
                totalPoints={stats.totalPoints}
                totalEarned={stats.totalEarned}
                availableForWithdrawal={stats.availableForWithdrawal}
                withdrawnTotal={stats.withdrawnTotal}
                rank={stats.rank}
                totalUsers={stats.totalUsers}
                weeklyPoints={stats.weeklyPoints || 0}
                monthlyPoints={stats.monthlyPoints || 0}
                onWithdraw={() => setShowWithdrawModal(true)}
              />
            )}

            <WithdrawalHistory withdrawals={history || []} />
          </div>
        </Container>
      </main>

      <WithdrawalModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        availableAmount={stats?.availableForWithdrawal || 0}
        onSubmit={handleWithdraw}
        isLoading={isSubmitting}
      />
    </div>
  );
}
