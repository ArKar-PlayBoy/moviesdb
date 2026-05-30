import { NextResponse } from "next/server";
import { MATCHES, GROUPS, getTeamFlag, getTeamName, getMatchScore, getStarOfTheMatch } from "@/data/worldcup-2026";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");
  const stage = searchParams.get("stage");

  let matches = MATCHES;

  if (teamId) {
    matches = matches.filter((m) => m.team1 === teamId || m.team2 === teamId);
  }
  if (stage) {
    matches = matches.filter((m) => m.stage === stage);
  }

  const enriched = matches.map((m) => {
    const [score1, score2] = getMatchScore(m.id, m.team1, m.team2, m.date);
    const star = getStarOfTheMatch(m.id);
    return {
      ...m,
      team1Name: getTeamName(m.team1),
      team2Name: getTeamName(m.team2),
      team1Flag: getTeamFlag(m.team1),
      team2Flag: getTeamFlag(m.team2),
      score1,
      score2,
      starOfTheMatch: star || null,
    };
  });

  return NextResponse.json(enriched, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
