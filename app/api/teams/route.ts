import { NextRequest, NextResponse } from "next/server";
import { getAllTeams } from "@/data/worldcup-2026";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const rateLimitResult = await rateLimit(`api:${ip}`, 60, 60);
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const teams = getAllTeams();
    return NextResponse.json(teams, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load teams" }, { status: 500 });
  }
}
