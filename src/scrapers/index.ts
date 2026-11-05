import { BaseScraper } from './base';
import { allJobsScraper } from './alljobs_govt';
import { bdJobsScraper } from './bdjobs';
import { bangladeshBankScraper } from './bangladesh_bank';
import { bdTechFirmsScraper } from './bd_tech_firms';
import { telecomScraper } from './telecom';
import { remoteTechScraper } from './remote_tech';
import { Job } from '../lib/types';

export const allScrapers: BaseScraper[] = [
  allJobsScraper,
  bdJobsScraper,
  bangladeshBankScraper,
  bdTechFirmsScraper,
  telecomScraper,
  remoteTechScraper,
];

export interface ScrapeRunOptions {
  useMockFallbackOnFailure?: boolean;
}

/**
 * Executes all registered scrapers in parallel with fault tolerance.
 * If one scraper fails, others continue without interruption.
 */
export async function runAllScrapers(options?: ScrapeRunOptions): Promise<Omit<Job, 'id' | 'createdAt' | 'updatedAt'>[]> {
  console.log(`Starting scraper run across ${allScrapers.length} Bangladesh & global sources...`);

  const results = await Promise.allSettled(
    allScrapers.map(async (scraper) => {
      const startTime = Date.now();
      try {
        const jobs = await scraper.scrape();
        console.log(`[${scraper.name}] scraped ${jobs.length} jobs (${Date.now() - startTime}ms)`);
        return jobs;
      } catch (err) {
        console.error(`[${scraper.name}] failed:`, err);
        return [];
      }
    })
  );

  const aggregatedJobs: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>[] = [];

  for (const res of results) {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      aggregatedJobs.push(...res.value);
    }
  }

  console.log(`Aggregated a total of ${aggregatedJobs.length} jobs.`);
  return aggregatedJobs;
}
