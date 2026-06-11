import { NextRequest, NextResponse } from "next/server";
import { getAllPlayers, getAllTeams } from "@/data/worldcup-2026";
import { slugify } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  // Get IP for rate limiting (fallback to anonymous if not present)
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  
  // Strict burst limit for search: 20 requests per 10 seconds
  const rateLimitResult = await rateLimit(`search:${ip}`, 20, 10);
  
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const q = req.nextUrl.searchParams.get("q") || "";
  if (!q.trim()) return NextResponse.json({ results: [] });

  const lower = q.toLowerCase();
  const results: { type: "player" | "team"; label: string; href: string; subtitle: string }[] = [];

  const players = getAllPlayers();
  for (const p of players) {
    if (results.length >= 10) break;
    if (p.name.toLowerCase().includes(lower) || p.teamName.toLowerCase().includes(lower)) {
      results.push({
        type: "player",
        label: p.name,
        subtitle: `${p.teamFlag} ${p.teamName} · ${p.position} · Age ${p.age}`,
        href: `/player/${slugify(p.name)}`,
      });
    }
  }

  const teams = getAllTeams();
  for (const t of teams) {
    if (results.length >= 15) break;
    if (t.name.toLowerCase().includes(lower) || t.id.includes(lower)) {
      results.push({
        type: "team",
        label: `${t.flag} ${t.name}`,
        subtitle: `Group ${t.group} · FIFA #${t.fifaRanking} · ${t.confederation}`,
        href: `/team/${t.id}`,
      });
    }
  }

  return NextResponse.json({ results }, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" },
  });
}
