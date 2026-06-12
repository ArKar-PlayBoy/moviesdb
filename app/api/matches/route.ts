import { NextResponse } from "next/server";
import { MATCHES, getTeamFlag, getTeamName, getMatchScore, getStarOfTheMatch } from "@/data/worldcup-2026";
import { getMatchData, type GoalEvent } from "@/lib/data-service";
import { rateLimit } from "@/lib/rate-limit";

function computePOTMFromGoals(goals: GoalEvent[]): { playerName: string; teamId: string; goals: number; minutes: number[] } | null {
  if (goals.length === 0) return null;
  const counts: Record<string, { count: number; minutes: number[]; teamId: string }> = {};
  for (const g of goals) {
    if (!counts[g.playerName]) counts[g.playerName] = { count: 0, minutes: [], teamId: g.teamId };
    counts[g.playerName].count++;
    counts[g.playerName].minutes.push(g.minute);
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1].count - a[1].count);
  if (sorted.length === 0) return null;
  return { playerName: sorted[0][0], teamId: sorted[0][1].teamId, goals: sorted[0][1].count, minutes: sorted[0][1].minutes };
}

export async function GET(request: Request) {
  // Get IP for rate limiting (fallback to anonymous if not present)
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  
  // Standard limit: 60 requests per 60 seconds
  const rateLimitResult = await rateLimit(`api:${ip}`, 60, 60);
  
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");
  const stage = searchParams.get("stage");
  const limitParam = searchParams.get("limit");

  let matches = MATCHES;

  if (teamId) {
    matches = matches.filter((m) => m.team1 === teamId || m.team2 === teamId);
  }
  if (stage) {
    matches = matches.filter((m) => m.stage === stage);
  }
  if (limitParam) {
    matches = matches.slice(0, parseInt(limitParam, 10));
  }

  const enriched = await Promise.all(matches.map(async (m) => {
    const live = await getMatchData(m.id, m.team1, m.team2);
    const [score1, score2] = live.status !== "scheduled" ? live.score : getMatchScore(m.id, m.team1, m.team2, m.date);
    const star = live.goals.length > 0 ? computePOTMFromGoals(live.goals) : getStarOfTheMatch(m.id);
    return {
      ...m,
      team1Name: getTeamName(m.team1),
      team2Name: getTeamName(m.team2),
      team1Flag: getTeamFlag(m.team1),
      team2Flag: getTeamFlag(m.team2),
      score1,
      score2,
      liveStatus: live.status,
      starOfTheMatch: star || null,
    };
  }));

  return NextResponse.json(enriched, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" },
  });
}
