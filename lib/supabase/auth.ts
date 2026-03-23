import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { getSafeNextPath } from "@/features/auth/lib/get-safe-next-path";
import { hasPublicSupabaseEnv } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

export async function getAuthenticatedUser(): Promise<User | null> {
  if (!hasPublicSupabaseEnv) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function redirectIfAuthenticated(nextPath?: string | null) {
  const user = await getAuthenticatedUser();

  if (user) {
    redirect(getSafeNextPath(nextPath));
  }
}
