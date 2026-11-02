'use client';

import React, { useState, useMemo } from 'react';
import {
  Incident,
  CategoryHierarchyNode,
  AreaRiskScore,
  IncidentCategory,
} from '@/lib/types/incident';
import { CategoryTree } from '@/components/gis/CategoryTree';
import { IncidentPopup } from '@/components/gis/IncidentPopup';
import { Button } from '@/components/ui/Button';
import {
  Layers,
  Flame,
  ShieldAlert,
  MapPin,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Compass,
} from 'lucide-react';

type MapViewMode = 'bubble' | 'heatmap' | 'risk' | 'cluster';

interface GISDashboardProps {
  incidents: Incident[];
  categories: CategoryHierarchyNode[];
  riskScores: AreaRiskScore[];
  onViewDetails: (incident: Incident) => void;
  onFilterCategory?: (category: IncidentCategory | null, type: string | null) => void;
  selectedCategory: string | null;
  selectedType: string | null;
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
  const [viewMode, setViewMode] = useState<MapViewMode>('bubble');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeSubSectorFilter, setActiveSubSectorFilter] = useState<string | null>(null);

  // Sector D-12 Islamabad geographic bounds:
  // Lat: 33.7230 to 33.7390, Long: 72.9530 to 72.9770
  const minLat = 33.7230;
  const maxLat = 33.7390;
  const minLng = 72.9530;
  const maxLng = 72.9770;

  // Filtered incidents for the map
  const displayIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (selectedCategory && inc.incidentCategory !== selectedCategory) return false;
      if (selectedType && inc.incidentType !== selectedType) return false;
      if (activeSubSectorFilter && inc.subSector !== activeSubSectorFilter) return false;
      return true;
    });
  }, [incidents, selectedCategory, selectedType, activeSubSectorFilter]);

  // Project lat/long to 0-100% SVG coordinates
  const projectCoords = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    return {
      x: Math.min(95, Math.max(5, x)),
      y: Math.min(95, Math.max(5, y)),
    };
  };

  const getCategoryColor = (cat: IncidentCategory | string): string => {
    switch (cat) {
      case 'Security':
        return '#ef4444'; // Red
      case 'Safety':
        return '#f97316'; // Orange
      case 'Community':
        return '#10b981'; // Green
      case 'Utilities':
        return '#3b82f6'; // Blue
      case 'Infrastructure':
        return '#8b5cf6'; // Purple
      case 'Traffic':
        return '#eab308'; // Amber
      default:
        return '#64748b'; // Slate
    }
  };

  // Group incidents by street for bubble & risk clustering
  const streetClusters = useMemo(() => {
    const map: Record<
      string,
      {
        street: string;
        subSector: string;
        lat: number;
        lng: number;
        count: number;
        primaryCategory: IncidentCategory;
        incidents: Incident[];
      }
    > = {};

    displayIncidents.forEach((inc) => {
      const key = `${inc.subSector}_${inc.streetNo}`;
      if (!map[key]) {
        map[key] = {
          street: inc.streetNo,
          subSector: inc.subSector,
          lat: inc.latitude,
          lng: inc.longitude,
          count: 0,
          primaryCategory: inc.incidentCategory,
          incidents: [],
        };
      }
      map[key].count++;
      map[key].incidents.push(inc);
    });

    return Object.values(map);
  }, [displayIncidents]);

  return (
    <div className="space-y-4">
      {/* Top Map Control Bar */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-400" /> Layer:
          </span>

          <button
            onClick={() => setViewMode('bubble')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              viewMode === 'bubble'
                ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20'
                : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            Bubble Map
          </button>

          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === 'heatmap'
                ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-500/20'
                : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Heatmap View
          </button>

          <button
            onClick={() => setViewMode('risk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === 'risk'
                ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Community Risk Map
          </button>

          <button
            onClick={() => setViewMode('cluster')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === 'cluster'
                ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/20'
                : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Marker Pin View
          </button>
        </div>

        {/* Sub-Sector Quick Filters */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 mr-1">Zone:</span>
          {['All', 'D-12/1', 'D-12/2', 'D-12/3', 'D-12/4'].map((sec) => {
            const isSelected =
              sec === 'All' ? activeSubSectorFilter === null : activeSubSectorFilter === sec;
            return (
              <button
                key={sec}
                onClick={() => setActiveSubSectorFilter(sec === 'All' ? null : sec)}
                className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {sec}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map Workspace: Sidebar Tree + Interactive Map Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Column: Expandable Category Tree & Area Scores */}
        <div className="lg:col-span-1 space-y-4">
          {/* Category Tree Box */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 max-h-[460px] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                Category Tree
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                {displayIncidents.length} active
              </span>
            </div>
            <CategoryTree
              categories={categories}
              selectedCategory={selectedCategory}
              selectedType={selectedType}
              onSelectNode={(cat, type) => onFilterCategory && onFilterCategory(cat, type)}
            />
          </div>

          {/* Area Risk Leaderboard */}
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 text-xs">
            <h4 className="font-bold text-slate-200 mb-2.5 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Area Risk Indices
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {riskScores.slice(0, 6).map((score) => (
                <div
                  key={score.areaName}
                  className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-slate-850"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        score.riskLevel === 'High'
                          ? 'bg-rose-500'
                          : score.riskLevel === 'Medium'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span className="text-slate-300 font-medium truncate">{score.areaName}</span>
                  </div>
                  <span
                    className={`font-mono font-bold text-[11px] ${
                      score.riskLevel === 'High'
                        ? 'text-rose-400'
                        : score.riskLevel === 'Medium'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    Score {score.riskScore}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: GIS Interactive Map Canvas */}
        <div className="lg:col-span-3 glass-panel rounded-xl border border-slate-800 relative overflow-hidden h-[580px] flex flex-col">
          {/* Map Canvas Header Strip */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs text-slate-200 flex items-center gap-2 shadow-lg">
              <Compass className="w-3.5 h-3.5 text-blue-400 animate-spin-slow" />
              <span className="font-semibold">Sector D-12 GIS Grid</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400 font-mono">33.730° N, 72.965° E</span>
            </div>
          </div>

          {/* Zoom & Control Floating Buttons */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.2))}
              className="p-2 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-lg cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
              className="p-2 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-lg cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-2 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-lg cursor-pointer"
              title="Reset View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Map Canvas Body */}
          <div className="relative w-full h-full bg-[#0a0f1d] overflow-hidden flex items-center justify-center">
            {/* SVG Vector Map of Sector D-12 */}
            <svg
              viewBox="0 0 1000 700"
              className="w-full h-full transition-transform duration-300 select-none"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* Definitions */}
              <defs>
                {/* Heatmap high risk radial gradient */}
                <radialGradient id="heatHigh" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#f97316" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                </radialGradient>
                {/* Heatmap medium risk radial gradient */}
                <radialGradient id="heatMed" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#eab308" stopOpacity="0.75" />
                  <stop offset="60%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#eab308" stopOpacity="0.0" />
                </radialGradient>
                {/* Subtle map pattern */}
                <pattern id="gisGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#162032" strokeWidth="0.8" />
                </pattern>
              </defs>

              {/* Background Grid */}
              <rect width="1000" height="700" fill="url(#gisGrid)" />

              {/* Margalla Hills Ridge Outline on North Boundary */}
              <path
                d="M 50 80 Q 250 50, 500 70 T 950 60 L 950 20 L 50 20 Z"
                fill="#111827"
                stroke="#1f2937"
                strokeWidth="1.5"
              />
              <text x="500" y="48" fill="#4b5563" fontSize="12" textAnchor="middle" fontWeight="bold" letterSpacing="3">
                MARGALLA HILLS NATIONAL PARK RIDGE (NORTH)
              </text>

              {/* Sector D-12 Quadrant Zones */}
              {/* D-12/1 (North-East) */}
              <rect
                x="520"
                y="110"
                width="420"
                height="240"
                rx="14"
                fill="#0d1527"
                stroke="#1e293b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text x="730" y="140" fill="#3b82f6" fontSize="14" fontWeight="bold" opacity="0.6">
                SUB-SECTOR D-12/1
              </text>

              {/* D-12/2 (North-West) */}
              <rect
                x="60"
                y="110"
                width="420"
                height="240"
                rx="14"
                fill="#0d1527"
                stroke="#1e293b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text x="270" y="140" fill="#3b82f6" fontSize="14" fontWeight="bold" opacity="0.6">
                SUB-SECTOR D-12/2
              </text>

              {/* D-12/3 (South-West) */}
              <rect
                x="60"
                y="390"
                width="420"
                height="260"
                rx="14"
                fill="#0d1527"
                stroke="#1e293b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text x="270" y="420" fill="#3b82f6" fontSize="14" fontWeight="bold" opacity="0.6">
                SUB-SECTOR D-12/3
              </text>

              {/* D-12/4 (South-East) */}
              <rect
                x="520"
                y="390"
                width="420"
                height="260"
                rx="14"
                fill="#0d1527"
                stroke="#1e293b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text x="730" y="420" fill="#3b82f6" fontSize="14" fontWeight="bold" opacity="0.6">
                SUB-SECTOR D-12/4
              </text>

              {/* Major Arterial Roads */}
              {/* Central Avenue (Vertical) */}
              <line x1="500" y1="80" x2="500" y2="670" stroke="#334155" strokeWidth="6" />
              <line x1="500" y1="80" x2="500" y2="670" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="10 8" />
              <text x="508" y="240" fill="#64748b" fontSize="10" transform="rotate(90, 508, 240)">
                CENTRAL DOUBLE ROAD
              </text>

              {/* Dividing Avenue (Horizontal) */}
              <line x1="50" y1="370" x2="950" y2="370" stroke="#334155" strokeWidth="6" />
              <line x1="50" y1="370" x2="950" y2="370" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="10 8" />
              <text x="350" y="364" fill="#64748b" fontSize="10">
                MAIN COMMERCIAL AVENUE (MARKAZ CORRIDOR)
              </text>

              {/* Internal Streets representation */}
              <path
                d="M 120 180 L 420 180 M 120 230 L 420 230 M 120 280 L 420 280 M 580 180 L 880 180 M 580 230 L 880 230 M 580 280 L 880 280 M 120 460 L 420 460 M 120 520 L 420 520 M 120 580 L 420 580 M 580 460 L 880 460 M 580 520 L 880 520 M 580 580 L 880 580"
                stroke="#1e293b"
                strokeWidth="2.5"
              />

              {/* Central Markaz Square */}
              <rect x="460" y="330" width="80" height="80" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
              <text x="500" y="375" fill="#93c5fd" fontSize="10" fontWeight="bold" textAnchor="middle">
                MARKAZ
              </text>

              {/* LAYER 2: HEATMAP VIEW */}
              {viewMode === 'heatmap' && (
                <g>
                  {streetClusters.map((cluster, idx) => {
                    const coords = projectCoords(cluster.lat, cluster.lng);
                    const svgX = (coords.x / 100) * 1000;
                    const svgY = (coords.y / 100) * 700;
                    const radius = Math.min(130, Math.max(50, cluster.count * 14));
                    const isHigh = cluster.count >= 4;

                    return (
                      <circle
                        key={idx}
                        cx={svgX}
                        cy={svgY}
                        r={radius}
                        fill={isHigh ? 'url(#heatHigh)' : 'url(#heatMed)'}
                        className="animate-pulse"
                      />
                    );
                  })}
                </g>
              )}

              {/* LAYER 3: COMMUNITY RISK MAP VIEW */}
              {viewMode === 'risk' && (
                <g>
                  {streetClusters.map((cluster, idx) => {
                    const coords = projectCoords(cluster.lat, cluster.lng);
                    const svgX = (coords.x / 100) * 1000;
                    const svgY = (coords.y / 100) * 700;

                    const riskData = riskScores.find((r) => r.areaName === cluster.street) || {
                      riskScore: cluster.count * 15,
                      riskLevel: cluster.count >= 4 ? 'High' : 'Medium',
                    };

                    const riskColor =
                      riskData.riskLevel === 'High'
                        ? '#ef4444'
                        : riskData.riskLevel === 'Medium'
                        ? '#f97316'
                        : '#10b981';

                    return (
                      <g
                        key={idx}
                        className="cursor-pointer group"
                        onClick={() => cluster.incidents[0] && setSelectedIncident(cluster.incidents[0])}
                      >
                        <circle
                          cx={svgX}
                          cy={svgY}
                          r={28}
                          fill={riskColor}
                          fillOpacity="0.25"
                          stroke={riskColor}
                          strokeWidth="2"
                        />
                        <circle cx={svgX} cy={svgY} r={16} fill={riskColor} />
                        <text
                          x={svgX}
                          y={svgY + 4}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="bold"
                        >
                          {riskData.riskScore}
                        </text>
                        <text
                          x={svgX}
                          y={svgY - 32}
                          textAnchor="middle"
                          fill="#f8fafc"
                          fontSize="11"
                          fontWeight="bold"
                        >
                          {cluster.street} ({riskData.riskLevel})
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* LAYER 1: BUBBLE MAP VIEW */}
              {viewMode === 'bubble' && (
                <g>
                  {streetClusters.map((cluster, idx) => {
                    const coords = projectCoords(cluster.lat, cluster.lng);
                    const svgX = (coords.x / 100) * 1000;
                    const svgY = (coords.y / 100) * 700;
                    const bubbleRadius = Math.min(36, Math.max(16, cluster.count * 4.5));
                    const color = getCategoryColor(cluster.primaryCategory);

                    return (
                      <g
                        key={idx}
                        className="cursor-pointer group"
                        onClick={() => cluster.incidents[0] && setSelectedIncident(cluster.incidents[0])}
                      >
                        {/* Outer Glow Halo */}
                        <circle
                          cx={svgX}
                          cy={svgY}
                          r={bubbleRadius + 6}
                          fill={color}
                          fillOpacity="0.18"
                          className="group-hover:fill-opacity-35 transition-all"
                        />
                        {/* Main Bubble */}
                        <circle
                          cx={svgX}
                          cy={svgY}
                          r={bubbleRadius}
                          fill={color}
                          fillOpacity="0.85"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="group-hover:scale-110 transition-transform origin-center"
                        />
                        {/* Incident Count in Bubble */}
                        <text
                          x={svgX}
                          y={svgY + 4}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize={bubbleRadius > 20 ? '12' : '10'}
                          fontWeight="bold"
                        >
                          {cluster.count}
                        </text>
                        {/* Label */}
                        <text
                          x={svgX}
                          y={svgY + bubbleRadius + 14}
                          textAnchor="middle"
                          fill="#cbd5e1"
                          fontSize="10"
                          fontWeight="semibold"
                        >
                          {cluster.street}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* LAYER 4: INDIVIDUAL MARKER PIN VIEW */}
              {viewMode === 'cluster' && (
                <g>
                  {displayIncidents.map((inc) => {
                    const coords = projectCoords(inc.latitude, inc.longitude);
                    const svgX = (coords.x / 100) * 1000;
                    const svgY = (coords.y / 100) * 700;
                    const color = getCategoryColor(inc.incidentCategory);
                    const isSelected = selectedIncident?.id === inc.id;

                    return (
                      <g
                        key={inc.id}
                        className="cursor-pointer group"
                        onClick={() => setSelectedIncident(inc)}
                      >
                        <circle
                          cx={svgX}
                          cy={svgY}
                          r={isSelected ? 10 : 6}
                          fill={color}
                          stroke="#ffffff"
                          strokeWidth={isSelected ? 2.5 : 1.5}
                          className="group-hover:scale-125 transition-transform origin-center"
                        />
                      </g>
                    );
                  })}
                </g>
              )}
            </svg>

            {/* Clicked Incident Popup Overlay */}
            {selectedIncident && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                <IncidentPopup
                  incident={selectedIncident}
                  onClose={() => setSelectedIncident(null)}
                  onViewDetails={(inc) => onViewDetails(inc)}
                />
              </div>
            )}
          </div>

          {/* Map Legend Footer */}
          <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-semibold">Category Legend:</span>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Security
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Safety
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Community
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Utilities
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Infrastructure
                </span>
              </div>
            </div>

            <div className="text-slate-400 font-mono text-[11px]">
              Showing <span className="text-white font-bold">{displayIncidents.length}</span> mapped locations
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
