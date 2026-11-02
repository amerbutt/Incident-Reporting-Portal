# D12 Community Incident Intelligence Portal (IIP)
### Sector D-12, Islamabad • Capital Development Authority & Citizen Intelligence Watch

A production-ready, enterprise-grade Incident Intelligence Web Application built with **Next.js 14+**, **TypeScript**, **Tailwind CSS**, and **Google Sheets API v4**.

---

## 🏛️ Project Objective & Architecture

The **D12 Community Incident Intelligence Portal (IIP)** reads incident records directly from a private master Google Sheet maintained by administrators and transforms them into an executive command center:

- **Executive KPI Dashboard**: 12 responsive scorecards, velocity curves, 24-hour temporal profiles, and authority workload rankings.
- **GIS Mapping Intelligence**: Multi-layer GIS canvas supporting **Bubble Map**, **Heatmap Hotspots**, **Community Risk Scores**, and **Marker Pins** with deep links to Google Maps.
- **Calendar Intelligence Matrix**: Cross-tabulation of incident typologies against calendar dates with dynamic intensity heatmap coloration (White, Yellow, Orange, Red) and drill-down filtering.
- **Advanced Incident Register**: Multi-column sorting, instant search, virtualized pagination, dynamic column reordering, and direct export to formatted **Excel (.xlsx)** and **CSV**.
- **Incident Detail Dossier**: Complete 16-field inspection with authentic **WhatsApp dispatch simulation**, **bilingual RTL Urdu voice note transcripts** (with Nastaliq typography), coordinates, and chronological audit history.
- **Report Generation Center & PDF Engine**: Print-ready executive PDF briefing generator with branded cover page, KPIs, charts, and recommendations using client-side `jspdf` & `jspdf-autotable`.
- **Autonomous AI Intelligence Module**: Natural language executive briefing synthesizing trends, peak hour clustering, vulnerability corridors, and prioritized management actions.

---

## 📁 Repository Folder Structure

```
d12-incident-portal/
├── .env.example                       # Documented environment variables template
├── next.config.ts                     # Next.js production configuration
├── package.json                       # Dependencies & build scripts
├── tsconfig.json                      # TypeScript configuration
├── public/                            # Static assets
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── incidents/
    │   │   │   ├── route.ts           # GET /api/incidents (Multi-field filtering, facets, stats)
    │   │   │   └── sync/
    │   │   │       └── route.ts       # POST /api/incidents/sync (Cache invalidation & Google Sheet fetch)
    │   │   └── ai/
    │   │       └── summarize/
    │   │           └── route.ts       # POST /api/ai/summarize (Natural language intelligence report)
    │   ├── globals.css                # Slate midnight luxury theme, glassmorphism, Urdu typography
    │   ├── layout.tsx                 # Root layout with fonts & SEO metadata
    │   └── page.tsx                   # Master portal orchestrator & synchronized state manager
    ├── components/
    │   ├── ui/
    │   │   ├── Badge.tsx              # Category, Severity, and Status color badges
    │   │   └── Button.tsx             # Reusable glass/primary/secondary button primitives
    │   ├── layout/
    │   │   ├── Header.tsx             # Branded command center header, sync trigger, tab navigation
    │   │   ├── FilterBar.tsx          # Quick search, date presets, severity toggles, active filter chips
    │   │   └── FilterDrawer.tsx       # Comprehensive slide-over filter drawer (Date, Location, Severities)
    │   ├── dashboard/
    │   │   ├── ExecutiveDashboard.tsx # Module 1: 12 KPI cards, multi-trend velocity, rankings
    │   │   ├── KPICard.tsx            # Metric card with MoM trend badge & glass styling
    │   │   └── Charts.tsx             # High-performance SVG charts (Daily Trend, 24h Profile, Donut, Workload)
    │   ├── gis/
    │   │   ├── GISDashboard.tsx       # Module 2: Bubble Map, Heatmap View, Community Risk Map, Pins
    │   │   ├── CategoryTree.tsx       # Expandable hierarchy tree (Category -> Types with counts)
    │   │   └── IncidentPopup.tsx      # Rich marker popup with View Details & Google Maps link
    │   ├── calendar/
    │   │   └── CalendarDashboard.tsx  # Module 3: Matrix view (Incident Types x Dates, heatmap colors, drilldowns)
    │   ├── register/
    │   │   ├── IncidentRegister.tsx   # Module 4: Incident table, multi-sort, pagination, CSV/Excel export
    │   │   └── ColumnManagerModal.tsx # Column visibility & order rearrangement manager
    │   ├── detail/
    │   │   └── IncidentDetailView.tsx # Module 5: Incident dossier (WhatsApp bubble, RTL Urdu transcript, coords)
    │   ├── reports/
    │   │   ├── ReportCenter.tsx       # Module 6: Report configurator & live briefing preview
    │   │   └── PDFExportEngine.ts     # Client-side multi-page PDF generator (Cover page, KPIs, charts, register)
    │   └── ai/
    │       └── AIIntelligenceView.tsx # Module 7: AI Intelligence Summary & prioritized directives
    └── lib/
        ├── types/
        │   └── incident.ts            # Complete schema, filter types, KPIs, risk scores
        ├── data/
        │   ├── dataProvider.ts        # IIncidentDataProvider interface
        │   ├── googleSheetsProvider.ts# Google Sheets API v4 integration with caching & dynamic fields
        │   ├── mockData.ts            # Authentic seeded dataset across Sector D-12 Islamabad
        │   ├── sqlAdapter.ts          # SQL schema & PostgreSQL / Supabase migration adapter
        │   └── cache.ts               # In-memory TTL cache with stale-while-revalidate
        └── utils/
            └── analytics.ts           # KPI calculators, risk scoring formula, calendar matrix generator
```

