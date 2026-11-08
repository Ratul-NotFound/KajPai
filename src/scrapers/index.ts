import { BaseScraper } from './base';
import { allJobsScraper } from './alljobs_govt';
import { bdJobsScraper } from './bdjobs';
import { skillJobsScraper } from './skill_jobs';
import { linkedInScraper } from './linkedin';
import { bangladeshBankScraper } from './bangladesh_bank';
import { bdTechFirmsScraper } from './bd_tech_firms';
import { telecomScraper } from './telecom';
import { remoteTechScraper } from './remote_tech';
import { Job } from '../lib/types';

export const allScrapers: BaseScraper[] = [
  allJobsScraper,
  bdJobsScraper,
  skillJobsScraper,
  linkedInScraper,
  bangladeshBankScraper,
  bdTechFirmsScraper,
  telecomScraper,
  remoteTechScraper,
];

export interface ScrapeRunOptions {
  useMockFallbackOnFailure?: boolean;
}

export interface ScraperMetric {
  name: string;
  count: number;
  durationMs: number;
  status: 'ok' | 'failed';
  error?: string;
}

export interface ScrapeRunReport {
  jobs: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>[];
  metrics: ScraperMetric[];
  totalScraped: number;
  durationMs: number;
}

/**
 * Runs all scrapers with detailed performance diagnostics and metrics.
 */
export async function runAllScrapersWithReport(): Promise<ScrapeRunReport> {
  const overallStart = Date.now();
  console.log(`Starting resilient scraper run across ${allScrapers.length} Bangladesh & global sources...`);

  const metrics: ScraperMetric[] = [];
  const results = await Promise.allSettled(
    allScrapers.map(async (scraper) => {
      const startTime = Date.now();
      try {
        const jobs = await scraper.scrape();
        const durationMs = Date.now() - startTime;
        metrics.push({
          name: scraper.name,
          count: jobs.length,
          durationMs,
          status: 'ok',
        });
        console.log(`[${scraper.name}] scraped ${jobs.length} jobs (${durationMs}ms)`);
        return jobs;
      } catch (err: any) {
        const durationMs = Date.now() - startTime;
        metrics.push({
          name: scraper.name,
          count: 0,
          durationMs,
          status: 'failed',
          error: err?.message || String(err),
        });
        console.error(`[${scraper.name}] failed:`, err);
        return [];
      }
    })
  );

  const aggregatedJobs: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>[] = [];
  const seenHashes = new Set<string>();

  for (const res of results) {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      for (const job of res.value) {
        if (!seenHashes.has(job.hash)) {
          seenHashes.add(job.hash);
          aggregatedJobs.push(job);
        }
      }
    }
  }

  const durationMs = Date.now() - overallStart;
  console.log(`Aggregated a total of ${aggregatedJobs.length} unique jobs in ${durationMs}ms.`);

  return {
    jobs: aggregatedJobs,
    metrics,
    totalScraped: aggregatedJobs.length,
    durationMs,
  };
}

/**
 * Executes all registered scrapers in parallel with fault tolerance.
 * Backwards compatible with existing CLI scripts and API routes.
 */
export async function runAllScrapers(options?: ScrapeRunOptions): Promise<Omit<Job, 'id' | 'createdAt' | 'updatedAt'>[]> {
  const report = await runAllScrapersWithReport();
  return report.jobs;
}
