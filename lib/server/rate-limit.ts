import { type NextRequest, NextResponse } from "next/server";

type SlidingWindowEntry = {
  timestamps: number[];
};

const store = new Map<string, SlidingWindowEntry>();

const MAX_REQUESTS = 10;
const WINDOW_MS = 60_000; // 1 minute
const CLEANUP_INTERVAL_MS = 120_000; // 2 minutes

let lastCleanup = Date.now();

function cleanupExpiredEntries(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return;
  }

  lastCleanup = now;
  const cutoff = now - WINDOW_MS;

  for (const [ip, entry] of store) {
    entry.timestamps = entry.timestamps.filter(
      (timestamp) => timestamp > cutoff,
    );

    if (entry.timestamps.length === 0) {
      store.delete(ip);
    }
  }
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();

    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = request.headers.get("x-real-ip");

  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

/**
 * Sliding-window rate limiter. Returns a 429 response if the IP has exceeded
 * the allowed number of requests within the time window. Returns null if the
 * request is allowed to proceed.
 */
export function rateLimit(request: NextRequest): NextResponse | null {
  const now = Date.now();

  cleanupExpiredEntries(now);

  const ip = getClientIp(request);
  const cutoff = now - WINDOW_MS;

  let entry = store.get(ip);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(ip, entry);
  }

  entry.timestamps = entry.timestamps.filter((timestamp) => timestamp > cutoff);

  if (entry.timestamps.length >= MAX_REQUESTS) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "Cache-Control": "no-store",
        },
      },
    );
  }

  entry.timestamps.push(now);

  return null;
}
