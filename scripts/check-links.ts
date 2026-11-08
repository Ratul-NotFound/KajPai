import fs from 'fs';
import path from 'path';

interface Job {
  id: string;
  title: string;
  company: string;
  sourceUrl: string;
  applyUrl: string;
  source: string;
}

async function checkUrl(url: string): Promise<{ status: number | string; ok: boolean }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timeout);
    // Some servers return 405 Method Not Allowed, 403, or 429 on rapid HEAD requests
    if (res.status === 405 || res.status === 403 || res.status === 429) {
      const getRes = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
      });
      return { status: getRes.status, ok: getRes.ok || getRes.status === 403 || getRes.status === 429 };
    }
    return { status: res.status, ok: res.ok };
  } catch (err: any) {
    return { status: err.name === 'AbortError' ? 'TIMEOUT' : err.message, ok: false };
  }
}

async function run() {
  const filePath = path.resolve('data/jobs.json');
  if (!fs.existsSync(filePath)) {
    console.error('data/jobs.json not found!');
    return;
  }

  const jobs: Job[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`Checking URLs for ${jobs.length} jobs in data/jobs.json...\n`);

  const failedJobs: Array<{
    title: string;
    company: string;
    source: string;
    sourceUrl: string;
    sourceStatus: any;
    applyUrl: string;
    applyStatus: any;
  }> = [];

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const sourceRes = await checkUrl(job.sourceUrl);
    let applyRes: { status: number | string; ok: boolean } = { status: 'SAME', ok: true };
    if (job.applyUrl !== job.sourceUrl) {
      applyRes = await checkUrl(job.applyUrl);
    }

    const sourceOk = sourceRes.ok || sourceRes.status === 403;
    const applyOk = applyRes.ok || applyRes.status === 403 || applyRes.status === 'SAME';

    if (!sourceOk || !applyOk) {
      failedJobs.push({
        title: job.title,
        company: job.company,
        source: job.source,
        sourceUrl: job.sourceUrl,
        sourceStatus: sourceRes.status,
        applyUrl: job.applyUrl,
        applyStatus: applyRes.status,
      });
      console.log(`❌ [FAIL] ${job.company} - ${job.title}`);
      if (!sourceOk) console.log(`   Source: ${job.sourceUrl} -> ${sourceRes.status}`);
      if (!applyOk) console.log(`   Apply:  ${job.applyUrl} -> ${applyRes.status}`);
    } else {
      console.log(`✅ [OK] ${job.company} - ${job.title.slice(0, 40)}`);
    }
  }

  console.log(`\n======================================================`);
  console.log(`Total checked: ${jobs.length}`);
  console.log(`Working: ${jobs.length - failedJobs.length}`);
  console.log(`Broken: ${failedJobs.length}`);
  console.log(`======================================================\n`);

  if (failedJobs.length > 0) {
    console.log('List of broken links:');
    console.log(JSON.stringify(failedJobs, null, 2));
  }
}

run();

