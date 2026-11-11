import React from 'react';
import { TrendingUp, TrendingDown, Minus, Filter } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  changePercent?: number;
  icon: React.ReactNode;
  accentColor?: 'blue' | 'red' | 'amber' | 'emerald' | 'purple' | 'slate';
  badgeText?: string;
  actionHint?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function KPICard({
  title,
  value,
  subtitle,
  changePercent,
  icon,
  accentColor = 'blue',
  badgeText,
  actionHint,
  isActive = false,
  onClick,
}: KPICardProps) {
  const accentBorders = {
    blue: 'border-blue-200 dark:border-blue-900/50 hover:border-blue-400 dark:hover:border-blue-500 shadow-blue-500/10',
    red: 'border-rose-200 dark:border-rose-900/50 hover:border-rose-400 dark:hover:border-rose-500 shadow-rose-500/10',
    amber: 'border-amber-200 dark:border-amber-900/50 hover:border-amber-400 dark:hover:border-amber-500 shadow-amber-500/10',
    emerald: 'border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-emerald-500/10',
    purple: 'border-purple-200 dark:border-purple-900/50 hover:border-purple-400 dark:hover:border-purple-500 shadow-purple-500/10',
    slate: 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-slate-900/10',
  };

  const iconBgs = {
    blue: 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
    red: 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30',
    amber: 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
    emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
    purple: 'bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/30',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`glass-panel p-4 rounded-xl border transition-all duration-200 select-none ${
        isActive
          ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/70 dark:bg-blue-950/60 shadow-lg shadow-blue-500/20'
          : accentBorders[accentColor]
      } ${
        onClick
          ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-blue-400/50'
          : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase truncate">
          {title}
        </span>
        <div className={`p-2 rounded-lg shrink-0 ${iconBgs[accentColor]}`}>{icon}</div>
      </div>

      <div className="flex items-baseline justify-between gap-2 mt-1">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
          {typeof value === 'number' && Number.isNaN(value) ? 0 : value}
        </div>
        {badgeText && (
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 font-semibold uppercase">
            {badgeText}
          </span>
        )}
      </div>

      {(subtitle || (changePercent !== undefined && !Number.isNaN(changePercent))) && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
          <span className="truncate">{subtitle}</span>
          {changePercent !== undefined && !Number.isNaN(changePercent) && (
            <div
              className={`flex items-center gap-0.5 font-medium shrink-0 ${
                changePercent < 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : changePercent > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {changePercent < 0 ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : changePercent > 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              )}
              <span>
                {changePercent > 0 ? `+${changePercent}%` : `${changePercent}%`}
              </span>
            </div>
          )}
        </div>
      )}

      {actionHint && (
        <div className="mt-2 pt-1 flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
          <Filter className="w-3 h-3" />
          <span>{actionHint}</span>
        </div>
      )}
    </div>
  );
}
