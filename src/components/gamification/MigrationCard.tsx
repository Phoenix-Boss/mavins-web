// src/components/gamification/MigrationCard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';

interface MigrationCardProps {
  fromTier: string;
  toTier: string;
  perks: string[];
  expiresAt: Date;
  onClaim: () => void;
  onDismiss: () => void;
}

export const MigrationCard = ({ fromTier, toTier, perks, expiresAt, onClaim, onDismiss }: MigrationCardProps) => {
  const { theme } = useTheme();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft('Expired');
        clearInterval(timer);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (86400000)) / 3600000);
        setTimeLeft(`${days}d ${hours}h`);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onDismiss} />
      <Card className="relative z-10 max-w-md w-full p-6 text-center animate-slide-up">
        <div className="text-5xl mb-4">ðŸŽ‰</div>
        <h2 className="text-2xl font-bold mb-2">NEW COMMUNITY UNLOCKED!</h2>
        <p className={cn('text-sm mb-4', theme.textSecondary)}>
          {fromTier} â†’ {toTier}
        </p>
        <div className="space-y-2 mb-6">
          {perks.map((perk, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="text-green-400">âœ“</span>
              <span>{perk}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Button onClick={onClaim} fullWidth>Open New Community</Button>
          <Button onClick={onDismiss} variant="ghost">Review Later</Button>
        </div>
        <p className={cn('text-xs mt-4', theme.textMuted)}>Expires in: {timeLeft}</p>
      </Card>
    </div>
  );
};
