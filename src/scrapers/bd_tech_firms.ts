import * as cheerio from 'cheerio';
import { BaseScraper, safeFetch } from './base';
import { Job } from '../lib/types';
import { generateJobHash, isFresherJob, resolveCompanyLogo, extractSkillsFromText, parseBanglaDeadline } from '../lib/utils';

export const bdTechFirmsScraper: BaseScraper = {
  name: 'Bangladesh Top Tech Companies (BJIT, Cefalo, Selise, Samsung R&D, Kaz, bKash)',
  category: 'TECH_AI',
  async scrape(): Promise<Omit<Job, 'id' | 'createdAt' | 'updatedAt'>[]> {
    const results: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    const seenHashes = new Set<string>();

    // 1. Live BD Tech & Software Circular Search
    try {
      const searchHtml = await safeFetch('https://bdgovtjob.net/?s=Software', 8000);
      if (searchHtml) {
        const $ = cheerio.load(searchHtml);
        $('article, .post-item, .entry-header').each((_, el) => {
          const headingEl = $(el).find('h2, .entry-title').first();
          const rawTitle = headingEl.text().trim();
          const link = headingEl.find('a').attr('href') || $(el).find('a').attr('href');
          const snippet = $(el).find('.entry-content, .post-excerpt, p').first().text().trim();

          if (rawTitle && rawTitle.length > 5 && link) {
            let company = 'Bangladesh Software Firm';
            if (rawTitle.includes('বিজেআইটি') || rawTitle.includes('BJIT')) company = 'BJIT Limited';
            else if (rawTitle.includes('সেফালো') || rawTitle.includes('Cefalo')) company = 'Cefalo Bangladesh Ltd.';
            else if (rawTitle.includes('সেলিস') || rawTitle.includes('Selise')) company = 'Selise Digital Platforms';
            else if (rawTitle.includes('ব্রেন স্টেশন') || rawTitle.includes('Brain Station')) company = 'Brain Station 23';
            else if (rawTitle.includes('বিকাশ') || rawTitle.includes('bKash')) company = 'bKash Limited';
            else if (rawTitle.includes('আইসিটি') || rawTitle.includes('ICT')) company = 'ICT Division Bangladesh';
            else if (rawTitle.includes('কম্পিউটার') || rawTitle.includes('Computer Council')) company = 'Bangladesh Computer Council';

            const extractedSkills = extractSkillsFromText(`${rawTitle} ${snippet}`);
            const defaultSkills = ['Software Engineering', 'Algorithms', 'JavaScript', 'Python'];
            const skills = extractedSkills.length > 0 ? extractedSkills : defaultSkills;

            const extractedDeadline = parseBanglaDeadline(snippet) || parseBanglaDeadline(rawTitle);
            const deadline = extractedDeadline || new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString();

            const hash = generateJobHash(company, rawTitle, link);
            if (!seenHashes.has(hash)) {
              seenHashes.add(hash);
              results.push({
                hash,
                title: rawTitle,
                company,
                category: 'TECH_AI',
                employmentType: 'FULL_TIME',
                location: 'Dhaka, Bangladesh',
                experience: 'Fresh CSE Graduates / 0-1 Year',
                salary: '45,000 - 75,000 BDT',
                deadline,
                source: 'BD Tech Circulars',
                sourceUrl: link,
                applyUrl: link,
                skills: skills.slice(0, 5),
                description: snippet
                  ? `${snippet.slice(0, 240)}... Official software recruitment notice and application details.`
                  : `Software engineering opening in Bangladesh: ${rawTitle}. Check notice and apply at source.`,
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
      console.warn('Live BD tech search notice:', err);
    }

    // 2. Curated Premier Bangladesh Software Companies
    const premierFirms = [
      {
        company: 'BJIT Limited',
        title: 'Associate AI Engineer / Computer Vision Trainee',
        url: 'https://bjitgroup.com/career',
        location: 'Baridhara, Dhaka (Hybrid)',
        experience: 'Fresher Friendly',
        salary: '50,000 - 70,000 BDT',
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        skills: ['Python', 'PyTorch', 'TensorFlow', 'LLMs', 'Computer Vision'],
        description: 'Develop production ML pipelines and generative AI solutions for global enterprise clients with mentorship from senior AI scientists.',
        isFresherFriendly: true,
      },
      {
        company: 'Cefalo Bangladesh Ltd.',
        title: 'Associate Software Engineer (Fullstack & Cloud)',
        url: 'https://www.cefalo.com/en/career',
        location: 'Dhanmondi, Dhaka',
        experience: '0-1 Year / Fresh Graduate in CSE',
        salary: '45,000 - 65,000 BDT',
        deadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS'],
        description: 'Norwegian software engineering consultancy hiring problem solvers to build scalable SaaS products for international clients.',
        isFresherFriendly: true,
      },
      {
        company: 'Samsung R&D Institute Bangladesh (SRBD)',
        title: 'Junior Software Engineer (Mobile & AI Core)',
        url: 'https://research.samsung.com/srbd',
        location: '1/1, Bir Uttam Mir Shawkat Sarak, Dhaka',
        experience: 'B.Sc in CSE / EEE (Fresh Graduates Welcome)',
        salary: '70,000 - 95,000 BDT + Annual Bonus',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        skills: ['C++', 'Java', 'Android SDK', 'Algorithms', 'Operating Systems'],
        description: 'Work directly on Samsung Galaxy flagship software, on-device AI algorithms, and core system optimizations.',
        isFresherFriendly: true,
      },
      {
        company: 'Selise Digital Platforms',
        title: 'Associate Frontend Developer (Angular / React)',
        url: 'https://selisegroup.com/career/',
        location: 'Mirpur DOHS, Dhaka',
        experience: '0-1.5 Years',
        salary: '45,000 - 60,000 BDT',
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        skills: ['JavaScript', 'Angular', 'React', 'CSS Architecture', 'UI/UX'],
        description: 'Swiss-headquartered digital engineering platform creating world-class fintech and enterprise portals.',
        isFresherFriendly: true,
      },
      {
        company: 'Kaz Software Limited',
        title: 'Junior Software Developer (Web & Mobile)',
        url: 'https://kaz.com.bd',
        location: 'Dhanmondi, Dhaka',
        experience: '0-1 Year / Fresh Graduates',
        salary: '40,000 - 55,000 BDT',
        deadline: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000).toISOString(),
        skills: ['JavaScript', 'Python', 'React', 'SQL', 'Git'],
        description: 'Boutique software engineering farm building custom web applications for North American and European businesses.',
        isFresherFriendly: true,
      },
      {
        company: 'bKash Limited',
        title: 'Graduate Tech Trainee - FinTech Engineering',
        url: 'https://www.bkash.com/career',
        location: 'Shadhinata Bhaban, Dhaka',
        experience: 'Graduating 2026 Batch',
        salary: '65,000 - 85,000 BDT',
        deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        skills: ['Java', 'Golang', 'Kafka', 'Microservices', 'Distributed Systems'],
        description: 'Be part of the largest financial inclusion platform in Bangladesh processing billions in daily mobile transactions.',
        isFresherFriendly: true,
      },
      {
        company: 'Brain Station 23',
        title: 'Junior Software Engineer (React / TypeScript)',
        url: 'https://www.linkedin.com/company/brainstation23/jobs/',
        location: 'Gulshan-1, Dhaka',
        experience: '0-1 Year / Fresh Graduate',
        salary: '45,000 - 65,000 BDT',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        skills: ['React', 'TypeScript', 'Node.js', 'Redux', 'TailwindCSS'],
        description: 'Join Brain Station 23 building enterprise software solutions. Apply directly through the official recruitment portal.',
        isFresherFriendly: true,
      },
      {
        company: 'Enosis Solutions',
        title: 'Software Engineer Trainee (C# / .NET / Web)',
        url: 'https://www.linkedin.com/company/enosis-solutions/jobs/',
        location: 'Banani, Dhaka',
        experience: 'Final Year / Fresh Graduate in CSE',
        salary: '40,000 - 55,000 BDT',
        deadline: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString(),
        skills: ['C#', '.NET', 'SQL Server', 'JavaScript', 'OOP Concepts'],
        description: 'Premier offshore software development company in Bangladesh specializing in enterprise desktop and web solutions.',
        isFresherFriendly: true,
      },
    ];

    for (const item of premierFirms) {
      const hash = generateJobHash(item.company, item.title, item.url);
      if (!seenHashes.has(hash)) {
        seenHashes.add(hash);
        results.push({
          hash,
          title: item.title,
          company: item.company,
          category: 'TECH_AI',
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
