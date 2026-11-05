import { BaseScraper } from './base';
import { Job } from '../lib/types';
import { generateJobHash, isFresherJob, resolveCompanyLogo } from '../lib/utils';

export const telecomScraper: BaseScraper = {
  name: 'Telecommunications (Grameenphone, Robi, Banglalink)',
  category: 'TELECOM',
  async scrape(): Promise<Omit<Job, 'id' | 'createdAt' | 'updatedAt'>[]> {
    const rawList = [
      {
        company: 'Grameenphone Ltd.',
        title: 'Apprentice / Graduate Engineer - Cloud & Infrastructure',
        url: 'https://www.telenor.com/career/',
        location: 'GPhouse, Bashundhara, Dhaka',
        experience: '0-1 Year / Freshers Eligible',
        salary: 'Competitive Enterprise Package',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        skills: ['Cloud Computing', 'Linux Administration', 'DevOps', 'Kubernetes', 'Python'],
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
        skills: ['ITIL', 'Bash Scripting', 'Monitoring Tools', 'System Integration'],
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
        skills: ['SOC', 'SIEM', 'Network Security', 'Vulnerability Assessment'],
        description: 'Protect critical telecommunication network assets and digital customer services from emerging cyber threats.',
        isFresherFriendly: true,
      },
    ];

    return rawList.map((item) => ({
      hash: generateJobHash(item.company, item.title, item.url),
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
    }));
  },
};
