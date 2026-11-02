'use client';

import React from 'react';
import { Incident } from '@/lib/types/incident';
import { CategoryBadge, SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { X, ExternalLink, Eye, MapPin, Calendar, Clock, Shield } from 'lucide-react';

interface IncidentPopupProps {
  incident: Incident;
  onClose: () => void;
  onViewDetails: (incident: Incident) => void;
}

export function IncidentPopup({ incident, onClose, onViewDetails }: IncidentPopupProps) {
  const googleMapsUrl =
    incident.mapLink ||
    `https://maps.google.com/?q=${incident.latitude},${incident.longitude}`;

  return (
    <div className="glass-panel-elevated p-4 rounded-xl border border-slate-700/80 shadow-2xl w-80 max-w-sm space-y-3 text-xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="font-mono text-[10px] text-blue-400 font-bold">{incident.id}</span>
            <SeverityBadge severity={incident.incidentSeverity} />
            <StatusBadge status={incident.status} />
          </div>
          <h4 className="font-bold text-sm text-white">{incident.incidentType}</h4>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2">
        <CategoryBadge category={incident.incidentCategory} />
        <span className="text-slate-400 text-[11px] font-mono">{incident.subSector} • {incident.streetNo}</span>
      </div>

      {/* Description */}
      <p className="text-slate-300 line-clamp-3 leading-relaxed">
        {incident.briefDescription}
      </p>

      {/* Meta Grid */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>{incident.fieldDate}</span>
          <span className="text-slate-600">•</span>
          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{incident.time} HRS</span>
        </div>

        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="truncate">{incident.address}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="truncate">Authority: <strong className="text-slate-300">{incident.authorities}</strong></span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <Button
          variant="primary"
          size="sm"
          className="flex-1 text-xs py-1.5"
          onClick={() => onViewDetails(incident)}
          icon={<Eye className="w-3.5 h-3.5" />}
        >
          View Details
        </Button>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          title="Open in Google Maps"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
