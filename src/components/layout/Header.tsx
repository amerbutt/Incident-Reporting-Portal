'use client';

import React from 'react';
import {
  Shield,
  Activity,
  MapPin,
  Calendar,
  Table,
  FileText,
  Sparkles,
  RefreshCw,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export type ActiveTab = 'executive' | 'gis' | 'calendar' | 'register' | 'details' | 'reports' | 'ai';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  lastSyncedAt: string;
  isSyncing: boolean;
  onSync: () => void;
  activeFilterCount: number;
  onToggleFilterDrawer: () => void;
  dataSource: string;
}

export function Header({
  activeTab,
  onTabChange,
  lastSyncedAt,
  isSyncing,
  onSync,
  activeFilterCount,
  onToggleFilterDrawer,
  dataSource,
}: HeaderProps) {
  const tabs = [
    { id: 'executive' as ActiveTab, label: 'Executive Dashboard', icon: <Activity className="w-4 h-4" /> },
    { id: 'gis' as ActiveTab, label: 'GIS Mapping', icon: <MapPin className="w-4 h-4" /> },
    { id: 'calendar' as ActiveTab, label: 'Calendar Matrix', icon: <Calendar className="w-4 h-4" /> },
    { id: 'register' as ActiveTab, label: 'Incident Register', icon: <Table className="w-4 h-4" /> },
    { id: 'details' as ActiveTab, label: 'Incident Detail', icon: <Eye className="w-4 h-4" /> },
    { id: 'reports' as ActiveTab, label: 'Report Center', icon: <FileText className="w-4 h-4" /> },
    { id: 'ai' as ActiveTab, label: 'AI Intelligence', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
  ];

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const formatSyncTime = (isoString: string) => {
    if (!mounted) return 'Live Sync';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Live Sync';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Logo & Portal Info */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30">
              <Shield className="w-6 h-6" />
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-950"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  D12 Incident Intelligence Portal
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold tracking-wide uppercase">
                    IIP v2.4
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Sector D-12, Islamabad • Capital Development Authority & Citizen Watch Network
              </p>
            </div>
          </div>

          {/* Sync & Action Status Bar */}
          <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto justify-end">
            {/* Master Sheet Source Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-slate-400">Master:</span>
              <span className="text-slate-200 font-mono">Google Sheet</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400" suppressHydrationWarning>
                {formatSyncTime(lastSyncedAt)}
              </span>
            </div>

            {/* Sync Now Button */}
            <Button
              variant="glass"
              size="sm"
              onClick={onSync}
              disabled={isSyncing}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />}
            >
              {isSyncing ? 'Syncing...' : 'Sync Sheet'}
            </Button>

            {/* Filter Drawer Toggle */}
            <Button
              variant={activeFilterCount > 0 ? 'primary' : 'secondary'}
              size="sm"
              onClick={onToggleFilterDrawer}
              icon={<Filter className="w-3.5 h-3.5" />}
            >
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white text-blue-700 text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1 scrollbar-none border-t border-slate-800/60 pt-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
