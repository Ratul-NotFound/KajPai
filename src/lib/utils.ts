import crypto from 'crypto';

/**
 * Sanitizes and cleans mojibake / corrupted UTF-8 encodings and HTML entities from scraped job text.
 */
export function cleanText(text?: string): string {
  if (!text) return '';
  return text
    .replace(/â\u0080\u0093/g, '–')
    .replace(/â\u0080\u0094/g, '—')
    .replace(/â\u0080\u0099/g, "'")
    .replace(/â\u0080\u0098/g, "'")
    .replace(/â\u0080\u009c/g, '"')
    .replace(/â\u0080\u009d/g, '"')
    .replace(/â\u0080\u00a6/g, '...')
    .replace(/â\u0080\u00a2/g, '•')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

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
  const seniorIndicators = ['senior', 'lead', 'principal', 'director', 'head of', '5+ year', '7+ year', '10+ year'];
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
    '0-2',
    '0 to 2',
    '0 to 3',
    'no experience',
    'freshers are encouraged',
    'freshers encouraged',
    'at least 0',
  ];

  // Specific check for 'associate' when not associated with director/vp
  if (text.includes('associate') && !text.includes('director') && !text.includes('manager')) {
    return true;
  }

  return fresherKeywords.some((keyword) => text.includes(keyword));
}

const COMMON_TECH_SKILLS = [
  'Python',
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'FastAPI',
  'Django',
  'Spring Boot',
  'Java',
  'C++',
  'Golang',
  'C#',
  '.NET',
  'PHP',
  'Laravel',
  'AWS',
  'GCP',
  'Azure',
  'Docker',
  'Kubernetes',
  'PostgreSQL',
  'MongoDB',
  'MySQL',
  'Redis',
  'PyTorch',
  'TensorFlow',
  'LLMs',
  'AI',
  'Machine Learning',
  'Data Science',
  'Computer Vision',
  'Automation',
  'DevOps',
  'CI/CD',
  'Networking',
  'Flutter',
  'React Native',
  'iOS',
  'Android',
  'TailwindCSS',
  'Angular',
  'Vue',
  'GraphQL',
  'REST API',
  'Microservices',
  'Git',
  'Linux',
  'Cybersecurity',
  'SQL',
  'QA',
  'System Design',
];

/**
 * Automatically extracts relevant tech and engineering skills from freeform job text.
 */
