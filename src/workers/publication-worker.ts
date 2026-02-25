// =============================================================================
// PUBLICATION WORKER
// Processes scheduled and pending publication jobs
// This module is used by the API route /api/cron/publish-worker
// =============================================================================

import { supabaseAdmin } from "@/lib/supabase/server";
import { publishToMeta } from "@/lib/meta/publisher";
import type { PublicationJob } from "@/types";

const BATCH_SIZE = 10; // Process max 10 jobs per run to avoid timeouts
const MAX_CONCURRENT = 3; // Max concurrent Meta API calls

interface JobWithRelations extends Omit<PublicationJob, "property"> {
  property: {
    id: string;
    title: string;
    description: string;
    agency_id: string;
  };
}

// =============================================================================
// MAIN WORKER FUNCTION
// Called by cron route handler
// =============================================================================

export async function runPublicationWorker(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
}> {
  const stats = { processed: 0, succeeded: 0, failed: 0, skipped: 0 };
  if (!supabaseAdmin) return stats;

  // Fetch due jobs: PENDING and (no scheduled_at OR scheduled_at <= now) and next_retry_at <= now
  const { data: jobs, error } = await supabaseAdmin
    .from("publication_jobs")
    .select(
      `
      *,
      property:properties(id, title, description, agency_id)
    `
    )
    .eq("status", "PENDING")
    .or("scheduled_at.is.null,scheduled_at.lte." + new Date().toISOString())
    .or("next_retry_at.is.null,next_retry_at.lte." + new Date().toISOString())
    .lt("retries", 3) // max_retries
    .limit(BATCH_SIZE)
    .order("scheduled_at", { ascending: true, nullsFirst: true });

  if (error) {
    console.error("[Worker] Failed to fetch jobs:", error.message);
    return stats;
  }

  if (!jobs || jobs.length === 0) {
    console.log("[Worker] No pending jobs found");
    return stats;
  }

  console.log(`[Worker] Processing ${jobs.length} jobs`);
  stats.processed = jobs.length;

  // Process in batches to limit concurrency
  for (let i = 0; i < jobs.length; i += MAX_CONCURRENT) {
    const batch = jobs.slice(i, i + MAX_CONCURRENT) as JobWithRelations[];

    const results = await Promise.allSettled(batch.map((job) => processJob(job)));

    results.forEach((result, idx) => {
      if (result.status === "fulfilled") {
        stats.succeeded++;
      } else {
        stats.failed++;
        console.error(
          `[Worker] Job ${batch[idx]?.id} failed:`,
          result.reason
        );
      }
    });
  }

  console.log("[Worker] Done:", stats);
  return stats;
}

// =============================================================================
// PROCESS SINGLE JOB
// =============================================================================

async function processJob(job: JobWithRelations): Promise<void> {
  // Lock the job to prevent duplicate processing (optimistic lock via status update)
  const { error: lockError, count } = await supabaseAdmin
    .from("publication_jobs")
    .update({ status: "UPLOADING", updated_at: new Date().toISOString() })
    .eq("id", job.id)
    .eq("status", "PENDING") // Only update if still PENDING
    .select("id");

  if (lockError || count === 0) {
    console.log(
      `[Worker] Job ${job.id} already locked or not found, skipping`
    );
    return;
  }

  // Get meta connection for this agency
  const { data: metaConn, error: connError } = await supabaseAdmin
    .from("meta_connections")
    .select("*")
    .eq("agency_id", job.agency_id)
    .eq("is_active", true)
    .single();

  if (connError || !metaConn) {
    await supabaseAdmin
      .from("publication_jobs")
      .update({
        status: "ERROR",
        error_log: "No hay conexión activa con Meta para esta agencia",
        retries: job.retries + 1
      })
      .eq("id", job.id);
    return;
  }

  // Check token expiry
  if (
    metaConn.token_expires_at &&
    new Date(metaConn.token_expires_at) < new Date()
  ) {
    await supabaseAdmin
      .from("publication_jobs")
      .update({
        status: "ERROR",
        error_log: "Token de Meta expirado. Por favor reconecta tu cuenta."
      })
      .eq("id", job.id);
    return;
  }

  // Publish
  await publishToMeta(job, metaConn as Parameters<typeof publishToMeta>[1]);
}

