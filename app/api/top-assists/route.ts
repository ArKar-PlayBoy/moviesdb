import { NextResponse } from "next/server";
import { computeTopAssistsFromResults } from "@/lib/data-service";
import { getAllMatchResults } from "@/lib/storage";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(500, parseInt(searchParams.get("limit") || "200", 10));

  const allResults = await getAllMatchResults();
  const assists = computeTopAssistsFromResults(allResults, limit);
  return NextResponse.json(assists, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