export function extractSkillsFromText(text: string): string[] {
  if (!text) return [];
  const found: string[] = [];
  const lower = text.toLowerCase();

  for (const skill of COMMON_TECH_SKILLS) {
    const skillLower = skill.toLowerCase();
    // Word boundary or clean match
    const regex = new RegExp(`(^|[^a-z0-9])${skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i');
    if (regex.test(lower)) {
      found.push(skill);
    }
  }

  return found.slice(0, 6);
}

const BANGLA_DIGITS: Record<string, string> = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
};

const BANGLA_MONTHS: Record<string, number> = {
  'জানুয়ারি': 0, 'জানুয়ারী': 0, 'january': 0,
  'ফেব্রুয়ারি': 1, 'ফেব্রুয়ারী': 1, 'february': 1,
  'মার্চ': 2, 'march': 2,
  'এপ্রিল': 3, 'april': 3,
  'মে': 4, 'may': 4,
  'জুন': 5, 'june': 5,
  'জুলাই': 6, 'july': 6,
  'আগস্ট': 7, 'আগষ্ট': 7, 'august': 7,
  'সেপ্টেম্বর': 8, 'september': 8,
  'অক্টোবর': 9, 'october': 9,
  'নভেম্বর': 10, 'november': 10,
  'ডিসেম্বর': 11, 'december': 11,
};

/**
 * Extracts and converts Bangla or English deadlines into ISO date format.
 * E.g., "৩০ নভেম্বর ২০২৬" -> "2026-11-30T17:59:59.000Z"
 */
export function parseBanglaDeadline(text: string): string | undefined {
  if (!text) return undefined;

  // Convert all Bangla digits to English
  const normalized = text.replace(/[০-৯]/g, (d) => BANGLA_DIGITS[d] || d).toLowerCase();

  // Pattern: (day 1-31) (month) (year 2024-2030)
  for (const [monthName, monthIndex] of Object.entries(BANGLA_MONTHS)) {
    if (normalized.includes(monthName)) {
      const match = normalized.match(new RegExp(`(\\d{1,2})\\s*(?:[\\s\\S]{0,10})?${monthName}\\s*(?:[\\s\\S]{0,10})?(\\d{4})`));
      if (match) {
        const day = parseInt(match[1], 10);
        const year = parseInt(match[2], 10);
        if (day >= 1 && day <= 31 && year >= 2024 && year <= 2030) {
          const date = new Date(Date.UTC(year, monthIndex, day, 17, 59, 59));
          return date.toISOString();
        }
      }
    }
  }

  // Fallback to standard safeIsoDate
  return safeIsoDate(text);
}


const LOCAL_BRAND_LOGOS: Record<string, string> = {
  // Top Bangladesh Tech
  'bkash': '/logos/bkash.svg',
  'brain station': '/logos/brainstation.svg',
  'bjit': '/logos/bjit.svg',
  'samsung': '/logos/samsung.svg',
  'selise': '/logos/selise.svg',
  'cefalo': '/logos/cefalo.svg',
  'kaz': '/logos/kaz.svg',
  'enosis': '/logos/enosis.svg',
  'pathao': '/logos/tech.svg',
  'chaldal': '/logos/tech.svg',
  'therap': '/logos/tech.svg',

  // Telecommunications
  'grameenphone': '/logos/grameenphone.svg',
  'telenor': '/logos/grameenphone.svg',
  'robi': '/logos/robi.svg',
  'banglalink': '/logos/banglalink.svg',

  // Banks & Financial
  'bangladesh bank': '/logos/bangladesh-bank.svg',
  'central bank': '/logos/bangladesh-bank.svg',
  'brac bank': '/logos/bracbank.svg',
  'city bank': '/logos/citybank.svg',
  'sonali bank': '/logos/bank.svg',
  'islami bank': '/logos/bank.svg',
  'bank': '/logos/bank.svg',

  // Govt Circulars & Portals
  'teletalk': '/logos/teletalk.svg',
  'alljobs': '/logos/teletalk.svg',
  'skill.jobs': '/logos/skilljobs.svg',
  'skill jobs': '/logos/skilljobs.svg',
  'daffodil': '/logos/skilljobs.svg',
  'cdc-diu': '/logos/skilljobs.svg',
  'supreme court': '/logos/govt.svg',
  'police': '/logos/govt.svg',
  'dmp': '/logos/govt.svg',
  'ministry': '/logos/govt.svg',
  'commission': '/logos/govt.svg',
  'council': '/logos/govt.svg',
  'govt': '/logos/govt.svg',
  'government': '/logos/govt.svg',
  'bdjobs': '/logos/bdjobs.svg',

  // Global & Remote
  'remote': '/logos/remote.svg',
  'remoteok': '/logos/remote.svg',
  'automattic': '/logos/tech.svg',
  'canonical': '/logos/tech.svg',
  'gitlab': '/logos/tech.svg',
};

/**
 * Resolves a reliable, instant logo or thumbnail URL for a company.
 * Prioritizes local first-party SVGs (zero adblocker blocking, zero latency).
 */
export function resolveCompanyLogo(company: string, explicitLogo?: string): string {
  // If explicitly a local asset path, use immediately
  if (explicitLogo && explicitLogo.startsWith('/logos/')) {
    return explicitLogo;
  }

  // If explicit HTTP logo exists, verify it is not an unavatar tracker
  if (explicitLogo && explicitLogo.trim().startsWith('http') && !explicitLogo.includes('unavatar.io')) {
    return explicitLogo.trim();
  }

  const clean = company.toLowerCase().trim();
  for (const [key, logoPath] of Object.entries(LOCAL_BRAND_LOGOS)) {
    if (clean.includes(key)) {
      return logoPath;
    }
  }

  // Categorical tech/code fallback
  if (
    clean.includes('software') ||
    clean.includes('tech') ||
    clean.includes('developer') ||
    clean.includes('engineering') ||
    clean.includes('system')
  ) {
    return '/logos/tech.svg';
  }

  return '/logos/remote.svg';
}

