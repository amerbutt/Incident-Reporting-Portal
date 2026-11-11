'use client';

import React from 'react';
import { Search, X, Calendar, SlidersHorizontal, AlertTriangle, ShieldCheck } from 'lucide-react';
import { FilterState, DatePreset, IncidentCategory, IncidentSeverity } from '@/lib/types/incident';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onOpenDrawer: () => void;
  totalFilteredCount: number;
}

export function FilterBar({ filters, onFilterChange, onOpenDrawer, totalFilteredCount }: FilterBarProps) {
  const datePresets: DatePreset[] = [
    'All Time',
    'Today',
    'Yesterday',
    'Last 7 Days',
    'Last 15 Days',
    'Last 30 Days',
    'Current Month',
  ];

  const severities: IncidentSeverity[] = ['Critical', 'High', 'Medium', 'Low'];

  const handleDatePresetClick = (preset: DatePreset) => {
    onFilterChange({
      ...filters,
      datePreset: preset,
    });
  };

  const handleSeverityToggle = (sev: IncidentSeverity) => {
    const exists = filters.severities.includes(sev);
    const newSeverities = exists
      ? filters.severities.filter((s) => s !== sev)
      : [...filters.severities, sev];
    onFilterChange({ ...filters, severities: newSeverities });
  };

  const handleClearAll = () => {
    onFilterChange({
      datePreset: 'All Time',
      subSectors: [],
      streets: [],
      categories: [],
      types: [],
      severities: [],
      statuses: [],
      authorities: [],
      searchQuery: '',
    });
  };

  // Collect active filters for tag chips
  const activeChips: { label: string; onRemove: () => void }[] = [];

  if (filters.datePreset !== 'All Time') {
    activeChips.push({
      label: `Date: ${filters.datePreset}`,
      onRemove: () => onFilterChange({ ...filters, datePreset: 'All Time' }),
    });
  }

  filters.subSectors.forEach((sec) => {
    activeChips.push({
      label: `Sector: ${sec}`,
      onRemove: () => onFilterChange({ ...filters, subSectors: filters.subSectors.filter((s) => s !== sec) }),
    });
  });

  filters.streets.forEach((st) => {
    activeChips.push({
      label: st,
      onRemove: () => onFilterChange({ ...filters, streets: filters.streets.filter((s) => s !== st) }),
    });
  });

  filters.categories.forEach((cat) => {
    activeChips.push({
      label: cat,
      onRemove: () => onFilterChange({ ...filters, categories: filters.categories.filter((c) => c !== cat) }),
    });
  });

  filters.severities.forEach((sev) => {
    activeChips.push({
      label: `Severity: ${sev}`,
      onRemove: () => onFilterChange({ ...filters, severities: filters.severities.filter((s) => s !== sev) }),
    });
  });

  filters.statuses.forEach((stat) => {
    activeChips.push({
      label: `Status: ${stat}`,
      onRemove: () => onFilterChange({ ...filters, statuses: filters.statuses.filter((s) => s !== stat) }),
    });
  });

  if (filters.searchQuery) {
    activeChips.push({
      label: `Search: "${filters.searchQuery}"`,
      onRemove: () => onFilterChange({ ...filters, searchQuery: '' }),
    });
  }

  return (
    <div className="bg-white/95 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5 space-y-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Keyword Search Input */}
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search Sector D-12 descriptions, WhatsApp reports, Urdu transcripts, streets..."
            className="w-full bg-slate-50 dark:bg-slate-950/80 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 pl-10 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Severity Quick Toggles */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold shrink-0 mr-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Severity:
          </span>
          {severities.map((sev) => {
            const isSelected = filters.severities.includes(sev);
            const sevColors: Record<IncidentSeverity, string> = {
              Critical: isSelected ? 'bg-rose-500 text-white border-rose-500' : 'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10',
              High: isSelected ? 'bg-amber-500 text-slate-950 border-amber-500' : 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 hover:bg-amber-50 dark:hover:bg-amber-500/10',
              Medium: isSelected ? 'bg-yellow-500 text-slate-950 border-yellow-500' : 'text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30 hover:bg-yellow-50 dark:hover:bg-yellow-500/10',
              Low: isSelected ? 'bg-emerald-500 text-white border-emerald-500' : 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
            };
            return (
              <button
                key={sev}
                onClick={() => handleSeverityToggle(sev)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${sevColors[sev]}`}
              >
                {sev}
              </button>
            );
          })}

          {/* More Filters button */}
          <button
            onClick={onOpenDrawer}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shrink-0 ml-1"
          >
            <SlidersHorizontal className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            Filters
          </button>
        </div>
      </div>

      {/* Date Presets Strip */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none text-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 dark:text-slate-400 font-semibold mr-1">Period:</span>
          {datePresets.map((preset) => {
            const isSelected = filters.datePreset === preset;
            return (
              <button
                key={preset}
                onClick={() => handleDatePresetClick(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {preset}
              </button>
            );
          })}
        </div>

        {/* Filter count match status */}
        <div className="text-xs text-slate-500 dark:text-slate-400 shrink-0 font-medium">
          Showing <span className="text-blue-600 dark:text-blue-400 font-bold">{totalFilteredCount}</span> matched incidents
        </div>
      </div>

      {/* Active Filter Chips Strip */}
      {activeChips.length > 0 && (
        <div className="max-w-7xl mx-auto flex items-center flex-wrap gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800/40">
          <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 mr-1 font-semibold">Active:</span>
          {activeChips.map((chip, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/70 font-medium"
            >
              {chip.label}
              <button
                onClick={chip.onRemove}
                className="hover:text-red-500 p-0.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={handleClearAll}
            className="text-xs text-red-600 dark:text-red-400 hover:underline font-semibold cursor-pointer ml-2"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
