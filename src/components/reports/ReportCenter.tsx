'use client';

import React, { useState } from 'react';
import { Incident, KPISummary, AreaRiskScore, CategoryHierarchyNode } from '@/lib/types/incident';
import { generateExecutivePDF, ReportConfig } from '@/components/reports/PDFExportEngine';
import { Button } from '@/components/ui/Button';
import {
  FileText,
  Download,
  Printer,
  CheckSquare,
  Square,
  Shield,
  Layers,
  Calendar,
  Sparkles,
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
  const [config, setConfig] = useState<ReportConfig>({
    reportingPeriod: 'Trailing 30 Days (Oct–Nov 2026)',
    includeKPIs: true,
    includeTrends: true,
    includeRiskAreas: true,
    includeRegister: true,
    includeRecommendations: true,
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    try {
      generateExecutivePDF(incidents, kpis, riskScores, config);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const securityCount = incidents.filter((i) => i.incidentCategory === 'Security').length;
  const securityPercent = kpis.totalIncidents > 0 ? Math.round((securityCount / kpis.totalIncidents) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Executive Report Generation Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Produce print-ready, professional executive intelligence reports with KPI scorecards, risk indices, and actionable directives.
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
            {isGenerating ? 'Building PDF...' : 'Export Official PDF'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Configuration Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Report Parameters
            </h3>

            {/* Reporting Period */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">Reporting Period Label</label>
              <input
                type="text"
                value={config.reportingPeriod}
                onChange={(e) => setConfig({ ...config, reportingPeriod: e.target.value })}
                className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Sections To Include Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs text-slate-400 block font-medium mb-1">Sections To Include in PDF</label>

              {[
                { key: 'includeKPIs', label: '1. Strategic KPI Scorecards' },
                { key: 'includeTrends', label: '2. Trend Analysis & Hour Profile' },
                { key: 'includeRiskAreas', label: '3. Community Area Risk Indices' },
                { key: 'includeRegister', label: '4. Incident Register Audit Table' },
                { key: 'includeRecommendations', label: '5. Actionable Directives' },
              ].map((section) => {
                const isChecked = config[section.key as keyof ReportConfig] as boolean;
                return (
                  <label
                    key={section.key}
                    onClick={() =>
                      setConfig({
                        ...config,
                        [section.key]: !isChecked,
                      })
                    }
                    className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-850 text-xs text-slate-300 hover:text-white cursor-pointer transition-colors"
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                    <span>{section.label}</span>
                  </label>
                );
              })}
            </div>

            {/* Generate Trigger */}
            <Button
              variant="primary"
              className="w-full text-xs py-2.5 mt-2"
              onClick={handleDownloadPDF}
              icon={<Download className="w-4 h-4" />}
            >
              Download PDF Report
            </Button>
          </div>
        </div>

        {/* Right Column: Live High-Fidelity Report Preview */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-2xl border border-slate-800 space-y-6 bg-slate-950/70 text-slate-200">
          {/* Document Header Preview */}
          <div className="border-b border-slate-800 pb-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] tracking-widest uppercase font-bold text-blue-400">
                  OFFICIAL INTELLIGENCE BRIEF
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  D12 Community Incident Intelligence Briefing
                </h3>
                <p className="text-xs text-slate-400">
                  Sector D-12, Islamabad • Capital Development Authority & Citizen Intelligence
                </p>
              </div>

              <div className="text-right text-xs font-mono text-slate-400">
                <span className="block font-bold text-slate-200">CONFIDENTIAL</span>
                <span suppressHydrationWarning>Date: {new Date().toLocaleDateString('en-US')}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3 text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Period: {config.reportingPeriod}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Records: {incidents.length} Verified
              </span>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              1. Executive Briefing Narrative
            </h4>
            <p className="text-xs leading-relaxed text-slate-300 bg-slate-900/50 p-4 rounded-xl border border-slate-850">
              During the selected reporting period ({config.reportingPeriod}), a total of{' '}
              <strong className="text-white">{kpis.totalIncidents} incidents</strong> were logged across Sector D-12. Security-related incidents represented{' '}
              <strong className="text-rose-400">{securityPercent}%</strong> of total reports. Sub-Sector{' '}
              <strong className="text-blue-400">{kpis.mostAffectedSubSector}</strong> accounted for the highest concentration of incidents ({kpis.mostAffectedSubSectorCount} occurrences). Most incidents occurred between 8 PM and 11 PM. Compared to the previous period, incidents shifted by{' '}
              <strong className={kpis.incidentChangePercent < 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {kpis.incidentChangePercent}%
              </strong>. Case resolution stands at{' '}
              <strong className="text-emerald-400">
                {kpis.totalIncidents > 0 ? Math.round((kpis.closedIncidents / kpis.totalIncidents) * 100) : 0}%
              </strong>, with {kpis.activeIncidents} cases under active investigation.
            </p>
          </div>

          {/* Section 2: Strategic Scorecards Preview */}
          {config.includeKPIs && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                2. Key Performance Indicators
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Total Incidents</span>
                  <span className="text-lg font-bold font-mono text-white">{kpis.totalIncidents}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Open Cases</span>
                  <span className="text-lg font-bold font-mono text-rose-400">{kpis.openIncidents}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Resolved Cases</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">{kpis.closedIncidents}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Critical Severity</span>
                  <span className="text-lg font-bold font-mono text-amber-400">{kpis.criticalCount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Risk Areas Preview */}
          {config.includeRiskAreas && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                3. High Priority Risk Corridors
              </h4>
              <div className="space-y-1.5 text-xs">
                {riskScores.slice(0, 4).map((area) => (
                  <div
                    key={area.areaName}
                    className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800"
                  >
                    <span className="font-semibold text-slate-200">{area.areaName}</span>
                    <span className="text-slate-400">Primary: {area.primaryCategory}</span>
                    <span className="font-mono text-rose-400 font-bold">Risk Score: {area.riskScore}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Actionable Recommendations */}
          {config.includeRecommendations && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                4. Strategic Management Directives
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                <li>Deploy dedicated night patrols along Street 5 and Street 7 between 20:00 and 02:00 hrs.</li>
                <li>Submit urgent work order to CDA Electrical Directorate for Street 22 streetlight restoration.</li>
                <li>Enforce biometric identity passes for construction site labor in Sub-Sectors D-12/3 & D-12/4.</li>
                <li>Deploy joint CDA-SNGPL utility rapid repair crew for high-pressure gas valve leaks.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
