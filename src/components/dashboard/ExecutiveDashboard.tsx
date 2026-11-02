'use client';

import React from 'react';
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
} from 'lucide-react';

interface ExecutiveDashboardProps {
  incidents: Incident[];
  kpis: KPISummary;
  dailyTrend: TimeSeriesPoint[];
  hourlyDist: HourlyDistribution[];
  dayDist: DayOfWeekDistribution[];
  authorities: AuthorityStat[];
  riskScores: AreaRiskScore[];
  categories: CategoryHierarchyNode[];
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
  onSelectIncident,
  onFilterStreet,
}: ExecutiveDashboardProps) {
  return (
    <div className="space-y-6">
      {/* 1. Responsive KPI Scorecards Grid (12 Scorecards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Incidents */}
        <KPICard
          title="Total Incidents"
          value={kpis.totalIncidents}
          subtitle="Registered in Sheet"
          icon={<Layers className="w-4 h-4" />}
          accentColor="blue"
          changePercent={kpis.incidentChangePercent}
        />

        {/* Active Incidents */}
        <KPICard
          title="Active Cases"
          value={kpis.activeIncidents}
          subtitle="Open & In-Progress"
          icon={<Clock className="w-4 h-4" />}
          accentColor="amber"
          badgeText="Needs Action"
        />

        {/* Open Incidents */}
        <KPICard
          title="Open Incidents"
          value={kpis.openIncidents}
          subtitle="Unresolved / Queued"
          icon={<AlertTriangle className="w-4 h-4" />}
          accentColor="red"
        />

        {/* Closed Incidents */}
        <KPICard
          title="Closed Incidents"
          value={kpis.closedIncidents}
          subtitle={`${kpis.totalIncidents > 0 ? Math.round((kpis.closedIncidents / kpis.totalIncidents) * 100) : 0}% Clearance`}
          icon={<CheckCircle2 className="w-4 h-4" />}
          accentColor="emerald"
        />

        {/* Critical Severity */}
        <KPICard
          title="Critical Severity"
          value={kpis.criticalCount}
          subtitle="Urgent Intervention"
          icon={<Flame className="w-4 h-4" />}
          accentColor="red"
          badgeText="P1 Level"
        />

        {/* High Severity */}
        <KPICard
          title="High Severity"
          value={kpis.highCount}
          subtitle="Major Priority"
          icon={<AlertTriangle className="w-4 h-4" />}
          accentColor="amber"
        />

        {/* Most Common Type */}
        <KPICard
          title="Common Typology"
          value={kpis.mostCommonType}
          subtitle={`${kpis.mostCommonTypeCount} incidents logged`}
          icon={<Shield className="w-4 h-4" />}
          accentColor="purple"
        />

        {/* Most Affected Sub-Sector */}
        <KPICard
          title="Top Sub-Sector"
          value={kpis.mostAffectedSubSector}
          subtitle={`${kpis.mostAffectedSubSectorCount} concentrated events`}
          icon={<MapPin className="w-4 h-4" />}
          accentColor="blue"
        />

        {/* Most Affected Street */}
        <KPICard
          title="Top Street Hotspot"
          value={kpis.mostAffectedStreet}
          subtitle={`${kpis.mostAffectedStreetCount} incidents recorded`}
          icon={<Activity className="w-4 h-4" />}
          accentColor="red"
        />

        {/* Average Daily Incidents */}
        <KPICard
          title="Daily Average"
          value={kpis.avgDailyIncidents}
          subtitle="Incidents / Day"
          icon={<TrendingUp className="w-4 h-4" />}
          accentColor="slate"
        />

        {/* Month to Date */}
        <KPICard
          title="Month To Date"
          value={kpis.monthToDateCount}
          subtitle="Current Month Run"
          icon={<Calendar className="w-4 h-4" />}
          accentColor="blue"
        />

        {/* Year to Date */}
        <KPICard
          title="Year To Date"
          value={kpis.yearToDateCount}
          subtitle="Annual Cumulative"
          icon={<FileText className="w-4 h-4" />}
          accentColor="slate"
        />
      </div>

      {/* 2. Primary Trend Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Incident Trend (2 Cols) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                Daily Incident Velocity & Temporal Trend
              </h3>
              <p className="text-xs text-slate-400">
                Tracking day-over-day incident occurrences across Sector D-12
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              30-Day Window
            </span>
          </div>
          <DailyTrendChart data={dailyTrend} />
        </div>

        {/* Category Breakdown Donut */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Category Distribution
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {categories.length} Categories
              </span>
            </div>
            <CategoryDonutChart categories={categories} total={kpis.totalIncidents} />
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Primary Focus: <strong className="text-rose-400">Security (58%)</strong></span>
            <span>Secondary: <strong className="text-blue-400">Utilities (22%)</strong></span>
          </div>
        </div>
      </div>

      {/* 3. Temporal Distribution Row (Hour of Day & Day of Week) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hour of Day Analysis */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Hour of Day Analysis (24-Hour Profile)
              </h3>
              <p className="text-xs text-slate-400">
                Concentration analysis identifies <span className="text-amber-400 font-semibold">8 PM - 11 PM</span> as highest risk window
              </p>
            </div>
          </div>
          <HourlyDistributionChart data={hourlyDist} />
        </div>

        {/* Day of Week Analysis */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Day of Week Frequency
              </h3>
              <p className="text-xs text-slate-400">
                Distribution of reports across weekdays vs weekend patrol cycles
              </p>
            </div>
          </div>
          <DayOfWeekChart data={dayDist} />
        </div>
      </div>

      {/* 4. Authority Workload & Community Risk Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Authority Workload */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Authority Workload & Case Resolution
              </h3>
              <p className="text-xs text-slate-400">
                Action distribution across Islamabad Police, CDA, Rescue 1122, and Utilities
              </p>
            </div>
          </div>
          <AuthorityWorkloadChart data={authorities} />
        </div>

        {/* Community Risk Rankings Table */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-400" />
                Community Area Risk Scoring (Top Corridors)
              </h3>
              <p className="text-xs text-slate-400">
                Composite risk index based on frequency, severity weighting, and active open status
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {riskScores.slice(0, 6).map((area) => (
              <div
                key={area.areaName}
                onClick={() => onFilterStreet && onFilterStreet(area.areaName)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
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
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-blue-400">
                      {area.areaName}
                    </span>
                    <div className="text-[11px] text-slate-400">
                      Primary Concern: <span className="text-slate-300">{area.primaryCategory}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="text-right">
                    <span className="text-slate-400 block">{area.incidentCount} incidents</span>
                    <span className="text-[10px] text-slate-500">Last: {area.lastIncidentDate}</span>
                  </div>
                  <div
                    className={`px-2.5 py-1 rounded text-xs font-bold ${
                      area.riskLevel === 'High'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : area.riskLevel === 'Medium'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    Risk {area.riskScore}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
