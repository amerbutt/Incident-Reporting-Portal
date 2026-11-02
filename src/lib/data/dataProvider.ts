import { Incident, FilterState, KPISummary } from '@/lib/types/incident';

export interface DataProviderResponse<T> {
  data: T;
  source: 'google_sheets' | 'cache' | 'mock_database' | 'sql_database';
  totalCount: number;
  lastSyncedAt: string;
  error?: string;
}

export interface IIncidentDataProvider {
  getIncidents(filters?: Partial<FilterState>): Promise<DataProviderResponse<Incident[]>>;
  getIncidentById(id: string): Promise<Incident | null>;
  getStats(filters?: Partial<FilterState>): Promise<KPISummary>;
  getAvailableFields(): Promise<string[]>;
  syncData(): Promise<{ success: boolean; recordCount: number; timestamp: string }>;
  healthCheck(): Promise<{ ok: boolean; provider: string; message: string }>;
}
