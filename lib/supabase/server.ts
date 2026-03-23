import { createClient } from "@supabase/supabase-js";

import {
  getPublicSupabaseEnv,
  getServiceSupabaseEnv,
} from "@/lib/supabase/env";

export function getSupabaseServerClient() {
  const { url, anonKey } = getPublicSupabaseEnv();

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getSupabaseAdminClient() {
  const { url, serviceRoleKey } = getServiceSupabaseEnv();

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
