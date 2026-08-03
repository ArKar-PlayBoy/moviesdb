import { NextResponse } from "next/server";
import { MATCHES, getTeamFlag, getTeamName, getMatchScore, getStarOfTheMatch, getKnockoutBracket, getAllPlayers, normalizePlayerName } from "@/data/worldcup-2026";
import { getMatchData, type GoalEvent } from "@/lib/data-service";
import { getAllMatchResults } from "@/lib/storage";
import { rateLimit } from "@/lib/rate-limit";

function computePOTMFromGoals(goals: GoalEvent[]): { playerName: string; teamId: string; goals: number; minutes: number[] } | null {
  const realGoals = goals.filter(g => !g.isOwnGoal);
  if (realGoals.length === 0) return null;
  const counts: Record<string, { count: number; minutes: number[]; teamId: string }> = {};
  for (const g of realGoals) {
    if (!counts[g.playerName]) counts[g.playerName] = { count: 0, minutes: [], teamId: g.teamId };
    counts[g.playerName].count++;
    counts[g.playerName].minutes.push(g.minute);
  }
  const allPlayers = getAllPlayers();
  const top = Object.entries(counts)
    .sort((a, b) => b[1].count - a[1].count)
    .find(([name, data]) => allPlayers.some(p => normalizePlayerName(p.name) === normalizePlayerName(name) && p.teamId === data.teamId));
  if (!top) return null;
  return { playerName: top[0], teamId: top[1].teamId, goals: top[1].count, minutes: top[1].minutes };
}

export async function GET(request: Request) {
  // Get IP for rate limiting (fallback to anonymous if not present)
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  
  // Standard limit: 60 requests per 60 seconds
  const rateLimitResult = await rateLimit(`api:${ip}`, 60, 60);
  
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");
    const stage = searchParams.get("stage");
    const limitParam = searchParams.get("limit");

    let matches: { id: string; group: string; team1: string; team2: string; date: string; venue: string; stage: string }[] = [...MATCHES];

    // Include knockout matches from stored data
    const allResults = await getAllMatchResults();
    const bracket = getKnockoutBracket(allResults);
    for (const bm of bracket) {
      if (bm.team1 && bm.team2) {
        const stored = allResults[bm.id];
        matches.push({
          id: bm.id,
          group: bm.round,
          team1: bm.team1,
          team2: bm.team2,
          date: stored?.date || "",
          venue: stored?.venue || "",
          stage: bm.round,
        });
      }
    }

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
      const live = await getMatchData(m.id, m.team1, m.team2, allResults);
      const [score1, score2] = live.status !== "scheduled" ? live.score : getMatchScore(m.id, m.team1, m.team2, m.date, allResults);
      const star = live.goals.length > 0 ? computePOTMFromGoals(live.goals) : getStarOfTheMatch(m.id, allResults);
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
  } catch {
    return NextResponse.json({ error: "Failed to load matches" }, { status: 500 });
  }
}
