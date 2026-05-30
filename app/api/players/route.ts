import { NextResponse } from "next/server";
import { getAllPlayers } from "@/data/worldcup-2026";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");
  const position = searchParams.get("position");

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
}
