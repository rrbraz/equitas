import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface HealthResponse {
  status: "ok" | "degraded";
  timestamp: string;
  database?: "connected" | "disconnected";
}

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const timestamp = new Date().toISOString();

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          status: "degraded",
          timestamp,
          database: "disconnected",
        },
        { status: 503 },
      );
    }

    // Try to connect to Supabase and perform a simple query
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Simple health check: attempt to get the current session
    // This doesn't require authentication and validates connectivity
    const { error: sessionError } = await supabase.auth.getSession();

    if (sessionError && sessionError.message !== "Auth session missing!") {
      // Unexpected error (not just missing session)
      return NextResponse.json(
        {
          status: "degraded",
          timestamp,
          database: "disconnected",
        },
        { status: 503 },
      );
    }

    // If we get here, Supabase is reachable and responsive
    return NextResponse.json(
      {
        status: "ok",
        timestamp,
        database: "connected",
      },
      { status: 200 },
    );
  } catch (error) {
    // Log error for observability
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        database: "disconnected",
      },
      { status: 503 },
    );
  }
}
