import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'D-12 Community Incident Intelligence Portal | D12 Security Committee',
  description:
    'Dedicated Community Incident Intelligence Portal for Sector D-12, Islamabad. Managed by the D12 Security Committee with live master Google Sheet synchronization, street-level hotspot analytics, and single-page executive intelligence reports.',
  keywords: [
    'D12 Incident Portal',
    'D12 Security Committee',
    'Sector D-12 Security Committee',
    'D12 Street Hotspots',
    'D-12 Islamabad Incidents',
    'Community Intelligence Portal',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Gulzar&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors duration-200" suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
