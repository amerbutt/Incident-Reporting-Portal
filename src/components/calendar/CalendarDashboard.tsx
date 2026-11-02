'use client';

import React, { useMemo } from 'react';
import { Incident } from '@/lib/types/incident';
import { calculateCalendarMatrix } from '@/lib/utils/analytics';
import { Calendar, Filter, Flame, Info } from 'lucide-react';

interface CalendarDashboardProps {
  incidents: Incident[];
  onFilterDate: (date: string) => void;
  onFilterType: (type: string) => void;
  onFilterCell: (type: string, date: string) => void;
}

export function CalendarDashboard({
  incidents,
  onFilterDate,
  onFilterType,
  onFilterCell,
}: CalendarDashboardProps) {
  const { incidentTypes, dates, matrix, maxCount } = useMemo(() => {
    return calculateCalendarMatrix(incidents);
  }, [incidents]);

  // Color generator based on PRD requirements:
  // White/Dark = 0, Yellow = Low, Orange = Medium, Red = High
  const getHeatmapColor = (count: number) => {
    if (count === 0) {
      return 'bg-slate-950/40 text-slate-600 border-slate-850 hover:bg-slate-800/50';
    }
    if (count <= 2) {
      // Yellow = Low
      return 'bg-amber-400/25 text-amber-300 border-amber-400/40 hover:bg-amber-400/40 font-bold';
    }
    if (count <= 4) {
      // Orange = Medium
      return 'bg-orange-500/50 text-white border-orange-400/60 hover:bg-orange-500/70 font-bold shadow-sm shadow-orange-500/20';
    }
    // Red = High
    return 'bg-rose-600 text-white border-rose-400 hover:bg-rose-500 font-extrabold shadow-md shadow-rose-600/30 animate-pulse';
  };

  // Daily totals
  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    dates.forEach((d) => {
      let sum = 0;
      incidentTypes.forEach((t) => {
        sum += (matrix[t] && matrix[t][d]) || 0;
      });
      totals[d] = sum;
    });
    return totals;
  }, [dates, incidentTypes, matrix]);

  // Type totals
  const typeTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    incidentTypes.forEach((t) => {
      let sum = 0;
      dates.forEach((d) => {
        sum += (matrix[t] && matrix[t][d]) || 0;
      });
      totals[t] = sum;
    });
    return totals;
  }, [incidentTypes, dates, matrix]);

  return (
    <div className="space-y-4">
      {/* Header Description & Heatmap Key */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Calendar Intelligence Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-tabulation of Incident Typology against chronological reporting dates. Click any column, row, or cell to drill down.
          </p>
        </div>

        {/* Heatmap Legend */}
        <div className="flex items-center gap-3 text-xs bg-slate-950/70 px-3.5 py-2 rounded-lg border border-slate-800">
          <span className="text-slate-400 font-semibold mr-1">Intensity Scale:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-slate-900 border border-slate-750" />
            <span className="text-slate-400 text-[11px]">0 Zero</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-amber-400/30 border border-amber-400/50" />
            <span className="text-amber-400 text-[11px]">1–2 Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-orange-500/60 border border-orange-400/60" />
            <span className="text-orange-400 text-[11px]">3–4 Med</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-rose-600 border border-rose-400" />
            <span className="text-rose-400 text-[11px]">5+ High</span>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800">
                {/* Incident Type Header */}
                <th className="p-3 text-left font-bold text-slate-300 min-w-[200px] sticky left-0 bg-slate-950 z-10 border-r border-slate-800">
                  Incident Type
                </th>

                {/* Date Columns */}
                {dates.map((dateStr) => {
                  const dayNum = dateStr.split('-')[2] || dateStr;
                  const monthNum = dateStr.split('-')[1];
                  return (
                    <th
                      key={dateStr}
                      onClick={() => onFilterDate(dateStr)}
                      className="p-2 text-center text-slate-400 hover:text-blue-400 hover:bg-slate-900/80 cursor-pointer transition-colors border-r border-slate-800/60 min-w-[38px] group"
                      title={`Filter to ${dateStr}`}
                    >
                      <div className="font-mono text-xs font-bold text-slate-200 group-hover:text-blue-400">
                        {parseInt(dayNum, 10)}
                      </div>
                      <div className="text-[9px] text-slate-500 uppercase">{monthNum}/26</div>
                    </th>
                  );
                })}

                {/* Total Column Header */}
                <th className="p-3 text-center font-bold text-slate-200 min-w-[65px] bg-slate-900/80">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {incidentTypes.map((type) => {
                const total = typeTotals[type] || 0;

                return (
                  <tr key={type} className="hover:bg-slate-900/40 transition-colors">
                    {/* Row Header: Incident Type */}
                    <td
                      onClick={() => onFilterType(type)}
                      className="p-3 font-semibold text-slate-200 hover:text-blue-400 cursor-pointer sticky left-0 bg-slate-950 z-10 border-r border-slate-800 truncate max-w-[200px] flex items-center justify-between"
                      title={`Filter to ${type}`}
                    >
                      <span className="truncate">{type}</span>
                      <Filter className="w-3 h-3 text-slate-600 hover:text-blue-400 shrink-0 ml-1.5" />
                    </td>

                    {/* Matrix Cells */}
                    {dates.map((dateStr) => {
                      const count = (matrix[type] && matrix[type][dateStr]) || 0;
                      const colorClass = getHeatmapColor(count);

                      return (
                        <td
                          key={dateStr}
                          onClick={() => onFilterCell(type, dateStr)}
                          className="p-1 text-center border-r border-slate-800/60 cursor-pointer select-none"
                          title={`${type} on ${dateStr}: ${count} incidents`}
                        >
                          <div
                            className={`w-7 h-7 mx-auto rounded-md flex items-center justify-center font-mono text-[11px] border transition-all ${colorClass}`}
                          >
                            {count > 0 ? count : '·'}
                          </div>
                        </td>
                      );
                    })}

                    {/* Row Total */}
                    <td className="p-2 text-center font-mono font-bold text-slate-200 bg-slate-900/40">
                      {total}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Bottom Summary Row: Daily Totals */}
            <tfoot>
              <tr className="bg-slate-950/90 font-bold border-t border-slate-700">
                <td className="p-3 text-slate-300 uppercase tracking-wide text-xs sticky left-0 bg-slate-950 z-10 border-r border-slate-800">
                  Daily Volume
                </td>
                {dates.map((dateStr) => (
                  <td
                    key={dateStr}
                    onClick={() => onFilterDate(dateStr)}
                    className="p-2 text-center font-mono text-xs text-blue-400 hover:text-white hover:bg-slate-800 cursor-pointer border-r border-slate-800/60"
                  >
                    {dailyTotals[dateStr]}
                  </td>
                ))}
                <td className="p-2 text-center font-mono text-sm text-emerald-400 bg-slate-900/80">
                  {incidents.length}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Instructions card */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
        <Info className="w-4 h-4 shrink-0 text-blue-400" />
        <span>
          <strong>Pro-tip:</strong> Click any cell to view incidents matching that exact day and type. Click any date header to focus the portal on that day, or click any incident type to inspect that classification.
        </span>
      </div>
    </div>
  );
}
