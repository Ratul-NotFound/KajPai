'use client';

import React from 'react';
import { Bookmark, Sparkles, RefreshCw } from 'lucide-react';

interface HeaderProps {
  totalJobs: number;
  savedCount: number;
  showSavedOnly: boolean;
  onToggleSaved: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  totalJobs,
  savedCount,
  showSavedOnly,
  onToggleSaved,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg tracking-tight shadow-sm">
            JP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-950 text-lg tracking-tight">JobPulse BD</span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                Bangladesh & Remote
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Daily curated tech, bank, govt, telecom & internship circulars
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Active count badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{totalJobs} Active Openings</span>
          </div>

          {/* Refresh button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh listings"
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* Bookmarks toggle button */}
          <button
            onClick={onToggleSaved}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showSavedOnly
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
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

