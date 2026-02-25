import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

// Server-only Supabase client (service role). Never expose this key to the browser.
// When env vars are missing, supabaseAdmin is null so the app still runs and shows a setup message.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin: SupabaseClient<Database> | null =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false }
      })
    : null;

