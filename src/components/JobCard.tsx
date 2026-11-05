'use client';

import React from 'react';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  ExternalLink,
  Bookmark,
  Building,
} from 'lucide-react';
import { Job } from '../lib/types';
import { formatDeadline } from '../lib/utils';

interface JobCardProps {
  job: Job;
  isSaved: boolean;
  onToggleSave: (jobId: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  TECH_AI: 'bg-blue-50 text-blue-700 border-blue-200',
  GOVT: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  BANK: 'bg-amber-50 text-amber-800 border-amber-200',
  TELECOM: 'bg-purple-50 text-purple-700 border-purple-200',
  INTERNSHIP: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  REMOTE: 'bg-teal-50 text-teal-800 border-teal-200',
  ADMIN: 'bg-slate-100 text-slate-700 border-slate-200',
  OTHER: 'bg-slate-100 text-slate-600 border-slate-200',
};

const CATEGORY_LABELS: Record<string, string> = {
  TECH_AI: 'Tech & AI',
  GOVT: 'Government',
  BANK: 'Bank',
  TELECOM: 'Telecom',
  INTERNSHIP: 'Internship',
  REMOTE: 'Remote',
  ADMIN: 'Admin',
  OTHER: 'Other',
};

export const JobCard: React.FC<JobCardProps> = ({ job, isSaved, onToggleSave }) => {
  const deadlineInfo = formatDeadline(job.deadline);

  return (
    <article className="group relative bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-400 hover:shadow-xs transition-all duration-150">
      {/* Top Header: Company + Source + Actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 mb-1">
            <span className="inline-flex items-center gap-1 font-medium text-slate-700">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              {job.company}
            </span>
            <span className="text-slate-300">•</span>
            <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
              {job.source}
            </span>
            {job.isFresherFriendly && (
              <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                🎓 Fresher Friendly
              </span>
            )}
          </div>

          {/* Job Title */}
          <h2 className="text-base font-semibold text-slate-950 group-hover:text-blue-600 transition-colors leading-snug">
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus:outline-none focus:underline"
            >
              {job.title}
            </a>
          </h2>
        </div>

        {/* Bookmark Action */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleSave(job.id);
          }}
          title={isSaved ? 'Remove from saved' : 'Save job'}
          className={`p-2 rounded-lg border transition-colors ${
            isSaved
              ? 'bg-amber-50 text-amber-600 border-amber-300'
              : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
        </button>
      </div>

      {/* Description Snippet if available */}
      {job.description && (
        <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {job.description}
        </p>
      )}

      {/* Metadata Pill Grid */}
      <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
        {/* Category Pill */}
        <span
          className={`px-2 py-0.5 rounded-md font-medium border text-[11px] ${
            CATEGORY_COLORS[job.category] || CATEGORY_COLORS.OTHER
          }`}
        >
          {CATEGORY_LABELS[job.category] || job.category}
        </span>

        {/* Location */}
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>{job.location}</span>
        </div>

        {/* Experience */}
        {job.experience && (
          <div className="flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.experience}</span>
          </div>
        )}

        {/* Salary */}
        {job.salary && (
          <div className="flex items-center gap-1 font-medium text-slate-800">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.salary}</span>
          </div>
        )}
      </div>

      {/* Skills tags */}
      {job.skills && job.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {job.skills.slice(0, 5).map((skill, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200 font-mono"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Bar: Deadline + Apply Button */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        {/* Deadline Status */}
        <div className="flex items-center gap-1.5 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span
            className={`font-medium ${
              deadlineInfo.status === 'red'
                ? 'text-rose-600'
                : deadlineInfo.status === 'amber'
                ? 'text-amber-700'
                : deadlineInfo.status === 'green'
                ? 'text-emerald-700'
                : 'text-slate-500'
            }`}
          >
            {deadlineInfo.text}
          </span>
        </div>

        {/* Apply Link */}
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-colors"
        >
          <span>Apply / Circular</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </article>
  );
};

