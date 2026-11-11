'use client';

import React, { useState, useMemo } from 'react';
import {
  Incident,
  CategoryHierarchyNode,
  AreaRiskScore,
  IncidentCategory,
} from '@/lib/types/incident';
import { Button } from '@/components/ui/Button';
import { CategoryBadge, SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import {
  Layers,
  MapPin,
  ExternalLink,
  Flame,
  Shield,
  Compass,
  Filter,
  Eye,
  X,
  Navigation,
  Globe,
  Radio,
} from 'lucide-react';

interface GISDashboardProps {
  incidents: Incident[];
  categories: CategoryHierarchyNode[];
  riskScores: AreaRiskScore[];
  onViewDetails: (incident: Incident) => void;
  onFilterCategory?: (category: IncidentCategory | null, type: string | null) => void;
  selectedCategory: string | null;
  selectedType: string | null;
}

interface LocationBubble {
  id: string;
  subSector: string;
  streetNo: string;
  latitude: number;
  longitude: number;
  incidentCount: number;
  incidents: Incident[];
  primaryCategory: IncidentCategory;
  criticalCount: number;
  hasWildlife: boolean;
  x: number; // percentage 0-100 on Sector D12 canvas
  y: number; // percentage 0-100 on Sector D12 canvas
}

export function GISDashboard({
  incidents,
  categories,
  riskScores,
  onViewDetails,
  onFilterCategory,
  selectedCategory,
  selectedType,
}: GISDashboardProps) {
  const [mapMode, setMapMode] = useState<'bubble' | 'google_satellite'>('bubble');
  const [activeSubSector, setActiveSubSector] = useState<string>('All');
  const [selectedBubble, setSelectedBubble] = useState<LocationBubble | null>(null);

  // Sector D-12 Islamabad geographic bounding box
  const minLat = 33.7050;
  const maxLat = 33.7420;
  const minLng = 72.9500;
  const maxLng = 72.9780;

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (activeSubSector !== 'All' && inc.subSector !== activeSubSector) return false;
      if (selectedCategory && inc.incidentCategory !== selectedCategory) return false;
      if (selectedType && inc.incidentType !== selectedType) return false;
      return true;
    });
  }, [incidents, activeSubSector, selectedCategory, selectedType]);

  // Aggregate incidents into geospatial bubbles by Street/Coordinate
  const bubbles = useMemo<LocationBubble[]>(() => {
    const map = new Map<string, LocationBubble>();

    filteredIncidents.forEach((inc) => {
      const key = `${inc.subSector}_${inc.streetNo || 'Main'}`;

      const lat = inc.latitude || 33.7250;
      const lng = inc.longitude || 72.9640;

      // Project into 0-100% canvas coordinates for Sector D-12
      const x = Math.min(92, Math.max(8, ((lng - minLng) / (maxLng - minLng)) * 100));
      const y = Math.min(92, Math.max(8, ((maxLat - lat) / (maxLat - minLat)) * 100));

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          subSector: inc.subSector,
          streetNo: inc.streetNo || 'General Area',
          latitude: lat,
          longitude: lng,
          incidentCount: 1,
          incidents: [inc],
          primaryCategory: inc.incidentCategory,
          criticalCount: inc.incidentSeverity === 'Critical' ? 1 : 0,
          hasWildlife: inc.incidentCategory === 'Wildlife',
          x,
          y,
        });
      } else {
        const item = map.get(key)!;
        item.incidentCount++;
        item.incidents.push(inc);
        if (inc.incidentSeverity === 'Critical') item.criticalCount++;
        if (inc.incidentCategory === 'Wildlife') item.hasWildlife = true;
      }
    });

    return Array.from(map.values());
  }, [filteredIncidents]);

  const getBubbleColor = (bubble: LocationBubble) => {
    if (bubble.primaryCategory === 'Crime' || bubble.primaryCategory === 'Security') {
      return {
        bg: 'bg-rose-500/80',
        border: 'border-rose-400',
        ring: 'ring-rose-500/30',
        text: 'text-rose-400',
      };
    }
    if (bubble.primaryCategory === 'Wildlife' || bubble.hasWildlife) {
      return {
        bg: 'bg-teal-500/80',
        border: 'border-teal-400',
        ring: 'ring-teal-500/30',
        text: 'text-teal-400',
      };
    }
    if (bubble.primaryCategory === 'Hazards & Misc' || bubble.primaryCategory === 'Safety') {
      return {
        bg: 'bg-amber-500/80',
        border: 'border-amber-400',
        ring: 'ring-amber-500/30',
        text: 'text-amber-400',
      };
    }
    return {
      bg: 'bg-blue-500/80',
      border: 'border-blue-400',
      ring: 'ring-blue-500/30',
      text: 'text-blue-400',
    };
  };

  const getBubbleRadius = (count: number) => {
    // Dynamic bubble radius in pixels
    if (count >= 10) return 48; // Large hotspot (e.g. Street 144)
    if (count >= 5) return 38;
    if (count >= 3) return 30;
    return 22; // Single or dual events
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Controls */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
              Sector D-12 Google Bubble Incident Map
            </h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30">
              Interactive Density Bubbles
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Geospatial density of incidents across Sector D-12 streets. Bubble size indicates incident volume. Click any bubble for street dossiers.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setMapMode('bubble')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mapMode === 'bubble'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Density Bubble Map
            </button>
            <button
              onClick={() => setMapMode('google_satellite')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mapMode === 'google_satellite'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Google Map Embed
            </button>
          </div>
        </div>
      </div>

      {/* 2. Sub-Sector Filter Pills & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-panel p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-slate-500 dark:text-slate-400 font-semibold mr-1">Sub-Sector:</span>
          {['All', 'D-12/1', 'D-12/2', 'D-12/3', 'D-12/4'].map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSubSector(sec)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                activeSubSector === sec
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {sec === 'All' ? 'All Sector D-12' : sec}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <span>Wildlife (Snakes)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Crime & Security</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Hazards / Misc</span>
          </div>
        </div>
      </div>

      {/* 3. Map View Area */}
      {mapMode === 'google_satellite' ? (
        /* Real Google Maps Embed centered on D-12 Islamabad */
        <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg h-[550px] relative">
          <iframe
            title="Google Maps Sector D-12 Islamabad"
            src="https://maps.google.com/maps?q=Sector+D-12+Islamabad+Pakistan&t=&z=15&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
          />
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-md">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Sector D-12, Islamabad
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Lat: 33.7250° N • Long: 72.9640° E
            </div>
          </div>
        </div>
      ) : (
        /* Dynamic Google-Styled Bubble Density Map Canvas */
        <div className="relative glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg h-[560px] bg-slate-100 dark:bg-[#0b101d] bg-grid-pattern">
          {/* Subtle Sector D-12 Visual Grid & Sub-Sector Quadrants */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Margalla Hills Indicator at top */}
            <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-teal-950/20 to-transparent flex items-center justify-center">
              <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest flex items-center gap-1.5 opacity-80">
                <Compass className="w-3.5 h-3.5" /> Margalla Foothills Wildlife Buffer (North)
              </span>
            </div>

            {/* Quadrant dividing cross lines */}
            <div className="absolute top-1/2 inset-x-0 border-t border-dashed border-slate-300 dark:border-slate-800/80" />
            <div className="absolute left-1/2 inset-y-0 border-l border-dashed border-slate-300 dark:border-slate-800/80" />

            {/* Sub-Sector Watermark Labels */}
            <div className="absolute top-12 left-10 text-2xl font-black text-slate-300 dark:text-slate-800/60 select-none">
              D-12/1
            </div>
            <div className="absolute top-12 right-12 text-2xl font-black text-slate-300 dark:text-slate-800/60 select-none">
              D-12/2
            </div>
            <div className="absolute bottom-12 left-10 text-2xl font-black text-slate-300 dark:text-slate-800/60 select-none">
              D-12/3 <span className="text-xs font-mono text-rose-500/70 block">Hotspot Zone</span>
            </div>
            <div className="absolute bottom-12 right-12 text-2xl font-black text-slate-300 dark:text-slate-800/60 select-none">
              D-12/4
            </div>
          </div>

          {/* Interactive Bubble Elements */}
          {bubbles.map((bubble) => {
            const colors = getBubbleColor(bubble);
            const radius = getBubbleRadius(bubble.incidentCount);
            const isSelected = selectedBubble?.id === bubble.id;

            return (
              <div
                key={bubble.id}
                onClick={() => setSelectedBubble(bubble)}
                style={{
                  left: `${bubble.x}%`,
                  top: `${bubble.y}%`,
                  width: `${radius}px`,
                  height: `${radius}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md ${
                  colors.bg
                } ${isSelected ? 'ring-4 ring-white dark:ring-blue-400 scale-125 z-30' : 'hover:scale-115 z-10'}`}
                title={`${bubble.subSector}, ${bubble.streetNo}: ${bubble.incidentCount} incidents`}
              >
                {/* Bubble Count Label */}
                <span className="font-mono font-bold text-white text-xs drop-shadow">
                  {bubble.incidentCount}
                </span>

                {/* Hotspot Pulse Effect for high concentration */}
                {bubble.incidentCount >= 6 && (
                  <span className="absolute -inset-1 rounded-full animate-ping opacity-35 bg-rose-500" />
                )}

                {/* Street Tag beneath bubble */}
                <div className="absolute -bottom-5 whitespace-nowrap text-[9px] font-semibold text-slate-700 dark:text-slate-300 bg-white/90 dark:bg-slate-900/90 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-800 shadow-sm pointer-events-none">
                  {bubble.streetNo}
                </div>
              </div>
            );
          })}

          {/* Bubble Selected Detail Overlay Modal */}
          {selectedBubble && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 glass-panel-elevated p-4 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-2xl z-40 animate-in fade-in slide-in-from-bottom-3 duration-200">
              <div className="flex items-start justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedBubble.subSector} • {selectedBubble.streetNo}
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {selectedBubble.incidentCount} Logged Community Incidents
                  </h4>
                </div>

                <button
                  onClick={() => setSelectedBubble(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Incidents preview list */}
              <div className="mt-2.5 max-h-48 overflow-y-auto space-y-2 pr-1">
                {selectedBubble.incidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => onViewDetails(inc)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:border-blue-400 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                        {inc.id}
                      </span>
                      <CategoryBadge category={inc.incidentCategory} />
                    </div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {inc.incidentType}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {inc.briefDescription}
                    </div>
                  </div>
                ))}
              </div>

              {/* External Navigation Link */}
              <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <a
                  href={`https://maps.google.com/?q=${selectedBubble.latitude},${selectedBubble.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open in Google Maps
                </a>

                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedBubble.latitude.toFixed(4)}, {selectedBubble.longitude.toFixed(4)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
