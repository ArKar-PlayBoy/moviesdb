import { NextRequest, NextResponse } from "next/server";
import { getAllPlayers, getAllTeams, slugify } from "@/data/worldcup-2026";

export async function GET(req: NextRequest) {
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

  return NextResponse.json({ results });
}
