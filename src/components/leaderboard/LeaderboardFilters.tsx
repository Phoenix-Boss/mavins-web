// src/components/leaderboard/LeaderboardFilters.tsx

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';'use client';
export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';import React from 'react';
export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';import { cn } from '@/lib/utils/cn';
export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';interface LeaderboardFiltersProps {

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';  activeFilter: 'global' | 'weekly' | 'monthly' | 'tier';

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';  onFilterChange: (filter: FilterType) => void;

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';  selectedTier?: string;

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';  onTierChange?: (tier: string) => void;

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';}

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';const filters = [

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';  { id: 'global', label: 'All Time' },

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';  { id: 'weekly', label: 'This Week' },

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';  { id: 'monthly', label: 'This Month' },

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';  { id: 'tier', label: 'By Tier' }

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';];

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';const tiers = ['T4', 'T3', 'T2', 'T1'];

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';export const LeaderboardFilters = ({ activeFilter, onFilterChange, selectedTier = 'T4', onTierChange }: LeaderboardFiltersProps) => {

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';  return (

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';    <div className="space-y-4">

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';      <div className="flex gap-2 flex-wrap">

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';        {filters.map((filter) => (

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';          <button

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';            key={filter.id}

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';            onClick={() => onFilterChange(filter.id)}

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';            className={cn(

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';              'px-4 py-2 rounded-xl text-sm font-medium transition-all',

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';              activeFilter === filter.id

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';                ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white'

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';            )}

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';          >

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';            {filter.label}

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';          </button>

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';        ))}

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';      </div>

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';      {activeFilter === 'tier' && onTierChange && (

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';        <div className="flex gap-2">

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';          {tiers.map((tier) => (

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';            <button

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';              key={tier}

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';              onClick={() => onTierChange(tier)}

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';              className={cn(

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';                'px-4 py-2 rounded-xl text-sm font-medium transition-all',

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';                selectedTier === tier

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';              )}

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';            >

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';              {tier}

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';            </button>

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';          ))}

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';        </div>

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';      )}

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';    </div>

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';  );

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';};

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';
