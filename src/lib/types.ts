export type JobCategory =
  | 'TECH_AI'
  | 'GOVT'
  | 'BANK'
  | 'TELECOM'
  | 'INTERNSHIP'
  | 'REMOTE'
  | 'ADMIN'
  | 'OTHER';

export type EmploymentType = 'FULL_TIME' | 'INTERNSHIP' | 'CONTRACT' | 'PART_TIME';

export interface Job {
  id: string;
  hash: string;
  title: string;
  company: string;
  category: JobCategory;
  employmentType: EmploymentType;
  location: string;
  experience: string;
  salary?: string;
  deadline?: string;
  source: string;
  sourceUrl: string;
  applyUrl: string;
  skills: string[];
  description?: string;
  isActive: boolean;
  isFresherFriendly: boolean;
  postedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilterOptions {
  searchQuery: string;
  category: JobCategory | 'ALL';
  fresherOnly: boolean;
  newOnly: boolean;
  savedOnly: boolean;
}

export interface ScrapeResult {
  source: string;
  jobs: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>[];
  error?: string;
}
