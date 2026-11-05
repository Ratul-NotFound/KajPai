import { NextResponse } from 'next/server';
import { runAllScrapers } from '@/scrapers';
import { upsertJobs, getJobs } from '@/lib/db';
import { sendTelegramAlert } from '@/notifications/telegram';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('[API /api/scrape] Triggering manual/scheduled scrape run...');
    const scrapedJobs = await runAllScrapers();
    const result = await upsertJobs(scrapedJobs);

    if (result.newCount > 0) {
      await sendTelegramAlert(result.newJobs);
    }

    const allJobs = await getJobs();

    return NextResponse.json({
      success: true,
      message: `Scrape completed successfully. Added ${result.newCount} new jobs out of ${result.total} scanned.`,
      newCount: result.newCount,
      totalCount: allJobs.length,
      jobs: allJobs,
    });
  } catch (err: any) {
    console.error('[API /api/scrape] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Scrape execution failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Allow GET as well for simple webhooks or direct browser clicks
  return POST();
}

