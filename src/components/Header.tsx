'use client';

import React from 'react';
import { Bookmark, RefreshCw } from 'lucide-react';

interface HeaderProps {
  totalJobs: number;
  savedCount: number;
  showSavedOnly: boolean;
  onToggleSaved: () => void;
  onScrapeNow: () => void;
  isScraping: boolean;
  lastScrapedTime?: string;
}

export const Header: React.FC<HeaderProps> = ({
  totalJobs,
  savedCount,
  showSavedOnly,
  onToggleSaved,
  onScrapeNow,
  isScraping,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-zinc-200/90">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-zinc-950 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
            JP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-950 text-base tracking-tight">JobPulse BD</span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                12-Hour Auto Radar
              </span>
            </div>
            <p className="text-xs text-zinc-500 hidden sm:block">
              Daily tech, bank, govt circulars, telecom & remote engineering jobs
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Active count badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{totalJobs} Jobs Live</span>
          </div>

          {/* Scrape Now Action Button (Minimalist Obsidian) */}
          <button
            onClick={onScrapeNow}
            disabled={isScraping}
            title="Active 12-hour scraper: Check all websites now"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-900 shadow-2xs transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
            <span>{isScraping ? 'Scraping Portals...' : 'Scrape Now'}</span>
          </button>

          {/* Bookmarks Toggle Button */}
          <button
            onClick={onToggleSaved}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              showSavedOnly
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${showSavedOnly ? 'fill-white' : ''}`} />
            <span>Saved ({savedCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
