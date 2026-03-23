import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getAdminSupabaseEnv } from "@/lib/supabase/env";

export function getSupabaseAdminClient() {
  const { url, serviceRoleKey } = getAdminSupabaseEnv();

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
