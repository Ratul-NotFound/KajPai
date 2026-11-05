import { describe, it, expect } from 'vitest';
import { runAllScrapers } from '../src/scrapers';
import { allJobsScraper } from '../src/scrapers/alljobs_govt';
import { bdJobsScraper } from '../src/scrapers/bdjobs';
import { bangladeshBankScraper } from '../src/scrapers/bangladesh_bank';
import { bdTechFirmsScraper } from '../src/scrapers/bd_tech_firms';
import { telecomScraper } from '../src/scrapers/telecom';
import { remoteTechScraper } from '../src/scrapers/remote_tech';

describe('Scraper Modules & Orchestration', () => {
  it('individual scrapers should adhere to BaseScraper interface', () => {
    const scrapers = [
      allJobsScraper,
      bdJobsScraper,
      bangladeshBankScraper,
      bdTechFirmsScraper,
      telecomScraper,
      remoteTechScraper,
    ];

    for (const scraper of scrapers) {
      expect(scraper.name).toBeTypeOf('string');
      expect(scraper.category).toBeTypeOf('string');
      expect(scraper.scrape).toBeTypeOf('function');
    }
  });

  it('runAllScrapers should return array of normalized jobs with valid hashes', async () => {
    const jobs = await runAllScrapers();
    expect(jobs).toBeInstanceOf(Array);
    expect(jobs.length).toBeGreaterThan(0);

    for (const job of jobs) {
      expect(job.title).toBeTruthy();
      expect(job.company).toBeTruthy();
      expect(job.hash).toHaveLength(64);
      expect(job.category).toBeDefined();
      expect(job.sourceUrl).toMatch(/^https?:\/\//);
      expect(job.applyUrl).toMatch(/^https?:\/\//);
    }
  });
});
