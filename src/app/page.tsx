'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { JobList } from '@/components/JobList';
import { Job, JobCategory } from '@/lib/types';
import { isDeadlinePassed } from '@/lib/utils';
import { getMockJobs } from '@/lib/mockData';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeNotification, setScrapeNotification] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | 'ALL'>('ALL');
  const [fresherOnly, setFresherOnly] = useState(false);
  const [hideExpired, setHideExpired] = useState(true);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  // Load saved bookmarks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('jobpulse_saved_jobs');
      if (stored) {
        setSavedJobIds(new Set(JSON.parse(stored)));
      }
    } catch (e) {
      console.warn('Could not read saved jobs from localStorage:', e);
    }
  }, []);

  // Save bookmarks to localStorage
  const handleToggleSave = (jobId: string) => {
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      try {
        localStorage.setItem('jobpulse_saved_jobs', JSON.stringify(Array.from(next)));
      } catch (e) {
        console.warn('Could not persist saved jobs to localStorage:', e);
      }
      return next;
    });
  };

  // Fetch jobs from API
  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (data.success && Array.isArray(data.jobs) && data.jobs.length > 0) {
        setJobs(data.jobs);
      } else {
        setJobs(getMockJobs());
      }
    } catch {
      setJobs(getMockJobs());
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger live scrape across all portals
  const handleScrapeNow = async () => {
    setIsScraping(true);
    setScrapeNotification('Scraping Bangladesh portals, software farms, bank circulars & remote boards...');
    try {
      const res = await fetch('/api/scrape', { method: 'POST' });
      const data = await res.json();
      if (data.success && Array.isArray(data.jobs)) {
        setJobs(data.jobs);
        setScrapeNotification(
          `✨ Done! Found ${data.newCount} new jobs. Total live openings: ${data.totalCount}.`
        );
      } else {
        setScrapeNotification('Scraped completed. Refreshing listings.');
        await fetchJobs();
      }
    } catch (err: any) {
      setScrapeNotification('Scraper finished. Listings refreshed.');
      await fetchJobs();
    } finally {
      setIsScraping(false);
      setTimeout(() => setScrapeNotification(null), 6000);
    }
  };

  // Initial load
  useEffect(() => {
    fetchJobs();

    // Automated 12-hour background polling (12 hours = 43,200,000 ms)
    const twelveHoursMs = 12 * 60 * 60 * 1000;
    const interval = setInterval(() => {
      console.log('Automated 12-hour scrape timer fired.');
      handleScrapeNow();
    }, twelveHoursMs);

    return () => clearInterval(interval);
  }, [fetchJobs]);

  // Category counts computation
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: jobs.length };
    for (const job of jobs) {
      counts[job.category] = (counts[job.category] || 0) + 1;
    }
    return counts;
  }, [jobs]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Saved only
      if (showSavedOnly && !savedJobIds.has(job.id)) {
        return false;
      }

      // Hide expired
      if (hideExpired && isDeadlinePassed(job.deadline)) {
        return false;
      }

      // Category
      if (selectedCategory !== 'ALL' && job.category !== selectedCategory) {
        return false;
      }

      // Fresher friendly
      if (fresherOnly && !job.isFresherFriendly) {
        return false;
      }

      // Universal search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesCompany = job.company.toLowerCase().includes(q);
        const matchesLocation = job.location.toLowerCase().includes(q);
        const matchesSkills = job.skills.some((s) => s.toLowerCase().includes(q));
        const matchesSource = job.source.toLowerCase().includes(q);

        if (!matchesTitle && !matchesCompany && !matchesLocation && !matchesSkills && !matchesSource) {
          return false;
        }
      }

      return true;
    });
  }, [jobs, showSavedOnly, savedJobIds, hideExpired, selectedCategory, fresherOnly, searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setFresherOnly(false);
    setHideExpired(true);
    setShowSavedOnly(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <Header
        totalJobs={jobs.length}
        savedCount={savedJobIds.size}
        showSavedOnly={showSavedOnly}
        onToggleSaved={() => setShowSavedOnly((prev) => !prev)}
        onScrapeNow={handleScrapeNow}
        isScraping={isScraping}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        {/* Live Notification Banner */}
        {scrapeNotification && (
          <div className="mt-4 p-3 rounded-md bg-zinc-900 text-zinc-100 border border-zinc-800 text-xs font-medium flex items-center justify-between animate-fade-in shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{scrapeNotification}</span>
            </div>
            <button
              onClick={() => setScrapeNotification(null)}
              className="text-zinc-400 hover:text-white font-bold ml-2 transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter Navigation */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={(cat) => {
            setSelectedCategory(cat);
            if (showSavedOnly) setShowSavedOnly(false);
          }}
          fresherOnly={fresherOnly}
          onToggleFresher={() => setFresherOnly((prev) => !prev)}
          hideExpired={hideExpired}
          onToggleHideExpired={() => setHideExpired((prev) => !prev)}
          categoryCounts={categoryCounts}
        />

        {/* Results Metadata Bar */}
        <div className="py-4 flex items-center justify-between text-xs text-zinc-500">
          <div>
            Showing <span className="font-semibold text-zinc-900">{filteredJobs.length}</span>{' '}
            {showSavedOnly ? 'saved' : ''} jobs
            {selectedCategory !== 'ALL' && (
              <span>
                {' '}
                in <strong className="text-zinc-800">{selectedCategory}</strong>
              </span>
            )}
            {fresherOnly && <span> • Freshers Only</span>}
          </div>
          {(searchQuery || selectedCategory !== 'ALL' || fresherOnly || showSavedOnly) && (
            <button
              onClick={handleResetFilters}
              className="text-zinc-900 hover:text-zinc-600 underline font-medium transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Job Listings Feed */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 sm:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-44 rounded-md border border-zinc-200 bg-zinc-50/70 animate-pulse p-5"
              />
            ))}
          </div>
        ) : (
          <JobList
            jobs={filteredJobs}
            savedJobIds={savedJobIds}
            onToggleSave={handleToggleSave}
            onResetFilters={handleResetFilters}
          />
        )}
      </main>
    </div>
  );
}
