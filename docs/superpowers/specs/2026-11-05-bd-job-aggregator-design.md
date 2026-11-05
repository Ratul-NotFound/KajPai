# Design Specification: Bangladesh Job Scraper & Minimalist Web Aggregator

**Date:** 2026-11-05  
**Target User:** Final-year Computer Science student in Bangladesh  
**Platform Name:** JobPulse BD  
**Aesthetic:** Clean, minimalist, simple white theme, distraction-free  
**Hosting & Cost:** 100% Free tier (Vercel + GitHub Actions + Supabase PostgreSQL + Telegram Bot)

---

## 1. Objectives & User Intent

Searching for entry-level jobs, internships, government circulars, bank openings, and tech roles in Bangladesh requires navigating dozens of fragmented, slow, and outdated portals.

**Primary Goals:**
1. **Automated Scraping Pipeline:** Scrapes jobs twice daily (every 12 hours) across major Bangladesh portals, government circular feeds, bank recruitment sites, direct tech company career pages, telecommunication providers, and remote developer boards.
2. **Strict Deduplication & Normalization:** Prevents duplicate listings using deterministic content hashing, standardizes categories, and auto-detects deadlines.
3. **Clean, Minimalist White-Themed Dashboard:** A fast, simple, responsive web interface built on Next.js 15 with zero clutter, instant search, category tabs, and local bookmarking.
4. **Mobile Notifications:** Sends instant Telegram alerts whenever new matching jobs are discovered.

---

## 2. System Architecture & Components

```
+-----------------------------------------------------------------------------------+
|  AUTOMATION RUNNER: GitHub Actions (Cron: every 12 hours - 00:00 & 12:00 UTC)    |
|                                                                                   |
|  1. 'npm run scrape' runs TypeScript scraper modules in parallel                  |
|  2. Normalization & Deduplication (SHA-256 hash of company + title + source_url)  |
|  3. Upsert to Supabase PostgreSQL (insert new, update existing timestamps)       |
|  4. Trigger Telegram Bot message for newly discovered jobs                        |
+-----------------------------------------------------------------------------------+
                                        |
                                        v
                 +---------------------------------------------+
                 |    Cloud Database (Supabase PostgreSQL)     |
                 |      Stores normalized, categorized jobs    |
                 +---------------------------------------------+
                                        ^
                                        |  (Fast Server Component / API queries)
+-----------------------------------------------------------------------------------+
|  FRONTEND DASHBOARD: Next.js 15 on Vercel                                         |
|                                                                                   |
|  - Minimalist White Theme (clean typography, crisp border lines, zero clutter)   |
|  - Category Tabs: Tech/AI, Govt, Banks, Telecom, Internships, Remote, Admin       |
|  - Universal Instant Search (title, company, skills, location)                    |
|  - One-Click Filters: "Freshers / Entry-Level Only", "New Today", "Saved Jobs"    |
|  - Direct Apply Link ↗ + Bookmark (Saved locally in browser localStorage)        |
+-----------------------------------------------------------------------------------+
```

---

## 3. Scraper Modules & Bangladesh Source Coverage

Each scraper implements a standardized `BaseScraper` interface and executes in its own isolated try/catch block so one slow or modified source never blocks others.

### Source Coverage:

1. **AllJobs BD (`alljobsbd.com` & `alljobs.teletalk.com.bd`):**
   - Official government circulars, autonomous bodies, public institutions, and university recruitment.
   - Extracts: Organization name, position title, grade, application deadline date, circular PDF / application link.

2. **BDJobs (`bdjobs.com`):**
   - High-volume job board.
   - Targets: IT & Telecommunication, Banking & Financial Institutions, and dedicated Freshers/Internship categories.
   - Extracts: Position, company, experience requirement, location, deadline, apply URL.

3. **Bangladesh Bank & Financial Institutions (`erecruitment.bb.org.bd`):**
   - Central bank and Bankers' Selection Committee (BSC) multi-bank circulars (Sonali, Janata, Agrani, Rupali, Bangladesh Krishi Bank).
   - Commercial private banks (BRAC Bank, Dutch-Bangla Bank, City Bank, Eastern Bank).

4. **Bangladesh Tech Industry & Software Farms:**
   - Leading tech companies: Brain Station 23, BJIT, Enosis Solutions, Selise Digital Platforms, Therap BD, Samsung R&D BD (SRBD), Cefalo, Kona Software Lab, and tech startups (bKash, Pathao).
   - Filters specifically for Junior/Mid Software Engineers, AI/ML Engineers, Web Developers, Mobile Developers, and Software Engineering Interns.

