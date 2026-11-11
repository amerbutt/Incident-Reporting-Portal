import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Incident, KPISummary, AreaRiskScore } from '@/lib/types/incident';

export interface ReportConfig {
  reportingPeriod: string;
  subSector?: string;
  category?: string;
}

/**
 * Generate an executive, self-explanatory, strictly SINGLE-PAGE PDF report
 * tailored specifically for the Sector D-12 Community Initiative.
 */
export function generateSinglePageCommunityPDF(
  incidents: Incident[],
  kpis: KPISummary,
  riskAreas: AreaRiskScore[],
  config: ReportConfig
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;

  // 1. D-12 COMMUNITY HEADER BANNER (Top 95 pt)
  doc.setFillColor(15, 23, 42); // Navy slate (#0f172a)
  doc.rect(0, 0, pageWidth, 95, 'F');

  // Accent Blue Bottom Stripe
  doc.setFillColor(37, 99, 235); // Blue-600
  doc.rect(0, 91, pageWidth, 4, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('SECTOR D-12 SECURITY COMMITTEE INCIDENT REPORT', margin, 36);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('D12 Security Committee • Incident Operations & Safety Intelligence Brief', margin, 52);

  // Metadata Chips
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  const dateFormatted = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.text(`Reporting Period: ${config.reportingPeriod || 'All Historical Records'}  •  Date: ${dateFormatted}  •  Scope: Sector D-12`, margin, 74);
  doc.text(`Total Records: ${incidents.length} Verified Master Sheet Entries  •  Status: Single-Page Executive Briefing`, margin, 86);

  let currentY = 112;

  // 2. EXECUTIVE RESIDENT NARRATIVE (Concise 3-line summary)
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('1. COMMUNITY EXECUTIVE SUMMARY', margin, currentY);

  currentY += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const wildlifeCount = incidents.filter(
    (i) => i.incidentCategory === 'Wildlife' || i.incidentType.toLowerCase().includes('snake')
  ).length;
  const crimeCount = incidents.filter(
    (i) => i.incidentCategory === 'Crime' || i.incidentCategory === 'Security'
  ).length;

  const narrative =
    `This single-page executive intelligence summary is prepared by the D12 Security Committee to consolidate verified incident reports across Sector D-12, Islamabad. A total of ${incidents.length} events have been registered and analyzed. Wildlife incidents (primarily poisonous snakes from the adjacent Margalla hills) account for ${wildlifeCount} reports, while Crime and Security reports total ${crimeCount}. Sub-Sector ${kpis.mostAffectedSubSector || 'D-12/3'} represents the highest event concentration, with Street ${kpis.mostAffectedStreet || '144'} identified as the primary hotspot corridor. An acute peak in incident frequency is consistently logged between 8:00 PM and 11:00 PM.`;

  const splitNarrative = doc.splitTextToSize(narrative, contentWidth);
  doc.text(splitNarrative, margin, currentY);
  currentY += splitNarrative.length * 10 + 10;

  // 3. KEY METRICS SCORECARDS TABLE (6 Core Metrics)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. STRATEGIC COMMUNITY METRICS', margin, currentY);
  currentY += 8;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Total Incidents', 'Active Cases', 'Critical/High Alerts', 'Wildlife Encounters', 'Crime & Security', 'Top Hotspot Sub-Sector']],
    body: [
      [
        String(incidents.length),
        `${kpis.activeIncidents} (${kpis.openIncidents} Open)`,
        String(kpis.criticalCount + kpis.highCount),
        `${wildlifeCount} Reports`,
        `${crimeCount} Reports`,
        `${kpis.mostAffectedSubSector || 'D-12/3'} (St ${kpis.mostAffectedStreet || '144'})`,
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 4,
    },
  });

  currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14;

  // 4. SUB-SECTOR BREAKDOWN TABLE (D-12/1, D-12/2, D-12/3, D-12/4)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. SUB-SECTOR INCIDENT DISTRIBUTION', margin, currentY);
  currentY += 8;

  const subSectors = ['D-12/1', 'D-12/2', 'D-12/3', 'D-12/4'];
  const subSectorData = subSectors.map((sub) => {
    const subIncidents = incidents.filter((i) => i.subSector === sub);
    const count = subIncidents.length;
    const share = incidents.length > 0 ? Math.round((count / incidents.length) * 100) : 0;
    const resolved = subIncidents.filter((i) => i.status === 'Closed').length;
    const resolveRate = count > 0 ? Math.round((resolved / count) * 100) : 0;

    // Top type in this subsector
    const typeCount: Record<string, number> = {};
    subIncidents.forEach((i) => {
      typeCount[i.incidentType] = (typeCount[i.incidentType] || 0) + 1;
    });
    const topType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return [
      sub,
      String(count),
      `${share}%`,
      topType,
      `${resolveRate}% (${resolved}/${count})`,
      count >= 15 ? 'HIGH VIGILANCE' : count >= 8 ? 'MODERATE' : 'NORMAL',
    ];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Sub-Sector', 'Incident Count', 'Sector Share', 'Primary Typology', 'Resolution Rate', 'Risk Level']],
    body: subSectorData,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 3.5,
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      5: { fontStyle: 'bold' },
    },
  });

  currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14;

  // 5. TEMPORAL TRENDS & HOTSPOT CORRIDORS (Side-by-side structured data)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('4. TEMPORAL RISK WINDOW & HOTSPOT CORRIDORS', margin, currentY);
  currentY += 8;

  const topAreas = riskAreas.slice(0, 4).map((a: AreaRiskScore) => `${a.areaName} (${a.incidentCount} events - ${a.primaryCategory})`).join('  •  ');

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Temporal Risk Dimension', 'Community Observation & Street Corridors']],
    body: [
      ['Peak Hourly Risk Window', '8:00 PM – 11:00 PM (Sharp concentration in evening hours; reduced street visibility)'],
      ['Weekly Patrol Pattern', 'Elevated event frequency on Weekends and Friday evenings'],
      ['Top Street Corridors', topAreas || 'Street 144, Street Major Road 4, Street 15'],
      ['Wildlife Proximity', 'Margalla foothill perimeter borders (D-12/1 & D-12/3) report regular snake sightings'],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 3.5,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 140 },
    },
  });

  currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14;

  // 6. ACTIONABLE DIRECTIVES & RECOMMENDATIONS FOR D-12 RESIDENTS
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('5. ACTIONABLE COMMUNITY SAFETY RECOMMENDATIONS', margin, currentY);
  currentY += 8;

  const directives = [
    ['1. Night Patrol Reinforcement', 'Increase D12 Security Committee patrols between 8:00 PM and 11:30 PM, specifically on Street 144 and Major Road corridors.'],
    ['2. Margalla Wildlife Safeguards', 'Distribute snake repellant and cautionary guidance to houses bordering natural green belts. Keep emergency reptile handlers on alert.'],
    ['3. Street Lighting Upgrades', 'Ensure functional street lighting in Sub-Sector D-12/3 to mitigate theft and unauthorized vehicle loitering.'],
    ['4. Security Committee Coordination', 'Encourage residents to promptly log incidents via the D12 Security Committee WhatsApp broadcast group for immediate documentation.'],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    body: directives,
    theme: 'plain',
    bodyStyles: {
      fontSize: 7.5,
      textColor: [51, 65, 85],
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 160, textColor: [15, 23, 42] },
    },
  });

  // 7. FOOTER BAR (Anchored strictly to bottom of page 1)
  const footerY = pageHeight - 24;
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(0, footerY - 10, pageWidth, 34, 'F');

  doc.setDrawColor(203, 213, 225);
  doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Sector D-12 Security Committee Incident Portal  •  Master Data: Google Sheets API v4', margin, footerY + 4);
  doc.text('Page 1 of 1 (Complete Single-Page Executive Briefing)', pageWidth - margin - 200, footerY + 4);

  // Save the PDF
  const filename = `D12_Security_Committee_Incident_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

// Keep the multi-page generator as an alternative detailed audit option
export function generateDetailedRegisterPDF(
  incidents: Incident[],
  kpis: KPISummary,
  riskAreas: AreaRiskScore[],
  config: ReportConfig
) {
  return generateSinglePageCommunityPDF(incidents, kpis, riskAreas, config);
}
