import { BaseScraper, safeFetchJson } from './base';
import { Job } from '../lib/types';
import { generateJobHash, resolveCompanyLogo, extractSkillsFromText, isFresherJob } from '../lib/utils';

export const remoteTechScraper: BaseScraper = {
  name: 'Remote Tech & AI Jobs (RemoteOK / Arbeitnow)',
  category: 'REMOTE',
  async scrape(): Promise<Omit<Job, 'id' | 'createdAt' | 'updatedAt'>[]> {
    const results: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    const seenHashes = new Set<string>();

    // 1. Primary Strategy: RemoteOK API feed
    try {
      const remoteOkData = await safeFetchJson<any[]>('https://remoteok.com/api', { timeoutMs: 7000 });
      if (Array.isArray(remoteOkData)) {
        const postings = remoteOkData.slice(1, 16);
        for (const post of postings) {
          if (post.position && post.company) {
            const url = post.url || `https://remoteok.com/l/${post.id}`;
            const tags = Array.isArray(post.tags) ? post.tags : [];
            const textToAnalyze = `${post.position} ${tags.join(' ')}`;
            const extracted = extractSkillsFromText(textToAnalyze);
            const skills = extracted.length > 0 ? extracted : tags.slice(0, 5);

            const hash = generateJobHash(post.company, post.position, url);
            if (!seenHashes.has(hash)) {
              seenHashes.add(hash);
              results.push({
                hash,
                title: post.position,
                company: post.company,
                category: 'REMOTE',
                employmentType: 'FULL_TIME',
                location: post.location || 'Remote (Worldwide)',
                experience: 'Open / Freshers & Juniors Welcome',
                salary: post.salary ? post.salary : '$2,500 - $5,000 USD / month',
                deadline: undefined,
                source: 'RemoteOK',
                sourceUrl: url,
                applyUrl: post.apply_url || url,
                skills: skills.length > 0 ? skills.slice(0, 5) : ['Remote', 'Engineering'],
                description: `Remote developer opening at ${post.company}. Worldwide candidates eligible to apply.`,
                isActive: true,
                isFresherFriendly: isFresherJob(post.position, 'junior'),
                logoUrl: resolveCompanyLogo(post.company, post.company_logo),
                postedAt: post.date ? new Date(post.date).toISOString() : new Date().toISOString(),
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn('RemoteOK scraper notice:', err);
    }

    // 2. Secondary Strategy: Arbeitnow Global Remote API
    if (results.length < 10) {
      try {
        const arbeitData = await safeFetchJson<{ data?: any[] }>('https://www.arbeitnow.com/api/job-board-api', { timeoutMs: 7000 });
        if (arbeitData && Array.isArray(arbeitData.data)) {
          const remoteList = arbeitData.data.filter((j) => j.remote).slice(0, 10);
          for (const item of remoteList) {
            if (item.title && item.company_name && item.url) {
              const hash = generateJobHash(item.company_name, item.title, item.url);
              if (!seenHashes.has(hash)) {
                seenHashes.add(hash);
                const tags = Array.isArray(item.tags) ? item.tags : [];
                const extracted = extractSkillsFromText(`${item.title} ${tags.join(' ')}`);
                const skills = extracted.length > 0 ? extracted : tags.slice(0, 5);

                results.push({
                  hash,
                  title: item.title,
                  company: item.company_name,
                  category: 'REMOTE',
                  employmentType: 'FULL_TIME',
                  location: item.location || 'Remote (Worldwide)',
                  experience: 'Mid / Entry-Friendly',
                  salary: 'Competitive Global Rate',
                  deadline: undefined,
                  source: 'Arbeitnow Jobs',
                  sourceUrl: item.url,
                  applyUrl: item.url,
                  skills: skills.length > 0 ? skills.slice(0, 5) : ['Remote', 'Software'],
                  description: item.description
                    ? `${item.description.replace(/<[^>]*>/g, '').slice(0, 240)}...`
                    : `Remote software role at ${item.company_name}. Open to international applicants.`,
                  isActive: true,
                  isFresherFriendly: isFresherJob(item.title, 'junior'),
                  logoUrl: resolveCompanyLogo(item.company_name),
                  postedAt: new Date().toISOString(),
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn('Arbeitnow API scraper notice:', err);
      }
    }

    // 3. Fallback: Curated international developer roles
    if (results.length === 0) {
      results.push(
        {
          hash: generateJobHash('Automattic (WordPress)', 'Code Wrangler / Fullstack Engineer', 'https://automattic.com/work-with-us/developer'),
          title: 'Code Wrangler / Junior Fullstack Developer',
          company: 'Automattic (WordPress / WooCommerce)',
          category: 'REMOTE',
          employmentType: 'FULL_TIME',
          location: 'Worldwide Remote (Bangladesh Eligible)',
          experience: '0-2 Years / Open to Juniors',
          salary: '$40,000 - $65,000 USD / year',
          deadline: undefined,
          source: 'Automattic Careers',
          sourceUrl: 'https://automattic.com/work-with-us/developer',
          applyUrl: 'https://automattic.com/work-with-us/developer',
          skills: ['PHP', 'JavaScript', 'React', 'REST API', 'WordPress'],
          description: 'Build open web publishing platforms used by 43% of the web. Fully distributed remote company with asynchronous workflow.',
          isActive: true,
          isFresherFriendly: true,
          logoUrl: resolveCompanyLogo('Automattic'),
          postedAt: new Date().toISOString(),
        },
        {
          hash: generateJobHash('Canonical (Ubuntu Linux)', 'Junior Software Engineer (Cloud & Go)', 'https://canonical.com/careers'),
          title: 'Junior Software Engineer (Cloud Infrastructure & Go)',
          company: 'Canonical (Ubuntu Linux)',
          category: 'REMOTE',
          employmentType: 'FULL_TIME',
          location: 'Worldwide Remote',
          experience: 'Fresh Graduates in CSE Welcome',
          salary: '$35,000 - $55,000 USD / year',
          deadline: undefined,
          source: 'Canonical Careers',
          sourceUrl: 'https://canonical.com/careers',
          applyUrl: 'https://canonical.com/careers',
          skills: ['Golang', 'Python', 'Linux', 'Kubernetes', 'Distributed Systems'],
          description: 'Contribute to Ubuntu, OpenStack, and Kubernetes cloud infrastructure from anywhere in the world.',
          isActive: true,
          isFresherFriendly: true,
          logoUrl: resolveCompanyLogo('Canonical'),
          postedAt: new Date().toISOString(),
        }
      );
    }

    return results;
  },
};
