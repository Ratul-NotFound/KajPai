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
import { formatDeadline, resolveCompanyLogo, cleanText } from '../lib/utils';

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

export const JobCard: React.FC<JobCardProps> = ({ job, isSaved, onToggleSave }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const deadlineInfo = formatDeadline(job.deadline);
  const categoryMeta = CATEGORY_META[job.category] || CATEGORY_META.OTHER;
  const logoUrl = resolveCompanyLogo(job.company, job.logoUrl);
  const displayTitle = cleanText(job.title);
  const displayCompany = cleanText(job.company);
  const displayDescription = cleanText(job.description);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(job.applyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="group relative flex flex-col justify-between h-full bg-white rounded-md border border-slate-200/90 hover:border-slate-400 p-3.5 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_20px_-4px_rgba(0,0,0,0.06),0_2px_4px_-1px_rgba(0,0,0,0.02)] transition-all duration-150">
      {/* Top Body Section */}
      <div className="flex-1">
        {/* Header Row: Company Logo + Names + Quick Actions */}
        <div className="flex items-start justify-between gap-2.5 sm:gap-3">
          <div className="flex items-start gap-2.5 sm:gap-3.5 min-w-0 flex-1">
            {/* Square Logo / Thumbnail Avatar */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-md shrink-0 flex items-center justify-center border border-slate-200/90 bg-white shadow-2xs overflow-hidden p-1">
              <img
                src={logoUrl}
                alt={displayCompany}
                className="w-full h-full object-contain"
                loading="eager"
              />
            </div>

            <div className="min-w-0 flex-1">
              {/* Company Name & Source Tag */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1">
                <span className="text-xs font-semibold text-slate-700 truncate max-w-[170px] xs:max-w-[220px] sm:max-w-none">
                  {displayCompany}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/70 font-mono shrink-0">
                  {job.source}
                </span>
              </div>

              {/* Job Title */}
              <h3 className="text-sm sm:text-base font-semibold text-slate-950 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus:outline-none focus:underline"
                >
                  {displayTitle}
                </a>
              </h3>
            </div>
          </div>

          {/* Quick Action Buttons (Touch Friendly) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleCopyLink}
              title={copied ? 'Link copied!' : 'Copy application link'}
              aria-label="Copy job link"
              className="w-8 h-8 sm:w-7 sm:h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-800 active:text-slate-950 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all touch-manipulation"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleSave(job.id);
              }}
              title={isSaved ? 'Remove from saved' : 'Save job'}
              aria-label={isSaved ? 'Remove from saved jobs' : 'Save job'}
              className={`w-8 h-8 sm:w-7 sm:h-7 rounded-md flex items-center justify-center border transition-all touch-manipulation ${
                isSaved
                  ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-2xs'
                  : 'border-slate-200 text-slate-400 hover:text-slate-800 active:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Minimalist Tags (Category dot, Fresher badge, Employment Type) */}
        <div className="mt-2.5 sm:mt-3.5 flex flex-wrap items-center gap-1.5">
          {/* Category Tag */}
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium bg-slate-100/80 text-slate-700 border border-slate-200/80">
            <span className={`w-1.5 h-1.5 rounded-full ${categoryMeta.dot}`} />
            {categoryMeta.label}
          </span>

          {/* Fresher Friendly Badge */}
          {job.isFresherFriendly && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/80">
              <Sparkles className="w-3 h-3 text-blue-500 shrink-0" />
              <span>Fresher Friendly</span>
            </span>
          )}

          {/* Employment Type */}
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200/60">
            {job.employmentType.replace('_', ' ')}
          </span>
        </div>

        {/* Structured 3-Column Specifications Box */}
        <div className="mt-2.5 sm:mt-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-md bg-slate-50/70 border border-slate-200/60 text-xs">
          {/* Location */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 shrink-0">
              <MapPin className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none mb-0.5">Location</span>
              <span className="text-slate-700 font-medium truncate block text-[11px] sm:text-xs">{job.location}</span>
            </div>
          </div>

          {/* Experience */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 shrink-0">
              <Briefcase className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none mb-0.5">Experience</span>
              <span className="text-slate-700 font-medium truncate block text-[11px] sm:text-xs">{job.experience || 'Entry / Any'}</span>
            </div>
          </div>

          {/* Salary */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 col-span-2 sm:col-span-1">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 shrink-0">
              <DollarSign className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none mb-0.5">Salary</span>
              <span className="text-slate-950 font-semibold truncate block text-[11px] sm:text-xs">{job.salary || 'Competitive'}</span>
            </div>
          </div>
        </div>

        {/* Skills Tag Chips */}
        {job.skills && job.skills.length > 0 && (
          <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center gap-1 sm:gap-1.5">
            {job.skills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 font-mono shadow-2xs"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="text-[9px] sm:text-[10px] font-mono text-slate-400">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Inline Expandable Details */}
        {isExpanded && displayDescription && (
          <div className="mt-2.5 sm:mt-3 p-3 sm:p-3.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed animate-fade-in">
            <p className="font-semibold text-slate-950 mb-1">Role & Qualifications Summary:</p>
            <p className="whitespace-pre-line line-clamp-6">{displayDescription}</p>
          </div>
        )}
      </div>

      {/* Card Footer: Deadline Status + Actions */}
      <div className="mt-3 pt-2.5 sm:mt-3.5 sm:pt-3 border-t border-slate-100 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2 sm:gap-2">
        {/* Left Sub-Row on mobile: Deadline Badge + Details Button */}
        <div className="flex items-center justify-between xs:justify-start gap-1.5 sm:gap-2">
          {/* Deadline Status Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-medium border ${
              deadlineInfo.status === 'red'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : deadlineInfo.status === 'amber'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{deadlineInfo.text}</span>
          </div>

          {/* Details Toggle Button */}
          {job.description && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-0.5 sm:gap-1 text-[11px] sm:text-xs font-medium text-slate-500 hover:text-slate-900 active:text-slate-950 px-2 py-1 rounded-md hover:bg-slate-100 touch-manipulation transition-colors"
            >
              <span>{isExpanded ? 'Less' : 'Details'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Right / Full-width Apply Button on Small Mobile */}
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-blue-600 active:bg-blue-700 px-3.5 py-2 xs:py-1.5 rounded-md shadow-2xs hover:shadow-xs transition-colors group/btn touch-manipulation min-h-[36px] xs:min-h-[32px]"
        >
          <span>Apply Now</span>
          <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </a>
      </div>
    </article>
  );
};
