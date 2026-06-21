// src/components/profile/BadgeCollection.tsx
'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: Date;
}

interface BadgeCollectionProps {
  badges: Badge[];
}

export const BadgeCollection = ({ badges }: BadgeCollectionProps) => {
  const earnedBadges = badges.filter(b => b.earnedAt);
  const lockedBadges = badges.filter(b => !b.earnedAt);

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Badges Earned</h3>
      <div className="grid grid-cols-3 gap-3">
        {earnedBadges.map((badge) => (
          <div key={badge.id} className="text-center group cursor-pointer">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center text-3xl mb-2 shadow-lg">
              {badge.icon}
            </div>
            <p className="text-xs font-medium">{badge.name}</p>
            <p className="text-xs text-neutral-500 hidden group-hover:block">{badge.description}</p>
          </div>
        ))}
        {lockedBadges.map((badge) => (
          <div key={badge.id} className="text-center group cursor-pointer">
            <div className="w-16 h-16 mx-auto rounded-full bg-neutral-800 flex items-center justify-center text-3xl opacity-50 mb-2">
              ?
            </div>
            <p className="text-xs text-neutral-500">{badge.name}</p>
            <p className="text-xs text-neutral-600 hidden group-hover:block">{badge.description}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};
