'use client';

import React from 'react';
import { Search, X, GraduationCap, Clock } from 'lucide-react';
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
    <div className="space-y-3 py-4 border-b border-zinc-200/90">
      {/* Top Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
          <input
            type="text"
            placeholder="Search jobs, skills, company (e.g. React, Python, Bangladesh Bank, Fresher)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-9 py-2 rounded-md bg-white border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-0.5 rounded hover:bg-zinc-100 transition-colors"
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
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border transition-all ${
              fresherOnly
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Freshers Only</span>
          </button>

          {/* Hide Expired Toggle */}
          <button
            onClick={onToggleHideExpired}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border transition-all ${
              hideExpired
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Active Only</span>
          </button>
        </div>
      </div>

      {/* Category Tabs / Filters with horizontal scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-0.5">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = categoryCounts[cat.id] ?? 0;

          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-zinc-900 text-white shadow-2xs font-semibold'
                  : 'bg-zinc-100/80 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium ${
                  isSelected ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200/80 text-zinc-500'
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
