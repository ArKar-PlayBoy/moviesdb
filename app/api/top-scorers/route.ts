import { NextResponse } from "next/server";
import { getTopScorers } from "@/data/worldcup-2026";
import { getTopScorersList, computeTopScorersFromResults } from "@/lib/data-service";
import { getAllMatchResults } from "@/lib/storage";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(500, parseInt(searchParams.get("limit") || "200", 10));

  const live = await getTopScorersList(limit);
  if (live) {
    return NextResponse.json(live, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" },
    });
  }

  // Try computing from Redis (populated by cron)
  const allResults = await getAllMatchResults();
  if (Object.keys(allResults).length > 0) {
    const scorers = computeTopScorersFromResults(allResults, limit);
    return NextResponse.json(scorers, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  }

  const scorers = getTopScorers(limit);
  return NextResponse.json(scorers, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
