import { NextRequest, NextResponse } from "next/server";
import { getTopScorers } from "@/data/worldcup-2026";
import { getTopScorersList } from "@/lib/data-service";
import { getAllMatchResults } from "@/lib/storage";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const rateLimitResult = await rateLimit(`api:${ip}`, 60, 60);
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(500, parseInt(searchParams.get("limit") || "200", 10));

  try {
    const live = await getTopScorersList(limit);
    if (live) {
      return NextResponse.json(live, {
        headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" },
      });
    }

    // Compute from Redis or fall back to LIVE_RESULTS
    const allResults = await getAllMatchResults();
    const scorers = getTopScorers(limit, allResults);

    return NextResponse.json(scorers, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load top scorers" }, { status: 500 });
  }
}
