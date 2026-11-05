'use client';

import React from 'react';
import { Search, X, GraduationCap, Clock, Sparkles } from 'lucide-react';
import { JobCategory } from '../lib/types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: JobCategory | 'ALL';
  onCategoryChange: (cat: JobCategory | 'ALL') => void;
  fresherOnly: boolean;
  onToggleFresher: () => void;
  hideExpired: boolean;
  onToggleHideExpired: () => void;
  categoryCounts: Record<string, number>;
}

const CATEGORIES: { id: JobCategory | 'ALL'; label: string; icon?: string }[] = [
  { id: 'ALL', label: 'All Openings' },
  { id: 'TECH_AI', label: '💻 Tech & AI' },
  { id: 'GOVT', label: '🏛️ Government' },
  { id: 'BANK', label: '🏦 Banks' },
  { id: 'TELECOM', label: '📡 Telecom' },
  { id: 'INTERNSHIP', label: '🎓 Internships' },
  { id: 'REMOTE', label: '🌍 Remote' },
  { id: 'ADMIN', label: '📁 Admin' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  fresherOnly,
  onToggleFresher,
  hideExpired,
  onToggleHideExpired,
  categoryCounts,
}) => {
  return (
    <div className="space-y-4 py-5 border-b border-slate-200/80">
      {/* Top Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="Search jobs, skills, company (e.g. React, Python, Bangladesh Bank, Fresher)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-md hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Fresher Friendly Toggle */}
          <button
            onClick={onToggleFresher}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              fresherOnly
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Freshers Only</span>
          </button>

          {/* Hide Expired Toggle */}
          <button
            onClick={onToggleHideExpired}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              hideExpired
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Active Only</span>
          </button>
        </div>
      </div>

      {/* Category Pills Navigation with horizontal scrolling */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = categoryCounts[cat.id] ?? 0;

          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-slate-950 text-white shadow-xs font-semibold'
                  : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
                  isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-200/70 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
