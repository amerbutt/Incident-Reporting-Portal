import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Incident, KPISummary, AreaRiskScore } from '@/lib/types/incident';

export interface ReportConfig {
  reportingPeriod: string;
  subSector?: string;
  category?: string;
  includeKPIs: boolean;
  includeTrends: boolean;
  includeRiskAreas: boolean;
  includeRegister: boolean;
  includeRecommendations: boolean;
}

export function generateExecutivePDF(
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
  const margin = 40;

  // 1. BRANDED COVER HEADER
  // Header bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 120, 'F');

  doc.setFillColor(37, 99, 235); // blue-600 accent stripe
  doc.rect(0, 116, pageWidth, 4, 'F');

  // Title & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('D12 COMMUNITY INCIDENT INTELLIGENCE PORTAL', margin, 45);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Sector D-12, Islamabad • Capital Development Authority & Citizen Watch', margin, 65);

  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`Official Executive Intelligence Brief • Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 85);
  doc.text(`Reporting Period: ${config.reportingPeriod} • Total Records Analyzed: ${incidents.length}`, margin, 100);

  let currentY = 145;

  // 2. EXECUTIVE SUMMARY SECTION
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('1. EXECUTIVE SUMMARY', margin, currentY);

  currentY += 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);

  const securityCount = incidents.filter((i) => i.incidentCategory === 'Security').length;
  const securityPct = incidents.length > 0 ? Math.round((securityCount / incidents.length) * 100) : 0;

  const summaryText =
    `During the selected reporting period (${config.reportingPeriod}), a total of ${kpis.totalIncidents} incident records were registered and processed across Sector D-12. Security-related incidents represented ${securityPct}% of all community reports. Sub-Sector ${kpis.mostAffectedSubSector} registered the highest event density, with ${kpis.mostAffectedStreet} emerging as the primary hotspot corridor. Most incidents occurred between 8:00 PM and 11:00 PM. Case clearance stands at ${kpis.totalIncidents > 0 ? Math.round((kpis.closedIncidents / kpis.totalIncidents) * 100) : 0}%, with ${kpis.activeIncidents} cases currently open or undergoing active field investigation.`;

  const splitSummary = doc.splitTextToSize(summaryText, pageWidth - margin * 2);
  doc.text(splitSummary, margin, currentY);
  currentY += splitSummary.length * 13 + 15;

  // 3. KEY PERFORMANCE SCORECARDS (TABLE)
  if (config.includeKPIs) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text('2. STRATEGIC METRICS & KPI SCORECARDS', margin, currentY);
    currentY += 10;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Metric', 'Value', 'Status / Context', 'Change vs Prev']],
      body: [
        ['Total Logged Incidents', String(kpis.totalIncidents), 'Verified Sheet Records', `${kpis.incidentChangePercent}%`],
        ['Active Cases (Open/Progress)', String(kpis.activeIncidents), `${kpis.openIncidents} strictly Open`, 'Pending Resolution'],
        ['Closed / Resolved Cases', String(kpis.closedIncidents), `${kpis.totalIncidents > 0 ? Math.round((kpis.closedIncidents / kpis.totalIncidents) * 100) : 0}% Clearance Rate`, 'Positive Trend'],
        ['Critical Severity Cases', String(kpis.criticalCount), 'Immediate Priority (P1)', 'High Threat Level'],
        ['Primary Typology', kpis.mostCommonType, `${kpis.mostCommonTypeCount} Occurrences`, 'Rank 1 Pattern'],
        ['Most Affected Hotspot', `${kpis.mostAffectedSubSector}, ${kpis.mostAffectedStreet}`, `${kpis.mostAffectedStreetCount} Incidents`, 'Patrol Focus Zone'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
      styles: { cellPadding: 5 },
    });

    currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;
  }

  // 4. COMMUNITY AREA RISK SCORING
  if (config.includeRiskAreas) {
    if (currentY > pageHeight - 160) {
      doc.addPage();
      currentY = 40;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text('3. COMMUNITY AREA RISK ASSESSMENT (TOP CORRIDORS)', margin, currentY);
    currentY += 10;

    const riskRows = riskAreas.slice(0, 6).map((r) => [
      r.areaName,
      String(r.incidentCount),
      `${r.riskScore} / 100`,
      r.riskLevel,
      r.primaryCategory,
      r.lastIncidentDate,
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Corridor / Street', 'Incidents', 'Risk Score', 'Risk Level', 'Primary Concern', 'Last Incident Date']],
      body: riskRows,
      theme: 'grid',
      headStyles: { fillColor: [185, 28, 28], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 8.5 },
      styles: { cellPadding: 4.5 },
    });

    currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;
  }

  // 5. INCIDENT REGISTER SAMPLE TABLE
  if (config.includeRegister) {
    if (currentY > pageHeight - 180) {
      doc.addPage();
      currentY = 40;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text('4. INCIDENT AUDIT REGISTER (RECENT CASES)', margin, currentY);
    currentY += 10;

    const registerRows = incidents.slice(0, 10).map((inc) => [
      inc.id,
      inc.fieldDate,
      inc.time,
      `${inc.subSector}, ${inc.streetNo}`,
      inc.incidentType,
      inc.incidentSeverity,
      inc.status,
      inc.authorities,
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['ID', 'Date', 'Time', 'Location', 'Type', 'Severity', 'Status', 'Authorities']],
      body: registerRows,
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 8.5 },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
      styles: { cellPadding: 4 },
    });

    currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;
  }

  // 6. STRATEGIC RECOMMENDATIONS & ACTIONS
  if (config.includeRecommendations) {
    if (currentY > pageHeight - 160) {
      doc.addPage();
      currentY = 40;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text('5. STRATEGIC RECOMMENDATIONS & DIRECTIVES', margin, currentY);
    currentY += 15;

    const recommendations = [
      '1. Intensify Islamabad Police mobile patrols along Street 5 and Street 7 between 20:00 and 02:00 hrs.',
      '2. Direct CDA Electrical Directorate to replace damaged streetlight fixtures on Street 22 to eliminate darkness corridors.',
      '3. Enforce mandatory registration and biometric badging for construction site laborers through the D-12 Citizen Association.',
      '4. Establish joint CDA-SNGPL utility emergency cell for prompt resolution of recurring gas pressure leaks.',
      '5. Implement automated license plate verification cameras at primary sector entry and exit barrier checkposts.',
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    recommendations.forEach((rec) => {
      doc.text(rec, margin, currentY);
      currentY += 14;
    });
  }

  // Footer on all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `D12 Community Incident Intelligence Portal (IIP) • Confidential Community Report • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: 'center' }
    );
  }

  // Download PDF file
  const fileName = `D12_Executive_Incident_Brief_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
