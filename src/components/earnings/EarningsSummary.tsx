"use client";

import { useTheme } from './theme-provider';

export interface EarnCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  accent?: boolean;
  onClick?: () => void;
  tooltip?: string;
}

export function EarnCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  accent = false,
  onClick,
  tooltip,
}: EarnCardProps) {
  const { theme } = useTheme();

  const CardWrapper = onClick ? 'button' : 'div';

  return (
    <CardWrapper
      onClick={onClick}
      title={tooltip}
      className={`
        relative p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border transition-all duration-200
        ${accent 
          ? `${theme.accentBg} text-white border-transparent hover:opacity-95` 
          : `${theme.bgCard} ${theme.border} hover:${theme.cardHover} cursor-default`
        }
        ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}
        focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900
      `}
      aria-label={tooltip || title}
    >
      {accent && (
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-400/20 to-amber-500/20 blur-xl opacity-50 pointer-events-none" />
      )}

      <div className="relative flex items-start justify-between z-10">
        <div className="flex-1 min-w-0">
          <p className={`text-xs sm:text-sm font-medium ${accent ? 'text-white/80' : theme.textSecondary}`}>
            {title}
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 truncate">
            {value}
          </p>
          {subtitle && (
            <p className={`text-xs mt-0.5 sm:mt-1 ${accent ? 'text-white/70' : theme.textSecondary}`}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-1.5 sm:mt-2 text-xs font-medium ${
              trend.positive ? 'text-emerald-400' : 'text-red-400'
            }`}>
              <span aria-hidden="true">{trend.positive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}% vs last week</span>
            </div>
          )}
        </div>

        <div 
          className={`
            w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl flex-shrink-0
            ${accent ? 'bg-white/20' : theme.bgTertiary}
          `}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>
    </CardWrapper>
  );
}
