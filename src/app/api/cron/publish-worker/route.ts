import { NextRequest } from "next/server";
import { runPublicationWorker } from "@/workers/publication-worker";

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const stats = await runPublicationWorker();
    return Response.json({ ok: true, ...stats });
  } catch (err) {
    const error = err as Error;
    console.error("[Cron Worker] Fatal error:", error.message);
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

