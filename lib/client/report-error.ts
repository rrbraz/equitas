"use client";

export function reportClientError(
  error: Error,
  context?: Record<string, string>,
): void {
  if (process.env.NODE_ENV === "development") {
    console.error("[client-error]", error.message, {
      context,
      stack: error.stack,
    });
  }

  // Fire-and-forget POST to /api/health for basic tracking.
  // The fetch is intentionally not awaited — error reporting must never
  // block the UI or throw. This stub can be replaced with Sentry later.
  try {
    fetch("/api/health", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "client_error",
        message: error.message,
        stack: error.stack,
        context: context ?? {},
      }),
      // keepalive ensures the request survives navigation/unmount
      keepalive: true,
    }).catch(() => {
      // Swallow network errors — reporting failures must be silent
    });
  } catch {
    // Swallow synchronous errors from fetch (e.g. invalid URL in SSR context)
  }
}