5. **Telecommunications:**
   - Grameenphone (Telenor), Robi Axiata, Banglalink (VEON), Teletalk Bangladesh.
   - Tech and administrative graduate trainee / specialist vacancies.

6. **Remote & Global Opportunities (for CS/AI/Dev):**
   - RemoteOK, WeWorkRemotely, Wellfound feeds.
   - Filters for developer & AI roles open to Bangladesh / Worldwide remote.

---

## 4. Data Model & Deduplication Strategy

### 4.1 PostgreSQL Database Schema (`jobs` table)

```sql
CREATE TYPE job_category AS ENUM (
  'TECH_AI',
  'GOVT',
  'BANK',
  'TELECOM',
  'INTERNSHIP',
  'REMOTE',
  'ADMIN',
  'OTHER'
);

CREATE TYPE employment_type AS ENUM (
  'FULL_TIME',
  'INTERNSHIP',
  'CONTRACT',
  'PART_TIME'
);

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hash TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  category job_category NOT NULL DEFAULT 'TECH_AI',
  employment_type employment_type NOT NULL DEFAULT 'FULL_TIME',
  location TEXT DEFAULT 'Dhaka, Bangladesh',
  experience TEXT DEFAULT 'Fresher / Entry Level',
  salary TEXT,
  deadline TIMESTAMPTZ,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL,
  apply_url TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_fresher_friendly BOOLEAN NOT NULL DEFAULT false,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_category ON jobs (category);
CREATE INDEX idx_jobs_is_active ON jobs (is_active);
CREATE INDEX idx_jobs_created_at ON jobs (created_at DESC);
CREATE INDEX idx_jobs_fresher ON jobs (is_fresher_friendly);
```

### 4.2 Deduplication Hash Logic
Before database upsert, the scraper calculates:
```ts
const raw = `${company.trim().toLowerCase()}::${title.trim().toLowerCase()}::${sourceUrl.trim()}`;
const hash = crypto.createHash('sha256').update(raw).digest('hex');
```
* **Upsert Behavior:**
  - If the hash is new $\rightarrow$ Insert record and mark for Telegram notification.
  - If the hash exists $\rightarrow$ Update `updated_at`, deadline, and `is_active` without spamming duplicate entries.
* **Auto-Expiration:** A database query or view automatically badges any record where `deadline < NOW()` as "Expired" and moves it to the bottom.

---

## 5. Web Dashboard UI Specification

### 5.1 Design & Styling
- **Theme:** Clean white minimalist aesthetic (Pure white background `#ffffff`, subtle off-white `#f8fafc` containers, crisp `#e2e8f0` borders, dark charcoal `#0f172a` typography, and single accent color `#2563eb` for active states).
- **Typography:** Inter / system sans-serif, clean hierarchy, readable line heights.

### 5.2 Layout Elements
1. **Header:**
   - Brand title: **JobPulse BD** (with a clean subtitle: *Curated tech, bank, govt & remote jobs in Bangladesh*).
   - Stats Badge: e.g., `🟢 128 Active Jobs • 14 New Today`.
   - Action Button: **Saved Jobs ⭐ (0)** toggle.
2. **Filter & Search Bar:**
   - Universal search input with instant client-side filtering.
   - Category Pills: `All`, `💻 Tech & AI`, `🏛️ Government`, `🏦 Banks`, `📡 Telecom`, `🎓 Internships & Freshers`, `🌍 Remote`, `📁 Admin`.
   - Quick check toggles:
     - `[ ] Freshers / Entry Level Only`
     - `[ ] New in Last 24 Hours`
3. **Job Cards:**
   - Card displays: Company Name, Job Title, Category Tag, Location, Experience, Salary, and Deadline badge.
   - Deadline indicators:
     - Green: `> 7 days left`
     - Amber: `< 3 days left`
     - Red / Muted: `Deadline Passed`
   - Actions:
     - ⭐ Bookmark (stored in browser `localStorage` - no sign-in barrier).
     - Direct **Apply Now ↗** external link.
4. **Empty State:**
   - Friendly minimalist illustration and reset filters button when no jobs match search criteria.

---

## 6. Automation & Telegram Notifications

