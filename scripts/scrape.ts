import { runAllScrapers } from '../src/scrapers';
import { upsertJobs } from '../src/lib/db';
import { sendTelegramAlert } from '../src/notifications/telegram';

async function main() {
  console.log('====================================================');
  console.log('🚀 KajPai: Automated 12-Hour Scraper Run');
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log('====================================================\n');

  try {
    // 1. Run all scrapers in parallel
    const scrapedJobs = await runAllScrapers();
    console.log(`\n📥 Scraped ${scrapedJobs.length} total job records from all sources.`);

    // 2. Upsert to database with deterministic SHA-256 deduplication
    console.log('\n🔄 Syncing with database and performing deduplication...');
    const result = await upsertJobs(scrapedJobs);

    console.log(`\n📊 Scrape Summary:`);
    console.log(`   - Total Processed: ${result.total}`);
    console.log(`   - Newly Discovered Jobs: ${result.newCount}`);
    console.log(`   - Existing / Updated Jobs: ${result.total - result.newCount}`);

    // 3. Dispatch Telegram notifications if new jobs were added
    if (result.newCount > 0) {
      console.log(`\n📢 Sending Telegram alert for ${result.newCount} new jobs...`);
      const alertResult = await sendTelegramAlert(result.newJobs);
      if (alertResult.success) {
        console.log('✅ Telegram alert successfully sent.');
      } else {
        console.log(`ℹ️ Telegram alert not sent: ${alertResult.error || 'No action needed'}`);
      }
    } else {
      console.log('\nℹ️ No new jobs found in this run. Telegram alert skipped to prevent spam.');
    }

    console.log('\n====================================================');
    console.log('🎉 Scraper pipeline finished successfully!');
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error in scraper execution:', error);
    process.exit(1);
  }
}

main();

