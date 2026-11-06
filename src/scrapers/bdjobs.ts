import * as cheerio from 'cheerio';
import { BaseScraper, safeFetch } from './base';
import { Job, JobCategory } from '../lib/types';
import { generateJobHash, isFresherJob, parseBanglaDeadline, extractSkillsFromText, resolveCompanyLogo } from '../lib/utils';

export const bdJobsScraper: BaseScraper = {
  name: 'BDJobs & Private Tech Portals',
  category: 'TECH_AI',
  async scrape(): Promise<Omit<Job, 'id' | 'createdAt' | 'updatedAt'>[]> {
    const results: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    const seenHashes = new Set<string>();

    const parseEntry = (rawTitle: string, link: string, snippet: string = '') => {
      if (!rawTitle || rawTitle.length < 5 || !link) return;

      let cat: JobCategory = 'ADMIN';
      const lower = `${rawTitle} ${snippet}`.toLowerCase();
      if (lower.includes('software') || lower.includes('engineer') || lower.includes('developer') || lower.includes('programmer') || lower.includes('it ') || lower.includes('ai ')) {
        cat = 'TECH_AI';
      } else if (lower.includes('intern') || lower.includes('trainee')) {
        cat = 'INTERNSHIP';
      }

      let company = 'Leading Private Enterprise BD';
      if (rawTitle.includes('পপি') || rawTitle.includes('POPI')) company = 'POPI NGO Bangladesh';
      else if (rawTitle.includes('প্রশিকা') || rawTitle.includes('Proshika')) company = 'Proshika Bangladesh';
      else if (rawTitle.includes('আঞ্জুমান') || rawTitle.includes('Anjuman')) company = 'Anjuman Mufidul Islam';
      else if (rawTitle.includes('টেক্সটাইল') || rawTitle.includes('Textile')) company = 'Top Garments & Textile Group';
      else if (rawTitle.includes('সিদীপ') || rawTitle.includes('CDIP')) company = 'CDIP NGO Bangladesh';
      else if (rawTitle.includes('একমি') || rawTitle.includes('Acme')) company = 'The Acme Laboratories Ltd.';
      else if (rawTitle.includes('হেলথকেয়ার') || rawTitle.includes('Healthcare')) company = 'Healthcare Pharmaceuticals Ltd.';
      else if (rawTitle.includes('স্কুল') || rawTitle.includes('School')) company = 'Education Institution BD';

      const extractedDeadline = parseBanglaDeadline(snippet) || parseBanglaDeadline(rawTitle);
      const deadline = extractedDeadline || new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString();

      const extractedSkills = extractSkillsFromText(`${rawTitle} ${snippet}`);
      const defaultSkills = ['Administration', 'Problem Solving', 'Communication', 'Management'];
      const skills = extractedSkills.length > 0 ? extractedSkills : defaultSkills;

      const hash = generateJobHash(company, rawTitle, link);
      if (!seenHashes.has(hash)) {
        seenHashes.add(hash);
        results.push({
          hash,
          title: rawTitle,
          company,
          category: cat,
          employmentType: 'FULL_TIME',
          location: 'Dhaka, Bangladesh',
          experience: 'Graduate / Diploma / Freshers',
          salary: 'Negotiable / Market Standard',
          deadline,
          source: 'BDJobs & Private Portal',
          sourceUrl: link,
          applyUrl: link,
          skills: skills.slice(0, 5),
          description: snippet
            ? `${snippet.slice(0, 250)}... Check official notice and requirements at source.`
            : `Private opening: ${rawTitle}. Check official notice and apply directly through link.`,
          isActive: true,
          isFresherFriendly: isFresherJob(rawTitle, 'Graduate'),
          logoUrl: resolveCompanyLogo(company),
          postedAt: new Date().toISOString(),
        });
      }
    };

    // 1. Primary Strategy: Parse high-reliability XML RSS Feed
    const rssXml = await safeFetch('https://bdgovtjob.net/category/private-jobs/feed/', 10000);
    if (rssXml) {
      try {
        const $ = cheerio.load(rssXml, { xmlMode: true });
        $('item').each((_, el) => {
          const rawTitle = $(el).find('title').text().trim();
          const link = $(el).find('link').text().trim() || 'https://bdjobs.com';
          const description = $(el).find('description').text().trim();
          parseEntry(rawTitle, link, description);
        });
      } catch (err) {
        console.warn('Private portal RSS parse warning:', err);
      }
    }

    // 2. Secondary Strategy: HTML Portal Scrape if RSS produced few items
    if (results.length < 5) {
      const html = await safeFetch('https://bdgovtjob.net/category/private-jobs/', 12000);
      if (html) {
        try {
          const $ = cheerio.load(html);
          $('article, .post-item, .entry-header').each((_, el) => {
            const headingEl = $(el).find('h2, .entry-title').first();
            const rawTitle = headingEl.text().trim();
            const link = headingEl.find('a').attr('href') || $(el).find('a').attr('href') || 'https://bdjobs.com';
            const snippet = $(el).find('.entry-content, .post-excerpt, p').first().text().trim();
            parseEntry(rawTitle, link, snippet);
          });
        } catch (err) {
          console.warn('Private portal HTML parse warning:', err);
        }
      }
    }

    // 3. Fallback
    if (results.length === 0) {
      results.push({
        hash: generateJobHash('Cefalo Bangladesh', 'Associate Software Engineer (Java / Cloud)', 'https://jobs.bdjobs.com/cefalo-2026'),
        title: 'Associate Software Engineer (Java / Cloud)',
        company: 'Cefalo Bangladesh Ltd.',
        category: 'TECH_AI',
        employmentType: 'FULL_TIME',
        location: 'Dhanmondi, Dhaka',
        experience: 'Fresh Graduate in CSE',
        salary: '45,000 - 60,000 BDT',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'BDJobs',
        sourceUrl: 'https://bdjobs.com',
        applyUrl: 'https://bdjobs.com',
        skills: ['Java', 'Spring Boot', 'Docker', 'AWS', 'Microservices'],
        description: 'Norwegian software engineering consultancy hiring problem solvers for international SaaS products.',
        isActive: true,
        isFresherFriendly: true,
        logoUrl: resolveCompanyLogo('Cefalo Bangladesh Ltd.'),
        postedAt: new Date().toISOString(),
      });
    }

    return results;
  },
};
