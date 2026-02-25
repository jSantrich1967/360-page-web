import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

export interface DashboardStats {
  totalProperties: number;
  availableCount: number;
  totalClients: number;
  pendingJobs: number;
}

/**
 * Fetches dashboard counts from Supabase.
 * Returns null if any query fails (e.g. tables not migrated yet).
 */
export async function fetchDashboardStats(
  supabase: SupabaseClient<Database>
): Promise<DashboardStats | null> {
  try {
    const [propsRes, availableRes, clientsRes, jobsRes] = await Promise.all([
      supabase.from("properties").select("id", { count: "exact", head: true }),
      supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("status", "available"),
      supabase.from("clients").select("id", { count: "exact", head: true }),
      supabase
        .from("publication_jobs")
        .select("id", { count: "exact", head: true })
        .eq("status", "PENDING")
    ]);

    return {
      totalProperties: propsRes.count ?? 0,
      availableCount: availableRes.count ?? 0,
      totalClients: clientsRes.count ?? 0,
      pendingJobs: jobsRes.count ?? 0
    };
  } catch {
    return null;
  }
}
