import { describe, it, expect } from 'vitest';
import { generateJobHash, isDeadlinePassed, formatDeadline, isFresherJob } from '../src/lib/utils';
import { getJobs, upsertJobs } from '../src/lib/db';
import { Job } from '../src/lib/types';

describe('Job Utilities & Hashing', () => {
  it('should generate consistent SHA-256 hash regardless of whitespace or casing', () => {
    const hash1 = generateJobHash('Brain Station 23', 'Junior Software Engineer', 'https://brainstation-23.com/job/1');
    const hash2 = generateJobHash('  brain station 23  ', 'JUNIOR SOFTWARE ENGINEER', 'https://brainstation-23.com/job/1 ');
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('correctly identifies passed and upcoming deadlines', () => {
    expect(isDeadlinePassed('2020-01-01T00:00:00Z')).toBe(true);
    expect(isDeadlinePassed('2099-01-01T00:00:00Z')).toBe(false);
    expect(isDeadlinePassed(undefined)).toBe(false);
  });

  it('correctly identifies fresher-friendly roles from text', () => {
    expect(isFresherJob('Junior Developer', 'Fresh Graduate or 0-1 yr')).toBe(true);
    expect(isFresherJob('Intern Software Engineer', '')).toBe(true);
    expect(isFresherJob('Senior Solutions Architect', '7+ years required')).toBe(false);
  });

  it('database upsert should prevent duplicate entries by hash', async () => {
    const sampleJob: Omit<Job, 'id' | 'createdAt' | 'updatedAt'> = {
      hash: generateJobHash('BJIT', 'Associate AI Engineer', 'https://bjit.com/job/2'),
      title: 'Associate AI Engineer',
      company: 'BJIT',
      category: 'TECH_AI',
      employmentType: 'FULL_TIME',
      location: 'Dhaka',
      experience: 'Fresher',
      salary: '50k',
      deadline: '2026-12-31',
      source: 'BJIT Careers',
      sourceUrl: 'https://bjit.com/job/2',
      applyUrl: 'https://bjit.com/job/2',
      skills: ['Python', 'AI'],
      isActive: true,
      isFresherFriendly: true,
    };

    const initialResult = await upsertJobs([sampleJob]);
    expect(initialResult.newCount).toBe(1);

    // Second upsert of the exact same job should yield 0 new jobs
    const duplicateResult = await upsertJobs([sampleJob]);
    expect(duplicateResult.newCount).toBe(0);
  });
});
