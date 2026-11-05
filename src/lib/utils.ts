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

const KNOWN_COMPANY_DOMAINS: Record<string, string> = {
  // Bangladesh Premier Tech Firms
  'bjit': 'bjitgroup.com',
  'cefalo': 'cefalo.com',
  'samsung': 'samsung.com',
  'selise': 'selisegroup.com',
  'kaz': 'kaz.com.bd',
  'bkash': 'bkash.com',
  'brain station': 'brainstation-23.com',
  'enosis': 'enosisbd.com',
  'chaldal': 'chaldal.com',
  'pathao': 'pathao.com',
  'optimizely': 'optimizely.com',
  'therap': 'therapservices.net',

  // Telecommunications
  'grameenphone': 'grameenphone.com',
  'telenor': 'telenor.com',
  'robi': 'robi.com.bd',
  'banglalink': 'banglalink.net',

  // Banks & Financial Institutions
  'bangladesh bank': 'bb.org.bd',
  'brac bank': 'bracbank.com',
  'city bank': 'thecitybank.com',
  'eastern bank': 'ebl.com.bd',
  'dutch-bangla': 'dutchbanglabank.com',
  'sonali bank': 'sonalibank.com.bd',
  'islami bank': 'islamibankbd.com',
  'prime bank': 'primebank.com.bd',
  'standard chartered': 'sc.com',

  // Govt Circulars & Portals
  'teletalk': 'teletalk.com.bd',
  'alljobs': 'teletalk.com.bd',
  'govt': 'bangladesh.gov.bd',
  'government': 'bangladesh.gov.bd',
  'ministry': 'bangladesh.gov.bd',
  'bdjobs': 'bdjobs.com',

  // Global / Remote
  'automattic': 'automattic.com',
  'canonical': 'canonical.com',
  'gitlab': 'gitlab.com',
  'supabase': 'supabase.com',
  'cloudflare': 'cloudflare.com',
  'remoteok': 'remoteok.com',
};

/**
 * Resolves a high-quality logo or thumbnail URL for a company.
 * Falls back to unavatar CDN with known domain or clearbit lookup.
 */
export function resolveCompanyLogo(company: string, explicitLogo?: string): string | undefined {
  if (explicitLogo && explicitLogo.trim().startsWith('http')) {
    return explicitLogo.trim();
  }

  const clean = company.toLowerCase().trim();
  for (const [key, domain] of Object.entries(KNOWN_COMPANY_DOMAINS)) {
    if (clean.includes(key)) {
      return `https://unavatar.io/${domain}`;
    }
  }

  // If company string itself looks like a domain (e.g. Acme.io)
  if (clean.includes('.')) {
    const domainMatch = clean.match(/([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/);
    if (domainMatch) {
      return `https://unavatar.io/${domainMatch[1]}`;
    }
  }

  // Fallback to unavatar by company name
  const sanitized = clean.replace(/[^a-zA-Z0-9]/g, '');
  if (sanitized.length >= 3) {
    return `https://unavatar.io/${sanitized}.com`;
  }

  return undefined;
}

