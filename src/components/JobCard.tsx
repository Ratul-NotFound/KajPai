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
  Building2,
} from 'lucide-react';
import { Job } from '../lib/types';
import { formatDeadline, resolveCompanyLogo } from '../lib/utils';

interface JobCardProps {
  job: Job;
  isSaved: boolean;
  onToggleSave: (jobId: string) => void;
}

const CATEGORY_META: Record<
  string,
  { label: string; dot: string }
> = {
  TECH_AI: {
    label: 'Tech & AI',
    dot: 'bg-blue-600',
  },
  GOVT: {
    label: 'Government',
    dot: 'bg-emerald-600',
  },
  BANK: {
    label: 'Bank',
    dot: 'bg-amber-600',
  },
  TELECOM: {
    label: 'Telecom',
    dot: 'bg-violet-600',
  },
  INTERNSHIP: {
    label: 'Internship',
    dot: 'bg-indigo-600',
  },
  REMOTE: {
    label: 'Remote',
    dot: 'bg-teal-600',
  },
  ADMIN: {
    label: 'Admin',
    dot: 'bg-slate-500',
  },
  OTHER: {
    label: 'Other',
    dot: 'bg-slate-400',
  },
};

/**
 * Generates consistent 2-letter monogram for company fallback avatar
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

export const JobCard: React.FC<JobCardProps> = ({ job, isSaved, onToggleSave }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const deadlineInfo = formatDeadline(job.deadline);
  const categoryMeta = CATEGORY_META[job.category] || CATEGORY_META.OTHER;
  const monogram = getCompanyMonogram(job.company);
  const logoUrl = job.logoUrl || resolveCompanyLogo(job.company);
  const showLogo = Boolean(logoUrl && !imgError);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(job.applyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="group relative flex flex-col justify-between h-full bg-white rounded-md border border-slate-200/90 hover:border-slate-400 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_20px_-4px_rgba(0,0,0,0.06),0_2px_4px_-1px_rgba(0,0,0,0.02)] transition-all duration-150">
      {/* Top Body Section */}
      <div className="flex-1">
        {/* Header Row: Scraped Logo/Thumbnail + Titles + Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            {/* Square Logo / Thumbnail Avatar */}
            <div className="w-11 h-11 rounded-md shrink-0 flex items-center justify-center border border-slate-200/90 bg-white shadow-2xs overflow-hidden p-1">
              {showLogo ? (
                <img
                  src={logoUrl}
                  alt={job.company}
                  className="w-full h-full object-contain"
                  onError={() => setImgError(true)}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full rounded flex items-center justify-center bg-slate-100 font-bold text-xs tracking-wider text-slate-800">
                  {monogram}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              {/* Company Name & Source Tag */}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px] sm:max-w-[260px]">
                  {job.company}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/70 font-mono">
                  {job.source}
                </span>
              </div>

              {/* Job Title */}
              <h3 className="text-[15px] sm:text-base font-semibold text-slate-950 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus:outline-none focus:underline"
                >
                  {job.title}
                </a>
              </h3>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleCopyLink}
              title={copied ? 'Link copied!' : 'Copy application link'}
              className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleSave(job.id);
              }}
              title={isSaved ? 'Remove from saved' : 'Save job'}
              className={`w-7 h-7 rounded-md flex items-center justify-center border transition-all ${
                isSaved
                  ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-2xs'
                  : 'border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Minimalist Tags (Category dot, Fresher badge, Employment Type) */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          {/* Category Tag */}
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100/80 text-slate-700 border border-slate-200/80">
            <span className={`w-1.5 h-1.5 rounded-full ${categoryMeta.dot}`} />
            {categoryMeta.label}
          </span>

          {/* Fresher Friendly Badge */}
          {job.isFresherFriendly && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/80">
              <Sparkles className="w-3 h-3 text-blue-500" />
              Fresher Friendly
            </span>
          )}

          {/* Employment Type */}
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200/60">
            {job.employmentType.replace('_', ' ')}
          </span>
        </div>

        {/* Structured 3-Column Specifications Box */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-md bg-slate-50/70 border border-slate-200/60 text-xs">
          {/* Location */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none mb-0.5">Location</span>
              <span className="text-slate-700 font-medium truncate block text-xs">{job.location}</span>
            </div>
          </div>

          {/* Experience */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 shrink-0">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none mb-0.5">Experience</span>
              <span className="text-slate-700 font-medium truncate block text-xs">{job.experience || 'Entry / Any'}</span>
            </div>
          </div>

          {/* Salary */}
          <div className="flex items-center gap-2 min-w-0 col-span-2 sm:col-span-1">
            <div className="w-6 h-6 rounded bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 shrink-0">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none mb-0.5">Salary</span>
              <span className="text-slate-950 font-semibold truncate block text-xs">{job.salary || 'Competitive'}</span>
            </div>
          </div>
        </div>

        {/* Skills Tag Chips */}
        {job.skills && job.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {job.skills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 font-mono shadow-2xs"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="text-[10px] font-mono text-slate-400">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Inline Expandable Details */}
        {isExpanded && job.description && (
          <div className="mt-3 p-3.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed animate-fade-in">
            <p className="font-semibold text-slate-950 mb-1">Role & Qualifications Summary:</p>
            <p className="whitespace-pre-line line-clamp-6">{job.description}</p>
          </div>
        )}
      </div>

      {/* Card Footer: Deadline Status + Actions */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Deadline Status Badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
            deadlineInfo.status === 'red'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : deadlineInfo.status === 'amber'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>{deadlineInfo.text}</span>
        </div>

        {/* Actions Group (Details Toggle + Direct Apply Button) */}
        <div className="flex items-center gap-2">
          {job.description && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors"
            >
              <span>{isExpanded ? 'Less' : 'Details'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-blue-600 px-3.5 py-1.5 rounded-md shadow-2xs hover:shadow-xs transition-colors group/btn"
          >
            <span>Apply Now</span>
            <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </article>
  );
};
