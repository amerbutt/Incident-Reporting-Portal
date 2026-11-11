'use client';

import React, { useState } from 'react';
import {
  Incident,
  KPISummary,
  TimeSeriesPoint,
  HourlyDistribution,
  DayOfWeekDistribution,
  AuthorityStat,
  AreaRiskScore,
  CategoryHierarchyNode,
} from '@/lib/types/incident';
import { KPICard } from '@/components/dashboard/KPICard';
import {
  DailyTrendChart,
  HourlyDistributionChart,
  DayOfWeekChart,
  CategoryDonutChart,
  AuthorityWorkloadChart,
} from '@/components/dashboard/Charts';
import { CategoryBadge, SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { generateSinglePageCommunityPDF } from '@/components/reports/PDFExportEngine';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  TrendingUp,
  Shield,
  Activity,
  Flame,
  FileText,
  Calendar,
  Compass,
  ArrowRight,
  Filter,
  X,
  Eye,
  AlertOctagon,
  FileDown,
  Printer,
  Share2,
} from 'lucide-react';

export type ScorecardFilterType = 'all' | 'active' | 'critical' | 'wildlife' | 'crime' | 'hotspot';

interface ExecutiveDashboardProps {
  incidents: Incident[];
  kpis: KPISummary;
  dailyTrend: TimeSeriesPoint[];
  hourlyDist: HourlyDistribution[];
  dayDist: DayOfWeekDistribution[];
  authorities: AuthorityStat[];
  riskScores: AreaRiskScore[];
  categories: CategoryHierarchyNode[];
  activeFilterType?: ScorecardFilterType | null;
  onFilterScorecard?: (type: ScorecardFilterType) => void;
  onClearScorecardFilter?: () => void;
  onSelectIncident?: (incident: Incident) => void;
  onFilterStreet?: (street: string) => void;
}

