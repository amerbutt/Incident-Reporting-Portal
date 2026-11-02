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
  ExternalLink,
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
  onApplyPreset,
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
      { id: 'id', label: 'Incident ID', visible: true },
      { id: 'fieldDate', label: 'Field Date', visible: true },
      { id: 'time', label: 'Time', visible: true },
      { id: 'subSector', label: 'Sub-Sector', visible: true },
      { id: 'streetNo', label: 'Street No.', visible: true },
      { id: 'houseNo', label: 'House No.', visible: true },
      { id: 'incidentType', label: 'Incident Type', visible: true },
      { id: 'incidentCategory', label: 'Category', visible: true },
      { id: 'incidentSeverity', label: 'Severity', visible: true },
      { id: 'status', label: 'Status', visible: true },
      { id: 'authorities', label: 'Authorities', visible: true },
      { id: 'briefDescription', label: 'Brief Description', visible: true },
      { id: 'address', label: 'Address', visible: false },
      { id: 'incidentReportWhatsApp', label: 'WhatsApp Dispatch', visible: false },
      { id: 'transcriptUrdu', label: 'Urdu Transcript', visible: false },
      { id: 'latLong', label: 'Coordinates', visible: false },
    ];

    const dynamicCols: ColumnDef[] = customFieldKeys.map((k) => ({
      id: `custom_${k}`,
      label: k,
      visible: false,
      isCustom: true,
    }));

    return [...standard, ...dynamicCols];
  }, [customFieldKeys]);

  const [columns, setColumns] = useState<ColumnDef[]>(initialColumns);

  // Synchronize when customFieldKeys change
  React.useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  // Handle Sort
  const handleSort = (field: keyof Incident) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and Sort
  const filteredSortedIncidents = useMemo(() => {
    let result = [...incidents];

    // Local Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (inc) =>
          inc.id.toLowerCase().includes(q) ||
          inc.briefDescription.toLowerCase().includes(q) ||
          inc.incidentType.toLowerCase().includes(q) ||
          inc.subSector.toLowerCase().includes(q) ||
          inc.streetNo.toLowerCase().includes(q) ||
          inc.authorities.toLowerCase().includes(q) ||
          inc.address.toLowerCase().includes(q) ||
          inc.incidentReportWhatsApp.toLowerCase().includes(q) ||
          inc.transcriptUrdu.includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      const valA = a[sortField] || '';
      const valB = b[sortField] || '';

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [incidents, searchTerm, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredSortedIncidents.length / pageSize));
  const paginatedIncidents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSortedIncidents.slice(start, start + pageSize);
  }, [filteredSortedIncidents, page, pageSize]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Incident ID',
      'Field Date',
      'Time',
      'Sub-Sector',
      'Street No.',
      'House No.',
      'Incident Type',
      'Incident Category',
      'Incident Severity',
      'Status',
      'Authorities',
      'Brief Description',
      'Address',
      'Lat Long',
      'WhatsApp Report',
      'Urdu Transcript',
      ...customFieldKeys,
    ];

    const rows = filteredSortedIncidents.map((inc) => {
      const row = [
        inc.id,
        inc.fieldDate,
        inc.time,
        inc.subSector,
        inc.streetNo,
        inc.houseNo,
        inc.incidentType,
        inc.incidentCategory,
        inc.incidentSeverity,
        inc.status,
        `"${inc.authorities.replace(/"/g, '""')}"`,
        `"${inc.briefDescription.replace(/"/g, '""')}"`,
        `"${inc.address.replace(/"/g, '""')}"`,
        inc.latLong,
        `"${inc.incidentReportWhatsApp.replace(/"/g, '""')}"`,
        `"${inc.transcriptUrdu.replace(/"/g, '""')}"`,
        ...customFieldKeys.map((k) => `"${(inc.customFields?.[k] || '').replace(/"/g, '""')}"`),
      ];
      return row.join(',');
    });

    // Add UTF-8 BOM so Urdu and special characters render cleanly in Excel
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `D12_Incident_Register_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export to Excel (.xlsx) via SheetJS
  const handleExportExcel = () => {
    const dataForSheet = filteredSortedIncidents.map((inc) => {
      const row: Record<string, string | number> = {
        'Incident ID': inc.id,
        'Field Date': inc.fieldDate,
        Time: inc.time,
        'Sub-Sector': inc.subSector,
        'Street No.': inc.streetNo,
        'House No.': inc.houseNo,
        'Incident Type': inc.incidentType,
        'Incident Category': inc.incidentCategory,
        'Incident Severity': inc.incidentSeverity,
        Status: inc.status,
        Authorities: inc.authorities,
        'Brief Description': inc.briefDescription,
        Address: inc.address,
        Coordinates: inc.latLong,
        'WhatsApp Report': inc.incidentReportWhatsApp,
        'Urdu Transcript': inc.transcriptUrdu,
      };

      if (inc.customFields) {
        Object.entries(inc.customFields).forEach(([k, v]) => {
          row[`[Custom] ${k}`] = v;
        });
      }

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'D12 Incidents Master');

    // Auto-fit column widths
    const maxCols = 16 + customFieldKeys.length;
    worksheet['!cols'] = Array(maxCols).fill({ wch: 18 });

    XLSX.writeFile(
      workbook,
      `D12_Incident_Intelligence_Master_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  // Saved Views Presets
  const savedViews = [
    { label: 'All Incidents', search: '' },
    { label: 'Critical Open', search: 'Critical' },
    { label: 'Police Cases', search: 'Police' },
    { label: 'Utilities (CDA/IESCO)', search: 'Utilities' },
    { label: 'Gas Leaks', search: 'Gas Leak' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Register Controls Strip */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search register table..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950 text-xs sm:text-sm text-slate-200 placeholder-slate-400 pl-10 pr-4 py-2 rounded-lg border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        {/* Saved Views Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none text-xs">
          <span className="text-slate-400 font-medium shrink-0 mr-1 flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5 text-blue-400" /> Views:
          </span>
          {savedViews.map((view) => (
            <button
              key={view.label}
              onClick={() => {
                setSearchTerm(view.search);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                searchTerm === view.search
                  ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
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
      <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                {columns
                  .filter((c) => c.visible)
                  .map((col) => {
                    const isSorted = sortField === col.id;
                    return (
                      <th
                        key={col.id}
                        onClick={() => handleSort(col.id as keyof Incident)}
                        className="p-3 font-bold hover:text-white cursor-pointer select-none whitespace-nowrap transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{col.label}</span>
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-blue-400" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-blue-400" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-600 opacity-60" />
                          )}
                        </div>
                      </th>
                    );
                  })}
                <th className="p-3 text-right font-bold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {paginatedIncidents.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.filter((c) => c.visible).length + 1}
                    className="p-8 text-center text-slate-400"
                  >
                    No incidents match the active search and filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedIncidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className="hover:bg-slate-900/60 transition-colors cursor-pointer group"
                  >
                    {columns
                      .filter((c) => c.visible)
                      .map((col) => {
                        return (
                          <td key={col.id} className="p-3 whitespace-nowrap">
                            {col.id === 'id' ? (
                              <span className="font-mono font-bold text-blue-400 group-hover:underline">
                                {inc.id}
                              </span>
                            ) : col.id === 'incidentCategory' ? (
                              <CategoryBadge category={inc.incidentCategory} />
                            ) : col.id === 'incidentSeverity' ? (
                              <SeverityBadge severity={inc.incidentSeverity} />
                            ) : col.id === 'status' ? (
                              <StatusBadge status={inc.status} />
                            ) : col.id === 'briefDescription' ? (
                              <span className="max-w-xs truncate block text-slate-300" title={inc.briefDescription}>
                                {inc.briefDescription}
                              </span>
                            ) : col.id === 'authorities' ? (
                              <span className="text-slate-300 font-medium">{inc.authorities}</span>
                            ) : col.id.startsWith('custom_') ? (
                              <span className="font-mono text-purple-300">
                                {inc.customFields?.[col.id.replace('custom_', '')] || '-'}
                              </span>
                            ) : (
                              <span className="text-slate-300">
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
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 font-medium transition-colors"
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
        <div className="px-4 py-3 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none"
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
              <strong className="text-white">{filteredSortedIncidents.length}</strong> incidents
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-200">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
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
