'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Incident,
  FilterState,
  KPISummary,
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus,
  DatePreset,
} from '@/lib/types/incident';
import { Header, ActiveTab } from '@/components/layout/Header';
import { FilterBar } from '@/components/layout/FilterBar';
import { FilterDrawer } from '@/components/layout/FilterDrawer';
import { ExecutiveDashboard } from '@/components/dashboard/ExecutiveDashboard';
import { GISDashboard } from '@/components/gis/GISDashboard';
import { CalendarDashboard } from '@/components/calendar/CalendarDashboard';
import { IncidentRegister } from '@/components/register/IncidentRegister';
import { IncidentDetailView } from '@/components/detail/IncidentDetailView';
import { ReportCenter } from '@/components/reports/ReportCenter';
import { AIIntelligenceView } from '@/components/ai/AIIntelligenceView';
import {
  calculateDailyTrend,
  calculateHourlyDistribution,
  calculateDayOfWeekDistribution,
  calculateAuthorityStats,
  calculateAreaRiskScores,
  calculateCategoryHierarchy,
  calculateKPIs,
} from '@/lib/utils/analytics';
import { Shield, RefreshCw } from 'lucide-react';

export default function IncidentIntelligencePortal() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('executive');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Global Filter State (Synchronized across all modules)
  const [filters, setFilters] = useState<FilterState>({
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

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Data State
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [kpis, setKpis] = useState<KPISummary | null>(null);
  const [dataSource, setDataSource] = useState<string>('google_sheets');
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('2026-11-02T16:00:00.000Z');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [facets, setFacets] = useState<{
    subSectors: string[];
    streets: string[];
    categories: IncidentCategory[];
    types: string[];
    authorities: string[];
    severities: IncidentSeverity[];
    statuses: IncidentStatus[];
  }>({
    subSectors: ['D-12/1', 'D-12/2', 'D-12/3', 'D-12/4'],
    streets: ['Street 5', 'Street 7', 'Street 11', 'Street 15', 'Street 22', 'Main Double Road'],
    categories: ['Security', 'Safety', 'Utilities', 'Community', 'Infrastructure', 'Traffic', 'Other'],
    types: ['Theft', 'Suspicious Activity', 'Gas Leak', 'Water Shortage', 'Vehicle Incident', 'Patrol Observation'],
    authorities: ['Police', 'Rescue 1122', 'CDA', 'Gas Company', 'Electricity Company', 'D-12 Security Watch'],
    severities: ['Critical', 'High', 'Medium', 'Low'],
    statuses: ['Open', 'In Progress', 'Closed', 'Pending Authority'],
  });

  // Fetch Incidents from API
  const fetchIncidents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.datePreset) params.set('datePreset', filters.datePreset);
      if (filters.customStartDate) params.set('customStartDate', filters.customStartDate);
      if (filters.customEndDate) params.set('customEndDate', filters.customEndDate);
      if (filters.searchQuery) params.set('q', filters.searchQuery);
      if (filters.houseNo) params.set('houseNo', filters.houseNo);
      if (filters.addressSearch) params.set('address', filters.addressSearch);

      filters.subSectors.forEach((s) => params.append('subSector', s));
      filters.streets.forEach((st) => params.append('street', st));
      filters.categories.forEach((c) => params.append('category', c));
      filters.types.forEach((t) => params.append('type', t));
      filters.severities.forEach((sev) => params.append('severity', sev));
      filters.statuses.forEach((stat) => params.append('status', stat));
      filters.authorities.forEach((a) => params.append('authority', a));

      const res = await fetch(`/api/incidents?${params.toString()}`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setIncidents(json.data);
        if (json.stats) setKpis(json.stats);
        if (json.source) setDataSource(json.source);
        if (json.lastSyncedAt) setLastSyncedAt(json.lastSyncedAt);
        if (json.facets) setFacets(json.facets);

        // Update selectedIncident if currently viewing
        if (selectedIncident) {
          const updated = json.data.find((i: Incident) => i.id === selectedIncident.id);
          if (updated) setSelectedIncident(updated);
        } else if (json.data.length > 0) {
          setSelectedIncident(json.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch incidents', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, selectedIncident]);

  useEffect(() => {
    fetchIncidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.datePreset,
    filters.customStartDate,
    filters.customEndDate,
    filters.searchQuery,
    filters.subSectors,
    filters.streets,
    filters.categories,
    filters.types,
    filters.severities,
    filters.statuses,
    filters.authorities,
  ]);

  // Trigger Manual Cache Invalidation & Re-sync
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await fetch('/api/incidents/sync', { method: 'POST' });
      await fetchIncidents();
    } catch (err) {
      console.error('Sync failed', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Precomputed analytics for active filtered dataset
  const computedKPIs = useMemo(() => {
    return kpis || calculateKPIs(incidents);
  }, [kpis, incidents]);

  const dailyTrend = useMemo(() => calculateDailyTrend(incidents), [incidents]);
  const hourlyDist = useMemo(() => calculateHourlyDistribution(incidents), [incidents]);
  const dayDist = useMemo(() => calculateDayOfWeekDistribution(incidents), [incidents]);
  const authorityStats = useMemo(() => calculateAuthorityStats(incidents), [incidents]);
  const riskScores = useMemo(() => calculateAreaRiskScores(incidents), [incidents]);
  const categoryHierarchy = useMemo(() => calculateCategoryHierarchy(incidents), [incidents]);

  // Active filter count calculation
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.datePreset !== 'All Time') count++;
    count += filters.subSectors.length;
    count += filters.streets.length;
    count += filters.categories.length;
    count += filters.types.length;
    count += filters.severities.length;
    count += filters.statuses.length;
    count += filters.authorities.length;
    if (filters.searchQuery.trim()) count++;
    if (filters.houseNo) count++;
    if (filters.addressSearch) count++;
    return count;
  }, [filters]);

  // Navigate to Incident Detail View
  const handleSelectIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setActiveTab('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Next / Prev Incident in Detail View
  const currentIncidentIndex = useMemo(() => {
    if (!selectedIncident) return -1;
    return incidents.findIndex((i) => i.id === selectedIncident.id);
  }, [selectedIncident, incidents]);

  const handlePrevIncident = () => {
    if (currentIncidentIndex > 0) {
      setSelectedIncident(incidents[currentIncidentIndex - 1]);
    }
  };

  const handleNextIncident = () => {
    if (currentIncidentIndex < incidents.length - 1) {
      setSelectedIncident(incidents[currentIncidentIndex + 1]);
    }
  };

  // Drilldown filter handlers
  const handleFilterStreet = (street: string) => {
    setFilters((prev) => ({
      ...prev,
      streets: prev.streets.includes(street) ? prev.streets : [...prev.streets, street],
    }));
  };

  const handleFilterCategoryTree = (category: IncidentCategory | null, type: string | null) => {
    setFilters((prev) => ({
      ...prev,
      categories: category ? [category] : [],
      types: type ? [type] : [],
    }));
  };

  const handleFilterCalendarDate = (dateStr: string) => {
    setFilters((prev) => ({
      ...prev,
      datePreset: 'Custom Range',
      customStartDate: dateStr,
      customEndDate: dateStr,
    }));
  };

  const handleFilterCalendarType = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      types: [type],
    }));
  };

  const handleFilterCalendarCell = (type: string, dateStr: string) => {
    setFilters((prev) => ({
      ...prev,
      types: [type],
      datePreset: 'Custom Range',
      customStartDate: dateStr,
      customEndDate: dateStr,
    }));
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col bg-grid-pattern">
        <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 flex items-center justify-center border border-blue-500/40">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">D12 Incident Intelligence Portal</div>
                <div className="text-xs text-slate-400">Sector D-12, Islamabad • Live Google Sheet Master</div>
              </div>
            </div>
            <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              Loading Master Data...
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-24 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Initializing Intelligence Dashboards & GIS Engine...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col bg-grid-pattern">
      {/* 1. Header Component */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        lastSyncedAt={lastSyncedAt}
        isSyncing={isSyncing}
        onSync={handleManualSync}
        activeFilterCount={activeFilterCount}
        onToggleFilterDrawer={() => setIsFilterDrawerOpen(true)}
        dataSource={dataSource}
      />

      {/* 2. Global Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        onOpenDrawer={() => setIsFilterDrawerOpen(true)}
        totalFilteredCount={incidents.length}
      />

      {/* 3. Global Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
        facets={facets}
      />

      {/* 4. Main Body Application Modules */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading && incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-sm text-slate-400 font-mono">
              Loading Sector D-12 Incident Intelligence Repository...
            </p>
          </div>
        ) : (
          <>
            {/* MODULE 1: EXECUTIVE DASHBOARD */}
            {activeTab === 'executive' && (
              <ExecutiveDashboard
                incidents={incidents}
                kpis={computedKPIs}
                dailyTrend={dailyTrend}
                hourlyDist={hourlyDist}
                dayDist={dayDist}
                authorities={authorityStats}
                riskScores={riskScores}
                categories={categoryHierarchy}
                onSelectIncident={handleSelectIncident}
                onFilterStreet={handleFilterStreet}
              />
            )}

            {/* MODULE 2: GIS MAPPING DASHBOARD */}
            {activeTab === 'gis' && (
              <GISDashboard
                incidents={incidents}
                categories={categoryHierarchy}
                riskScores={riskScores}
                onViewDetails={handleSelectIncident}
                onFilterCategory={handleFilterCategoryTree}
                selectedCategory={filters.categories.length === 1 ? filters.categories[0] : null}
                selectedType={filters.types.length === 1 ? filters.types[0] : null}
              />
            )}

            {/* MODULE 3: CALENDAR INTELLIGENCE DASHBOARD */}
            {activeTab === 'calendar' && (
              <CalendarDashboard
                incidents={incidents}
                onFilterDate={handleFilterCalendarDate}
                onFilterType={handleFilterCalendarType}
                onFilterCell={handleFilterCalendarCell}
              />
            )}

            {/* MODULE 4: INCIDENT REGISTER */}
            {activeTab === 'register' && (
              <IncidentRegister
                incidents={incidents}
                onSelectIncident={handleSelectIncident}
              />
            )}

            {/* MODULE 5: INCIDENT DETAIL VIEW */}
            {activeTab === 'details' && (
              <IncidentDetailView
                incident={selectedIncident}
                onBackToRegister={() => setActiveTab('register')}
                onNavigatePrev={handlePrevIncident}
                onNavigateNext={handleNextIncident}
                hasPrev={currentIncidentIndex > 0}
                hasNext={currentIncidentIndex < incidents.length - 1}
              />
            )}

            {/* MODULE 6: REPORT GENERATION CENTER */}
            {activeTab === 'reports' && (
              <ReportCenter
                incidents={incidents}
                kpis={computedKPIs}
                riskScores={riskScores}
                categories={categoryHierarchy}
              />
            )}

            {/* MODULE 7: AI INTELLIGENCE SUMMARY */}
            {activeTab === 'ai' && (
              <AIIntelligenceView
                filters={filters}
                onUpdateFilters={setFilters}
              />
            )}
          </>
        )}
      </main>

      {/* 5. Executive Command Center Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 py-5 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-slate-300">
              D12 Community Incident Intelligence Portal (IIP)
            </span>
            <span className="text-slate-600">|</span>
            <span>Production Vercel Ready</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <span>Sector D-12, Islamabad</span>
            <span>Master: Google Sheets API v4</span>
            <span className="text-emerald-400">● Live Synchronization Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
