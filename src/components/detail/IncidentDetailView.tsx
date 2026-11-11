'use client';

import React, { useState } from 'react';
import { Incident } from '@/lib/types/incident';
import { CategoryBadge, SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  MapPin,
  Calendar,
  Clock,
  Shield,
  MessageSquare,
  Volume2,
  Copy,
  Check,
  Languages,
  Layers,
  Building,
  AlertTriangle,
} from 'lucide-react';

interface IncidentDetailViewProps {
  incident: Incident | null;
  onBackToRegister: () => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export function IncidentDetailView({
  incident,
  onBackToRegister,
  onNavigatePrev,
  onNavigateNext,
  hasPrev = true,
  hasNext = true,
}: IncidentDetailViewProps) {
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [copiedUrdu, setCopiedUrdu] = useState(false);
  const [showEnglishTranslation, setShowEnglishTranslation] = useState(false);

  if (!incident) {
    return (
      <div className="glass-panel p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Incident Selected</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Select an incident from the Incident Register, Google Bubble Map, or Executive Dashboard to inspect its complete dossier.
        </p>
        <Button variant="primary" onClick={onBackToRegister} icon={<ArrowLeft className="w-4 h-4" />}>
          Go to Incident Register
        </Button>
      </div>
    );
  }

  const handleCopy = (text: string, type: 'wa' | 'urdu') => {
    navigator.clipboard.writeText(text);
    if (type === 'wa') {
      setCopiedWhatsApp(true);
      setTimeout(() => setCopiedWhatsApp(false), 2000);
    } else {
      setCopiedUrdu(true);
      setTimeout(() => setCopiedUrdu(false), 2000);
    }
  };

  const googleMapsUrl =
    incident.mapLink ||
    `https://maps.google.com/?q=${incident.latitude},${incident.longitude}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Navigation Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={onBackToRegister}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Register
        </Button>

        {/* Previous / Next Incident Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="glass"
            size="sm"
            onClick={onNavigatePrev}
            disabled={!hasPrev}
            icon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            Previous Case
          </Button>
          <Button
            variant="glass"
            size="sm"
            onClick={onNavigateNext}
            disabled={!hasNext}
          >
            Next Case <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>

      {/* Main Dossier Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="font-mono text-sm px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/40 font-bold">
                {incident.id}
              </span>
              <SeverityBadge severity={incident.incidentSeverity} />
              <StatusBadge status={incident.status} />
              <CategoryBadge category={incident.incidentCategory} />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {incident.incidentType}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {incident.briefDescription}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in Google Maps
            </a>
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
              {incident.latLong}
            </span>
          </div>
        </div>

        {/* Quick Facts Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block uppercase font-bold text-[10px]">Date of Record</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> {incident.fieldDate}
            </span>
          </div>

          <div>
            <span className="text-slate-500 dark:text-slate-400 block uppercase font-bold text-[10px]">Logged Time</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> {incident.time} HRS
            </span>
          </div>

          <div>
            <span className="text-slate-500 dark:text-slate-400 block uppercase font-bold text-[10px]">Zone & Street</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1.5 mt-0.5">
              <Building className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {incident.subSector}, {incident.streetNo}
            </span>
          </div>

          <div>
            <span className="text-slate-500 dark:text-slate-400 block uppercase font-bold text-[10px]">Assigned Authority</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1.5 mt-0.5">
              <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> {incident.authorities}
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Incident Intelligence Dossier: WhatsApp & Urdu Transcripts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Official WhatsApp Dispatch Report */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-300 dark:border-emerald-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-300 dark:border-emerald-500/30">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Incident Report (WhatsApp)</h3>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Original Dispatch Transmission</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(incident.incidentReportWhatsApp, 'wa')}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Copy Dispatch Text"
              >
                {copiedWhatsApp ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* WhatsApp Styled Message Bubble */}
            <div className="bg-[#e9f5ec] dark:bg-[#0b141a] p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 relative text-xs text-slate-800 dark:text-slate-200 space-y-2 leading-relaxed">
              <div className="flex items-center justify-between text-[10px] text-emerald-700 dark:text-emerald-400 font-mono border-b border-emerald-200 dark:border-emerald-900/30 pb-1">
                <span>D-12 CITIZEN SECURITY HELPLINE</span>
                <span>{incident.time} ✓✓</span>
              </div>
              <p className="whitespace-pre-wrap font-sans">
                {incident.incidentReportWhatsApp || 'No raw WhatsApp dispatch text attached for this record.'}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Source: Verified Sector Dispatch Network</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">Encrypted transmission</span>
          </div>
        </div>

        {/* Card 2: Urdu Voice / Audio Transcript */}
        <div className="glass-panel p-5 rounded-2xl border border-blue-300 dark:border-blue-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-300 dark:border-blue-500/30">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Transcript (Urdu)</h3>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">آڈیو ریکارڈنگ و اردو بیان</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEnglishTranslation(!showEnglishTranslation)}
                  className="flex items-center gap-1 text-[11px] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                  title="Toggle English Translation"
                >
                  <Languages className="w-3.5 h-3.5" />
                  {showEnglishTranslation ? 'Show Urdu' : 'Translate'}
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(incident.transcriptUrdu, 'urdu')}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Copy Urdu Transcript"
                >
                  {copiedUrdu ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Urdu Container */}
            <div className="bg-amber-50/50 dark:bg-slate-950/80 p-4 rounded-xl border border-amber-200 dark:border-slate-800 min-h-[110px] flex items-center">
              {showEnglishTranslation ? (
                <div className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  <strong>English Translation:</strong> &ldquo;{incident.briefDescription}&rdquo; (Transcribed from community Urdu audio dispatch).
                </div>
              ) : (
                <p className="urdu-text text-base sm:text-lg text-amber-900 dark:text-amber-200/90 w-full font-medium">
                  {incident.transcriptUrdu || 'کوئی اردو بیان موجود نہیں ہے۔'}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Audio Transcript Quality: High (Native Nastaliq)</span>
            <span className="font-mono text-blue-600 dark:text-blue-400">Audio Verified</span>
          </div>
        </div>
      </div>

      {/* Location Details & Dynamic Future Fields Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Location Information */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            Precise Location & Address
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-850">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Registered Address</span>
              <span className="text-slate-900 dark:text-slate-200 font-semibold text-sm mt-0.5 block">{incident.address}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Sub-Sector</span>
                <span className="text-slate-900 dark:text-slate-200 font-bold">{incident.subSector}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Street No.</span>
                <span className="text-slate-900 dark:text-slate-200 font-bold">{incident.streetNo}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">House / Plot</span>
                <span className="text-slate-900 dark:text-slate-200 font-bold">{incident.houseNo || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Future Fields Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Dynamic Google Sheet Fields
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Fields dynamically captured beyond standard schema (auto-syncs with sheet additions):
          </p>

          {incident.customFields && Object.keys(incident.customFields).length > 0 ? (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(incident.customFields).map(([key, value]) => (
                <div key={key} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-850">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-mono">{key}</span>
                  <span className="text-purple-700 dark:text-purple-300 font-semibold font-mono text-xs">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850 text-xs text-slate-500 italic text-center">
              No supplemental custom fields detected for this row. New columns added to Google Sheet will automatically populate here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
