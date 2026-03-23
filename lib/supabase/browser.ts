"use client";

import "client-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getPublicSupabaseEnv, hasPublicSupabaseEnv } from "@/lib/supabase/env";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (!hasPublicSupabaseEnv) {
    return null;
  }

  if (!browserClient) {
    const { url, anonKey } = getPublicSupabaseEnv();
    browserClient = createClient(url, anonKey);
  }

  return browserClient;
}
