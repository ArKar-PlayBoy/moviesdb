import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { MATCHES, getTeamName } from "@/data/worldcup-2026";
import { getFIFAIdMatch, fetchFIFA } from "@/lib/data-service";
import { getMatchResult, setMatchResult } from "@/lib/storage";

export const maxDuration = 120;

interface FIFAPlayer {
  IdPlayer: string;
  PlayerName?: { Locale?: string; Description?: string }[];
  Position?: number;
  ShirtNumber?: number;
}

interface FIFATeam {
  Score?: number;
  IdTeam?: string;
  Players?: FIFAPlayer[];
  Goals?: {
    Type?: number;
    IdPlayer?: string;
    Minute?: string;
    IdAssistPlayer?: string | null;
    Period?: number;
    IdTeam?: string;
  }[];
  Bookings?: {
    Card?: number;
    IdPlayer?: string;
    Minute?: string;
    IdTeam?: string;
  }[];
}

interface FIFAMatchResponse {
  HomeTeam?: FIFATeam;
  AwayTeam?: FIFATeam;
  MatchStatus?: number;
}

interface GoalEntry {
  playerName: string;
  teamId: string;
  minute: number;
  isPenalty: boolean;
  isOwnGoal: boolean;
}

interface AssistEntry {
  playerName: string;
  teamId: string;
  minute: number;
}

interface CardEntry {
  playerName: string;
  teamId: string;
  minute: string;
  card: number;
}

function findPlayerName(players: FIFAPlayer[] | undefined, idPlayer: string): string {
  if (!players) return "Unknown";
  const p = players.find(p => p.IdPlayer === idPlayer);
  if (!p?.PlayerName) return "Unknown";
  const name = p.PlayerName.find(n => n.Locale?.startsWith("en"))?.Description;
  return name || "Unknown";
}

function parseFIFAData(fifa: FIFAMatchResponse, team1Id: string, team2Id: string): { goals: GoalEntry[]; assists: AssistEntry[]; cards: CardEntry[] } {
  const goals: GoalEntry[] = [];
  const assists: AssistEntry[] = [];
  const cards: CardEntry[] = [];

  const teams = [
    { data: fifa.HomeTeam, ourId: team1Id },
    { data: fifa.AwayTeam, ourId: team2Id },
  ];

  for (const { data: team, ourId } of teams) {
    if (!team) continue;

    // Parse goals
    if (team.Goals) {
      for (const g of team.Goals) {
        const playerName = findPlayerName(team.Players, g.IdPlayer || "");
        const minuteNum = parseInt(g.Minute || "0", 10);
        goals.push({
          playerName,
          teamId: ourId,
          minute: isNaN(minuteNum) ? 0 : minuteNum,
          isPenalty: g.Type === 2,
          isOwnGoal: g.Type === 3,
        });
        if (g.IdAssistPlayer) {
          const assisterName = findPlayerName(team.Players, g.IdAssistPlayer);
          assists.push({
            playerName: assisterName,
            teamId: ourId,
            minute: isNaN(minuteNum) ? 0 : minuteNum,
          });
        }
      }
    }

    // Parse bookings
    if (team.Bookings) {
      for (const b of team.Bookings) {
        const playerName = findPlayerName(team.Players, b.IdPlayer || "");
        cards.push({
          playerName,
          teamId: ourId,
          minute: b.Minute || "0'",
          card: b.Card || 1,
        });
      }
    }
  }

  return { goals, assists, cards };
}

const TEAM_NAME_ALIASES: Record<string, string> = {
  "korearepublic": "southkorea",
  "czechia": "czechrepublic",
  "bosniaandherzegovina": "bosniaherz",
  "bosniaherzegovina": "bosniaherz",
  "unitedstates": "usa",
  "turkiye": "turkey",
  "ctedivoire": "ivorycoast",
  "caboverde": "capeverde",
  "congodr": "drcongo",
  "iriran": "iran",
};

function normName(name: string): string {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return TEAM_NAME_ALIASES[normalized] || normalized;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key") || "";
  const authHeader = request.headers.get("authorization") || "";
  const secret = process.env.CRON_SECRET || "";

  let isAuthorized = false;
  try {
    const bearer = authHeader.replace(/^Bearer\s+/i, "").trim();
    const input = key || bearer;
    if (input.length > 0 && input.length === secret.length) {
      isAuthorized = crypto.timingSafeEqual(Buffer.from(input), Buffer.from(secret));
    }
  } catch {}

  if (!isAuthorized) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
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
          const matchDate = new Date(`2026 ${m.date}`);
          const today = new Date();
          matchDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);

          // Early exit for future matches to save API calls
          if (matchDate > today) {
             return { matchId: m.id, score: [0, 0] as [number, number], goals: [] as GoalEntry[], assists: [] as AssistEntry[], cards: [] as CardEntry[], status: "scheduled" as const };
          }

          // 1) Always try FIFA live/football first (fresh data, no cache, has goals/assists/cards)
          const fifaIdMatch = await getFIFAIdMatch(m.team1, m.team2);
          if (fifaIdMatch) {
            const fifa = await fetchFIFA<FIFAMatchResponse>(`live/football/${fifaIdMatch}`);
            if (fifa) {
              const parsed = parseFIFAData(fifa, m.team1, m.team2);
              return {
                matchId: m.id,
                score: [fifa.HomeTeam?.Score ?? 0, fifa.AwayTeam?.Score ?? 0] as [number, number],
                goals: parsed.goals,
                assists: parsed.assists,
                cards: parsed.cards,
                status: (fifa.MatchStatus === 0 ? "finished" : fifa.MatchStatus === 2 ? "live" : "scheduled") as "scheduled" | "live" | "finished",
              };
            }
          }

          // 2) Fallback to SportSRC for scores (no goals/assists/cards)
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
              assists: [] as AssistEntry[],
              cards: [] as CardEntry[],
              status: (hit.status === "inprogress" ? "live" : hit.status === "finished" ? "finished" : "scheduled") as "scheduled" | "live" | "finished",
            };
          }

          // 3) Past matches: store as finished with no data (allows future live data to override)
          if (matchDate < today) {
            return { matchId: m.id, score: [0, 0] as [number, number], goals: [] as GoalEntry[], assists: [] as AssistEntry[], cards: [] as CardEntry[], status: "finished" as const };
          }
          return { matchId: m.id, score: [0, 0] as [number, number], goals: [] as GoalEntry[], assists: [] as AssistEntry[], cards: [] as CardEntry[], status: "scheduled" as const };
        })
      );

      for (const entry of entries) {
        results[entry.matchId] = { status: entry.status };
        if (entry.status !== "scheduled") {
          const prev = await getMatchResult(entry.matchId);
          const changed = !prev || prev.score[0] !== entry.score[0] || prev.score[1] !== entry.score[1] || prev.status !== entry.status || prev.goals.length !== entry.goals.length || prev.assists?.length !== entry.assists.length || prev.cards?.length !== entry.cards.length;
          const stored = await setMatchResult(entry.matchId, {
            score: entry.score,
            goals: entry.goals,
            assists: entry.assists,
            cards: entry.cards,
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
