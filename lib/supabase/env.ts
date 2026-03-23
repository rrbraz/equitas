const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasPublicSupabaseEnv = Boolean(publicUrl && publicAnonKey);

export function getPublicSupabaseEnv() {
  if (!publicUrl || !publicAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return {
    url: publicUrl,
    anonKey: publicAnonKey,
  };
}

export function getAdminSupabaseEnv() {
  if (!publicUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return {
    url: publicUrl,
    serviceRoleKey,
  };
}
