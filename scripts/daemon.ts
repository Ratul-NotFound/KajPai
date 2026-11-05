import { runAllScrapers } from '../src/scrapers';
import { upsertJobs } from '../src/lib/db';
import { sendTelegramAlert } from '../src/notifications/telegram';

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

async function executeScrapeJob() {
  console.log(`\n======================================================`);
  console.log(`⏰ [12-Hour Cron Triggered] ${new Date().toISOString()}`);
  console.log(`======================================================`);

  try {
    const jobs = await runAllScrapers();
    const result = await upsertJobs(jobs);

    console.log(`[Summary] Processed: ${result.total} | New Added: ${result.newCount}`);

    if (result.newCount > 0) {
      await sendTelegramAlert(result.newJobs);
    }
  } catch (err) {
    console.error('Error during scheduled scrape job:', err);
  }
}

async function startDaemon() {
  console.log('🚀 JobPulse BD: 12-Hour Background Scheduler Active');
  console.log(`🔄 Checking for new jobs every 12 hours (${TWELVE_HOURS_MS / 1000 / 60 / 60} hours)...`);

  // Run initial scrape immediately on startup
  await executeScrapeJob();

  // Schedule recurring 12-hour scrape
  setInterval(executeScrapeJob, TWELVE_HOURS_MS);
}

startDaemon();

