import { NextRequest, NextResponse } from 'next/server';
import { getJobs } from '@/lib/db';
import { JobCategory } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as JobCategory | 'ALL' | null;
    const searchQuery = searchParams.get('q') || undefined;
    const fresherOnly = searchParams.get('fresher') === 'true';

    const jobs = await getJobs({
      category: category && category !== 'ALL' ? category : undefined,
      searchQuery,
      fresherOnly,
    });

    return NextResponse.json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

