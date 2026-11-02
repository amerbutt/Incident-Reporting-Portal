import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsProvider } from '@/lib/data/googleSheetsProvider';
import { FilterState, IncidentCategory, IncidentSeverity, IncidentStatus, DatePreset } from '@/lib/types/incident';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Parse filters
    const datePreset = (searchParams.get('datePreset') as DatePreset) || 'All Time';
    const customStartDate = searchParams.get('customStartDate') || undefined;
    const customEndDate = searchParams.get('customEndDate') || undefined;
    const subSectors = searchParams.getAll('subSector').filter(Boolean);
    const streets = searchParams.getAll('street').filter(Boolean);
    const houseNo = searchParams.get('houseNo') || undefined;
    const addressSearch = searchParams.get('address') || undefined;
    const categories = searchParams.getAll('category') as IncidentCategory[];
    const types = searchParams.getAll('type').filter(Boolean);
    const severities = searchParams.getAll('severity') as IncidentSeverity[];
    const statuses = searchParams.getAll('status') as IncidentStatus[];
    const authorities = searchParams.getAll('authority').filter(Boolean);
    const searchQuery = searchParams.get('q') || '';

    const filters: Partial<FilterState> = {
      datePreset,
      customStartDate,
      customEndDate,
      subSectors: subSectors.length > 0 ? subSectors : undefined,
      streets: streets.length > 0 ? streets : undefined,
      houseNo,
      addressSearch,
      categories: categories.length > 0 ? categories : undefined,
      types: types.length > 0 ? types : undefined,
      severities: severities.length > 0 ? severities : undefined,
      statuses: statuses.length > 0 ? statuses : undefined,
      authorities: authorities.length > 0 ? authorities : undefined,
      searchQuery,
    };

    const result = await googleSheetsProvider.getIncidents(filters);
    const stats = await googleSheetsProvider.getStats(filters);
    const availableFields = await googleSheetsProvider.getAvailableFields();

    // Collect distinct facet values for filter selectors
    const allResult = await googleSheetsProvider.getIncidents();
    const allIncidents = allResult.data;

    const facetSubSectors = Array.from(new Set(allIncidents.map((i) => i.subSector))).filter(Boolean).sort();
    const facetStreets = Array.from(new Set(allIncidents.map((i) => i.streetNo))).filter(Boolean).sort();
    const facetCategories = Array.from(new Set(allIncidents.map((i) => i.incidentCategory))).filter(Boolean).sort();
    const facetTypes = Array.from(new Set(allIncidents.map((i) => i.incidentType))).filter(Boolean).sort();
    const facetAuthorities = Array.from(
      new Set(
        allIncidents
          .flatMap((i) => i.authorities.split(',').map((a) => a.trim()))
          .filter(Boolean)
      )
    ).sort();

    return NextResponse.json({
      success: true,
      data: result.data,
      stats,
      totalCount: result.totalCount,
      source: result.source,
      lastSyncedAt: result.lastSyncedAt,
      availableFields,
      facets: {
        subSectors: facetSubSectors,
        streets: facetStreets,
        categories: facetCategories,
        types: facetTypes,
        authorities: facetAuthorities,
        severities: ['Critical', 'High', 'Medium', 'Low'],
        statuses: ['Open', 'In Progress', 'Closed', 'Pending Authority'],
      },
      error: result.error,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