---

## 📊 Data Structure & Field Mapping

The application maps the Google Sheet columns and supports new columns added dynamically in the future:

| # | Master Sheet Column | Type | Application Mapping & Role |
|---|---|---|---|
| 1 | `FieldDate` | String (YYYY-MM-DD) | Primary chronological timeline & date filtering |
| 2 | `Time` | String (HH:mm) | 24-hour temporal profile & peak window analysis |
| 3 | `Sub-Sector` | String | Geographic zone (D-12/1, D-12/2, D-12/3, D-12/4) |
| 4 | `Street No.` | String | Street corridor hotspot analysis (Street 1 to 50+) |
| 5 | `House No.` | String | Micro-location & house cluster analysis |
| 6 | `Incident Type` | String | Typology (Theft, Suspicious Activity, Gas Leak, etc.) |
| 7 | `Brief Description` | Text | Primary summary & global search index |
| 8 | `Authorities` | String | Dispatched agencies (Police, CDA, Rescue 1122, IESCO, SNGPL) |
| 9 | `Map Link` | URL | External Google Maps fallback navigation link |
| 10 | `Lat, Long` | String | Geographic coordinates (e.g. `33.7312, 72.9645`) |
| 11 | `Status` | String | Workflow status (`Open`, `In Progress`, `Closed`, `Pending Authority`) |
| 12 | `Incident Report (WhatsApp)` | Text | Field dispatch text formatted in verified WhatsApp bubble |
| 13 | `Transcript (Urdu)` | Urdu Text | Bilingual audio transcript formatted in native Nastaliq RTL |
| 14 | `Address` | Text | Full residential address |
| 15 | `Incident Category` | String | Hierarchy root (`Security`, `Safety`, `Utilities`, `Community`, `Infrastructure`, `Traffic`) |
| 16 | `Incident Severity` | String | Risk weighting (`Critical`, `High`, `Medium`, `Low`) |
| 17+ | *Future Dynamic Columns* | Any | Automatically captured in `customFields` JSON and exposed in Register & Detail views |

---

## 🔌 Google Sheets Integration Setup

To link your live master Google Sheet:

1. **Create a Google Cloud Project & Enable Google Sheets API**:
   - Visit the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a project (e.g., `d12-incident-intelligence`).
   - Enable the **Google Sheets API**.

2. **Generate a Service Account**:
   - Navigate to **IAM & Admin > Service Accounts**.
   - Create a service account (e.g., `d12-sheet-reader`).
   - Click on the created service account, go to the **Keys** tab, and create a **JSON Key**.
   - Download the JSON file.

