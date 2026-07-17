import TEAMS, { MATCHES, getTeamName } from "@/data/worldcup-2026";
import { fetchFIFA, fetchFIFACalendar, normalizeTeamName, getFIFAIdMatch } from "@/lib/data-service";
import { getMatchResult, setMatchResult } from "@/lib/storage";

export interface GoalSyncEntry {
  playerName: string;
  teamId: string;
  minute: number;
  isPenalty: boolean;
  isOwnGoal: boolean;
}

export interface AssistSyncEntry {
  playerName: string;
  teamId: string;
  minute: number;
}

export interface CardSyncEntry {
  playerName: string;
  teamId: string;
  minute: string;
  card: number;
}

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

function findPlayerName(players: FIFAPlayer[] | undefined, idPlayer: string): string {
  if (!players) return "Unknown";
  const p = players.find(p => p.IdPlayer === idPlayer);
  if (!p?.PlayerName) return "Unknown";
  const name = p.PlayerName.find(n => n.Locale?.startsWith("en"))?.Description;
  return name || "Unknown";
}

export function parseFIFAData(
  fifa: FIFAMatchResponse,
  team1Id: string,
  team2Id: string,
): { goals: GoalSyncEntry[]; assists: AssistSyncEntry[]; cards: CardSyncEntry[] } {
  const goals: GoalSyncEntry[] = [];
  const assists: AssistSyncEntry[] = [];
  const cards: CardSyncEntry[] = [];

  const teams = [
    { data: fifa.HomeTeam, ourId: team1Id },
    { data: fifa.AwayTeam, ourId: team2Id },
  ];

  for (const { data: team, ourId } of teams) {
    if (!team) continue;

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

function parseDate(dateStr: string): Date {
  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };
  const parts = dateStr.split(" ");
  if (parts.length === 2) {
    const month = months[parts[0]?.toLowerCase().slice(0, 3)] ?? 0;
    const day = parseInt(parts[1], 10);
    if (!isNaN(day)) {
      return new Date(Date.UTC(2026, month, day));
    }
  }
  return new Date(dateStr);
}

function isBeforeToday(dateStr: string): boolean {
  const matchDate = parseDate(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return matchDate < today;
}

export interface MatchSyncResult {
  matchId: string;
  score: [number, number];
  goals: GoalSyncEntry[];
  assists: AssistSyncEntry[];
  cards: CardSyncEntry[];
  status: "scheduled" | "live" | "finished";
}

export interface SyncStats {
  total: number;
  live: number;
  finished: number;
  scheduled: number;
  persisted: number;
  changedIds: string[];
}

const BATCH_SIZE = 5;

export async function syncAllMatches(): Promise<SyncStats> {
  let live = 0;
  let finished = 0;
  let persisted = 0;
  let knockoutAttempted = 0;
  const changedIds: string[] = [];

  const knownMatchIds = MATCHES.map((m) => m.id);

  const allSportSRCMatches: {
    homeTeam?: { name?: string }; awayTeam?: { name?: string };
    homeScore?: { current?: number }; awayScore?: { current?: number };
    home_score?: number; away_score?: number; status?: string;
  }[] = [];

  const sportsrcKey = process.env.SPORTSRC_KEY || "";
  if (sportsrcKey) {
    const [finishedRes, liveRes] = await Promise.all([
      fetch(
        `https://api.sportsrc.org/v2/?type=matches&sport=football&status=finished&days=7&api_key=${sportsrcKey}`,
        { next: { revalidate: 30 } },
      )
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(
        `https://api.sportsrc.org/v2/?type=matches&sport=football&status=inprogress&api_key=${sportsrcKey}`,
        { next: { revalidate: 30 } },
      )
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ]);
    if (finishedRes?.data) allSportSRCMatches.push(...finishedRes.data);
    if (liveRes?.data) allSportSRCMatches.push(...liveRes.data);
  }

  for (let i = 0; i < knownMatchIds.length; i += BATCH_SIZE) {
    const batchIds = knownMatchIds.slice(i, i + BATCH_SIZE);
    const batchMatches = batchIds
      .map((id) => MATCHES.find((m) => m.id === id))
      .filter(Boolean) as typeof MATCHES;

    const entries = await Promise.all(
      batchMatches.map(async (m) => {
        if (!isBeforeToday(m.date)) {
          return {
            matchId: m.id,
            score: [0, 0] as [number, number],
            goals: [] as GoalSyncEntry[],
            assists: [] as AssistSyncEntry[],
            cards: [] as CardSyncEntry[],
            status: "scheduled" as const,
          };
        }

        try {
          const fifaIdMatch = await getFIFAIdMatch(m.team1, m.team2);
          if (fifaIdMatch) {
            const fifa = await fetchFIFA<FIFAMatchResponse>(`live/football/${fifaIdMatch}`);
            if (fifa) {
              const parsed = parseFIFAData(fifa, m.team1, m.team2);
              return {
                matchId: m.id,
                score: [
                  fifa.HomeTeam?.Score ?? 0,
                  fifa.AwayTeam?.Score ?? 0,
                ] as [number, number],
                goals: parsed.goals,
                assists: parsed.assists,
                cards: parsed.cards,
                status: (fifa.MatchStatus === 0
                  ? "finished"
                  : fifa.MatchStatus === 2
                    ? "live"
                    : "scheduled") as "scheduled" | "live" | "finished",
              };
            }
          }
        } catch {
          // FIFA failed, try fallbacks
        }

        try {
          const team1Display = normalizeTeamName(getTeamName(m.team1));
          const team2Display = normalizeTeamName(getTeamName(m.team2));
          const hit = allSportSRCMatches.find((sm) => {
            const home = normalizeTeamName(sm.homeTeam?.name || "");
            const away = normalizeTeamName(sm.awayTeam?.name || "");
            return (
              (home === team1Display && away === team2Display) ||
              (home === team2Display && away === team1Display)
            );
          });
          if (hit) {
            return {
              matchId: m.id,
              score: [
                hit.homeScore?.current ?? hit.home_score ?? 0,
                hit.awayScore?.current ?? hit.away_score ?? 0,
              ] as [number, number],
              goals: [] as GoalSyncEntry[],
              assists: [] as AssistSyncEntry[],
              cards: [] as CardSyncEntry[],
              status: (hit.status === "inprogress"
                ? "live"
                : hit.status === "finished"
                  ? "finished"
                  : "scheduled") as "scheduled" | "live" | "finished",
            };
          }
        } catch {
          // SportSRC failed
        }

        if (isBeforeToday(m.date)) {
          return {
            matchId: m.id,
            score: [0, 0] as [number, number],
            goals: [] as GoalSyncEntry[],
            assists: [] as AssistSyncEntry[],
            cards: [] as CardSyncEntry[],
            status: "finished" as const,
          };
        }

        return {
          matchId: m.id,
          score: [0, 0] as [number, number],
          goals: [] as GoalSyncEntry[],
          assists: [] as AssistSyncEntry[],
          cards: [] as CardSyncEntry[],
          status: "scheduled" as const,
        };
      }),
    );

    for (const entry of entries) {
      if (entry.status === "live") live++;
      if (entry.status === "finished") finished++;

      if (entry.status !== "scheduled") {
        const prev = await getMatchResult(entry.matchId);
        const changed =
          !prev ||
          prev.score[0] !== entry.score[0] ||
          prev.score[1] !== entry.score[1] ||
          prev.status !== entry.status ||
          prev.goals.length !== entry.goals.length ||
          (prev.assists?.length ?? 0) !== entry.assists.length ||
          (prev.cards?.length ?? 0) !== entry.cards.length;

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

  const groupTotal = knownMatchIds.length;

  // Calendar-driven knockout sync (replaces computed bracket approach)
  const calMatches = await fetchFIFACalendar();
  const stagePrefixMap: Record<string, string> = {
    "Round of 32": "r32",
    "Round of 16": "r16",
    "Quarter-final": "qf",
    "Semi-final": "sf",
    "Bronze final": "bronze",
    "Final": "final",
  };
  const stageCounters: Record<string, number> = {};
  const teamNameToId: Record<string, string> = {};
  for (const t of TEAMS) {
    teamNameToId[normalizeTeamName(t.name)] = t.id;
  }

  for (const cm of calMatches) {
    const stage = cm.StageName?.[0]?.Description;
    if (!stage || stage === "First Stage" || !stagePrefixMap[stage]) continue;

    const homeName = cm.Home?.TeamName?.[0]?.Description || "";
    const awayName = cm.Away?.TeamName?.[0]?.Description || "";
    const homeId = teamNameToId[normalizeTeamName(homeName)];
    const awayId = teamNameToId[normalizeTeamName(awayName)];
    if (!homeId || !awayId) continue;

    const prefix = stagePrefixMap[stage];
    const idx = stageCounters[stage] ?? 0;
    stageCounters[stage] = idx + 1;
    const matchId = stage === "Bronze final" || stage === "Final" ? prefix : `${prefix}-${idx}`;
    const fifaIdMatch = cm.IdMatch;

    knockoutAttempted++;

    const calScore: [number, number] = [
      cm.Home?.Score ?? 0,
      cm.Away?.Score ?? 0,
    ];
    const hasCalScore = (cm.Home?.Score ?? -1) >= 0 && (cm.Away?.Score ?? -1) >= 0;
    const calDate = cm.Date ? cm.Date.substring(0, 10) : "";

    let status: "scheduled" | "live" | "finished" = "scheduled";
    let score: [number, number] = [0, 0];
    let goals: GoalSyncEntry[] = [];
    let assists: AssistSyncEntry[] = [];
    let cards: CardSyncEntry[] = [];

    if (fifaIdMatch) {
      try {
        const fifa = await fetchFIFA<FIFAMatchResponse>(`live/football/${fifaIdMatch}`);
        if (fifa) {
          const parsed = parseFIFAData(fifa, homeId, awayId);
          goals = parsed.goals;
          assists = parsed.assists;
          cards = parsed.cards;
          status = fifa.MatchStatus === 0 ? "finished" : fifa.MatchStatus === 2 ? "live" : "scheduled";
          score = [fifa.HomeTeam?.Score ?? calScore[0], fifa.AwayTeam?.Score ?? calScore[1]];
        }
      } catch {
        // live/football failed, fall back to calendar scores
      }
    }

    if (status === "scheduled" && hasCalScore) {
      status = "finished";
      score = calScore;
    }

    if (status === "scheduled" && calDate && calDate < new Date().toISOString().substring(0, 10)) {
      status = "finished";
    }

    const prev = await getMatchResult(matchId);
    const changed =
      !prev ||
      prev.score[0] !== score[0] ||
      prev.score[1] !== score[1] ||
      prev.status !== status ||
      prev.team1 !== homeId ||
      prev.team2 !== awayId ||
      prev.goals.length !== goals.length ||
      (prev.assists?.length ?? 0) !== assists.length ||
      (prev.cards?.length ?? 0) !== cards.length;

    const stored = await setMatchResult(matchId, {
      score,
      goals,
      assists,
      cards,
      status,
      updatedAt: new Date().toISOString(),
      team1: homeId,
      team2: awayId,
      date: calDate,
      stage,
    });

    if (stored) persisted++;
    if (changed && stored) changedIds.push(matchId);
    if (status === "live") live++;
    if (status === "finished") finished++;
  }

  return {
    total: groupTotal + knockoutAttempted,
    live,
    finished,
    scheduled: groupTotal + knockoutAttempted - live - finished,
    persisted,
    changedIds,
  };
}
