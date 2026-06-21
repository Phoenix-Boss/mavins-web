// src/components/modals/WelcomeBonusModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';

interface WelcomeBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayFeatured: () => void;
}

export const WelcomeBonusModal = ({ isOpen, onClose, onPlayFeatured }: WelcomeBonusModalProps) => {
  const { theme } = useTheme();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(3);
      return;
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onPlayFeatured();
    }
  }, [isOpen, countdown, onPlayFeatured]);

  if (countdown > 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md" closeOnBackdropClick={false} closeOnEsc={false}>
        <div className="text-center py-8">
          <div className="text-6xl mb-4 animate-bounce">🎁</div>
          <h2 className={cn('text-2xl font-bold mb-2', theme.text)}>
            Welcome Bonus!
          </h2>
          <p className={cn('mb-6', theme.textSecondary)}>
            Claim your 500 bonus points by playing the featured track
          </p>
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white animate-pulse">
              {countdown}
            </div>
          </div>
          <p className={cn('text-sm mt-4', theme.textMuted)}>
            Starting in {countdown}...
          </p>
        </div>
      </Modal>
    );
  }

  return null;
};