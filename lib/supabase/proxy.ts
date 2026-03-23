import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSafeNextPath } from "@/features/auth/lib/get-safe-next-path";
import { getPublicSupabaseEnv, hasPublicSupabaseEnv } from "@/lib/supabase/env";

const publicRoutes = new Set([
  "/",
  "/login",
  "/cadastro",
  "/recuperar-acesso",
  "/auth/callback",
]);

function isPublicRoute(pathname: string) {
  return (
    publicRoutes.has(pathname) ||
    pathname.startsWith("/auth/callback/") ||
    pathname.startsWith("/_next/")
  );
}

function withCopiedCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });

  target.headers.set("Cache-Control", "private, no-store");

  return target;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });
  const pathname = request.nextUrl.pathname;
  const currentPath = `${pathname}${request.nextUrl.search}`;

  if (!hasPublicSupabaseEnv) {
    if (isPublicRoute(pathname)) {
      return response;
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("error", "missing-env");
    loginUrl.searchParams.set("next", currentPath);

    return withCopiedCookies(response, NextResponse.redirect(loginUrl));
  }

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicRoute(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", currentPath);

    response = withCopiedCookies(response, NextResponse.redirect(loginUrl));
  } else if (
    user &&
    publicRoutes.has(pathname) &&
    pathname !== "/auth/callback"
  ) {
    const destination = getSafeNextPath(
      request.nextUrl.searchParams.get("next"),
      "/dashboard",
    );
    const [destinationPath, destinationQuery] = destination.split("?");
    const appUrl = request.nextUrl.clone();
    appUrl.pathname = destinationPath ?? "/dashboard";
    appUrl.search = destinationQuery ? `?${destinationQuery}` : "";

    response = withCopiedCookies(response, NextResponse.redirect(appUrl));
  }

  response.headers.set("Cache-Control", "private, no-store");

  return response;
}
