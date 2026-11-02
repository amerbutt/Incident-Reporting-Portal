// Complete schema for D12 Community Incident Intelligence Portal (IIP)

export type IncidentCategory =
  | 'Security'
  | 'Safety'
  | 'Utilities'
  | 'Community'
  | 'Infrastructure'
  | 'Traffic'
  | 'Other';

export type IncidentSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export type IncidentStatus = 'Open' | 'In Progress' | 'Closed' | 'Pending Authority';

export interface Incident {
  id: string;
  fieldDate: string; // YYYY-MM-DD
  time: string; // HH:mm (24h)
  subSector: string; // e.g. "D-12/1", "D-12/2", "D-12/3", "D-12/4"
  streetNo: string; // e.g. "Street 5", "Street 12"
  houseNo: string; // e.g. "45", "112-A"
  incidentType: string; // e.g. "Theft", "Suspicious Activity", "Water Shortage"
  briefDescription: string;
  authorities: string; // e.g. "Police, CDA", "Rescue 1122"
  mapLink: string; // Google Maps URL or query
  latLong: string; // "33.7295, 72.9658"
  latitude: number;
  longitude: number;
  status: IncidentStatus;
  incidentReportWhatsApp: string; // WhatsApp dispatch/alert text
  transcriptUrdu: string; // Urdu audio transcript or message
  address: string; // Full address
  incidentCategory: IncidentCategory;
  incidentSeverity: IncidentSeverity;
  // Dynamic fields added in future Google Sheet versions
  customFields?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export type DatePreset =
  | 'Today'
  | 'Yesterday'
  | 'Last 7 Days'
  | 'Last 15 Days'
  | 'Last 30 Days'
  | 'Current Month'
  | 'Previous Month'
  | 'Current Quarter'
  | 'Previous Quarter'
  | 'Current Year'
  | 'Custom Range'
  | 'All Time';

export interface FilterState {
  datePreset: DatePreset;
  customStartDate?: string;
  customEndDate?: string;
  subSectors: string[];
  streets: string[];
  houseNo?: string;
  addressSearch?: string;
  categories: IncidentCategory[];
  types: string[];
  severities: IncidentSeverity[];
  statuses: IncidentStatus[];
  authorities: string[];
  searchQuery: string;
}

export interface KPISummary {
  totalIncidents: number;
  openIncidents: number;
  closedIncidents: number;
  activeIncidents: number;
  totalCategories: number;
  totalTypes: number;
  mostCommonType: string;
  mostCommonTypeCount: number;
  mostAffectedSubSector: string;
  mostAffectedSubSectorCount: number;
  mostAffectedStreet: string;
  mostAffectedStreetCount: number;
  avgDailyIncidents: number;
  incidentChangePercent: number; // vs previous equivalent period (+/-)
  monthToDateCount: number;
  yearToDateCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export interface AreaRiskScore {
  areaName: string; // e.g. "Street 5" or "D-12/2"
  incidentCount: number;
  riskScore: number; // 0-100
  riskLevel: 'High' | 'Medium' | 'Low';
  primaryCategory: string;
  lastIncidentDate: string;
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
  critical?: number;
  high?: number;
  medium?: number;
  low?: number;
  open?: number;
  closed?: number;
}

export interface HourlyDistribution {
  hour: number; // 0-23
  label: string; // "8 PM"
  count: number;
}

export interface DayOfWeekDistribution {
  dayIndex: number; // 0-6 (Sun-Sat)
  dayName: string; // "Mon", "Tue", etc.
  count: number;
}

export interface AuthorityStat {
  authority: string;
  count: number;
  openCount: number;
  closedCount: number;
  percent: number;
}

export interface CategoryHierarchyNode {
  category: IncidentCategory;
  count: number;
  color: string;
  types: {
    name: string;
    count: number;
  }[];
}
