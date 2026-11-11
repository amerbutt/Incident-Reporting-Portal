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
  Eye,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';
import { PWARegister } from '@/components/pwa/PWARegister';

export type ActiveTab = 'executive' | 'calendar' | 'register' | 'details' | 'reports' | 'ai';

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
  const { theme, setTheme } = useTheme();

  const tabs = [
    { id: 'executive' as ActiveTab, label: 'Executive Dashboard', icon: <Activity className="w-4 h-4" /> },
    { id: 'calendar' as ActiveTab, label: 'Calendar Matrix', icon: <Calendar className="w-4 h-4" /> },
    { id: 'register' as ActiveTab, label: 'Incident Register', icon: <Table className="w-4 h-4" /> },
    { id: 'details' as ActiveTab, label: 'Incident Detail', icon: <Eye className="w-4 h-4" /> },
    { id: 'reports' as ActiveTab, label: '1-Page Report Center', icon: <FileText className="w-4 h-4" /> },
    { id: 'ai' as ActiveTab, label: 'AI Intelligence', icon: <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" /> },
  ];

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const formatSyncTime = (isoString: string) => {
    if (!mounted || !isoString) return 'Live Sync';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Live Sync';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#090d16] backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200 no-print">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Logo & Portal Info - Strictly D12 Focused Community Initiative */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30">
              <Shield className="w-6 h-6" />
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-950"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  D-12 Community Incident Portal
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30 font-semibold tracking-wide uppercase">
                    D12 Security Committee
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sector D-12 Security Committee • Incident Operations & Resident Safety Network
              </p>
            </div>
          </div>

          {/* Sync, Theme Toggle & Action Status Bar */}
          <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-end">
            {/* Master Sheet Source Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-slate-500 dark:text-slate-400">Master:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">Google Sheet</span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="text-slate-600 dark:text-slate-400" suppressHydrationWarning>
                {mounted ? formatSyncTime(lastSyncedAt) : 'Live'}
              </span>
            </div>

            {/* Sync Now Button */}
            <Button
              variant="glass"
              size="sm"
              onClick={onSync}
              disabled={isSyncing}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-500 dark:text-blue-400' : ''}`} />}
            >
              {isSyncing ? 'Syncing...' : 'Sync Sheet'}
            </Button>

            {/* PWA Install Button (Mobile & Desktop) */}
            <PWARegister />

            {/* Explicit Light / Dark Mode Segmented Switch */}
            <div className="flex items-center rounded-xl p-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Switch to Light Theme"
              >
                <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-amber-500' : ''}`} />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white shadow-sm border border-blue-500'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Switch to Dark Theme"
              >
                <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-blue-200' : ''}`} />
                <span>Dark</span>
              </button>
            </div>

            {/* Filter Drawer Toggle */}
            <Button
              variant={activeFilterCount > 0 ? 'primary' : 'secondary'}
              size="sm"
              onClick={onToggleFilterDrawer}
              icon={<Filter className="w-3.5 h-3.5" />}
            >
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-600 dark:bg-white text-white dark:text-blue-700 text-xs font-bold shadow-sm">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1 scrollbar-none border-t border-slate-200 dark:border-slate-800/80 pt-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-600/20 dark:text-blue-400 dark:border-blue-500/40 shadow-sm shadow-blue-500/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/60 border border-transparent'
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
