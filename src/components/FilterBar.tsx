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
  { id: 'ALL', label: 'All Jobs' },
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
    <div className="space-y-4 py-4 border-b border-slate-200">
      {/* Top Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, company, skills (e.g. Python, React, Bangladesh Bank, Fresher)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2 rounded-lg bg-white border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-2">
          {/* Fresher Friendly Toggle */}
          <button
            onClick={onToggleFresher}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              fresherOnly
                ? 'bg-blue-50 text-blue-800 border-blue-300 ring-1 ring-blue-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Freshers / Entry-Level</span>
          </button>

          {/* Hide Expired Toggle */}
          <button
            onClick={onToggleHideExpired}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              hideExpired
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Hide Expired</span>
          </button>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = categoryCounts[cat.id] ?? 0;

          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-200/80 text-slate-500'
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