### 6.1 GitHub Actions Workflow
- File: `.github/workflows/scrape.yml`
- Schedule: Runs every 12 hours (`cron: '0 0,12 * * *'`).
- Manual Trigger: `workflow_dispatch` enabled so you can click "Run workflow" in GitHub anytime.
- Steps:
  1. Checkout code
  2. Setup Node.js 20
  3. Install dependencies (`npm ci`)
  4. Run scraper script: `npm run scrape`
  5. The script queries Supabase, runs scrapers, performs idempotent upserts, and triggers Telegram alerts for new rows.

### 6.2 Telegram Bot Alert Format
Whenever new jobs are inserted, a message is dispatched to your private Telegram chat via Telegram Bot API:

```markdown
🚀 *New Job Alert on JobPulse BD!*

📌 *Junior Software Engineer*
🏢 Brain Station 23
📍 Dhaka (Hybrid) | 🎓 Fresher Friendly
⏳ Deadline: 25 Nov 2026
🔗 [Apply Here](https://...)

---
📌 *Assistant Director (IT)*
🏢 Bangladesh Bank (BSC)
📍 Dhaka, Bangladesh
⏳ Deadline: 30 Nov 2026
🔗 [View Circular](https://...)
```

---

## 7. Project Structure

```
job-scrapper/
├── .github/
│   └── workflows/
│       └── scrape.yml              # 12-hour cron workflow
├── docs/
│   └── superpowers/specs/         # Design and plan documentation
├── src/
│   ├── app/                        # Next.js 15 App Router
│   │   ├── api/
│   │   │   ├── jobs/route.ts       # Jobs API endpoint (search, filter, pagination)
│   │   │   └── scrape/route.ts     # Manual scrape trigger endpoint (protected)
│   │   ├── globals.css             # Tailwind v4 clean white theme styling
│   │   ├── layout.tsx              # Root layout & metadata
│   │   └── page.tsx                # Main minimalist dashboard
│   ├── components/                 # UI Components
│   │   ├── Header.tsx              # Brand, live stats, bookmarks toggle
│   │   ├── FilterBar.tsx           # Category tabs, search bar, fresher toggle
│   │   ├── JobCard.tsx             # Clean minimalist job card
│   │   ├── JobList.tsx             # Virtualized / paginated job feed
│   │   └── BookmarksDrawer.tsx     # Slide-over or filter view for saved jobs
│   ├── lib/                        # Shared utilities
│   │   ├── db.ts                   # Supabase / Postgres client
│   │   ├── types.ts                # Shared TypeScript definitions
│   │   └── utils.ts                # Date formatting, hashing, string helpers
│   ├── scrapers/                   # Modular Scraping Pipeline
│   │   ├── base.ts                 # BaseScraper interface
│   │   ├── alljobs_govt.ts         # AllJobs BD / Teletalk circulars
│   │   ├── bdjobs.ts               # BDJobs (Tech, Bank, Intern, Govt)
│   │   ├── bangladesh_bank.ts      # Bangladesh Bank eRecruitment
│   │   ├── bd_tech_firms.ts        # Brain Station 23, BJIT, Enosis, etc.
│   │   ├── telecom.ts              # Grameenphone, Robi, Banglalink
│   │   ├── remote_tech.ts          # RemoteOK / WeWorkRemotely
│   │   └── index.ts                # Orchestrator running all scrapers concurrently
│   └── notifications/
│       └── telegram.ts             # Telegram Bot notifier for new jobs
├── .env.example                    # Template for Supabase & Telegram credentials
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md                       # Setup, Vercel deployment & GitHub Action instructions
```

---

## 8. Verification & Acceptance Criteria

1. **Scraper Verification:** Running `npm run scrape` locally fetches real job postings from configured sources, normalizes them, and produces valid `Job` objects with correct categories.
2. **Deduplication Verification:** Running the scraper multiple times in a row results in 0 duplicate entries in the database.
3. **Web Dashboard Verification:**
   - Renders cleanly in a pure white minimalist aesthetic.
   - Category filtering instantly shows only matching jobs (e.g., clicking "Tech & AI" displays software/dev jobs; clicking "Banks" displays bank notices).
   - "Freshers Only" filter isolates 0-1 year experience and entry-level positions.
   - Bookmarking persists across page refreshes via `localStorage`.
   - Search bar filters in real-time.
4. **Deployment Verification:** Ready for one-click deployment to Vercel free tier with environment variables configured in Vercel project settings.
