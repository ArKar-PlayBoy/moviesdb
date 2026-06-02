import { getKnockoutBracket as getSimulatedBracket, type KnockoutMatch } from "@/data/worldcup-2026";
import { getMatchResult } from "@/lib/storage";

interface SportSRCMatchRaw {
  id?: string | number;
  homeTeam?: { id?: string; name?: string };
  awayTeam?: { id?: string; name?: string };
  homeScore?: { current?: number };
  awayScore?: { current?: number };
  home_score?: number;
  away_score?: number;
  status?: string;
  date?: string;
  venue?: string;
}

interface SportSRCResponse {
  data?: SportSRCMatchRaw[];
}

interface FIFALiveEvent {
  PlayerName?: string;
  TeamId?: number;
  Minute?: number;
  EventType?: string;
}

interface FIFAMatchResponse {
  HomeTeam?: { Score?: number };
  AwayTeam?: { Score?: number };
  LiveEvents?: FIFALiveEvent[];
  MatchStatus?: number;
  Results?: unknown[];
}

export type DataSource = "simulated" | "sportsrc" | "fifa";

export interface LiveMatchData {
  id: string;
  team1Id: string;
  team2Id: string;
  team1Score: number;
  team2Score: number;
  status: "scheduled" | "live" | "finished";
  date: string;
  venue: string;
  stage: string;
}

export interface GoalEvent {
  playerName: string;
  teamId: string;
  minute: number;
  isPenalty: boolean;
  isOwnGoal: boolean;
}

export interface MatchDetail {
  score: [number, number];
  goals: GoalEvent[];
  possession?: [number, number];
  shots?: [number, number];
  status: "scheduled" | "live" | "finished";
}

const WC_START = new Date("2026-06-11T00:00:00Z");

function isWcStarted(): boolean {
  return new Date() >= WC_START;
}

export interface ScorerData {
  playerName: string;
  teamId: string;
  teamName: string;
  teamFlag: string;
  position: string;
  goals: number;
  matches: number;
  teamGroup: string;
}

export interface StarData {
  name: string;
  teamId: string;
  reason: string;
  photo?: string;
  stats?: { label: string; value: string }[];
}

const API_KEY = process.env.SPORTSRC_KEY || "";

async function fetchSportSRC<T>(endpoint: string): Promise<T | null> {
  if (!API_KEY) return null;
  try {
    const url = `https://api.sportsrc.org/v2/?${endpoint}&api_key=${API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchFIFA<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`https://api.fifa.com/api/v3/${path}`, {
      headers: { "User-Agent": "WorldCup2026/1.0" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getMatchData(
  matchId: string,
  team1Id: string,
  team2Id: string,
): Promise<MatchDetail> {
  if (!isWcStarted()) {
    return { score: [0, 0], goals: [], status: "scheduled" };
  }

  const cached = await getMatchResult(matchId);
  if (cached) {
    return { score: cached.score, goals: cached.goals, status: cached.status };
  }

  const sportsrc = await fetchSportSRC<SportSRCResponse>(`type=detail&id=${matchId}`);
  if (sportsrc?.data) {
    const d = sportsrc.data[0];
    const homeScore = d?.homeScore?.current ?? d?.home_score ?? 0;
    const awayScore = d?.awayScore?.current ?? d?.away_score ?? 0;
    const status = d?.status === "inprogress" ? "live" : d?.status === "finished" ? "finished" : "scheduled";
    return {
      score: [homeScore, awayScore],
      goals: [],
      status,
    };
  }

  const fifa = await fetchFIFA<FIFAMatchResponse>(`live/football/${matchId}`);
  if (fifa) {
    const homeScore = fifa.HomeTeam?.Score ?? 0;
    const awayScore = fifa.AwayTeam?.Score ?? 0;
    const goals: GoalEvent[] = (fifa.LiveEvents || []).map((e) => ({
      playerName: e.PlayerName || "Unknown",
      teamId: e.TeamId === 1 ? team1Id : team2Id,
      minute: e.Minute || 0,
      isPenalty: e.EventType === "penalty",
      isOwnGoal: e.EventType === "owngoal",
    }));
    return {
      score: [homeScore, awayScore],
      goals,
      status: fifa.MatchStatus === 3 ? "finished" : fifa.MatchStatus === 2 ? "live" : "scheduled",
    };
  }

  return { score: [0, 0], goals: [], status: "scheduled" };
}

export async function getLiveScores(): Promise<LiveMatchData[]> {
  if (!isWcStarted()) return [];

  const sportsrc = await fetchSportSRC<SportSRCResponse>("type=matches&sport=football&status=inprogress");
  if (sportsrc?.data) {
    return sportsrc.data.map((m) => ({
      id: String(m.id || ""),
      team1Id: m.homeTeam?.id || "",
      team2Id: m.awayTeam?.id || "",
      team1Score: m.homeScore?.current ?? 0,
      team2Score: m.awayScore?.current ?? 0,
      status: "live" as const,
      date: m.date || "",
      venue: m.venue || "",
      stage: "Group Stage",
    }));
  }

  return [];
}

export async function getStandings(group: string): Promise<unknown[] | null> {
  if (!isWcStarted()) return null;

  const fifa = await fetchFIFA<FIFAMatchResponse>(`competitions/1/standings?group=${group}`);
  if (fifa?.Results) return fifa.Results;

  return null;
}

export async function getTopScorersList(limit = 30): Promise<ScorerData[] | null> {
  if (!isWcStarted()) return null;

  const fifa = await fetchFIFA<FIFAMatchResponse>(`competitions/1/topscorers?limit=${limit}`);
  if (fifa?.Results) {
    return fifa.Results.map((_r) => {
      const r = _r as Record<string, unknown>;
      return {
        playerName: String(r.PlayerName || ""),
        teamId: String(r.TeamId || ""),
        teamName: String(r.TeamName || ""),
        teamFlag: "",
        position: String(r.Position || ""),
        goals: Number(r.Goals || 0),
        matches: Number(r.Matches || 0),
        teamGroup: "",
      };
    });
  }

  return null;
}

export async function getWeeklyStar(): Promise<StarData | null> {
  if (!isWcStarted()) return null;

  const sportsrc = await fetchSportSRC<SportSRCResponse>("type=matches&sport=football&status=finished&days=7");
  if (sportsrc?.data) {
    return {
      name: "TBD",
      teamId: "",
      reason: "Best performer of the week",
    };
  }

  return null;
}

export function getYouTubeMatchUrl(team1: string, team2: string, date: string): string {
  const query = `fifa world cup 2026 ${team1} vs ${team2} official highlights ${date}`;
  return `https://www.youtube.com/embed?listType=search&q=${encodeURIComponent(query)}&hl=en`;
}

export function getYouTubeFIFAChannelUrl(): string {
  return "https://www.youtube.com/@FIFA";
}

export function getBracketData(): KnockoutMatch[] {
  const bracket = getSimulatedBracket();
  if (!isWcStarted()) {
    return bracket.map((m) => ({ ...m, score1: undefined, score2: undefined }));
  }
  return bracket;
}
