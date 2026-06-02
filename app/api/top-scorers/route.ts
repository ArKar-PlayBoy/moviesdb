import { NextResponse } from "next/server";
import { getTopScorers } from "@/data/worldcup-2026";
import { getTopScorersList } from "@/lib/data-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(500, parseInt(searchParams.get("limit") || "200", 10));

  const live = await getTopScorersList(limit);
  if (live) {
    return NextResponse.json(live, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" },
    });
  }

  const scorers = getTopScorers(limit);
  return NextResponse.json(scorers, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
