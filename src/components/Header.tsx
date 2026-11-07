'use client';

import React from 'react';
import { Bookmark, RefreshCw, Zap } from 'lucide-react';

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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200/90 transition-all">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand Identity */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-zinc-950 text-white flex items-center justify-center font-bold text-xs sm:text-sm tracking-tight shadow-xs">
            KP
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-semibold text-zinc-950 text-sm sm:text-base tracking-tight truncate">
                KajPai
              </span>
              <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                BD Job Radar
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 hidden sm:block truncate max-w-[280px] lg:max-w-none">
              Daily tech, bank, govt circulars, telecom & remote jobs
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Active count badge - hidden on small mobile, visible on tablet+ */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{totalJobs} Live</span>
          </div>

          {/* Scrape Now Action Button */}
          <button
            onClick={onScrapeNow}
            disabled={isScraping}
            title="Scan BDJobs, circulars, and top BD tech portals now"
            aria-label="Scrape job portals"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white border border-zinc-900 shadow-2xs transition-colors disabled:opacity-60 touch-manipulation min-h-[34px] sm:min-h-[32px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isScraping ? 'animate-spin' : ''}`} />
            <span>
              {isScraping ? (
                <>
                  <span className="hidden sm:inline">Scraping Portals...</span>
                  <span className="sm:hidden">Scraping...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Scrape Now</span>
                  <span className="sm:hidden">Scrape</span>
                </>
              )}
            </span>
          </button>

          {/* Bookmarks Toggle Button */}
          <button
            onClick={onToggleSaved}
            aria-label={`View saved jobs (${savedCount})`}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium border transition-colors touch-manipulation min-h-[34px] sm:min-h-[32px] ${
              showSavedOnly
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 active:bg-zinc-100'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 shrink-0 ${showSavedOnly ? 'fill-white' : ''}`} />
            <span>Saved</span>
            <span
              className={`text-[10px] font-mono px-1 rounded ${
                showSavedOnly ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              {savedCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
