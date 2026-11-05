import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JobPulse BD — Bangladesh Tech, Bank & Govt Job Radar',
  description: 'Clean, minimalist aggregator for CS graduates, engineers, and job seekers in Bangladesh. Scraped daily across top portals, software farms, and circulars.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-white">
      <body className="min-h-screen bg-white text-slate-900 antialiased selection:bg-slate-200">
        {children}
      </body>
    </html>
  );
}

