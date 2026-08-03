import { NextRequest, NextResponse } from "next/server";
import { getAllPlayers } from "@/data/worldcup-2026";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const rateLimitResult = await rateLimit(`api:${ip}`, 60, 60);
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");
  const position = searchParams.get("position");

  try {
    let players = getAllPlayers();

    if (teamId) {
      players = players.filter((p) => p.teamId === teamId);
    }
    if (position) {
      players = players.filter((p) => p.position === position);
    }

    return NextResponse.json(players, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load players" }, { status: 500 });
  }
}
