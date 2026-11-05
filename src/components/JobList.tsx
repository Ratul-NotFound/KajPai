'use client';

import React from 'react';
import { JobCard } from './JobCard';
import { Job } from '../lib/types';
import { Inbox, RotateCcw } from 'lucide-react';

interface JobListProps {
  jobs: Job[];
  savedJobIds: Set<string>;
  onToggleSave: (jobId: string) => void;
  onResetFilters: () => void;
}

export const JobList: React.FC<JobListProps> = ({
  jobs,
  savedJobIds,
  onToggleSave,
  onResetFilters,
}) => {
  if (jobs.length === 0) {
    return (
      <div className="py-20 text-center rounded-md border border-dashed border-zinc-200 bg-zinc-50/50">
        <div className="w-12 h-12 rounded-md bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400 mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-900 mb-1">No jobs match your filters</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
          Try expanding your search, selecting a different category, or toggling off the fresher-only filter.
        </p>
        <button
          onClick={onResetFilters}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-2xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 sm:gap-5 items-stretch">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          isSaved={savedJobIds.has(job.id)}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  );
};

