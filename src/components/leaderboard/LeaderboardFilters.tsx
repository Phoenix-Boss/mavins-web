'use client';

import { cn } from '@/lib/utils/cn';

export type FilterType = 'weekly' | 'monthly' | 'tier' | 'global';

export interface LeaderboardFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  selectedTier?: string;
  onTierChange?: (tier: string) => void;
}

const filters: { id: FilterType; label: string }[] = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'tier', label: 'Tier' },
  { id: 'global', label: 'Global' }
];

const tiers = ['T1', 'T2', 'T3', 'T4'];

export function LeaderboardFilters({
  activeFilter,
  onFilterChange,
  selectedTier,
  onTierChange,
}: LeaderboardFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              activeFilter === filter.id
                ? 'bg-amber-500 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>
      
      {activeFilter === 'tier' && onTierChange && (
        <div className="flex flex-wrap gap-2">
          {tiers.map((tier) => (
            <button
              key={tier}
              onClick={() => onTierChange(tier)}
              className={cn(
                'px-3 py-1 rounded-lg text-sm font-medium transition-all',
                selectedTier === tier
                  ? 'bg-purple-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              )}
            >
              {tier}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
