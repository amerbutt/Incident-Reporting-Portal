'use client';

import React from 'react';
import { X, RotateCcw, Check, Filter, MapPin, Calendar, AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import { FilterState, DatePreset, IncidentCategory, IncidentSeverity, IncidentStatus } from '@/lib/types/incident';
import { Button } from '@/components/ui/Button';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
  facets: {
    subSectors: string[];
    streets: string[];
    categories: IncidentCategory[];
    types: string[];
    authorities: string[];
    severities: IncidentSeverity[];
    statuses: IncidentStatus[];
  };
}

export function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  facets,
}: FilterDrawerProps) {
  const [localFilters, setLocalFilters] = React.useState<FilterState>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const datePresets: DatePreset[] = [
    'All Time',
    'Today',
    'Yesterday',
    'Last 7 Days',
    'Last 15 Days',
    'Last 30 Days',
    'Current Month',
    'Previous Month',
    'Current Quarter',
    'Previous Quarter',
    'Current Year',
    'Custom Range',
  ];

  const toggleArrayItem = <T extends string>(arr: T[], item: T): T[] => {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
  };

  const handleReset = () => {
    const emptyFilters: FilterState = {
      datePreset: 'All Time',
      subSectors: [],
      streets: [],
      houseNo: '',
      addressSearch: '',
      categories: [],
      types: [],
      severities: [],
      statuses: [],
      authorities: [],
      searchQuery: '',
    };
    setLocalFilters(emptyFilters);
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-white">Global Filter Framework</h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-sm">
            {/* 1. Date Range Section */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" /> Date Preset
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {datePresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setLocalFilters({ ...localFilters, datePreset: preset })}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium text-left border transition-all ${
                      localFilters.datePreset === preset
                        ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800/60'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {localFilters.datePreset === 'Custom Range' && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={localFilters.customStartDate || ''}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, customStartDate: e.target.value })
                      }
                      className="w-full bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded border border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">End Date</label>
                    <input
                      type="date"
                      value={localFilters.customEndDate || ''}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, customEndDate: e.target.value })
                      }
                      className="w-full bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded border border-slate-700"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Location Filters */}
            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Sub-Sector
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['D-12/1', 'D-12/2', 'D-12/3', 'D-12/4'].map((sec) => {
                  const isChecked = localFilters.subSectors.includes(sec);
                  return (
                    <label
                      key={sec}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          setLocalFilters({
                            ...localFilters,
                            subSectors: toggleArrayItem(localFilters.subSectors, sec),
                          })
                        }
                        className="rounded border-slate-700 text-emerald-600 focus:ring-0"
                      />
                      <span>{sec}</span>
                    </label>
                  );
                })}
              </div>

              {/* Streets multi-select */}
              <div className="pt-2">
                <label className="text-xs text-slate-400 block mb-1.5">Street Filter</label>
                <div className="max-h-28 overflow-y-auto space-y-1 pr-1 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                  {facets.streets.map((st) => {
                    const isChecked = localFilters.streets.includes(st);
                    return (
                      <label
                        key={st}
                        className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer py-0.5"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            setLocalFilters({
                              ...localFilters,
                              streets: toggleArrayItem(localFilters.streets, st),
                            })
                          }
                          className="rounded border-slate-700 text-blue-600 focus:ring-0"
                        />
                        <span>{st}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* House No Search */}
              <div className="pt-1">
                <label className="text-xs text-slate-400 block mb-1">House No. / Plot</label>
                <input
                  type="text"
                  placeholder="e.g. 42 or 18-B"
                  value={localFilters.houseNo || ''}
                  onChange={(e) => setLocalFilters({ ...localFilters, houseNo: e.target.value })}
                  className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700"
                />
              </div>
            </div>

            {/* 3. Severity & Status */}
            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Incident Severity
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Critical', 'High', 'Medium', 'Low'] as IncidentSeverity[]).map((sev) => {
                  const isChecked = localFilters.severities.includes(sev);
                  return (
                    <label
                      key={sev}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          setLocalFilters({
                            ...localFilters,
                            severities: toggleArrayItem(localFilters.severities, sev),
                          })
                        }
                        className="rounded border-slate-700 text-amber-500 focus:ring-0"
                      />
                      <span>{sev}</span>
                    </label>
                  );
                })}
              </div>

              {/* Status */}
              <div className="pt-2">
                <label className="text-xs text-slate-400 block mb-1.5">Status Filter</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Open', 'In Progress', 'Closed', 'Pending Authority'] as IncidentStatus[]).map((stat) => {
                    const isChecked = localFilters.statuses.includes(stat);
                    return (
                      <label
                        key={stat}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer ${
                          isChecked
                            ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            setLocalFilters({
                              ...localFilters,
                              statuses: toggleArrayItem(localFilters.statuses, stat),
                            })
                          }
                          className="rounded border-slate-700 text-blue-500 focus:ring-0"
                        />
                        <span className="truncate">{stat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. Incident Category & Types */}
            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-400" /> Categories
              </label>
              <div className="grid grid-cols-2 gap-2">
                {facets.categories.map((cat) => {
                  const isChecked = localFilters.categories.includes(cat);
                  return (
                    <label
                      key={cat}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer ${
                        isChecked
                          ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          setLocalFilters({
                            ...localFilters,
                            categories: toggleArrayItem(localFilters.categories, cat),
                          })
                        }
                        className="rounded border-slate-700 text-purple-500 focus:ring-0"
                      />
                      <span>{cat}</span>
                    </label>
                  );
                })}
              </div>

              {/* Authorities */}
              <div className="pt-2">
                <label className="text-xs text-slate-400 block mb-1.5">Authorities Involved</label>
                <div className="space-y-1 max-h-28 overflow-y-auto bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                  {facets.authorities.map((auth) => {
                    const isChecked = localFilters.authorities.includes(auth);
                    return (
                      <label
                        key={auth}
                        className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer py-0.5"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            setLocalFilters({
                              ...localFilters,
                              authorities: toggleArrayItem(localFilters.authorities, auth),
                            })
                          }
                          className="rounded border-slate-700 text-blue-600 focus:ring-0"
                        />
                        <span>{auth}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset All
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApply}
                icon={<Check className="w-3.5 h-3.5" />}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
