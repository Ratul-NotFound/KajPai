import { Job, JobCategory } from '../lib/types';

export interface BaseScraper {
  name: string;
  category: JobCategory;
  scrape(): Promise<Omit<Job, 'id' | 'createdAt' | 'updatedAt'>[]>;
}

export interface FetchOptions {
  timeoutMs?: number;
  retries?: number;
  backoffMs?: number;
  headers?: Record<string, string>;
}

export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
];

/**
 * Executes a resilient HTTP fetch with exponential backoff retries,
 * modern browser headers, timeout cancellation, and 429/503 mitigation.
 */
export async function safeFetch(url: string, timeoutOrOptions: number | FetchOptions = 10000): Promise<string | null> {
  const options: FetchOptions =
    typeof timeoutOrOptions === 'number'
      ? { timeoutMs: timeoutOrOptions, retries: 2, backoffMs: 800 }
      : { timeoutMs: 10000, retries: 2, backoffMs: 800, ...timeoutOrOptions };

  const maxAttempts = (options.retries ?? 2) + 1;
  const timeoutMs = options.timeoutMs ?? 10000;
  const backoffMs = options.backoffMs ?? 800;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': userAgent,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8',
          'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      // If rate-limited (429) or temporary server glitch (502, 503, 504), wait and retry
      if (res.status === 429 || res.status === 502 || res.status === 503 || res.status === 504) {
        if (attempt < maxAttempts) {
          const retryAfter = res.headers.get('retry-after');
          const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : backoffMs * Math.pow(2, attempt - 1);
          await new Promise((r) => setTimeout(r, delay + Math.random() * 200));
          continue;
        }
        return null;
      }

      if (!res.ok) {
        return null;
      }

      return await res.text();
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (attempt < maxAttempts) {
        const jitter = Math.floor(Math.random() * 200);
        const delay = backoffMs * Math.pow(2, attempt - 1) + jitter;
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      return null;
    }
  }

  return null;
}

/**
 * Resilient JSON fetcher with type safety and fallback.
 */
export async function safeFetchJson<T = any>(url: string, options?: FetchOptions): Promise<T | null> {
  const text = await safeFetch(url, {
    ...options,
    headers: {
      Accept: 'application/json, text/plain, */*',
      ...options?.headers,
    },
  });

  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch (err) {
    return null;
  }
}
