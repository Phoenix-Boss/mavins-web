// src/components/modals/BannerModal.tsx
'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

export const BannerModal = ({ isOpen, onClose, onStart }: BannerModalProps) => {
  const { theme } = useTheme();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-amber-500 to-purple-600 flex items-center justify-center text-4xl">
          🎵
        </div>
        <h2 className={cn('text-2xl font-bold mb-2', theme.text)}>
          Welcome to SoundWave
        </h2>
        <p className={cn('mb-6', theme.textSecondary)}>
          Complete tasks, earn points, and climb the leaderboards!
        </p>
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10">
            <span className="text-2xl">💰</span>
            <span className={cn('text-sm', theme.textSecondary)}>
              Earn points for every song you play
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10">
            <span className="text-2xl">📋</span>
            <span className={cn('text-sm', theme.textSecondary)}>
              Complete daily tasks for bonus rewards
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10">
            <span className="text-2xl">🔥</span>
            <span className={cn('text-sm', theme.textSecondary)}>
              Maintain your streak to unlock exclusive perks
            </span>
          </div>
        </div>
        <Button onClick={onStart} fullWidth>
          Get Started
        </Button>
      </div>
    </Modal>
  );
};