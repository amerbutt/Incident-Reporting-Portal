'use client';

import React, { useMemo, useState } from 'react';
import { Incident } from '@/lib/types/incident';
import { calculateCalendarMatrix } from '@/lib/utils/analytics';
import { CategoryBadge, SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import { Calendar, Filter, Flame, Info, X, MapPin, Clock, Eye, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CalendarDashboardProps {
  incidents: Incident[];
  onFilterDate: (date: string) => void;
  onFilterType: (type: string) => void;
  onFilterCell: (type: string, date: string) => void;
  onSelectIncident?: (incident: Incident) => void;
}

export function CalendarDashboard({
  incidents,
  onFilterDate,
  onFilterType,
  onFilterCell,
  onSelectIncident,
}: CalendarDashboardProps) {
  const { incidentTypes, dates, matrix, maxCount } = useMemo(() => {
    return calculateCalendarMatrix(incidents);
  }, [incidents]);

  // Local drill-down selection state for instant incident card display
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Filter incidents for drill-down view below matrix
  const drillDownIncidents = useMemo(() => {
    if (!selectedDate && !selectedType) return [];
    return incidents.filter((inc) => {
      if (selectedDate && inc.fieldDate !== selectedDate) return false;
      if (selectedType && inc.incidentType !== selectedType) return false;
      return true;
    });
  }, [incidents, selectedDate, selectedType]);

  const handleCellClick = (type: string, dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedType(type);
    onFilterCell(type, dateStr);
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedType(null);
    onFilterDate(dateStr);
  };

  const handleTypeClick = (type: string) => {
    setSelectedType(type);
    setSelectedDate(null);
    onFilterType(type);
  };

  const handleClearSelection = () => {
    setSelectedDate(null);
    setSelectedType(null);
  };

  // Color generator based on intensity
  const getHeatmapColor = (count: number, isSelected: boolean) => {
    if (isSelected) {
      return 'ring-2 ring-blue-500 bg-blue-500 text-white font-bold shadow-md';
    }
    if (count === 0) {
      return 'bg-slate-100 dark:bg-slate-950/40 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800/50';
    }
    if (count <= 2) {
      return 'bg-amber-100 dark:bg-amber-400/25 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-400/40 hover:bg-amber-200 font-bold';
    }
    if (count <= 4) {
      return 'bg-orange-200 dark:bg-orange-500/50 text-orange-950 dark:text-white border-orange-400/60 hover:bg-orange-300 font-bold shadow-sm';
    }
    return 'bg-rose-600 text-white border-rose-400 hover:bg-rose-500 font-extrabold shadow-md animate-pulse';
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
    <div className="space-y-6">
      {/* Header Description & Heatmap Key */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Calendar Matrix Intelligence
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sector D-12 chronological incident heat matrix. <strong>Click any cell or date</strong> to immediately view matching incidents with details below.
          </p>
        </div>

        {/* Heatmap Legend */}
        <div className="flex items-center gap-3 text-xs bg-slate-100 dark:bg-slate-950/70 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-600 dark:text-slate-400 font-semibold mr-1">Intensity:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-750" />
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">0</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-200 dark:bg-amber-400/40 border border-amber-300 dark:border-amber-400/50" />
            <span className="text-amber-700 dark:text-amber-400 text-[11px]">1–2 Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-orange-300 dark:bg-orange-500/60 border border-orange-400 dark:border-orange-400/60" />
            <span className="text-orange-700 dark:text-orange-400 text-[11px]">3–4 Med</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-rose-600 border border-rose-400" />
            <span className="text-rose-700 dark:text-rose-400 text-[11px]">5+ High</span>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800">
                {/* Incident Type Header */}
                <th className="p-3 text-left font-bold text-slate-700 dark:text-slate-300 min-w-[200px] sticky left-0 bg-slate-100 dark:bg-slate-950 z-10 border-r border-slate-200 dark:border-slate-800">
                  Incident Typology
                </th>

                {/* Date Columns */}
                {dates.map((dateStr) => {
                  const dayNum = dateStr.split('-')[2] || dateStr;
                  const monthNum = dateStr.split('-')[1];
                  const isDateSelected = selectedDate === dateStr;

                  return (
                    <th
                      key={dateStr}
                      onClick={() => handleDateClick(dateStr)}
                      className={`p-2 text-center cursor-pointer transition-colors border-r border-slate-200 dark:border-slate-800/60 min-w-[40px] group ${
                        isDateSelected
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900/80 hover:text-blue-600'
                      }`}
                      title={`Click to filter to ${dateStr}`}
                    >
                      <div className="font-mono text-xs font-bold">
                        {parseInt(dayNum, 10)}
                      </div>
                      <div className="text-[9px] uppercase opacity-75">{monthNum}/26</div>
                    </th>
                  );
                })}

                {/* Total Column Header */}
                <th className="p-3 text-center font-bold text-slate-800 dark:text-slate-200 min-w-[65px] bg-slate-200/60 dark:bg-slate-900/80">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {incidentTypes.map((type) => {
                const total = typeTotals[type] || 0;
                const isTypeSelected = selectedType === type;

                return (
                  <tr
                    key={type}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors ${
                      isTypeSelected ? 'bg-blue-50/60 dark:bg-blue-950/30' : ''
                    }`}
                  >
                    {/* Row Header: Incident Type */}
                    <td
                      onClick={() => handleTypeClick(type)}
                      className="p-3 font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer sticky left-0 bg-white dark:bg-[#0f172a] z-10 border-r border-slate-200 dark:border-slate-800 truncate max-w-[200px] flex items-center justify-between"
                      title={`Filter to ${type}`}
                    >
                      <span className="truncate">{type}</span>
                      <Filter className="w-3 h-3 text-slate-400 hover:text-blue-500 shrink-0 ml-1.5" />
                    </td>

                    {/* Matrix Cells */}
                    {dates.map((dateStr) => {
                      const count = (matrix[type] && matrix[type][dateStr]) || 0;
                      const isCellSelected = selectedDate === dateStr && selectedType === type;
                      const colorClass = getHeatmapColor(count, isCellSelected);

                      return (
                        <td
                          key={dateStr}
                          onClick={() => handleCellClick(type, dateStr)}
                          className="p-1 text-center border-r border-slate-200 dark:border-slate-800/60 cursor-pointer select-none"
                          title={`${type} on ${dateStr}: ${count} incidents (Click to view)`}
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
                    <td className="p-2 text-center font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100/50 dark:bg-slate-900/40">
                      {total}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Bottom Summary Row: Daily Totals */}
            <tfoot>
              <tr className="bg-slate-100 dark:bg-slate-950/90 font-bold border-t border-slate-300 dark:border-slate-700">
                <td className="p-3 text-slate-700 dark:text-slate-300 uppercase tracking-wide text-xs sticky left-0 bg-slate-100 dark:bg-slate-950 z-10 border-r border-slate-200 dark:border-slate-800">
                  Daily Volume
                </td>
                {dates.map((dateStr) => (
                  <td
                    key={dateStr}
                    onClick={() => handleDateClick(dateStr)}
                    className="p-2 text-center font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer border-r border-slate-200 dark:border-slate-800/60"
                  >
                    {dailyTotals[dateStr]}
                  </td>
                ))}
                <td className="p-2 text-center font-mono text-sm text-emerald-600 dark:text-emerald-400 bg-slate-200/60 dark:bg-slate-900/80">
                  {incidents.length}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Drill-Down Incident List Below Calendar Matrix */}
      {(selectedDate || selectedType) && (
        <div className="glass-panel p-5 rounded-2xl border-2 border-blue-400 dark:border-blue-600 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                Filtered Incidents for Selection
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold">
                  {drillDownIncidents.length} Records
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedDate && `Date: ${selectedDate}`} {selectedDate && selectedType && '•'}{' '}
                {selectedType && `Typology: ${selectedType}`}
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearSelection}
              icon={<X className="w-3.5 h-3.5" />}
            >
              Clear Selection
            </Button>
          </div>

          {drillDownIncidents.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              No specific incidents recorded for this cell intersection.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {drillDownIncidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncident && onSelectIncident(inc)}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        {inc.id}
                      </span>
                      <div className="flex items-center gap-1">
                        <CategoryBadge category={inc.incidentCategory} />
                        <SeverityBadge severity={inc.incidentSeverity} />
                        <StatusBadge status={inc.status} />
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1 mb-1">
                      {inc.incidentType}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {inc.briefDescription}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-medium truncate">
                      {inc.subSector}, {inc.streetNo}
                    </span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      View Dossier <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Instructions card */}
      <div className="flex items-center gap-2 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-xs text-blue-800 dark:text-blue-300">
        <Info className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <span>
          <strong>Community Drill-Down:</strong> Click any cell to inspect the incidents logged on that date. Click any date header to inspect all incidents on that day, or click any typology row to inspect that specific concern.
        </span>
      </div>
    </div>
  );
}
