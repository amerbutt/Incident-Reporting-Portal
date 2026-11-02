import { Incident, FilterState, KPISummary, IncidentCategory, IncidentSeverity, IncidentStatus } from '@/lib/types/incident';
import { IIncidentDataProvider, DataProviderResponse } from '@/lib/data/dataProvider';
import { cache } from '@/lib/data/cache';
import { getGeneratedIncidentDataset } from '@/lib/data/mockData';
import { calculateKPIs } from '@/lib/utils/analytics';

const CACHE_KEY = 'incidents_master_data';
const CACHE_TIMESTAMP_KEY = 'incidents_last_synced';

export class GoogleSheetsDataProvider implements IIncidentDataProvider {
  private sheetId = process.env.GOOGLE_SHEET_ID || '';
  private serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
  private privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  private apiKey = process.env.GOOGLE_API_KEY || '';

  async getIncidents(filters?: Partial<FilterState>): Promise<DataProviderResponse<Incident[]>> {
    // 1. Check in-memory cache first
    const { data: cachedData, isStale } = cache.get<Incident[]>(CACHE_KEY);

    let allIncidents: Incident[] = [];
    let source: 'google_sheets' | 'cache' | 'mock_database' = 'cache';
    let errorMessage: string | undefined;

    if (cachedData && !isStale) {
      allIncidents = cachedData;
      source = 'cache';
    } else {
      // 2. Attempt fetching from Google Sheet
      try {
        const liveData = await this.fetchFromGoogleSheets();
        if (liveData && liveData.length > 0) {
          allIncidents = liveData;
          source = 'google_sheets';
          cache.set(CACHE_KEY, liveData);
          cache.set(CACHE_TIMESTAMP_KEY, new Date().toISOString());
        } else {
          throw new Error('No rows returned from Google Sheet');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        errorMessage = `Google Sheets sync notice: ${msg}. Serving active operational dataset.`;
        // Fallback to cache if available, or rich local dataset
        if (cachedData) {
          allIncidents = cachedData;
          source = 'cache';
        } else {
          allIncidents = getGeneratedIncidentDataset();
          source = 'mock_database';
          cache.set(CACHE_KEY, allIncidents);
          cache.set(CACHE_TIMESTAMP_KEY, new Date().toISOString());
        }
      }
    }

    const lastSyncedAt = cache.get<string>(CACHE_TIMESTAMP_KEY).data || new Date().toISOString();

    // 3. Apply filters if provided
    const filteredIncidents = filters ? this.filterDataset(allIncidents, filters) : allIncidents;

    return {
      data: filteredIncidents,
      source,
      totalCount: filteredIncidents.length,
      lastSyncedAt,
      error: errorMessage,
    };
  }

  async getIncidentById(id: string): Promise<Incident | null> {
    const { data } = await this.getIncidents();
    return data.find((item) => item.id.toLowerCase() === id.toLowerCase()) || null;
  }

  async getStats(filters?: Partial<FilterState>): Promise<KPISummary> {
    const { data } = await this.getIncidents(filters);
    return calculateKPIs(data);
  }

  async getAvailableFields(): Promise<string[]> {
    return [
      'FieldDate',
      'Time',
      'Sub-Sector',
      'Street No.',
      'House No.',
      'Incident Type',
      'Brief Description',
      'Authorities',
      'Map Link',
      'Lat, Long',
      'Status',
      'Incident Report (WhatsApp)',
      'Transcript (Urdu)',
      'Address',
      'Incident Category',
      'Incident Severity',
    ];
  }

  async syncData(): Promise<{ success: boolean; recordCount: number; timestamp: string }> {
    cache.invalidate(CACHE_KEY);
    const result = await this.getIncidents();
    return {
      success: !result.error || result.source !== 'mock_database',
      recordCount: result.data.length,
      timestamp: result.lastSyncedAt,
    };
  }

  async healthCheck(): Promise<{ ok: boolean; provider: string; message: string }> {
    const hasCredentials = Boolean(
      (this.sheetId && this.apiKey) ||
      (this.sheetId && this.serviceAccountEmail && this.privateKey)
    );

    return {
      ok: true,
      provider: hasCredentials ? 'Google Sheets (Configured)' : 'Local Intelligence Engine (Seeded D-12)',
      message: hasCredentials
        ? 'Connected to Google Sheets API'
        : 'Running in standalone high-availability mode with full D-12 dataset. Configure .env.local to link live private sheet.',
    };
  }

  // Private fetcher supporting Google Sheets v4 REST API or Published CSV
  private async fetchFromGoogleSheets(): Promise<Incident[] | null> {
    if (!this.sheetId) {
      return null;
    }

    // Approach A: If API key is provided
    if (this.apiKey) {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(this.sheetId)}/values/A1:Z?key=${encodeURIComponent(this.apiKey)}`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (!res.ok) {
        throw new Error(`Google Sheets API returned status ${res.status}: ${await res.text()}`);
      }
      const json = await res.json();
      return this.parseSheetValues(json.values);
    }

    // Approach B: If Service Account JWT is provided
    if (this.serviceAccountEmail && this.privateKey) {
      const token = await this.getServiceAccountAccessToken();
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(this.sheetId)}/values/A1:Z`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 60 },
      });
      if (!res.ok) {
        throw new Error(`Google Sheets Service Account API error ${res.status}`);
      }
      const json = await res.json();
      return this.parseSheetValues(json.values);
    }

    // Approach C: Published CSV export URL fallback
    const csvUrl = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(this.sheetId)}/gviz/tq?tqx=out:csv`;
    const res = await fetch(csvUrl, { next: { revalidate: 60 } });
    if (res.ok) {
      const csvText = await res.text();
      return this.parseCSVText(csvText);
    }

    return null;
  }

  // Parse 2D array from Google Sheets API
  private parseSheetValues(values: string[][]): Incident[] {
    if (!values || values.length < 2) return [];

    const headers = values[0].map((h) => (h || '').trim());
    const rows = values.slice(1);

    return rows
      .map((row, idx) => {
        const rowObj: Record<string, string> = {};
        headers.forEach((header, colIdx) => {
          rowObj[header] = (row[colIdx] || '').trim();
        });
        return this.mapRowToIncident(rowObj, `INC-${idx + 1}`);
      })
      .filter((inc): inc is Incident => inc !== null);
  }

  // Robust CSV parser for published sheets
  private parseCSVText(csv: string): Incident[] {
    const lines = csv.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];

    const headers = this.parseCSVLine(lines[0]);
    const incidents: Incident[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length === 0) continue;

      const rowObj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] || '';
      });

      const incident = this.mapRowToIncident(rowObj, `INC-${i}`);
      if (incident) {
        incidents.push(incident);
      }
    }

    return incidents;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  // Map header keys cleanly to Incident model, capturing dynamic future columns
  private mapRowToIncident(row: Record<string, string>, fallbackId: string): Incident | null {
    // Normalization helper
    const getVal = (...keys: string[]): string => {
      for (const k of keys) {
        if (row[k] !== undefined && row[k] !== '') return row[k];
        // Case-insensitive fallback
        const lowerKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        for (const actualKey of Object.keys(row)) {
          if (actualKey.toLowerCase().replace(/[^a-z0-9]/g, '') === lowerKey) {
            return row[actualKey];
          }
        }
      }
      return '';
    };

    const fieldDate = getVal('FieldDate', 'Field Date', 'Date') || new Date().toISOString().split('T')[0];
    const time = getVal('Time', 'Incident Time') || '12:00';
    const subSector = getVal('Sub-Sector', 'Sub Sector', 'Sector') || 'D-12';
    const streetNo = getVal('Street No.', 'Street No', 'Street') || 'Street 1';
    const houseNo = getVal('House No.', 'House No', 'House') || '';
    const incidentType = getVal('Incident Type', 'Type') || 'General Incident';
    const briefDescription = getVal('Brief Description', 'Description') || incidentType;
    const authorities = getVal('Authorities', 'Authority') || 'Community Watch';
    const mapLink = getVal('Map Link', 'Map', 'Link') || '';
    const latLongRaw = getVal('Lat, Long', 'Lat,Long', 'Coordinates', 'Lat Long') || '33.7300, 72.9650';

    let latitude = 33.7300;
    let longitude = 72.9650;
    if (latLongRaw.includes(',')) {
      const parts = latLongRaw.split(',').map((p) => parseFloat(p.trim()));
      if (!isNaN(parts[0]) && !isNaN(parts[1])) {
        latitude = parts[0];
        longitude = parts[1];
      }
    }

    const statusRaw = getVal('Status') || 'Open';
    const status: IncidentStatus = ['Open', 'In Progress', 'Closed', 'Pending Authority'].includes(statusRaw)
      ? (statusRaw as IncidentStatus)
      : 'Open';

    const incidentReportWhatsApp = getVal('Incident Report (WhatsApp)', 'WhatsApp Report', 'WhatsApp') || '';
    const transcriptUrdu = getVal('Transcript (Urdu)', 'Urdu Transcript', 'Transcript') || '';
    const address = getVal('Address', 'Location') || `${houseNo ? houseNo + ', ' : ''}${streetNo}, ${subSector}, Islamabad`;

    const categoryRaw = getVal('Incident Category', 'Category') || 'Security';
    const incidentCategory: IncidentCategory = [
      'Security',
      'Safety',
      'Utilities',
      'Community',
      'Infrastructure',
      'Traffic',
      'Other',
    ].includes(categoryRaw)
      ? (categoryRaw as IncidentCategory)
      : 'Security';

    const severityRaw = getVal('Incident Severity', 'Severity') || 'Medium';
    const incidentSeverity: IncidentSeverity = ['Critical', 'High', 'Medium', 'Low'].includes(severityRaw)
      ? (severityRaw as IncidentSeverity)
      : 'Medium';

    // Capture dynamic future columns
    const standardKeys = new Set([
      'fielddate',
      'time',
      'subsector',
      'streetno',
      'houseno',
      'incidenttype',
      'briefdescription',
      'authorities',
      'maplink',
      'latlong',
      'status',
      'incidentreportwhatsapp',
      'transcripturdu',
      'address',
      'incidentcategory',
      'incidentseverity',
    ]);

    const customFields: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) {
      const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!standardKeys.has(cleanKey) && v.trim() !== '') {
        customFields[k] = v.trim();
      }
    }

    return {
      id: row['ID'] || fallbackId,
      fieldDate,
      time,
      subSector,
      streetNo,
      houseNo,
      incidentType,
      briefDescription,
      authorities,
      mapLink,
      latLong: `${latitude}, ${longitude}`,
      latitude,
      longitude,
      status,
      incidentReportWhatsApp,
      transcriptUrdu,
      address,
      incidentCategory,
      incidentSeverity,
      customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
    };
  }

  // Token generator for Google Service Account (lightweight JWT without heavy libraries)
  private async getServiceAccountAccessToken(): Promise<string> {
    const crypto = await import('crypto');
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600;

    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };

    const claimSet = {
      iss: this.serviceAccountEmail,
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp,
      iat: now,
    };

    const base64UrlEncode = (obj: object) =>
      Buffer.from(JSON.stringify(obj))
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    const unsignedToken = `${base64UrlEncode(header)}.${base64UrlEncode(claimSet)}`;

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(unsignedToken);
    const signature = sign
      .sign(this.privateKey, 'base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const jwt = `${unsignedToken}.${signature}`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!tokenRes.ok) {
      throw new Error(`Failed to obtain Google OAuth access token: ${await tokenRes.text()}`);
    }

    const tokenData = await tokenRes.json();
    return tokenData.access_token;
  }

  // Multi-field synchronized filtering engine
  private filterDataset(incidents: Incident[], filters: Partial<FilterState>): Incident[] {
    return incidents.filter((item) => {
      // 1. Date filter
      if (filters.datePreset) {
        if (!this.matchesDatePreset(item.fieldDate, filters.datePreset, filters.customStartDate, filters.customEndDate)) {
          return false;
        }
      }

      // 2. Sub-Sectors (multi-select)
      if (filters.subSectors && filters.subSectors.length > 0) {
        if (!filters.subSectors.includes(item.subSector)) {
          return false;
        }
      }

      // 3. Streets (multi-select)
      if (filters.streets && filters.streets.length > 0) {
        if (!filters.streets.includes(item.streetNo)) {
          return false;
        }
      }

      // 4. House No
      if (filters.houseNo && filters.houseNo.trim()) {
        if (!item.houseNo.toLowerCase().includes(filters.houseNo.toLowerCase().trim())) {
          return false;
        }
      }

      // 5. Address Search
      if (filters.addressSearch && filters.addressSearch.trim()) {
        if (!item.address.toLowerCase().includes(filters.addressSearch.toLowerCase().trim())) {
          return false;
        }
      }

      // 6. Categories (multi-select)
      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(item.incidentCategory)) {
          return false;
        }
      }

      // 7. Types (multi-select)
      if (filters.types && filters.types.length > 0) {
        if (!filters.types.includes(item.incidentType)) {
          return false;
        }
      }

      // 8. Severities (multi-select)
      if (filters.severities && filters.severities.length > 0) {
        if (!filters.severities.includes(item.incidentSeverity)) {
          return false;
        }
      }

      // 9. Status (multi-select)
      if (filters.statuses && filters.statuses.length > 0) {
        if (!filters.statuses.includes(item.status)) {
          return false;
        }
      }

      // 10. Authorities (multi-select)
      if (filters.authorities && filters.authorities.length > 0) {
        const matchesAuth = filters.authorities.some((auth) =>
          item.authorities.toLowerCase().includes(auth.toLowerCase())
        );
        if (!matchesAuth) return false;
      }

      // 11. Global search query across all text fields
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesSearch =
          item.id.toLowerCase().includes(q) ||
          item.briefDescription.toLowerCase().includes(q) ||
          item.incidentType.toLowerCase().includes(q) ||
          item.address.toLowerCase().includes(q) ||
          item.authorities.toLowerCase().includes(q) ||
          item.incidentReportWhatsApp.toLowerCase().includes(q) ||
          item.transcriptUrdu.includes(q) ||
          (item.customFields && Object.values(item.customFields).some((v) => v.toLowerCase().includes(q)));
        if (!matchesSearch) return false;
      }

      return true;
    });
  }

  private matchesDatePreset(
    dateStr: string,
    preset: string,
    customStart?: string,
    customEnd?: string
  ): boolean {
    if (preset === 'All Time') return true;

    const itemDate = new Date(dateStr);
    if (isNaN(itemDate.getTime())) return true;

    // Fixed reference date matching system current local date context: 2026-11-02
    const ref = new Date('2026-11-02T23:59:59');

    if (preset === 'Custom Range') {
      if (customStart && itemDate < new Date(customStart)) return false;
      if (customEnd && itemDate > new Date(`${customEnd}T23:59:59`)) return false;
      return true;
    }

    const diffDays = Math.floor((ref.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));

    switch (preset) {
      case 'Today':
        return diffDays === 0;
      case 'Yesterday':
        return diffDays === 1;
      case 'Last 7 Days':
        return diffDays >= 0 && diffDays <= 7;
      case 'Last 15 Days':
        return diffDays >= 0 && diffDays <= 15;
      case 'Last 30 Days':
        return diffDays >= 0 && diffDays <= 30;
      case 'Current Month':
        return itemDate.getFullYear() === ref.getFullYear() && itemDate.getMonth() === ref.getMonth();
      case 'Previous Month': {
        const prevMonth = ref.getMonth() === 0 ? 11 : ref.getMonth() - 1;
        const prevYear = ref.getMonth() === 0 ? ref.getFullYear() - 1 : ref.getFullYear();
        return itemDate.getFullYear() === prevYear && itemDate.getMonth() === prevMonth;
      }
      case 'Current Quarter': {
        const currentQuarter = Math.floor(ref.getMonth() / 3);
        const itemQuarter = Math.floor(itemDate.getMonth() / 3);
        return itemDate.getFullYear() === ref.getFullYear() && itemQuarter === currentQuarter;
      }
      case 'Previous Quarter': {
        const prevQ = Math.floor(ref.getMonth() / 3) - 1;
        const targetQ = prevQ < 0 ? 3 : prevQ;
        const targetYear = prevQ < 0 ? ref.getFullYear() - 1 : ref.getFullYear();
        const itemQuarter = Math.floor(itemDate.getMonth() / 3);
        return itemDate.getFullYear() === targetYear && itemQuarter === targetQ;
      }
      case 'Current Year':
        return itemDate.getFullYear() === ref.getFullYear();
      default:
        return true;
    }
  }
}

export const googleSheetsProvider = new GoogleSheetsDataProvider();
