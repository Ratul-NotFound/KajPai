import crypto from 'crypto';

/**
 * Deterministically generates a SHA-256 hash for a job posting.
 */
export function generateJobHash(company: string, title: string, sourceUrl: string): string {
  const normalized = `${company.trim().toLowerCase()}::${title.trim().toLowerCase()}::${sourceUrl.trim()}`;
  return crypto.createHash('sha256').update(normalized).digest('hex');
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
 */
export function isFresherJob(title: string, experience?: string): boolean {
  const text = `${title} ${experience || ''}`.toLowerCase();
  const fresherKeywords = [
    'fresher',
    'fresh graduate',
    'trainee',
    'intern',
    'junior',
    'associate',
    'entry level',
    'entry-level',
    '0-1',
    '0 to 1',
    'no experience',
  ];
  return fresherKeywords.some((keyword) => text.includes(keyword));
}
