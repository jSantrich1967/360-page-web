// =============================================================================
// META PUBLISHER
// Handles Instagram Feed/Reels + Facebook Page posts
// Uses Graph API v19.0+
// Server-side ONLY - never expose tokens
// =============================================================================

import { supabaseAdmin } from "@/lib/supabase/server";
import type { PublicationJob, PublicationPlatform } from "@/types";

const META_GRAPH_URL = "https://graph.facebook.com/v19.0";

// Exponential backoff delays in ms
const RETRY_DELAYS = [60_000, 300_000, 900_000]; // 1min, 5min, 15min

interface MetaConnectionRow {
  user_access_token: string | null;
  page_access_token: string | null;
  instagram_access_token: string | null;
  facebook_page_id: string | null;
  instagram_account_id: string | null;
}

interface JobWithRelations extends PublicationJob {
  property: { title: string; description: string };
}

// =============================================================================
// MAIN PUBLISHER
// =============================================================================

export async function publishToMeta(
  job: JobWithRelations,
  metaConn: MetaConnectionRow
): Promise<void> {
  // Mark as uploading
  await updateJobStatus(job.id, "UPLOADING");

  try {
    let result: { post_id?: string; media_id?: string } = {};

    switch (job.platform) {
      case "instagram_feed":
        result = await publishInstagramFeed(job, metaConn);
        break;
      case "instagram_reel":
        result = await publishInstagramReel(job, metaConn);
        break;
      case "facebook_feed":
        result = await publishFacebookPost(job, metaConn);
        break;
      case "facebook_reel":
        result = await publishFacebookReel(job, metaConn);
        break;
    }

    // Success
    await supabaseAdmin
      .from("publication_jobs")
      .update({
        status: "PUBLISHED",
        published_at: new Date().toISOString(),
        meta_post_id: result.post_id,
        meta_media_id: result.media_id,
        error_log: null
      })
      .eq("id", job.id);
  } catch (err) {
    const error = err as Error;
    const newRetries = job.retries + 1;
    const hasMoreRetries = newRetries < job.max_retries;
    const nextRetryDelay =
      RETRY_DELAYS[newRetries - 1] ?? RETRY_DELAYS[RETRY_DELAYS.length - 1];

    await supabaseAdmin
      .from("publication_jobs")
      .update({
        status: hasMoreRetries ? "PENDING" : "ERROR",
        retries: newRetries,
        error_log: error.message,
        next_retry_at: hasMoreRetries
          ? new Date(Date.now() + nextRetryDelay).toISOString()
          : null
      })
      .eq("id", job.id);

    // Log to audit
    await supabaseAdmin.from("audit_logs").insert({
      agency_id: job.agency_id,
      action: "publish",
      entity_type: "publication_job",
      entity_id: job.id,
      new_data: {
        error: error.message,
        platform: job.platform,
        retries: newRetries
      }
    });
  }
}

// =============================================================================
// INSTAGRAM FEED (single or carousel)
// =============================================================================

async function publishInstagramFeed(
  job: JobWithRelations,
  conn: MetaConnectionRow
): Promise<{ post_id: string; media_id: string }> {
  const token = conn.instagram_access_token ?? conn.page_access_token;
  if (!token || !conn.instagram_account_id) {
    throw new Error("Instagram no está configurado correctamente");
  }

  const igAccountId = conn.instagram_account_id;
  let mediaId: string;

  if (job.media_urls.length === 1) {
    // Single image
    const containerRes = await metaFetch(
      `${igAccountId}/media`,
      "POST",
      token,
      {
        image_url: job.media_urls[0],
        caption: job.caption
      }
    );
    mediaId = containerRes.id;
  } else {
    // Carousel
    const childIds = await Promise.all(
      job.media_urls.slice(0, 10).map((url) =>
        metaFetch(`${igAccountId}/media`, "POST", token, {
          image_url: url,
          is_carousel_item: true
        }).then((r) => r.id)
      )
    );

    const carouselRes = await metaFetch(
      `${igAccountId}/media`,
      "POST",
      token,
      {
        media_type: "CAROUSEL",
        children: childIds.join(","),
        caption: job.caption
      }
    );
    mediaId = carouselRes.id;
  }

  // Wait for container to be ready
  await waitForMediaReady(igAccountId, mediaId, token);

  // Publish
  const publishRes = await metaFetch(
    `${igAccountId}/media_publish`,
    "POST",
    token,
    { creation_id: mediaId }
  );

  return { post_id: publishRes.id, media_id: mediaId };
}

// =============================================================================
// INSTAGRAM REELS
// =============================================================================

