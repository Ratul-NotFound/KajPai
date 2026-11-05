'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  ExternalLink,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Share2,
  Check,
  Sparkles,
} from 'lucide-react';
import { Job } from '../lib/types';
import { formatDeadline } from '../lib/utils';

interface JobCardProps {
  job: Job;
  isSaved: boolean;
  onToggleSave: (jobId: string) => void;
}

const CATEGORY_STYLES: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  TECH_AI: {
    label: 'Tech & AI',
    bg: 'bg-blue-50/70',
    text: 'text-blue-700',
    border: 'border-blue-200/80',
    dot: 'bg-blue-500',
  },
  GOVT: {
    label: 'Government',
    bg: 'bg-emerald-50/70',
    text: 'text-emerald-800',
    border: 'border-emerald-200/80',
    dot: 'bg-emerald-600',
  },
  BANK: {
    label: 'Bank',
    bg: 'bg-amber-50/70',
    text: 'text-amber-800',
    border: 'border-amber-200/80',
    dot: 'bg-amber-500',
  },
  TELECOM: {
    label: 'Telecom',
    bg: 'bg-purple-50/70',
    text: 'text-purple-700',
    border: 'border-purple-200/80',
    dot: 'bg-purple-500',
  },
  INTERNSHIP: {
    label: 'Internship',
    bg: 'bg-indigo-50/70',
    text: 'text-indigo-700',
    border: 'border-indigo-200/80',
    dot: 'bg-indigo-500',
  },
  REMOTE: {
    label: 'Remote',
    bg: 'bg-teal-50/70',
    text: 'text-teal-800',
    border: 'border-teal-200/80',
    dot: 'bg-teal-500',
  },
  ADMIN: {
    label: 'Admin',
    bg: 'bg-slate-100/70',
    text: 'text-slate-700',
    border: 'border-slate-200/80',
    dot: 'bg-slate-500',
  },
  OTHER: {
    label: 'Other',
    bg: 'bg-slate-100/70',
    text: 'text-slate-600',
    border: 'border-slate-200/80',
    dot: 'bg-slate-400',
  },
};

/**
 * Generates consistent 2-letter monogram for company logo avatar
 */
function getCompanyMonogram(name: string): string {
  const clean = name.replace(/[^a-zA-Z\s]/g, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (words.length === 1 && words[0].length >= 2) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return 'BD';
}

/**
 * Generates subtle pastel background based on company name
 */
function getMonogramBg(name: string): { bg: string; text: string } {
  const hues = [
    { bg: 'bg-blue-100/80', text: 'text-blue-800' },
    { bg: 'bg-emerald-100/80', text: 'text-emerald-800' },
    { bg: 'bg-purple-100/80', text: 'text-purple-800' },
    { bg: 'bg-indigo-100/80', text: 'text-indigo-800' },
    { bg: 'bg-amber-100/80', text: 'text-amber-800' },
    { bg: 'bg-teal-100/80', text: 'text-teal-800' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hues[Math.abs(hash) % hues.length];
}

export const JobCard: React.FC<JobCardProps> = ({ job, isSaved, onToggleSave }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const deadlineInfo = formatDeadline(job.deadline);
  const categoryStyle = CATEGORY_STYLES[job.category] || CATEGORY_STYLES.OTHER;
  const monogram = getCompanyMonogram(job.company);
  const monogramTheme = getMonogramBg(job.company);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(job.applyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 hover:border-slate-400/80 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all duration-200 ease-out">
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-3">
          {/* Company Avatar & Metadata */}
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs tracking-wider shadow-2xs border border-white/60 ${monogramTheme.bg} ${monogramTheme.text}`}
            >
              {monogram}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 mb-0.5">
                <span className="font-medium text-slate-800 truncate max-w-[200px] sm:max-w-[260px]">
                  {job.company}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                  {job.source}
                </span>
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
          </div>

          {/* Quick Actions (Share + Bookmark) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleCopyLink}
              title={copied ? 'Link copied!' : 'Copy application link'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleSave(job.id);
              }}
              title={isSaved ? 'Remove from saved' : 'Save job'}
              className={`p-1.5 rounded-lg border transition-all ${
                isSaved
                  ? 'bg-amber-50 text-amber-600 border-amber-300 shadow-2xs'
                  : 'border-slate-200/80 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Category & Status Pills Row */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          {/* Category Pill with colored indicator dot */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${categoryStyle.dot}`} />
            {categoryStyle.label}
          </span>

          {/* Fresher Friendly Badge */}
          {job.isFresherFriendly && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50/80 text-blue-700 border border-blue-200/70">
              <Sparkles className="w-3 h-3 text-blue-500" />
              Fresher Friendly
            </span>
          )}

          {/* Employment Type */}
          <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-slate-50 text-slate-600 border border-slate-200/60">
            {job.employmentType.replace('_', ' ')}
          </span>
        </div>

        {/* Metadata Details (Location, Experience, Salary) */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[200px]">{job.location}</span>
          </div>

          {job.experience && (
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{job.experience}</span>
            </div>
          )}

          {job.salary && (
            <div className="flex items-center gap-1.5 font-medium text-slate-900">
              <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{job.salary}</span>
            </div>
          )}
        </div>

        {/* Skills Tag Pills */}
        {job.skills && job.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {job.skills.slice(0, 5).map((skill, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200/60 font-mono"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Inline Expandable Details */}
        {isExpanded && job.description && (
          <div className="mt-3.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 text-xs text-slate-600 leading-relaxed animate-fade-in">
            <p className="font-medium text-slate-900 mb-1">Role & Qualifications Summary:</p>
            <p>{job.description}</p>
          </div>
        )}
      </div>

      {/* Bottom Footer Row: Deadline + Expand Toggle + Apply Link */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Deadline Indicator with status dot */}
        <div className="flex items-center gap-1.5 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span
            className={`font-medium flex items-center gap-1 ${
              deadlineInfo.status === 'red'
                ? 'text-rose-600'
                : deadlineInfo.status === 'amber'
                ? 'text-amber-700'
                : deadlineInfo.status === 'green'
                ? 'text-emerald-700'
                : 'text-slate-500'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                deadlineInfo.status === 'red'
                  ? 'bg-rose-500'
                  : deadlineInfo.status === 'amber'
                  ? 'bg-amber-500'
                  : deadlineInfo.status === 'green'
                  ? 'bg-emerald-500'
                  : 'bg-slate-400'
              }`}
            />
            {deadlineInfo.text}
          </span>
        </div>

        {/* Actions Group (Details Toggle + Direct Apply Button) */}
        <div className="flex items-center gap-2">
          {job.description && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 px-2 py-1 rounded transition-colors"
            >
              <span>{isExpanded ? 'Less' : 'Details'}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}

          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-white bg-slate-100/90 hover:bg-blue-600 px-3.5 py-1.5 rounded-lg border border-slate-200/80 hover:border-blue-600 shadow-2xs hover:shadow-xs transition-all duration-150 group/btn"
          >
            <span>Apply Now</span>
            <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </article>
  );
};