3. **Share Google Sheet**:
   - Open your private Google Sheet.
   - Click **Share** and paste the `client_email` from your downloaded JSON (e.g., `d12-sheet-reader@...iam.gserviceaccount.com`).
   - Grant **Viewer** access.

4. **Configure Environment Variables**:
   In your `.env.local` or Vercel Environment Variables:
   ```env
   GOOGLE_SHEET_ID=your_spreadsheet_id_here
   GOOGLE_SERVICE_ACCOUNT_EMAIL=d12-sheet-reader@your-project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

*Note: If no Google credentials are provided, the portal operates in standalone mode with a seeded dataset of 146+ incidents across Sector D-12.*

---

## 🗺️ GIS Mapping & Risk Engine

The GIS engine offers four view modes:
1. **Bubble Map**: Sized according to incident volume and color-coded by category:
   - 🔴 **Security**: `#ef4444` (Theft, Suspicious Activity, Burglary)
   - 🟠 **Safety**: `#f97316` (Gas Leaks, Transformer Sparks)
   - 🟢 **Community**: `#10b981` (Noise, Encroachment, Public Disputes)
   - 🔵 **Utilities**: `#3b82f6` (Water Supply Disruptions, Streetlight Failure)
   - 🟣 **Infrastructure**: `#8b5cf6` (Road damage, Wall collapse)
2. **Heatmap View**: Hotspot radiant analysis displaying high, medium, and low concentration density zones.
3. **Community Area Risk Map**: Evaluates street risk scores on a 0–100 scale:
   $$\text{Risk Score} = \min(100, (\text{Count} \times 4) + (\text{Critical} \times 12) + (\text{High} \times 6) + (\text{Open} \times 4))$$
   - 🔴 **High Risk** ($\ge 70$): Immediate security patrol reallocation.
   - 🟠 **Medium Risk** ($45 - 69$): Infrastructure maintenance monitoring.
   - 🟢 **Low Risk** ($< 45$): Routine surveillance.
4. **Marker Pin View**: Individual interactive pins displaying complete incident details, authority tags, and direct links to Google Maps coordinates.

---

## 🚀 Installation & Local Development

### Prerequisites
- Node.js 18+ (tested on Node 20 & 24)
- npm or pnpm

### Setup
```bash
# Clone repository
git clone https://github.com/your-org/d12-incident-portal.git
cd d12-incident-portal

# Install dependencies
npm install --legacy-peer-deps

# Create environment configuration
cp .env.example .env.local

# Run development server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## ⚡ Deployment Guide (Vercel)

### 1-Click Vercel Deployment

1. Push this codebase to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: initial D12 incident intelligence portal release"
   git branch -M main
   git remote add origin https://github.com/your-username/d12-incident-portal.git
   git push -u origin main
   ```

2. Log into [Vercel](https://vercel.com/) and click **Add New Project**.
3. Select your `d12-incident-portal` repository.
4. In the **Environment Variables** section, add:
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (optional)
   - `CACHE_TTL_SECONDS` (recommended: `300`)
5. Click **Deploy**. Vercel will build and assign a production URL (e.g., `https://d12-incident-portal.vercel.app`).

---

## 🛡️ Database Abstraction Layer (SQL Migration)

The portal implements an adapter pattern via `IIncidentDataProvider` (`src/lib/data/dataProvider.ts`). To transition from Google Sheets to PostgreSQL, Supabase, or Prisma:

1. Execute the DDL schema provided in `src/lib/data/sqlAdapter.ts`.
2. Configure `DATABASE_URL` in `.env.local`.
3. In `src/app/api/incidents/route.ts`, switch the active provider to `SQLDatabaseDataProvider`.

---

## 🔒 Security Architecture

- **Server-Side API Routes**: Google Service Account credentials, private keys, and API tokens are executed strictly on the server and are never exposed to client browsers.
- **Read-Only Master Data**: Public visitors cannot alter Google Sheet records or upload unverified data.
- **Server-Side Caching**: Uses in-memory cache with stale-while-revalidate to prevent Google API rate limits and deliver responses in under 100ms.