async function publishInstagramReel(
  job: JobWithRelations,
  conn: MetaConnectionRow
): Promise<{ post_id: string; media_id: string }> {
  const token = conn.instagram_access_token ?? conn.page_access_token;
  if (!token || !conn.instagram_account_id) {
    throw new Error("Instagram no está configurado");
  }

  const igAccountId = conn.instagram_account_id;
  const videoUrl = job.media_urls[0];
  if (!videoUrl) throw new Error("No hay video para el Reel");

  // Create reel container
  const containerRes = await metaFetch(
    `${igAccountId}/media`,
    "POST",
    token,
    {
      media_type: "REELS",
      video_url: videoUrl,
      caption: job.caption,
      share_to_feed: true
    }
  );

  const mediaId: string = containerRes.id;

  // Reels take longer to process
  await waitForMediaReady(igAccountId, mediaId, token, 60, 10_000);

  const publishRes = await metaFetch(
    `${igAccountId}/media_publish`,
    "POST",
    token,
    { creation_id: mediaId }
  );

  return { post_id: publishRes.id, media_id: mediaId };
}

// =============================================================================
// FACEBOOK PAGE POST
// =============================================================================

async function publishFacebookPost(
  job: JobWithRelations,
  conn: MetaConnectionRow
): Promise<{ post_id: string }> {
  const token = conn.page_access_token;
  if (!token || !conn.facebook_page_id) {
    throw new Error("Facebook Page no está configurado");
  }

  const pageId = conn.facebook_page_id;

  if (job.media_urls.length === 0) {
    // Text-only post
    const res = await metaFetch(`${pageId}/feed`, "POST", token, {
      message: job.caption
    });
    return { post_id: res.id };
  }

  if (job.media_urls.length === 1) {
    // Single photo
    const res = await metaFetch(`${pageId}/photos`, "POST", token, {
      url: job.media_urls[0],
      caption: job.caption
    });
    return { post_id: res.post_id ?? res.id };
  }

  // Multiple photos - create unpublished photos then post
  const photoIds = await Promise.all(
    job.media_urls.slice(0, 10).map((url) =>
      metaFetch(`${pageId}/photos`, "POST", token, {
        url,
        published: false
      }).then((r) => ({ media_fbid: r.id }))
    )
  );

  const res = await metaFetch(`${pageId}/feed`, "POST", token, {
    message: job.caption,
    attached_media: photoIds
  });

  return { post_id: res.id };
}

// =============================================================================
// FACEBOOK REELS
// =============================================================================

async function publishFacebookReel(
  job: JobWithRelations,
  conn: MetaConnectionRow
): Promise<{ post_id: string; media_id: string }> {
  const token = conn.page_access_token;
  if (!token || !conn.facebook_page_id) {
    throw new Error("Facebook Page no está configurado");
  }

  const pageId = conn.facebook_page_id;
  const videoUrl = job.media_urls[0];
  if (!videoUrl) throw new Error("No hay video para el Reel");

  // Step 1: Initialize upload session
  const initRes = await metaFetch(`${pageId}/video_reels`, "POST", token, {
    upload_phase: "start"
  });

  const videoId: string = initRes.video_id;

  // Step 2: Upload video from URL (server-to-server)
  await metaFetch(`${pageId}/video_reels`, "POST", token, {
    upload_phase: "finish",
    video_id: videoId,
    video_file_chunk_url: videoUrl,
    description: job.caption,
    title: job.property.title
  });

  // Step 3: Publish
  const publishRes = await metaFetch(`${pageId}/video_reels`, "POST", token, {
    upload_phase: "publish",
    video_id: videoId,
    video_state: "PUBLISHED",
    description: job.caption
  });

  return { post_id: publishRes.post_id ?? videoId, media_id: videoId };
}

// =============================================================================
// HELPERS
// =============================================================================

async function metaFetch(
  endpoint: string,
  method: "GET" | "POST",
  token: string,
  params?: Record<string, unknown>
) {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${META_GRAPH_URL}/${endpoint}`;

  const body = params ? { ...params, access_token: token } : undefined;

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(`Meta API Error ${data.error.code}: ${data.error.message}`);
  }

  return data;
}

// Poll until media container is ready (or timeout)
async function waitForMediaReady(
  accountId: string,
  mediaId: string,
  token: string,
  maxAttempts = 30,
  delayMs = 5000
): Promise<void> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((r) => setTimeout(r, delayMs));

    const res = await metaFetch(
      `${mediaId}?fields=status_code,status`,
      "GET",
      token
    );

    if (res.status_code === "FINISHED") return;
    if (res.status_code === "ERROR") {
      throw new Error(`Error procesando media: ${JSON.stringify(res.status)}`);
    }
    // IN_PROGRESS - continue waiting
  }

  throw new Error("Timeout: El media tardó demasiado en procesarse");
}

async function updateJobStatus(
  jobId: string,
  status: PublicationPlatform | string,
  extra?: Record<string, unknown>
) {
  await supabaseAdmin
    .from("publication_jobs")
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...extra
    })
    .eq("id", jobId);
}