export function ExecutiveDashboard({
  incidents,
  kpis,
  dailyTrend,
  hourlyDist,
  dayDist,
  authorities,
  riskScores,
  categories,
  activeFilterType,
  onFilterScorecard,
  onClearScorecardFilter,
  onSelectIncident,
  onFilterStreet,
}: ExecutiveDashboardProps) {
  // Pre-calculate self-explanatory community metric counts
  const wildlifeCount = incidents.filter(
    (i) => i.incidentCategory === 'Wildlife' || i.incidentType.toLowerCase().includes('snake') || i.incidentType.toLowerCase().includes('wildlife')
  ).length;

  const crimeCount = incidents.filter(
    (i) =>
      i.incidentCategory === 'Crime' ||
      i.incidentCategory === 'Security' ||
      i.incidentType.toLowerCase().includes('theft') ||
      i.incidentType.toLowerCase().includes('trespass') ||
      i.incidentType.toLowerCase().includes('robbery')
  ).length;

  const criticalHighCount = incidents.filter(
    (i) => i.incidentSeverity === 'Critical' || i.incidentSeverity === 'High'
  ).length;

  const dashboardRef = React.useRef<HTMLDivElement>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // 1. Export the ACTUAL VISUAL DASHBOARD as a high-resolution PDF snapshot
  const handleExportDashboardPDF = async () => {
    if (!dashboardRef.current) return;
    setIsExportingPDF(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const element = dashboardRef.current;
      const isDark =
        document.documentElement.classList.contains('dark') ||
        document.body.classList.contains('dark');
      const bgColor = isDark ? '#090d16' : '#f8fafc';

      const canvas = await html2canvas(element, {
        scale: 2, // 2x Retina resolution for sharp text & charts
        useCORS: true,
        logging: false,
        backgroundColor: bgColor,
        windowWidth: element.scrollWidth,
        ignoreElements: (el) =>
          el.getAttribute('data-html2canvas-ignore') === 'true' ||
          el.classList.contains('no-print'),
      });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Page 1
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Multi-page handling for complete dashboard snapshot
      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      const dateStr = new Date().toISOString().split('T')[0];
      pdf.save(`D12_Security_Committee_Dashboard_${dateStr}.pdf`);
    } catch (err) {
      console.error('Failed to export visual dashboard to PDF:', err);
      // Fallback: trigger browser print dialog
      window.print();
    } finally {
      setIsExportingPDF(false);
    }
  };

  // 2. Export the tabular 1-Page Summary Report Brief
  const handleExport1PageReport = () => {
    generateSinglePageCommunityPDF(incidents, kpis, riskScores, {
      reportingPeriod: 'Executive Dashboard Brief • D12 Security Committee',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div ref={dashboardRef} id="executive-dashboard-view" className="space-y-6">
      {/* 1. Sector D-12 Security Committee Banner */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Sector D-12 Security Committee • Incident Intelligence
            </h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30">
              D12 Security Committee
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official operational intelligence for Sector D-12 (Sub-Sectors D-12/1 through D-12/4) by the D12 Security Committee. Click any scorecard to filter, or export to PDF for sharing.
          </p>
        </div>

        <div data-html2canvas-ignore="true" className="flex items-center flex-wrap gap-2.5 no-print">
          {activeFilterType && (
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
              <span className="font-semibold">Filter: {activeFilterType.toUpperCase()}</span>
              <button
                onClick={onClearScorecardFilter}
                className="p-1 hover:bg-blue-200 dark:hover:bg-blue-900 rounded-full transition-colors cursor-pointer"
                title="Reset scorecard filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
            title="Print or save current screen via browser print"
          >
            Print
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportDashboardPDF}
            disabled={isExportingPDF}
            icon={<FileDown className="w-4 h-4" />}
            title="Export visual dashboard snapshot with all KPI cards, charts, and metrics into a high-res PDF"
          >
            {isExportingPDF ? 'Capturing Dashboard PDF...' : 'Export Dashboard PDF'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport1PageReport}
            icon={<FileText className="w-4 h-4" />}
            title="Download executive 1-page structured briefing report"
          >
            1-Page Summary
          </Button>
        </div>
      </div>

      {/* 2. Focused, Self-Explanatory & Clickable 6 Scorecards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Scorecard 1: Total Incidents */}
        <KPICard
          title="Total Incidents"
          value={kpis.totalIncidents ?? 0}
          subtitle="All logged community reports"
          icon={<Layers className="w-4 h-4" />}
          accentColor="blue"
          actionHint="Click to view all ↓"
          isActive={activeFilterType === 'all'}
          onClick={() => onFilterScorecard && onFilterScorecard('all')}
        />

        {/* Scorecard 2: Active Cases */}
        <KPICard
          title="Active Cases"
          value={kpis.activeIncidents ?? 0}
          subtitle={`${kpis.openIncidents ?? 0} Open • ${Math.max(0, (kpis.activeIncidents ?? 0) - (kpis.openIncidents ?? 0))} In-Progress`}
          badgeText="Action Needed"
          icon={<Clock className="w-4 h-4" />}
          accentColor="amber"
          actionHint="Click to filter active ↓"
          isActive={activeFilterType === 'active'}
          onClick={() => onFilterScorecard && onFilterScorecard('active')}
        />

        {/* Scorecard 3: Critical & High Priority */}
        <KPICard
          title="Critical & High"
          value={criticalHighCount}
          subtitle={`${kpis.criticalCount ?? 0} Critical • ${kpis.highCount ?? 0} High`}
          badgeText="Urgent Alerts"
          icon={<Flame className="w-4 h-4" />}
          accentColor="red"
          actionHint="Click to filter urgent ↓"
          isActive={activeFilterType === 'critical'}
          onClick={() => onFilterScorecard && onFilterScorecard('critical')}
        />

        {/* Scorecard 4: Wildlife Encounters */}
        <KPICard
          title="Wildlife Incidents"
          value={wildlifeCount}
          subtitle="Snakes & Margalla animal alerts"
          badgeText="Wildlife Committee"
          icon={<Compass className="w-4 h-4" />}
          accentColor="emerald"
          actionHint="Click to filter wildlife ↓"
          isActive={activeFilterType === 'wildlife'}
          onClick={() => onFilterScorecard && onFilterScorecard('wildlife')}
        />

        {/* Scorecard 5: Crime & Security */}
        <KPICard
          title="Crime & Security"
          value={crimeCount}
          subtitle="Theft, trespass & security reports"
          badgeText="Security"
          icon={<Shield className="w-4 h-4" />}
          accentColor="purple"
          actionHint="Click to filter security ↓"
          isActive={activeFilterType === 'crime'}
          onClick={() => onFilterScorecard && onFilterScorecard('crime')}
        />

        {/* Scorecard 6: Top Hotspot Sub-Sector */}
        <KPICard
          title="Top Hotspot"
          value={kpis.mostAffectedSubSector || 'D-12/3'}
          subtitle={`${kpis.mostAffectedStreetCount || 6} reports in Street ${kpis.mostAffectedStreet || '144'}`}
          badgeText="Concentration"
          icon={<MapPin className="w-4 h-4" />}
          accentColor="slate"
          actionHint="Click to filter hotspot ↓"
          isActive={activeFilterType === 'hotspot'}
          onClick={() => onFilterScorecard && onFilterScorecard('hotspot')}
        />
      </div>

      {/* 3. Interactive Filtered Incident Stream (Quick Click-To-Dossier Feed) */}
      <div id="incident-stream" className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Community Incident Stream
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {incidents.length} Records
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any incident to open the complete dossier, WhatsApp dispatch report, and Urdu audio transcript.
            </p>
          </div>

          {activeFilterType && (
            <button
              onClick={onClearScorecardFilter}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Reset Scorecard Filter
            </button>
          )}
        </div>

        {incidents.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No incidents found matching the active selection.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {incidents.slice(0, 9).map((inc) => (
              <div
                key={inc.id}
                onClick={() => onSelectIncident && onSelectIncident(inc)}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                      {inc.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <CategoryBadge category={inc.incidentCategory} />
                      <SeverityBadge severity={inc.incidentSeverity} />
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1 mb-1">
                    {inc.incidentType}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">
                    {inc.briefDescription}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1 truncate font-medium">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{inc.subSector}, {inc.streetNo}</span>
                  </div>
                  <span className="shrink-0 font-mono text-[10px]">{inc.fieldDate}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {incidents.length > 9 && (
          <div className="pt-2 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing 9 of {incidents.length} incidents. Use the <strong>Incident Register</strong> tab for full tabular searching and sorting.
            </span>
          </div>
        )}
      </div>

      {/* 4. Temporal Trend & Category Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 Cols) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                D-12 Incident Chronological Timeline
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily frequency pattern of incidents logged in Sector D-12
              </p>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {dailyTrend.length} Days Sampled
            </span>
          </div>
          <DailyTrendChart data={dailyTrend} />
        </div>

        {/* Category Donut (1 Col) */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Category Distribution
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {categories.length} Categories
              </span>
            </div>
            <CategoryDonutChart categories={categories} total={kpis.totalIncidents} />
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Primary: <strong className="text-rose-600 dark:text-rose-400">Wildlife & Safety</strong></span>
            <span>Secondary: <strong className="text-blue-600 dark:text-blue-400">Crime & Security</strong></span>
          </div>
        </div>
      </div>

      {/* 5. 24-Hour Profile & Day of Week Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hour of Day Analysis */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                24-Hour Concentration Profile
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Peak risk window observed between <span className="text-amber-600 dark:text-amber-400 font-semibold">8:00 PM – 11:00 PM</span>
              </p>
            </div>
          </div>
          <HourlyDistributionChart data={hourlyDist} />
        </div>

        {/* Day of Week Analysis */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                Day of Week Frequency
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pattern across resident weekdays vs weekend activity
              </p>
            </div>
          </div>
          <DayOfWeekChart data={dayDist} />
        </div>
      </div>

      {/* 6. Community Hotspot Corridors Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              Sector D-12 Hotspot Streets & Corridors
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Community risk index based on frequency and severity across Sector D-12 streets. Click any street to filter.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {riskScores.slice(0, 6).map((area) => (
            <div
              key={area.areaName}
              onClick={() => onFilterStreet && onFilterStreet(area.areaName)}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    area.riskLevel === 'High'
                      ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                      : area.riskLevel === 'Medium'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {area.areaName}
                  </span>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Top Concern: <span className="font-semibold">{area.primaryCategory}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white block">
                  {area.incidentCount} events
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    area.riskLevel === 'High'
                      ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30'
                      : area.riskLevel === 'Medium'
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30'
                      : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                  }`}
                >
                  Score: {area.riskScore}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
