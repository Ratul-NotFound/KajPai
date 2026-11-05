# 🚀 JobPulse BD — Bangladesh Job Aggregator & Automated Scraper

A clean, professional, minimalistic white-themed job portal built for Computer Science students, software engineers, and job seekers in Bangladesh. Automatically aggregates, categorizes, and normalizes job openings twice daily (every 12 hours) across major Bangladesh portals, software farms, bank recruitment circulars, government notices, telecom giants, and remote developer boards.

---

## ✨ Features

- **⚡ Blazing Fast Minimalist Dashboard:** Pure white aesthetic, zero clutter, responsive across mobile, tablet, and desktop.
- **🏷️ Automated Categorization:**
  - `💻 Tech & AI`: Software Engineers, AI/ML Engineers, Fullstack/Backend/Frontend, DevOps
  - `🏛️ Government`: AllJobs Teletalk, BPSC, ICT Division, BCC circulars
  - `🏦 Banks`: Bangladesh Bank eRecruitment (BSC), Sonali, Janata, BRAC Bank, DBBL
  - `📡 Telecom`: Grameenphone, Robi Axiata, Banglalink
  - `🎓 Internships & Freshers`: 0-1 year exp & student trainee openings
  - `🌍 Remote`: Global & APAC remote developer roles (RemoteOK / WeWorkRemotely)
  - `📁 Admin`: Corporate, people operations & administrative roles
- **🔍 Instant Search & Filters:** Filter in real-time by title, company, skills, fresher-friendly tags, and active deadlines.
- **⭐️ Local Bookmarks:** Save jobs to review later with 1-click (persists in browser `localStorage` with zero login friction).
- **🔁 12-Hour Automated Scraping:** Scheduled via free GitHub Actions cron (`0 0,12 * * *`).
- **🛡️ Deterministic Deduplication:** SHA-256 content hashing guarantees zero duplicate entries in the database.
- **📢 Instant Telegram Alerts:** Get instant notifications directly on your phone whenever new matching jobs are posted.
- **💰 100% Free Tier:** Runs indefinitely on Vercel + GitHub Actions + Supabase PostgreSQL.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS v4, Lucide React
- **Scraper Engine:** Node.js, TypeScript, Cheerio, Safe HTTP Fetch with User-Agent rotation
- **Database:** Supabase (PostgreSQL) with in-memory / local fallback
- **Automation:** GitHub Actions Scheduled Cron Workflow
- **Testing:** Vitest

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd "job scrapper"
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The dashboard will immediately load with curated seed jobs even before configuring cloud keys!

### 3. Run the Scrapers Manually
```bash
npm run scrape
```
This runs all 6 Bangladesh and global scrapers concurrently, prints a summary table to your terminal, and upserts jobs.

---

## 🌐 Deploy to Vercel (100% Free)

1. Push this repository to your GitHub account:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in with GitHub.
3. Click **"Add New Project"** $\rightarrow$ Select your repository.
4. (Optional) Add your Supabase environment variables in Vercel **Project Settings > Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**. Your site will be live on `https://<your-project>.vercel.app`!

---

## 🗄️ Setting Up Free Supabase Database (Optional)

1. Create a free account at [supabase.com](https://supabase.com) and create a new project.
2. Go to the **SQL Editor** in Supabase and run this migration:

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

3. In your local `.env.local` or GitHub Secrets, add:
   ```env
   SUPABASE_URL=https://<your-id>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   NEXT_PUBLIC_SUPABASE_URL=https://<your-id>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```

---

## ⏰ Setting Up 12-Hour Automated Scraping (GitHub Actions)

The workflow file is already created at `.github/workflows/scrape.yml`.
To enable it in your repository:

1. Open your repository on GitHub.
2. Go to **Settings > Secrets and variables > Actions > New repository secret**.
3. Add the following secrets:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `TELEGRAM_BOT_TOKEN` *(optional)*
   - `TELEGRAM_CHAT_ID` *(optional)*
4. Go to the **Actions** tab on GitHub:
   - You can trigger the scraper manually anytime by clicking **"12-Hour Automated Job Scraper"** $\rightarrow$ **"Run workflow"**.
   - It will automatically execute every 12 hours (00:00 & 12:00 UTC) and keep your dashboard refreshed!

---

## 📢 Setting Up Telegram Alerts (Optional)

1. Open Telegram and search for `@BotFather`.
2. Send `/newbot`, choose a name and username, and copy the **API Token**.
3. Send a message to `@userinfobot` on Telegram to get your **User ID / Chat ID**.
4. Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in your `.env.local` or GitHub Secrets.
5. Next time new jobs are found, you'll receive clean notifications with direct apply links!

---

## 🧪 Testing

Run the automated test suite:
```bash
npm test
```
All unit and integration tests for deduplication, types, scrapers, and Telegram notifications will run and verify.

---

## 📄 License
MIT License. Built for students and engineers in Bangladesh.

