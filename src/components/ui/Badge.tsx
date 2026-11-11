import React from 'react';
import { IncidentCategory, IncidentSeverity, IncidentStatus } from '@/lib/types/incident';

export function CategoryBadge({ category }: { category: IncidentCategory | string }) {
  const styles: Record<string, string> = {
    Crime: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30',
    Security: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
    Wildlife: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30',
    'Hazards & Misc': 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
    Safety: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30',
    Community: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
    Utilities: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
    Infrastructure: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/30',
    Traffic: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
    Other: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-400 dark:border-slate-500/30',
  };

  const style = styles[category] || styles.Other;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${style}`}>
      {category}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: IncidentSeverity | string }) {
  const styles: Record<string, { bg: string; dot: string }> = {
    Critical: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30',
      dot: 'bg-rose-500',
    },
    High: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
      dot: 'bg-amber-500',
    },
    Medium: {
      bg: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-400 dark:border-yellow-500/30',
      dot: 'bg-yellow-500',
    },
    Low: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
      dot: 'bg-emerald-500',
    },
  };

  const current = styles[severity] || styles.Medium;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold border ${current.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} animate-pulse`} />
      {severity}
    </span>
  );
}

export function StatusBadge({ status }: { status: IncidentStatus | string }) {
  const styles: Record<string, string> = {
    Open: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20',
    'In Progress': 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20',
    Closed: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
    'Pending Authority': 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
  };

  const style = styles[status] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/30 dark:text-slate-300 dark:border-slate-600/30';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      {status}
    </span>
  );
}
