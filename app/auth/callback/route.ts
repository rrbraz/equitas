import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSafeNextPath } from "@/features/auth/lib/get-safe-next-path";
import { rateLimit } from "@/lib/server/rate-limit";
import { getPublicSupabaseEnv, hasPublicSupabaseEnv } from "@/lib/supabase/env";
import { ensureProfileForUser } from "@/lib/supabase/profile";

export async function GET(request: NextRequest) {
  const rateLimitResponse = rateLimit(request);

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const nextPath = getSafeNextPath(
    request.nextUrl.searchParams.get("next"),
    "/dashboard",
  );
  const [destinationPath, destinationQuery] = nextPath.split("?");
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = destinationPath ?? "/dashboard";
  redirectUrl.search = destinationQuery ? `?${destinationQuery}` : "";

  if (!hasPublicSupabaseEnv) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("error", "missing-env");
    return NextResponse.redirect(loginUrl);
  }

  const code = request.nextUrl.searchParams.get("code");
  let response = NextResponse.redirect(redirectUrl);
  const { url, anonKey } = getPublicSupabaseEnv();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        });
      },
    },
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await ensureProfileForUser(supabase, user);
      }

      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("error", "auth-callback");
  return NextResponse.redirect(loginUrl);
}
