// src/components/ui/StatCard.tsx
'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  icon?: string;
}

export function StatCard({ label, value, change, positive, icon }: StatCardProps) {
  const { theme } = useTheme();
  
  return (
    <div className={cn('p-4 rounded-xl border', theme.bgCard, theme.border)}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn('text-sm', theme.textSecondary)}>{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {change && (
            <span className={`text-xs ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
              {change} vs last week
            </span>
          )}
        </div>
        {icon && (
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-xl', theme.bgTertiary)}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}