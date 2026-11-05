import { Job, JobCategory } from '../lib/types';

export interface BaseScraper {
  name: string;
  category: JobCategory;
  scrape(): Promise<Omit<Job, 'id' | 'createdAt' | 'updatedAt'>[]>;
}

export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
];

export async function safeFetch(url: string, timeoutMs: number = 10000): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': randomUA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8',
      },
    });

    clearTimeout(timeoutId);
    if (!res.ok) {
      return null;
    }
    return await res.text();
  } catch (err) {
    clearTimeout(timeoutId);
    return null;
  }
}
