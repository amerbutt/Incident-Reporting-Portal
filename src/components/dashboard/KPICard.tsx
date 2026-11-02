import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  changePercent?: number;
  icon: React.ReactNode;
  accentColor?: 'blue' | 'red' | 'amber' | 'emerald' | 'purple' | 'slate';
  badgeText?: string;
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
  onClick,
}: KPICardProps) {
  const accentBorders = {
    blue: 'border-blue-500/30 hover:border-blue-500/60 shadow-blue-500/10',
    red: 'border-rose-500/30 hover:border-rose-500/60 shadow-rose-500/10',
    amber: 'border-amber-500/30 hover:border-amber-500/60 shadow-amber-500/10',
    emerald: 'border-emerald-500/30 hover:border-emerald-500/60 shadow-emerald-500/10',
    purple: 'border-purple-500/30 hover:border-purple-500/60 shadow-purple-500/10',
    slate: 'border-slate-700/60 hover:border-slate-600 shadow-slate-900/20',
  };

  const iconBgs = {
    blue: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    red: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    slate: 'bg-slate-800 text-slate-300 border border-slate-700',
  };

  return (
    <div
      onClick={onClick}
      className={`glass-panel p-4 rounded-xl border transition-all duration-200 ${accentBorders[accentColor]} ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">{title}</span>
        <div className={`p-2 rounded-lg ${iconBgs[accentColor]}`}>{icon}</div>
      </div>

      <div className="flex items-baseline justify-between gap-2 mt-1">
        <div className="text-2xl font-bold tracking-tight text-white font-mono">{value}</div>
        {badgeText && (
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60 font-medium">
            {badgeText}
          </span>
        )}
      </div>

      {(subtitle || changePercent !== undefined) && (
        <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/50">
          <span className="truncate">{subtitle}</span>
          {changePercent !== undefined && (
            <div
              className={`flex items-center gap-0.5 font-medium shrink-0 ${
                changePercent < 0
                  ? 'text-emerald-400'
                  : changePercent > 0
                  ? 'text-rose-400'
                  : 'text-slate-400'
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
    </div>
  );
}
