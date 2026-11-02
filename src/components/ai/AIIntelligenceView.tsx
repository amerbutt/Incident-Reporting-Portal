'use client';

import React, { useState, useEffect } from 'react';
import { FilterState } from '@/lib/types/incident';
import { Button } from '@/components/ui/Button';
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Clock,
  FileText,
  Target,
  ArrowRight,
} from 'lucide-react';

interface AIIntelligenceViewProps {
  filters: FilterState;
  onUpdateFilters: (newFilters: FilterState) => void;
}

interface AIReportData {
  generatedAt: string;
  reportingPeriod: string;
  totalAnalyzed: number;
  executiveSummary: string;
  keyFindings: string[];
  majorTrends: string[];
  topRiskAreas: {
    name: string;
    score: number;
    level: string;
    primaryConcern: string;
    incidentCount: number;
  }[];
  emergingConcerns: string[];
  recommendations: string[];
  managementActions: {
    priority: string;
    action: string;
  }[];
}

export function AIIntelligenceView({ filters, onUpdateFilters }: AIIntelligenceViewProps) {
  const [report, setReport] = useState<AIReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAIReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters }),
      });
      const json = await res.json();
      if (json.success && json.report) {
        setReport(json.report);
      } else {
        throw new Error(json.error || 'Failed to generate report');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.datePreset, filters.subSectors, filters.categories, filters.severities]);

  const handleCopy = () => {
    if (!report) return;
    const text = `D-12 INCIDENT INTELLIGENCE EXECUTIVE BRIEF\nPeriod: ${report.reportingPeriod}\n\nEXECUTIVE SUMMARY:\n${report.executiveSummary}\n\nKEY FINDINGS:\n${report.keyFindings.map((f) => `• ${f}`).join('\n')}\n\nRECOMMENDATIONS:\n${report.recommendations.map((r) => `• ${r}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold text-purple-400 tracking-wider">
              Autonomous Intelligence Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Sector D-12 AI Incident Briefing
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Synthesizes trends, temporal spikes, corridor vulnerabilities, and authority response bottlenecks into actionable briefings.
          </p>
        </div>

        <div className="flex items-center gap-2.5 z-10 shrink-0">
          <Button
            variant="glass"
            size="sm"
            onClick={handleCopy}
            icon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? 'Copied' : 'Copy Brief'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={fetchAIReport}
            disabled={loading}
            icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            {loading ? 'Synthesizing...' : 'Regenerate Brief'}
          </Button>
        </div>
      </div>

      {loading && !report && (
        <div className="glass-panel p-16 rounded-2xl border border-slate-800 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <h3 className="text-base font-bold text-white">Synthesizing Incident Data</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Computing temporal clustering, street vulnerability scores, and authority resolution metrics across Sector D-12...
          </p>
        </div>
      )}

      {error && (
        <div className="glass-panel p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-300 text-xs">
          <strong>Synthesis Notice:</strong> {error}
        </div>
      )}

      {report && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="glass-panel p-6 rounded-2xl border border-blue-500/30 relative">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Executive Summary
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Period: {report.reportingPeriod} • {report.totalAnalyzed} Cases
              </span>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-slate-100 font-sans">
              {report.executiveSummary}
            </p>
          </div>

          {/* 2-Column: Key Findings & Major Trends */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Findings */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Key Analytical Findings
              </h3>
              <div className="space-y-2.5">
                {report.keyFindings.map((finding, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{finding}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Major Trends */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Major Temporal & Spatial Trends
              </h3>
              <div className="space-y-2.5">
                {report.majorTrends.map((trend, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{trend}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2-Column: Risk Areas & Emerging Concerns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Risk Areas */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                High Vulnerability Risk Corridors
              </h3>
              <div className="space-y-2">
                {report.topRiskAreas.map((area) => (
                  <div
                    key={area.name}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-850"
                  >
                    <div>
                      <span className="font-bold text-white text-xs">{area.name}</span>
                      <span className="text-[11px] text-slate-400 block">
                        Focus: {area.primaryConcern} ({area.incidentCount} cases)
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                        area.level === 'High'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      Score {area.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Emerging Concerns */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Emerging Operational Concerns
              </h3>
              <div className="space-y-2.5">
                {report.emergingConcerns.map((concern, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{concern}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations & Management Action Plan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strategic Recommendations */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Strategic AI Recommendations
              </h3>
              <div className="space-y-2.5">
                {report.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                    <span className="font-bold text-purple-400 font-mono text-xs shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prioritized Management Actions */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Management Action Directive Plan
              </h3>
              <div className="space-y-2">
                {report.managementActions.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-850 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded uppercase font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{item.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
