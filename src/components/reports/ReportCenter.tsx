'use client';

import React, { useState } from 'react';
import { Incident, KPISummary, AreaRiskScore, CategoryHierarchyNode } from '@/lib/types/incident';
import { generateSinglePageCommunityPDF, ReportConfig } from '@/components/reports/PDFExportEngine';
import { Button } from '@/components/ui/Button';
import {
  FileText,
  Download,
  Printer,
  Shield,
  Layers,
  Calendar,
  Sparkles,
  MapPin,
  Clock,
  Compass,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface ReportCenterProps {
  incidents: Incident[];
  kpis: KPISummary;
  riskScores: AreaRiskScore[];
  categories: CategoryHierarchyNode[];
}

export function ReportCenter({
  incidents,
  kpis,
  riskScores,
  categories,
}: ReportCenterProps) {
  const [reportingPeriod, setReportingPeriod] = useState<string>('All Historical Records (2026)');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    try {
      generateSinglePageCommunityPDF(incidents, kpis, riskScores, {
        reportingPeriod,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const wildlifeCount = incidents.filter(
    (i) => i.incidentCategory === 'Wildlife' || i.incidentType.toLowerCase().includes('snake')
  ).length;

  const crimeCount = incidents.filter(
    (i) => i.incidentCategory === 'Crime' || i.incidentCategory === 'Security'
  ).length;

  const subSectors = ['D-12/1', 'D-12/2', 'D-12/3', 'D-12/4'];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Sector D-12 Single-Page Community Report
            </h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30">
              1-Page Self-Explanatory
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Engineered strictly for a single A4 page. Perfect for D-12 resident committee meetings, community review, and emergency oversight.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
          >
            Print
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            icon={<Download className="w-4 h-4" />}
          >
            {isGenerating ? 'Building Single-Page PDF...' : 'Download 1-Page PDF'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Configuration Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Report Customization
            </h3>

            {/* Reporting Period */}
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1.5 font-medium">
                Reporting Period Label
              </label>
              <input
                type="text"
                value={reportingPeriod}
                onChange={(e) => setReportingPeriod(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* What is included checklist */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold block">
                Included in Single Page:
              </span>
              <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>D-12 Community Executive Summary</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>6 Core Strategic Community Metrics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Sub-Sector Breakdown (D-12/1 to D-12/4)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Temporal 8–11 PM Risk Profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Hotspot Streets (Street 144, etc.)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Actionable Resident Directives</span>
                </li>
              </ul>
            </div>

            {/* Download Button */}
            <Button
              variant="primary"
              className="w-full text-xs py-2.5 mt-2 shadow-md"
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              icon={<Download className="w-4 h-4" />}
            >
              {isGenerating ? 'Building Single-Page PDF...' : 'Download 1-Page PDF'}
            </Button>
          </div>
        </div>

        {/* Right Column: Live High-Fidelity 1-Page Report Preview */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 shadow-xl">
          {/* Document Header Preview */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] tracking-widest uppercase font-bold text-blue-600 dark:text-blue-400">
                  SECTOR D-12 SECURITY COMMITTEE
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  Sector D-12 Security Committee Incident Report
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  D12 Security Committee • Official Incident Operations & Safety Intelligence Brief
                </p>
              </div>

              <div className="text-right text-xs font-mono text-slate-500 dark:text-slate-400">
                <span className="block font-bold text-slate-800 dark:text-slate-200">EXECUTIVE BRIEF</span>
                <span suppressHydrationWarning>Date: {new Date().toLocaleDateString('en-US')}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-medium">
                Period: {reportingPeriod}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {incidents.length} Verified Master Entries
              </span>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              1. Community Executive Summary
            </h4>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#090d16] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
              A consolidated single-page briefing of {incidents.length} verified community incident records across Sector D-12, Islamabad. Wildlife encounters (principally snakes from the adjacent Margalla hills) account for {wildlifeCount} cases, while Crime & Security alerts total {crimeCount}. Sub-Sector {kpis.mostAffectedSubSector || 'D-12/3'} exhibits the highest event density, with Street {kpis.mostAffectedStreet || '144'} emerging as the primary hotspot. Peak reporting is concentrated between 8:00 PM and 11:00 PM.
            </p>
          </div>

          {/* Section 2: Key Metrics 6-Card Preview */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              2. Core Strategic Metrics
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#090d16] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block">Total Incidents</span>
                <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">{incidents.length}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#090d16] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block">Active Unresolved</span>
                <span className="text-lg font-mono font-bold text-amber-600 dark:text-amber-400">{kpis.activeIncidents}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#090d16] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block">Critical Alerts</span>
                <span className="text-lg font-mono font-bold text-rose-600 dark:text-rose-400">{kpis.criticalCount + kpis.highCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#090d16] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block">Wildlife Sightings</span>
                <span className="text-lg font-mono font-bold text-teal-600 dark:text-teal-400">{wildlifeCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#090d16] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block">Crime & Security</span>
                <span className="text-lg font-mono font-bold text-purple-600 dark:text-purple-400">{crimeCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#090d16] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block">Top Hotspot</span>
                <span className="text-sm font-mono font-bold text-slate-900 dark:text-white truncate block">
                  {kpis.mostAffectedSubSector || 'D-12/3'} (St {kpis.mostAffectedStreet || '144'})
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Sub-Sector Breakdown Table */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              3. Sub-Sector Breakdown (D-12/1 to D-12/4)
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-900/80 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-2">Sub-Sector</th>
                    <th className="p-2 text-center">Incidents</th>
                    <th className="p-2 text-center">Share</th>
                    <th className="p-2">Resolution</th>
                    <th className="p-2 text-right">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono text-[11px]">
                  {subSectors.map((sub) => {
                    const subInc = incidents.filter((i) => i.subSector === sub);
                    const count = subInc.length;
                    const share = incidents.length > 0 ? Math.round((count / incidents.length) * 100) : 0;
                    const resolved = subInc.filter((i) => i.status === 'Closed').length;

                    return (
                      <tr key={sub} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                        <td className="p-2 font-bold text-slate-900 dark:text-slate-200">{sub}</td>
                        <td className="p-2 text-center">{count}</td>
                        <td className="p-2 text-center">{share}%</td>
                        <td className="p-2 font-sans text-slate-600 dark:text-slate-400">{resolved}/{count} Closed</td>
                        <td className="p-2 text-right font-sans font-bold">
                          <span className={count >= 15 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                            {count >= 15 ? 'High Watch' : 'Normal'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Actionable Directives Preview */}
          <div className="space-y-1.5 pt-1">
            <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              4. Actionable Resident Directives
            </h4>
            <div className="text-[11px] space-y-1 text-slate-600 dark:text-slate-300 bg-blue-50/60 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-200 dark:border-blue-900/40">
              <p>• <strong>Night Patrols:</strong> Intensify D12 Security Committee patrols between 8:00 PM – 11:00 PM along Street 144.</p>
              <p>• <strong>Wildlife Alerts:</strong> Exercise caution near green belts; report snake sightings immediately.</p>
              <p>• <strong>Street Lighting:</strong> Address non-functional lights in Sub-Sector D-12/3 to deter unauthorized entry.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
