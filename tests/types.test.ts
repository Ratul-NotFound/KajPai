import { describe, it, expect } from 'vitest';
import { Job, JobCategory } from '../src/lib/types';
import { getMockJobs } from '../src/lib/mockData';

describe('Domain Types & Mock Data', () => {
  it('should generate valid mock jobs covering all primary categories', () => {
    const jobs: Job[] = getMockJobs();
    expect(jobs.length).toBeGreaterThanOrEqual(10);

    const categories = new Set(jobs.map((j) => j.category));
    expect(categories.has('TECH_AI')).toBe(true);
    expect(categories.has('GOVT')).toBe(true);
    expect(categories.has('BANK')).toBe(true);
    expect(categories.has('TELECOM')).toBe(true);
    expect(categories.has('INTERNSHIP')).toBe(true);
    expect(categories.has('REMOTE')).toBe(true);
  });
});

