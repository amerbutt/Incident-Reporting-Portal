import React from 'react';
import { IncidentCategory, IncidentSeverity, IncidentStatus } from '@/lib/types/incident';
export function CategoryBadge({ category }: { category: IncidentCategory | string }) {
  const styles: Record<string, string> = {
    Crime: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    Security: 'bg-red-500/15 text-red-400 border-red-500/30',
    Wildlife: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    'Hazards & Misc': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    Safety: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    Community: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Utilities: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    Infrastructure: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    Traffic: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Other: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  };

  const style = styles[category] || styles.Other;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${style}`}>
      {category}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: IncidentSeverity | string }) {
  const styles: Record<string, { bg: string; dot: string }> = {
    Critical: { bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30', dot: 'bg-rose-500' },
    High: { bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dot: 'bg-amber-500' },
    Medium: { bg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-500' },
    Low: { bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-500' },
  };

  const current = styles[severity] || styles.Medium;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${current.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} animate-pulse`} />
      {severity}
    </span>
  );
}

export function StatusBadge({ status }: { status: IncidentStatus | string }) {
  const styles: Record<string, string> = {
    Open: 'bg-red-500/10 text-red-300 border-red-500/20',
    'In Progress': 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    Closed: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    'Pending Authority': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  };

  const style = styles[status] || 'bg-slate-700/30 text-slate-300 border-slate-600/30';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      {status}
    </span>
  );
}
