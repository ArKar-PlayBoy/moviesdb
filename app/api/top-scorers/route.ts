import { NextResponse } from "next/server";
import { getTopScorers } from "@/data/worldcup-2026";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(500, parseInt(searchParams.get("limit") || "200", 10));
  const scorers = getTopScorers(limit);
  return NextResponse.json(scorers, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
