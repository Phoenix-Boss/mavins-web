// src/components/leaderboard/LeaderboardFilters.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface LeaderboardFiltersProps {
  activeFilter: 'global' | 'weekly' | 'monthly' | 'tier';
  onFilterChange: (filter: 'global' | 'weekly' | 'monthly' | 'tier') => void;
  selectedTier?: string;
  onTierChange?: (tier: string) => void;
}

const filters = [
  { id: 'global', label: 'All Time' },
  { id: 'weekly', label: 'This Week' },
  { id: 'monthly', label: 'This Month' },
  { id: 'tier', label: 'By Tier' }
];

const tiers = ['T4', 'T3', 'T2', 'T1'];

export const LeaderboardFilters = ({ activeFilter, onFilterChange, selectedTier = 'T4', onTierChange }: LeaderboardFiltersProps) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              activeFilter === filter.id
                ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>
      {activeFilter === 'tier' && onTierChange && (
        <div className="flex gap-2">
          {tiers.map((tier) => (
            <button
              key={tier}
              onClick={() => onTierChange(tier)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                selectedTier === tier
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              )}
            >
              {tier}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};



