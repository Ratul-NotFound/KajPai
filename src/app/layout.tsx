import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KajPai — Bangladesh Tech, Bank & Govt Job Radar',
  description: 'Clean, minimalist job radar for CS graduates, engineers, and job seekers in Bangladesh. Scraped daily across BDJobs, Skill.jobs, tech firms, banks, and circulars.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
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
