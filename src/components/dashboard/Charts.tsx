'use client';

import React, { useState } from 'react';
import { TimeSeriesPoint, HourlyDistribution, DayOfWeekDistribution, AuthorityStat, IncidentCategory } from '@/lib/types/incident';

// 1. Daily Trend Area Chart (SVG)
export function DailyTrendChart({ data }: { data: TimeSeriesPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="text-center py-12 text-slate-500 text-sm">No trend data available</div>;
  }

  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 20, bottom: 30, left: 35 };

  const maxVal = Math.max(...data.map((d) => d.count), 5);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(1, data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - (d.count / maxVal) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const y = padding.top + chartHeight * (1 - pct);
          const val = Math.round(maxVal * pct);
          return (
            <g key={idx}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#1e293b"
                strokeDasharray="4 4"
              />
              <text x={padding.left - 8} y={y + 3} textAnchor="end" fill="#64748b" fontSize="10">
                {val}
              </text>
            </g>
          );
        })}

        {/* Gradient fill area */}
        <path d={areaD} fill="url(#trendGradient)" />

        {/* Trend Line */}
        <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />

        {/* Data points */}
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r={hoverIndex === idx ? 5 : 3}
            fill={hoverIndex === idx ? '#60a5fa' : '#3b82f6'}
            stroke="#0f172a"
            strokeWidth="2"
            className="cursor-pointer transition-all"
            onMouseEnter={() => setHoverIndex(idx)}
            onMouseLeave={() => setHoverIndex(null)}
          />
        ))}

        {/* X-axis date labels */}
        {points
          .filter((_, idx) => idx % Math.ceil(points.length / 6) === 0 || idx === points.length - 1)
          .map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="10"
              fontFamily="sans-serif"
            >
              {p.date}
            </text>
          ))}
      </svg>

      {/* Tooltip */}
      {hoverIndex !== null && points[hoverIndex] && (
        <div
          className="absolute z-10 pointer-events-none bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg shadow-xl text-xs"
          style={{
            left: `${(points[hoverIndex].x / width) * 100}%`,
            top: `${(points[hoverIndex].y / height) * 100}%`,
            transform: 'translate(-50%, -120%)',
          }}
        >
          <div className="font-semibold text-white">{points[hoverIndex].date}</div>
          <div className="text-blue-400 font-mono">Total Incidents: {points[hoverIndex].count}</div>
          {points[hoverIndex].critical !== undefined && (
            <div className="text-rose-400 font-mono text-[11px]">Critical: {points[hoverIndex].critical}</div>
          )}
        </div>
      )}
    </div>
  );
}

// 2. Hourly Distribution Histogram (0 - 23h)
export function HourlyDistributionChart({ data }: { data: HourlyDistribution[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
        <span>12 AM (Midnight)</span>
        <span className="text-amber-400 font-medium">8 PM – 11 PM (Critical Evening Surge)</span>
        <span>11 PM</span>
      </div>
      <div className="flex items-end gap-1 h-36 pt-4 px-1 bg-slate-950/40 rounded-lg border border-slate-800/80">
        {data.map((item) => {
          const heightPct = Math.max(6, Math.round((item.count / maxCount) * 100));
          const isPeakEvening = item.hour >= 20 && item.hour <= 23;

          return (
            <div
              key={item.hour}
              className="group relative flex-1 flex flex-col items-center h-full justify-end cursor-pointer"
            >
              {/* Tooltip on hover */}
              <div className="absolute -top-9 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                <span className="bg-slate-900 border border-slate-700 text-white text-[11px] px-2 py-0.5 rounded shadow whitespace-nowrap">
                  {item.label}: <strong className="text-blue-400">{item.count}</strong>
                </span>
                <span className="w-1.5 h-1.5 bg-slate-700 rotate-45 -mt-1" />
              </div>

              {/* Bar */}
              <div
                style={{ height: `${heightPct}%` }}
                className={`w-full rounded-t transition-all ${
                  isPeakEvening
                    ? 'bg-gradient-to-t from-amber-600 to-rose-500 shadow-sm shadow-rose-500/30 group-hover:brightness-125'
                    : 'bg-gradient-to-t from-blue-700/60 to-blue-500/80 group-hover:from-blue-600 group-hover:to-blue-400'
                }`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-slate-500 px-1 font-mono">
        <span>00h</span>
        <span>06h</span>
        <span>12h</span>
        <span>18h</span>
        <span>23h</span>
      </div>
    </div>
  );
}

// 3. Day of Week Chart
export function DayOfWeekChart({ data }: { data: DayOfWeekDistribution[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="grid grid-cols-7 gap-2 h-36 items-end pt-4 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
      {data.map((item) => {
        const heightPct = Math.max(10, Math.round((item.count / maxCount) * 100));
        const isWeekend = item.dayName === 'Sat' || item.dayName === 'Sun';

        return (
          <div key={item.dayName} className="group flex flex-col items-center h-full justify-end">
            <div className="text-[11px] text-slate-300 font-mono mb-1 group-hover:text-blue-400">
              {item.count}
            </div>
            <div
              style={{ height: `${heightPct}%` }}
              className={`w-full max-w-[28px] rounded-t transition-all ${
                isWeekend
                  ? 'bg-gradient-to-t from-indigo-700 to-purple-500 group-hover:brightness-125'
                  : 'bg-gradient-to-t from-blue-800 to-cyan-500 group-hover:brightness-125'
              }`}
            />
            <span className="text-xs text-slate-400 mt-2 font-medium">{item.dayName}</span>
          </div>
        );
      })}
    </div>
  );
}

// 4. Incident Category Donut Chart (SVG)
export function CategoryDonutChart({
  categories,
  total,
}: {
  categories: { category: IncidentCategory; count: number; color: string }[];
  total: number;
}) {
  const size = 160;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* SVG Donut */}
      <div className="relative shrink-0 w-40 h-40">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
          />
          {categories.map((cat, idx) => {
            const percent = total > 0 ? cat.count / total : 0;
            const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
            const strokeDashoffset = -circumference * accumulatedPercent;
            accumulatedPercent += percent;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={cat.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 hover:opacity-80"
              />
            );
          })}
        </svg>

        {/* Center count display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-white font-mono">{total}</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Cases</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 grid grid-cols-2 gap-2 text-xs w-full">
        {categories.map((cat) => {
          const pct = total > 0 ? Math.round((cat.count / total) * 100) : 0;
          return (
            <div key={cat.category} className="flex items-center justify-between p-1.5 rounded bg-slate-900/50 border border-slate-800">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-slate-300 truncate">{cat.category}</span>
              </div>
              <span className="font-mono text-slate-400 shrink-0 ml-1">
                {cat.count} <span className="text-[10px] text-slate-500">({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 5. Authority Workload Chart
export function AuthorityWorkloadChart({ data }: { data: AuthorityStat[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-3">
      {data.map((item) => {
        const widthPct = Math.round((item.count / maxCount) * 100);
        return (
          <div key={item.authority} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-200">{item.authority}</span>
              <div className="flex items-center gap-2 font-mono text-slate-400">
                <span className="text-emerald-400">{item.closedCount} resolved</span>
                <span>•</span>
                <span className="text-amber-400">{item.openCount} open</span>
                <span>•</span>
                <span className="font-bold text-white">{item.count} total</span>
              </div>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
              <div
                style={{ width: `${widthPct}%` }}
                className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-full"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
