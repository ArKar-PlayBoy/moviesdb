import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { MATCHES, getTeamName } from "@/data/worldcup-2026";
import { getFIFAIdMatch, fetchFIFA } from "@/lib/data-service";
import { getMatchResult, setMatchResult, clearAllMatchResults } from "@/lib/storage";

export const maxDuration = 120;

interface FIFAMatchResponse {
  HomeTeam?: { Score?: number };
  AwayTeam?: { Score?: number };
  LiveEvents?: { PlayerName?: string; TeamId?: number; Minute?: number; EventType?: string }[];
  Goals?: { PlayerName?: string; TeamId?: number; Minute?: number; Type?: number }[];
  MatchStatus?: number;
}

interface GoalEntry {
  playerName: string;
  teamId: string;
  minute: number;
  isPenalty: boolean;
  isOwnGoal: boolean;
}

function parseFIFAGoals(fifa: FIFAMatchResponse, team1Id: string, team2Id: string): GoalEntry[] {
  const goals: GoalEntry[] = [];
  if (fifa.Goals && fifa.Goals.length > 0) {
    for (const g of fifa.Goals) {
      goals.push({
        playerName: g.PlayerName || "Unknown",
        teamId: g.TeamId === 1 ? team1Id : team2Id,
        minute: g.Minute || 0,
        isPenalty: g.Type === 2,
        isOwnGoal: g.Type === 3,
      });
    }
  } else if (fifa.LiveEvents) {
    for (const e of fifa.LiveEvents) {
      if (e.EventType === "goal" || e.EventType === "penalty") {
        goals.push({
          playerName: e.PlayerName || "Unknown",
          teamId: e.TeamId === 1 ? team1Id : team2Id,
          minute: e.Minute || 0,
          isPenalty: e.EventType === "penalty",
          isOwnGoal: false,
        });
      }
    }
  }
  return goals;
}

const TEAM_NAME_ALIASES: Record<string, string> = {
  "korearepublic": "southkorea",
  "czechia": "czechrepublic",
  "bosniaandherzegovina": "bosniaherzegovina",
  "unitedstates": "usa",
  "turkey": "turkiye",
};

