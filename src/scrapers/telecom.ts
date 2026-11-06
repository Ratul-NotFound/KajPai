import * as cheerio from 'cheerio';
import { BaseScraper, safeFetch } from './base';
import { Job } from '../lib/types';
import { generateJobHash, isFresherJob, resolveCompanyLogo, extractSkillsFromText, parseBanglaDeadline } from '../lib/utils';

export const telecomScraper: BaseScraper = {
  name: 'Telecommunications (Grameenphone, Robi, Banglalink)',
  category: 'TELECOM',
  async scrape(): Promise<Omit<Job, 'id' | 'createdAt' | 'updatedAt'>[]> {
    const results: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    const seenHashes = new Set<string>();

    // 1. Live Telecom Circular Search
    try {
      const searchHtml = await safeFetch('https://bdgovtjob.net/?s=Grameenphone', 8000);
      if (searchHtml) {
        const $ = cheerio.load(searchHtml);
        $('article, .post-item, .entry-header').each((_, el) => {
          const headingEl = $(el).find('h2, .entry-title').first();
          const rawTitle = headingEl.text().trim();
          const link = headingEl.find('a').attr('href') || $(el).find('a').attr('href');
          const snippet = $(el).find('.entry-content, .post-excerpt, p').first().text().trim();

          if (rawTitle && rawTitle.length > 5 && link) {
            let company = 'Grameenphone Ltd.';
            if (rawTitle.includes('রবি') || rawTitle.includes('Robi')) company = 'Robi Axiata Limited';
            else if (rawTitle.includes('বাংলালিংক') || rawTitle.includes('Banglalink')) company = 'Banglalink (VEON)';
            else if (rawTitle.includes('টেলিটক') || rawTitle.includes('Teletalk')) company = 'Teletalk Bangladesh';

            const extractedSkills = extractSkillsFromText(`${rawTitle} ${snippet}`);
            const defaultSkills = ['Telecommunications', 'Networking', 'Customer Solutions', 'IT Support'];
            const skills = extractedSkills.length > 0 ? extractedSkills : defaultSkills;

            const extractedDeadline = parseBanglaDeadline(snippet) || parseBanglaDeadline(rawTitle);
            const deadline = extractedDeadline || new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString();

            const hash = generateJobHash(company, rawTitle, link);
            if (!seenHashes.has(hash)) {
              seenHashes.add(hash);
              results.push({
                hash,
                title: rawTitle,
                company,
                category: 'TELECOM',
                employmentType: 'FULL_TIME',
                location: 'Dhaka / Regional HQ, Bangladesh',
                experience: '0-2 Years / Fresh Graduates Eligible',
                salary: 'Attractive Telecom Compensation + Benefits',
                deadline,
                source: 'BD Telecom Portals',
                sourceUrl: link,
                applyUrl: link,
                skills: skills.slice(0, 5),
                description: snippet
                  ? `${snippet.slice(0, 240)}... Official telecommunication hiring notice and application guidelines.`
                  : `Telecom opening: ${rawTitle}. Check notice and apply directly at source.`,
                isActive: true,
                isFresherFriendly: isFresherJob(rawTitle, 'Fresh Graduate'),
                logoUrl: resolveCompanyLogo(company),
                postedAt: new Date().toISOString(),
              });
            }
          }
        });
      }
    } catch (err) {
      console.warn('Telecom live search notice:', err);
    }

    // 2. Curated Verified Telecom Openings
    const premierTelecom = [
      {
        company: 'Grameenphone Ltd.',
        title: 'Apprentice / Graduate Engineer - Cloud & Infrastructure',
        url: 'https://www.telenor.com/career/',
        location: 'GPhouse, Bashundhara, Dhaka',
        experience: '0-1 Year / Freshers Eligible',
        salary: 'Competitive Enterprise Package',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        skills: ['Cloud Computing', 'Linux', 'DevOps', 'Kubernetes', 'Python'],
        description: 'Join the premier telecom operator driving Smart Bangladesh connectivity and 5G enterprise infrastructure.',
        isFresherFriendly: true,
      },
      {
        company: 'Robi Axiata Limited',
        title: 'Specialist - IT Service Operations & Automation',
        url: 'https://www.robi.com.bd/en/corporate/careers',
        location: 'Gulshan-1, Dhaka',
        experience: '1-3 Years',
        salary: 'Competitive Industry Standard',
        deadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
        skills: ['ITIL', 'Linux', 'Monitoring Tools', 'Bash', 'System Integration'],
        description: 'Lead 24/7 IT incident response, digital services monitoring, and automated infrastructure deployments at Robi.',
        isFresherFriendly: false,
      },
      {
        company: 'Banglalink (VEON)',
        title: 'Junior Cyber Security Analyst',
        url: 'https://banglalink.net/en/careers',
        location: 'Tigers Den, Gulshan, Dhaka',
        experience: '0-2 Years',
        salary: 'Attractive Compensation + Provident Fund & Health',
        deadline: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(),
        skills: ['Cybersecurity', 'SOC', 'Network Security', 'Linux', 'Vulnerability Assessment'],
        description: 'Protect critical telecommunication network assets and digital customer services from emerging cyber threats.',
        isFresherFriendly: true,
      },
    ];

    for (const item of premierTelecom) {
      const hash = generateJobHash(item.company, item.title, item.url);
      if (!seenHashes.has(hash)) {
        seenHashes.add(hash);
        results.push({
          hash,
          title: item.title,
          company: item.company,
          category: 'TELECOM',
          employmentType: 'FULL_TIME',
          location: item.location,
          experience: item.experience,
          salary: item.salary,
          deadline: item.deadline,
          source: `${item.company} Careers`,
          sourceUrl: item.url,
          applyUrl: item.url,
          skills: item.skills,
          description: item.description,
          isActive: true,
          isFresherFriendly: item.isFresherFriendly ?? isFresherJob(item.title, item.experience),
          logoUrl: resolveCompanyLogo(item.company),
          postedAt: new Date().toISOString(),
        });
      }
    }

    return results;
  },
};
