import crypto from 'crypto';

/**
 * Deterministically generates a SHA-256 hash for a job posting.
 */
export function generateJobHash(company: string, title: string, sourceUrl: string): string {
  const normalized = `${company.trim().toLowerCase()}::${title.trim().toLowerCase()}::${sourceUrl.trim()}`;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Safely parses a date string into an ISO string without throwing RangeError on invalid values.
 */
export function safeIsoDate(dateStr?: string): string | undefined {
  if (!dateStr || typeof dateStr !== 'string') return undefined;
  try {
    const d = new Date(dateStr.trim());
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString();
  } catch {
    return undefined;
  }
}

/**
 * Checks if a given ISO deadline string has already passed relative to current time.
 */
export function isDeadlinePassed(deadlineStr?: string): boolean {
  if (!deadlineStr) return false;
  try {
    const deadline = new Date(deadlineStr);
    if (isNaN(deadline.getTime())) return false;
    return deadline.getTime() < Date.now();
  } catch {
    return false;
  }
}

/**
 * Formats a deadline into a clean human-readable countdown or date.
 */
export function formatDeadline(deadlineStr?: string): { text: string; status: 'green' | 'amber' | 'red' | 'neutral' } {
  if (!deadlineStr) return { text: 'Not specified', status: 'neutral' };

  try {
    const deadline = new Date(deadlineStr);
    if (isNaN(deadline.getTime())) return { text: deadlineStr, status: 'neutral' };

    const diffMs = deadline.getTime() - Date.now();
    if (diffMs < 0) {
      return { text: 'Deadline Passed', status: 'red' };
    }

    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 2) {
      return { text: `Closes in ${diffDays} day${diffDays === 1 ? '' : 's'}`, status: 'amber' };
    }
    if (diffDays <= 7) {
      return { text: `${diffDays} days left`, status: 'amber' };
    }
    return { text: `${diffDays} days left`, status: 'green' };
  } catch {
    return { text: deadlineStr, status: 'neutral' };
  }
}

/**
 * Determines whether a job is suitable for freshers / entry-level based on title and experience.
 * Protects against senior false positives (e.g., "Associate Director").
 */
export function isFresherJob(title: string, experience?: string): boolean {
  const text = `${title} ${experience || ''}`.toLowerCase();

  // If explicitly senior or director, it's not a fresher role
  const seniorIndicators = ['senior', 'lead', 'principal', 'director', 'head of', 'manager', '5+ year', '7+ year', '10+ year'];
  if (seniorIndicators.some((word) => text.includes(word))) {
    return false;
  }

  const fresherKeywords = [
    'fresher',
    'fresh graduate',
    'trainee',
    'intern',
    'junior',
    'entry level',
    'entry-level',
    '0-1',
    '0 to 1',
    'no experience',
  ];

  // Specific check for 'associate' when not associated with director/vp
  if (text.includes('associate') && !text.includes('director') && !text.includes('manager')) {
    return true;
  }

  return fresherKeywords.some((keyword) => text.includes(keyword));
}
