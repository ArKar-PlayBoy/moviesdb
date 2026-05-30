import { NextResponse } from "next/server";
import { getAllTeams } from "@/data/worldcup-2026";

export async function GET() {
  const teams = getAllTeams();
  return NextResponse.json(teams, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
