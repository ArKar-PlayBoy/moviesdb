import { NextResponse } from "next/server";
import { MATCHES, getTeamFlag, getTeamName, getMatchScore, getStarOfTheMatch } from "@/data/worldcup-2026";
import { getMatchData } from "@/lib/data-service";

export async function GET(request: Request) {
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
    const star = getStarOfTheMatch(m.id);
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
