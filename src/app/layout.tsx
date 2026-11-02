import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'D12 Community Incident Intelligence Portal (IIP) | Islamabad',
  description:
    'Production-ready Community Incident Intelligence Portal for Sector D-12, Islamabad. Live Google Sheet master sync, interactive GIS mapping, calendar matrix, executive dashboards, and AI report generation.',
  keywords: [
    'D12 Incident Portal',
    'Sector D-12 Islamabad',
    'Capital Development Authority',
    'GIS Incident Mapping',
    'Community Watch',
    'Executive Incident Intelligence',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Gulzar&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
