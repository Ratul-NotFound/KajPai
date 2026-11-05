import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Job, FilterOptions } from './types';
import { getMockJobs } from './mockData';

let supabase: SupabaseClient | null = null;

// Initialize Supabase client if environment variables are present
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (err) {
    console.warn('Could not initialize Supabase client:', err);
  }
}

// In-memory fallback repository for local offline development & testing
let memoryJobs: Job[] = [...getMockJobs()];

export interface UpsertResult {
  total: number;
  newCount: number;
  newJobs: Job[];
}

/**
 * Inserts or updates jobs in the database.
 * Deduplicates strictly by `hash`.
 */
export async function upsertJobs(jobsToUpsert: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<UpsertResult> {
  const newJobs: Job[] = [];
  const now = new Date().toISOString();

  // 1. In-batch deduplication: keep only unique jobs by hash within the current batch
  const uniqueIncomingMap = new Map<string, Omit<Job, 'id' | 'createdAt' | 'updatedAt'>>();
  for (const item of jobsToUpsert) {
    if (!uniqueIncomingMap.has(item.hash)) {
      uniqueIncomingMap.set(item.hash, item);
    }
  }
  const uniqueIncomingJobs = Array.from(uniqueIncomingMap.values());

  if (supabase) {
    try {
      const hashes = uniqueIncomingJobs.map((j) => j.hash);
      const { data: existingRows } = await supabase
        .from('jobs')
        .select('hash')
        .in('hash', hashes);

      const existingHashSet = new Set((existingRows || []).map((r: { hash: string }) => r.hash));

      const rowsToInsert: any[] = [];
      const rowsToUpdate: any[] = [];

      for (const item of uniqueIncomingJobs) {
        if (!existingHashSet.has(item.hash)) {
          existingHashSet.add(item.hash);
          const newJob: Job = {
            ...item,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
          };
          newJobs.push(newJob);
          rowsToInsert.push({
            id: newJob.id,
            hash: newJob.hash,
            title: newJob.title,
            company: newJob.company,
            category: newJob.category,
            employment_type: newJob.employmentType,
            location: newJob.location,
            experience: newJob.experience,
            salary: newJob.salary,
            deadline: newJob.deadline,
            source: newJob.source,
            source_url: newJob.sourceUrl,
            apply_url: newJob.applyUrl,
            skills: newJob.skills,
            description: newJob.description,
            is_active: newJob.isActive,
            is_fresher_friendly: newJob.isFresherFriendly,
            posted_at: newJob.postedAt,
            created_at: now,
            updated_at: now,
          });
        } else {
          rowsToUpdate.push({
            hash: item.hash,
            deadline: item.deadline,
            is_active: item.isActive,
            updated_at: now,
          });
        }
      }

      if (rowsToInsert.length > 0) {
        await supabase.from('jobs').insert(rowsToInsert);
      }

      // Execute batch updates for existing jobs
      for (const updateRow of rowsToUpdate) {
        await supabase
          .from('jobs')
          .update({
            deadline: updateRow.deadline,
            is_active: updateRow.is_active,
            updated_at: updateRow.updated_at,
          })
          .eq('hash', updateRow.hash);
      }

      return {
        total: jobsToUpsert.length,
        newCount: newJobs.length,
        newJobs,
      };
    } catch (error) {
      console.warn('Supabase upsert failed, falling back to local memory store:', error);
    }
  }

  // In-memory fallback
  const existingMap = new Map(memoryJobs.map((j) => [j.hash, j]));

  for (const item of uniqueIncomingJobs) {
    if (!existingMap.has(item.hash)) {
      const newJob: Job = {
        ...item,
        id: `local-${crypto.randomUUID()}`,
        createdAt: now,
        updatedAt: now,
      };
      memoryJobs.unshift(newJob);
      newJobs.push(newJob);
      existingMap.set(newJob.hash, newJob);
    } else {
      const existing = existingMap.get(item.hash)!;
      existing.updatedAt = now;
      existing.deadline = item.deadline || existing.deadline;
      existing.isActive = item.isActive;
    }
  }

  return {
    total: jobsToUpsert.length,
    newCount: newJobs.length,
    newJobs,
  };
}

/**
 * Queries jobs with filtering and search options.
 */
export async function getJobs(filters?: Partial<FilterOptions>): Promise<Job[]> {
  if (supabase) {
    try {
      let query = supabase.from('jobs').select('*').order('created_at', { ascending: false });

      if (filters?.category && filters.category !== 'ALL') {
        query = query.eq('category', filters.category);
      }
      if (filters?.fresherOnly) {
        query = query.eq('is_fresher_friendly', true);
      }

      const { data, error } = await query;
      if (!error && data) {
        let results = data.map((r: any): Job => ({
          id: r.id,
          hash: r.hash,
          title: r.title,
          company: r.company,
          category: r.category,
          employmentType: r.employment_type,
          location: r.location,
          experience: r.experience,
          salary: r.salary,
          deadline: r.deadline,
          source: r.source,
          sourceUrl: r.source_url,
          applyUrl: r.apply_url,
          skills: r.skills || [],
          description: r.description,
          isActive: r.is_active,
          isFresherFriendly: r.is_fresher_friendly,
          postedAt: r.posted_at,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));

        if (filters?.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          results = results.filter(
            (j) =>
              j.title.toLowerCase().includes(q) ||
              j.company.toLowerCase().includes(q) ||
              j.location.toLowerCase().includes(q) ||
              j.skills.some((s) => s.toLowerCase().includes(q))
          );
        }

        return results;
      }
    } catch (e) {
      console.warn('Supabase query failed, falling back to local memory store:', e);
    }
  }

  // In-memory query
  let results = [...memoryJobs];

  if (filters?.category && filters.category !== 'ALL') {
    results = results.filter((j) => j.category === filters.category);
  }

  if (filters?.fresherOnly) {
    results = results.filter((j) => j.isFresherFriendly);
  }

  if (filters?.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    results = results.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.skills.some((s) => s.toLowerCase().includes(q))
    );
  }

  return results;
}
