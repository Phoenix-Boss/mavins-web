// src/components/profile/ProfileHeader.tsx
'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';

interface ProfileHeaderProps {
  username: string;
  email?: string;
  points: number;
  streak: number;
  tier: string;
  joinedDate: string;
  isOwnProfile?: boolean;
  onEdit?: () => void;
}

export const ProfileHeader = ({
  username,
  email,
  points,
  streak,
  tier,
  joinedDate,
  isOwnProfile = false,
  onEdit
}: ProfileHeaderProps) => {
  const { theme } = useTheme();

  return (
    <Card className="relative overflow-hidden">
      <div className={cn('absolute inset-0 bg-gradient-to-r', theme.bg === 'bg-zinc-900' ? 'from-amber-500/20 to-purple-600/20' : 'from-amber-500/10 to-purple-600/10')} />
      <div className="relative z-10 p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{username}</h1>
              <Badge variant="accent">{tier}</Badge>
            </div>
            {email && <p className={cn('text-sm mt-1', theme.textSecondary)}>{email}</p>}
            <p className={cn('text-xs mt-2', theme.textMuted)}>Joined {joinedDate}</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-400">{points.toLocaleString()}</p>
              <p className={cn('text-xs', theme.textSecondary)}>Points</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold flex items-center justify-center gap-1">{streak} 🔥</p>
              <p className={cn('text-xs', theme.textSecondary)}>Streak</p>
            </div>
          </div>
        </div>
        {isOwnProfile && onEdit && (
          <div className="flex justify-center md:justify-end mt-4">
            <Button size="sm" variant="outline" onClick={onEdit}>Edit Profile</Button>
          </div>
        )}
      </div>
    </Card>
  );
};

