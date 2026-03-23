import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getPublicSupabaseEnv } from "@/lib/supabase/env";

export function getSupabaseServerClient() {
  const { url, anonKey } = getPublicSupabaseEnv();

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
