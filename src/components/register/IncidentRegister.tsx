'use client';

import React, { useState, useMemo } from 'react';
import {
  Incident,
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus,
} from '@/lib/types/incident';
import { CategoryBadge, SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ColumnManagerModal, ColumnDef } from '@/components/register/ColumnManagerModal';
import {
  Search,
  Download,
  FileSpreadsheet,
  Columns3,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Bookmark,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface IncidentRegisterProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onApplyPreset?: (presetName: string) => void;
}

export function IncidentRegister({
  incidents,
  onSelectIncident,
}: IncidentRegisterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Incident>('fieldDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

  // Discover all dynamic custom fields from incidents
  const customFieldKeys = useMemo(() => {
    const keys = new Set<string>();
    incidents.forEach((inc) => {
      if (inc.customFields) {
        Object.keys(inc.customFields).forEach((k) => keys.add(k));
      }
    });
    return Array.from(keys);
  }, [incidents]);

  // Initial column definitions
  const initialColumns: ColumnDef[] = useMemo(() => {
    const standard: ColumnDef[] = [
      { id: 'id', label: 'Incident ID', visible: true, locked: true },
      { id: 'fieldDate', label: 'Date', visible: true },
      { id: 'time', label: 'Time', visible: true },
      { id: 'subSector', label: 'Sub-Sector', visible: true },
      { id: 'streetNo', label: 'Street No', visible: true },
      { id: 'houseNo', label: 'House No', visible: true },
      { id: 'incidentType', label: 'Typology', visible: true },
      { id: 'incidentCategory', label: 'Category', visible: true },
      { id: 'incidentSeverity', label: 'Severity', visible: true },
      { id: 'status', label: 'Status', visible: true },
      { id: 'briefDescription', label: 'Brief Description', visible: true },
      { id: 'authorities', label: 'Authorities', visible: true },
    ];

    const dynamicCols: ColumnDef[] = customFieldKeys.map((key) => ({
      id: `custom_${key}`,
      label: key,
      visible: true,
    }));

    return [...standard, ...dynamicCols];
  }, [customFieldKeys]);

  const [columns, setColumns] = useState<ColumnDef[]>(initialColumns);

  // Filter and sort incidents
  const filteredSortedIncidents = useMemo(() => {
    let result = [...incidents];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.briefDescription.toLowerCase().includes(q) ||
          i.incidentType.toLowerCase().includes(q) ||
          i.incidentCategory.toLowerCase().includes(q) ||
          i.subSector.toLowerCase().includes(q) ||
          i.streetNo.toLowerCase().includes(q) ||
          i.houseNo.toLowerCase().includes(q) ||
          i.authorities.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField.startsWith('custom_')) {
        const customKey = sortField.replace('custom_', '');
        valA = a.customFields?.[customKey] || '';
        valB = b.customFields?.[customKey] || '';
      }

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [incidents, searchTerm, sortField, sortDirection]);

  // Paginated incidents
  const totalPages = Math.ceil(filteredSortedIncidents.length / pageSize) || 1;
  const paginatedIncidents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSortedIncidents.slice(start, start + pageSize);
  }, [filteredSortedIncidents, page, pageSize]);

  const handleSort = (fieldId: keyof Incident) => {
    if (sortField === fieldId) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(fieldId);
      setSortDirection('asc');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const visibleCols = columns.filter((c) => c.visible);
    const headers = visibleCols.map((c) => c.label);
    const rows = filteredSortedIncidents.map((inc) =>
      visibleCols.map((c) => {
        if (c.id.startsWith('custom_')) {
          const k = c.id.replace('custom_', '');
          return `"${(inc.customFields?.[k] || '').replace(/"/g, '""')}"`;
        }
        return `"${String(inc[c.id as keyof Incident] || '').replace(/"/g, '""')}"`;
      })
    );
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `D12_Incidents_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Export Excel
  const handleExportExcel = () => {
    const visibleCols = columns.filter((c) => c.visible);
    const data = filteredSortedIncidents.map((inc) => {
      const row: Record<string, string> = {};
      visibleCols.forEach((c) => {
        if (c.id.startsWith('custom_')) {
          const k = c.id.replace('custom_', '');
          row[c.label] = inc.customFields?.[k] || '';
        } else {
          row[c.label] = String(inc[c.id as keyof Incident] || '');
        }
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'D12 Incidents');
    XLSX.writeFile(wb, `D12_Incidents_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const savedViews = [
    { label: 'All Incidents', search: '' },
    { label: 'Wildlife (Snakes)', search: 'Wildlife' },
    { label: 'Crime / Theft', search: 'Theft' },
    { label: 'Hotspot D-12/3', search: 'D-12/3' },
    { label: 'Street 144', search: '144' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Register Controls Strip */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search incident table..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        {/* Saved Views Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-semibold shrink-0 mr-1 flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Quick Views:
          </span>
          {savedViews.map((view) => (
            <button
              key={view.label}
              onClick={() => {
                setSearchTerm(view.search);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                searchTerm === view.search
                  ? 'bg-blue-100 dark:bg-blue-600/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/50'
                  : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>

        {/* Action Buttons: Column Manager, Export CSV, Export Excel */}
        <div className="flex items-center gap-2 shrink-0 justify-end">
          <Button
            variant="glass"
            size="sm"
            onClick={() => setIsColumnModalOpen(true)}
            icon={<Columns3 className="w-3.5 h-3.5" />}
          >
            Columns
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportExcel}
            icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
          >
            Excel
          </Button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                {columns
                  .filter((c) => c.visible)
                  .map((col) => {
                    const isSorted = sortField === col.id;
                    return (
                      <th
                        key={col.id}
                        onClick={() => handleSort(col.id as keyof Incident)}
                        className="p-3 font-bold hover:text-blue-600 dark:hover:text-white cursor-pointer select-none whitespace-nowrap transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{col.label}</span>
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                          )}
                        </div>
                      </th>
                    );
                  })}
                <th className="p-3 text-right font-bold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {paginatedIncidents.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.filter((c) => c.visible).length + 1}
                    className="p-8 text-center text-slate-500"
                  >
                    No incidents match the active search and filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedIncidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors cursor-pointer group"
                  >
                    {columns
                      .filter((c) => c.visible)
                      .map((col) => {
                        return (
                          <td key={col.id} className="p-3 whitespace-nowrap">
                            {col.id === 'id' ? (
                              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                                {inc.id}
                              </span>
                            ) : col.id === 'incidentCategory' ? (
                              <CategoryBadge category={inc.incidentCategory} />
                            ) : col.id === 'incidentSeverity' ? (
                              <SeverityBadge severity={inc.incidentSeverity} />
                            ) : col.id === 'status' ? (
                              <StatusBadge status={inc.status} />
                            ) : col.id === 'briefDescription' ? (
                              <span className="max-w-xs truncate block text-slate-700 dark:text-slate-300" title={inc.briefDescription}>
                                {inc.briefDescription}
                              </span>
                            ) : col.id === 'authorities' ? (
                              <span className="text-slate-700 dark:text-slate-300 font-medium">{inc.authorities}</span>
                            ) : col.id.startsWith('custom_') ? (
                              <span className="font-mono text-purple-600 dark:text-purple-300">
                                {inc.customFields?.[col.id.replace('custom_', '')] || '-'}
                              </span>
                            ) : (
                              <span className="text-slate-700 dark:text-slate-300">
                                {String(inc[col.id as keyof Incident] || '-')}
                              </span>
                            )}
                          </td>
                        );
                      })}

                    {/* Action column */}
                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIncident(inc);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-100 dark:hover:bg-blue-600/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 font-semibold transition-colors"
                      >
                        <Eye className="w-3 h-3" /> Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Strip */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="ml-2">
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, filteredSortedIncidents.length)} of{' '}
              <strong className="text-slate-900 dark:text-white">{filteredSortedIncidents.length}</strong> incidents
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-800 dark:text-slate-200">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Column Manager Modal */}
      <ColumnManagerModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        columns={columns}
        onChangeColumns={setColumns}
        onResetColumns={() => setColumns(initialColumns)}
      />
    </div>
  );
}
