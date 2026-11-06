import { describe, it, expect } from 'vitest';
import {
  generateJobHash,
  isDeadlinePassed,
  formatDeadline,
  isFresherJob,
  safeIsoDate,
  resolveCompanyLogo,
  extractSkillsFromText,
  parseBanglaDeadline,
} from '../src/lib/utils';
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
    expect(isFresherJob('Associate Director of Technology', '10+ years')).toBe(false);
  });

  it('safely parses dates without throwing on invalid formats', () => {
    expect(safeIsoDate('2026-12-01')).toBeDefined();
    expect(safeIsoDate('Not a valid date string')).toBeUndefined();
    expect(safeIsoDate(undefined)).toBeUndefined();
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

    // In-batch duplicate test: passing the same job twice in the same batch
    const inBatchResult = await upsertJobs([
      { ...sampleJob, hash: generateJobHash('BJIT', 'Associate AI Engineer 2', 'https://bjit.com/job/3') },
      { ...sampleJob, hash: generateJobHash('BJIT', 'Associate AI Engineer 2', 'https://bjit.com/job/3') },
    ]);
    expect(inBatchResult.newCount).toBe(1);
  });

  it('correctly resolves company logo or thumbnail URL', () => {
    expect(resolveCompanyLogo('bKash Limited')).toBe('/logos/bkash.svg');
    expect(resolveCompanyLogo('Brain Station 23')).toBe('/logos/brainstation.svg');
    expect(resolveCompanyLogo('Grameenphone')).toBe('/logos/grameenphone.svg');
    expect(resolveCompanyLogo('Bangladesh Bank')).toBe('/logos/bangladesh-bank.svg');
    expect(resolveCompanyLogo('Unknown Firm', 'https://example.com/logo.png')).toBe('https://example.com/logo.png');
  });

  it('extracts technical skills automatically from freeform text', () => {
    const text = 'Looking for Python and React developer with PostgreSQL and Docker experience.';
    const skills = extractSkillsFromText(text);
    expect(skills).toContain('Python');
    expect(skills).toContain('React');
    expect(skills).toContain('PostgreSQL');
    expect(skills).toContain('Docker');
  });

  it('parses Bangla digits and months into valid ISO deadlines', () => {
    const banglaText = 'আবেদন করার শেষ তারিখ ৩০ নভেম্বর ২০২৬ বিকাল ৫টা';
    const iso = parseBanglaDeadline(banglaText);
    expect(iso).toBeDefined();
    expect(iso).toContain('2026-11-30');
  });
});

