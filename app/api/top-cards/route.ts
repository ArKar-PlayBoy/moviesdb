import { NextResponse } from "next/server";
import { getTopCards } from "@/data/worldcup-2026";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(500, parseInt(searchParams.get("limit") || "200", 10));

  const cards = getTopCards(limit);
  return NextResponse.json(cards, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