function normName(name: string): string {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return TEAM_NAME_ALIASES[normalized] || normalized;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key") || "";
  const secret = process.env.CRON_SECRET || "";

  let isAuthorized = false;
  try {
    if (key.length > 0 && key.length === secret.length) {
      isAuthorized = crypto.timingSafeEqual(Buffer.from(key), Buffer.from(secret));
    }
  } catch {}

  if (!isAuthorized) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Clear stale data only AFTER we're inside the try block — if fetch fails, old data survives
    await clearAllMatchResults();

    // Pre-fetch SportSRC matches once as a fallback for scores when FIFA is unavailable
    const allSportSRCMatches: { homeTeam?: { name?: string }; awayTeam?: { name?: string }; homeScore?: { current?: number }; awayScore?: { current?: number }; home_score?: number; away_score?: number; status?: string }[] = [];
    const sportsrcKey = process.env.SPORTSRC_KEY || "";
    if (sportsrcKey) {
      const [finishedRes, liveRes] = await Promise.all([
        fetch(`https://api.sportsrc.org/v2/?type=matches&sport=football&status=finished&days=7&api_key=${sportsrcKey}`, { next: { revalidate: 30 } }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`https://api.sportsrc.org/v2/?type=matches&sport=football&status=inprogress&api_key=${sportsrcKey}`, { next: { revalidate: 30 } }).then(r => r.ok ? r.json() : null).catch(() => null),
      ]);
      if (finishedRes?.data) allSportSRCMatches.push(...finishedRes.data);
      if (liveRes?.data) allSportSRCMatches.push(...liveRes.data);
    }

    const results: Record<string, { status: string }> = {};
    const changedIds: string[] = [];
    const batchSize = 5;
    let persisted = 0;

    for (let i = 0; i < MATCHES.length; i += batchSize) {
      const batch = MATCHES.slice(i, i + batchSize);
      const entries = await Promise.all(
        batch.map(async (m) => {
          // 1) Always try FIFA live/football first (fresh data, no cache, has goals)
          const fifaIdMatch = await getFIFAIdMatch(m.team1, m.team2);
          if (fifaIdMatch) {
            const fifa = await fetchFIFA<FIFAMatchResponse>(`live/football/${fifaIdMatch}`);
            if (fifa) {
              const goals = parseFIFAGoals(fifa, m.team1, m.team2);
              return {
                matchId: m.id,
                score: [fifa.HomeTeam?.Score ?? 0, fifa.AwayTeam?.Score ?? 0] as [number, number],
                goals,
                status: (fifa.MatchStatus === 3 ? "finished" : fifa.MatchStatus === 2 ? "live" : "scheduled") as "scheduled" | "live" | "finished",
              };
            }
          }

          // 2) Fallback to SportSRC for scores (no goals)
          const team1Display = normName(getTeamName(m.team1));
          const team2Display = normName(getTeamName(m.team2));
          const hit = allSportSRCMatches.find(sm => {
            const home = normName(sm.homeTeam?.name || "");
            const away = normName(sm.awayTeam?.name || "");
            return (home === team1Display && away === team2Display) ||
                   (home === team2Display && away === team1Display);
          });
          if (hit) {
            return {
              matchId: m.id,
              score: [hit.homeScore?.current ?? hit.home_score ?? 0, hit.awayScore?.current ?? hit.away_score ?? 0] as [number, number],
              goals: [] as GoalEntry[],
              status: (hit.status === "inprogress" ? "live" : hit.status === "finished" ? "finished" : "scheduled") as "scheduled" | "live" | "finished",
            };
          }

          // 3) Past matches: store as finished with no data (allows future live data to override)
          const matchDate = new Date(`2026 ${m.date}`);
          const today = new Date();
          matchDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          if (matchDate < today) {
            return { matchId: m.id, score: [0, 0] as [number, number], goals: [] as GoalEntry[], status: "finished" as const };
          }
          return { matchId: m.id, score: [0, 0] as [number, number], goals: [] as GoalEntry[], status: "scheduled" as const };
        })
      );

      for (const entry of entries) {
        results[entry.matchId] = { status: entry.status };
        if (entry.status !== "scheduled") {
          const prev = await getMatchResult(entry.matchId);
          const changed = !prev || prev.score[0] !== entry.score[0] || prev.score[1] !== entry.score[1] || prev.status !== entry.status || prev.goals.length !== entry.goals.length;
          const stored = await setMatchResult(entry.matchId, {
            score: entry.score,
            goals: entry.goals,
            status: entry.status,
            updatedAt: new Date().toISOString(),
          });
          if (stored) persisted++;
          if (changed && stored) changedIds.push(entry.matchId);
        }
      }
    }

    const revalidated = new Set<string>();

    if (persisted > 0) {
      revalidatePath("/");
      revalidatePath("/matches");
      revalidatePath("/stats");
      revalidatePath("/top-scorers");
      revalidatePath("/standings");
      revalidated.add("/");
      revalidated.add("/matches");
      revalidated.add("/stats");
      revalidated.add("/top-scorers");
      revalidated.add("/standings");
    }
    for (const mid of changedIds) {
      const path = `/match/${mid}` as const;
      revalidatePath(path);
      revalidated.add(path);
    }

    const live = Object.values(results).filter(r => r.status === "live").length;
    const finished = Object.values(results).filter(r => r.status === "finished").length;

    return NextResponse.json({
      ok: true,
      updatedAt: new Date().toISOString(),
      total: MATCHES.length,
      live,
      finished,
      scheduled: MATCHES.length - live - finished,
      persisted,
      revalidated: Array.from(revalidated),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
