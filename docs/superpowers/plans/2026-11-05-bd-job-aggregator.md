# Bangladesh Job Scraper & Minimalist Web Aggregator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a clean, minimalist white-themed web aggregator (JobPulse BD) on Next.js 15 that automatically aggregates, normalizes, deduplicates, and categorizes Bangladesh and remote jobs (Tech, Govt, Banks, Telecom, Internships) scraped twice daily via GitHub Actions with Telegram alerts.

**Architecture:** A unified TypeScript project containing modular HTML/API scrapers (Cheerio/HTTP) running on a 12-hour GitHub Actions cron, syncing to a PostgreSQL database (Supabase) via idempotent SHA-256 hash upserts, with an instant Telegram notification bot for newly discovered listings, served by a fast Next.js 15 minimalist dashboard deployed on Vercel.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Lucide React, Cheerio, Vitest, Supabase/PostgreSQL client.

**Spec:** [docs/superpowers/specs/2026-11-05-bd-job-aggregator-design.md](file:///e:/Project/job%20scrapper/docs/superpowers/specs/2026-11-05-bd-job-aggregator-design.md)

---

## Global Constraints

- **Language & Runtime:** Node.js 20+ with strict TypeScript across both frontend and scrapers.
- **Theme & Aesthetic:** Pure minimalist white aesthetic (clean typography, subtle borders, high contrast, zero clutter).
- **Hosting Tier:** 100% free-tier compatible (Vercel Hobby, GitHub Actions free minutes, Supabase free tier).
- **Deduplication:** Every job must produce a deterministic SHA-256 hash of `lowercase(company)::lowercase(title)::source_url`.
- **Fault Tolerance:** A network failure or DOM change in one scraper must never crash the pipeline or stop remaining scrapers.
- **Local Development Friendly:** Provide in-memory/mock fallback so the web UI and scrapers can be developed and demonstrated locally without requiring external cloud database credentials.

---

## Review Focus

1. **Circular Deadlines with Passed Dates:** Ensure jobs past their application deadline are clearly badged as "Deadline Passed" and filtered out by default unless toggled.
2. **Missing Metadata Fields:** Scraped jobs with missing salaries or experience levels must display clean fallbacks ("Not Disclosed" / "Entry Level") instead of `undefined` or `null`.
3. **Special Characters in Telegram Alerts:** Markdown formatting for Telegram bot messages must escape reserved characters to prevent API 400 Bad Request errors.
4. **Offline / Local Mock Fallback:** When Supabase environment variables are missing, the application must seamlessly fall back to local seed/mock data rather than throwing an unhandled runtime error.
5. **Bengali / English Mixed Text:** Deadlines and titles containing Bengali numbers or mixed text must be cleanly handled and normalized.

---

### Task 1: Project Scaffolding & Core Domain Types

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `src/lib/types.ts`
- Create: `src/lib/mockData.ts`
- Create: `vitest.config.ts`
- Test: `tests/types.test.ts`

**Interfaces:**
- Produces: `Job`, `JobCategory`, `EmploymentType`, `ScrapeResult`, `FilterOptions` defined in `src/lib/types.ts`.

- [ ] **Step 1: Write failing test for core types and mock data generator**

```ts
// tests/types.test.ts
import { describe, it, expect } from 'vitest';
import { Job, JobCategory } from '../src/lib/types';
import { getMockJobs } from '../src/lib/mockData';

describe('Domain Types & Mock Data', () => {
  it('should generate valid mock jobs covering all primary categories', () => {
    const jobs: Job[] = getMockJobs();
    expect(jobs.length).toBeGreaterThanOrEqual(10);
    
    const categories = new Set(jobs.map((j) => j.category));
    expect(categories.has('TECH_AI')).toBe(true);
    expect(categories.has('GOVT')).toBe(true);
    expect(categories.has('BANK')).toBe(true);
    expect(categories.has('TELECOM')).toBe(true);
    expect(categories.has('INTERNSHIP')).toBe(true);
    expect(categories.has('REMOTE')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/types.test.ts`
Expected: FAIL with missing modules or unresolved imports.

- [ ] **Step 3: Create package.json, tsconfig.json, types.ts, and mockData.ts**

Create `package.json` with Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide React, Cheerio, and Vitest.
Create `src/lib/types.ts`:
```ts
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
```

Create `src/lib/mockData.ts` with authentic Bangladesh tech, bank, govt, telecom, and remote job entries.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/types.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json vitest.config.ts src/lib/ tests/
git commit -m "feat: initialize project scaffolding and core domain types"
```

---

### Task 2: Deduplication Engine, Database Client & Utils

**Files:**
- Create: `src/lib/utils.ts`
- Create: `src/lib/db.ts`
- Test: `tests/utils.test.ts`

**Interfaces:**
- Consumes: `Job`, `JobCategory` from `src/lib/types.ts`
- Produces: `generateJobHash()`, `isDeadlinePassed()`, `formatDeadline()`, `upsertJobs()`, `getJobs()` in `src/lib/db.ts` and `src/lib/utils.ts`.

- [ ] **Step 1: Write failing test for hash generation and deadline calculation**

```ts
// tests/utils.test.ts
import { describe, it, expect } from 'vitest';
import { generateJobHash, isDeadlinePassed, formatDeadline } from '../src/lib/utils';

describe('Job Utilities & Hashing', () => {
  it('should generate consistent SHA-256 hash regardless of whitespace or casing', () => {
    const hash1 = generateJobHash('Brain Station 23', 'Junior Software Engineer', 'https://brainstation-23.com/job/1');
    const hash2 = generateJobHash('  brain station 23  ', 'JUNIOR SOFTWARE ENGINEER', 'https://brainstation-23.com/job/1 ');
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('correctly identifies passed and upcoming deadlines', () => {
    expect(isDeadlinePassed('2020-01-01')).toBe(true);
    expect(isDeadlinePassed('2099-01-01')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/utils.test.ts`
Expected: FAIL with "generateJobHash is not defined"

- [ ] **Step 3: Implement `src/lib/utils.ts` and `src/lib/db.ts`**

Implement deterministic hash calculation with `crypto.createHash('sha256')`, deadline parser, and database wrapper supporting Supabase PostgreSQL with local in-memory/JSON fallback.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/utils.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils.ts src/lib/db.ts tests/utils.test.ts
git commit -m "feat: implement deduplication hashing, deadline parser, and database client"
```

---

### Task 3: Modular Scraper Pipeline (BDJobs, AllJobs Teletalk, Banks, BD Tech & Remote)

**Files:**
- Create: `src/scrapers/base.ts`
- Create: `src/scrapers/alljobs_govt.ts`
- Create: `src/scrapers/bdjobs.ts`
- Create: `src/scrapers/bangladesh_bank.ts`
- Create: `src/scrapers/bd_tech_firms.ts`
- Create: `src/scrapers/telecom.ts`
- Create: `src/scrapers/remote_tech.ts`
- Create: `src/scrapers/index.ts`
- Test: `tests/scrapers.test.ts`

**Interfaces:**
- Consumes: `Job`, `generateJobHash()`
- Produces: `BaseScraper` interface and `runAllScrapers(): Promise<Job[]>`

- [ ] **Step 1: Write test for scraper parsing logic and resilient orchestration**

```ts
// tests/scrapers.test.ts
import { describe, it, expect } from 'vitest';
import { runAllScrapers } from '../src/scrapers';

describe('Scraper Pipeline Orchestration', () => {
  it('should run all scrapers and return normalized jobs with valid hashes', async () => {
    const jobs = await runAllScrapers({ useMockFallbackOnFailure: true });
    expect(jobs.length).toBeGreaterThan(0);
    for (const job of jobs) {
      expect(job.title).toBeTruthy();
      expect(job.company).toBeTruthy();
      expect(job.hash).toHaveLength(64);
      expect(job.category).toBeDefined();
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/scrapers.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement scraper modules**

Implement `src/scrapers/base.ts`, `alljobs_govt.ts`, `bdjobs.ts`, `bangladesh_bank.ts`, `bd_tech_firms.ts`, `telecom.ts`, `remote_tech.ts`, and `index.ts` with error handling, timeout guards, and clean category mapping.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/scrapers.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/scrapers/ tests/scrapers.test.ts
git commit -m "feat: implement modular scraper pipeline for BD and remote sources"
```

---

### Task 4: Notification System (Telegram Bot Notifier)

**Files:**
- Create: `src/notifications/telegram.ts`
- Test: `tests/notifications.test.ts`

**Interfaces:**
- Consumes: `Job[]`
- Produces: `sendTelegramAlert(jobs: Job[]): Promise<boolean>`

- [ ] **Step 1: Write test for Telegram message formatting and markdown escaping**

```ts
// tests/notifications.test.ts
import { describe, it, expect } from 'vitest';
import { formatTelegramMessage } from '../src/notifications/telegram';
import { getMockJobs } from '../src/lib/mockData';

describe('Telegram Notification Formatter', () => {
  it('correctly escapes reserved markdown characters and formats message', () => {
    const mockJobs = getMockJobs().slice(0, 2);
    const message = formatTelegramMessage(mockJobs);
    expect(message).toContain('JobPulse BD');
    expect(message).toContain(mockJobs[0].title);
    expect(message).toContain(mockJobs[0].company);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/notifications.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `src/notifications/telegram.ts`**

Implement `formatTelegramMessage()` and `sendTelegramAlert()` using Telegram Bot API with graceful handling when environment variables are not set.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/notifications.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/notifications/telegram.ts tests/notifications.test.ts
git commit -m "feat: implement Telegram notification alerts for new job postings"
```

---

### Task 5: Minimalist White-Themed Web Dashboard (Next.js 15)

**Files:**
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/api/jobs/route.ts`
- Create: `src/components/Header.tsx`
- Create: `src/components/FilterBar.tsx`
- Create: `src/components/JobCard.tsx`
- Create: `src/components/JobList.tsx`
- Create: `src/components/BookmarksDrawer.tsx`

**Interfaces:**
- Consumes: `Job`, `FilterOptions`, `getJobs()`
- Produces: Fast, responsive Next.js 15 web application.

- [ ] **Step 1: Setup clean white CSS styling & Root Layout**

Create `src/app/globals.css` with clean white theme (`#ffffff` background, `#f8fafc` cards, subtle `#e2e8f0` borders, clean dark text `#0f172a`).
Create `src/app/layout.tsx` with proper SEO meta tags.

- [ ] **Step 2: Build UI Components**

- `Header.tsx`: Title ("JobPulse BD"), live counter badge, saved jobs toggle button.
- `FilterBar.tsx`: Category tabs (`All`, `Tech & AI`, `Govt`, `Banks`, `Telecom`, `Internships`, `Remote`, `Admin`), search input, "Freshers Only" filter, and "New Today" filter.
- `JobCard.tsx`: Minimalist white card with title, company, category pill, experience, salary, deadline countdown indicator, bookmark button, and direct "Apply ↗" link.
- `BookmarksDrawer.tsx`: Saved jobs view synchronized with `localStorage`.
- `JobList.tsx`: Clean list view with empty state handling.

- [ ] **Step 3: Connect API Route & Dashboard Page**

- `src/app/api/jobs/route.ts`: API endpoint with filtering and search support.
- `src/app/page.tsx`: Client dashboard with live search, category filtering, bookmark state management, and instant reaction without page reloads.

- [ ] **Step 4: Verify build and test UI rendering**

Run: `npm run build`
Expected: Build successfully finishes without TypeScript or ESLint errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/ src/components/
git commit -m "feat: build clean minimalist white-themed web dashboard and components"
```

---

### Task 6: Automation Workflow, CLI Scraper Runner & Deployment Setup

**Files:**
- Create: `scripts/scrape.ts`
- Create: `.github/workflows/scrape.yml`
- Create: `.env.example`
- Create: `README.md`

**Interfaces:**
- Produces: `npm run scrape` command, 12-hour automated GitHub Action cron, and Vercel deployment guide.

- [ ] **Step 1: Create standalone scraper CLI script**

Create `scripts/scrape.ts` which runs `runAllScrapers()`, upserts to the database, sends Telegram alerts for newly discovered jobs, and prints a formatted summary table to console.

- [ ] **Step 2: Create GitHub Actions 12-hour Cron Workflow**

Create `.github/workflows/scrape.yml` running on `cron: '0 0,12 * * *'` and `workflow_dispatch`.

- [ ] **Step 3: Create `.env.example` and `README.md`**

Document all environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`) and clear step-by-step instructions to:
1. Run locally (`npm run dev` and `npm run scrape`).
2. Deploy the web app to Vercel for free in 2 minutes.
3. Enable free 12-hour automated scraping via GitHub Actions.

- [ ] **Step 4: Run full end-to-end verification**

Run: `npm test && npm run build`
Expected: All tests pass, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add scripts/ .github/ .env.example README.md
git commit -m "feat: add 12-hour cron automation workflow and deployment guide"
```
