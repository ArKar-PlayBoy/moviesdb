import { getKnockoutBracket as getSimulatedBracket, getTeamName, getTeamsByGroup, getAllPlayers, getTeamById, MATCHES, type KnockoutMatch, type Standing, type ScorerEntry } from "@/data/worldcup-2026";
import { getMatchResult, type StoredMatchResult } from "@/lib/storage";

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

function normalizeTeamName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function doTeamsMatch(sportsrcHome: string | undefined, sportsrcAway: string | undefined, team1Id: string, team2Id: string): boolean {
  const home = normalizeTeamName(sportsrcHome || "");
  const away = normalizeTeamName(sportsrcAway || "");
  const t1 = normalizeTeamName(getTeamName(team1Id));
  const t2 = normalizeTeamName(getTeamName(team2Id));
  return (home === t1 && away === t2) || (home === t2 && away === t1);
}

async function findSportSRCMatchByTeams(team1Id: string, team2Id: string): Promise<SportSRCMatchRaw | null> {
  const finished = await fetchSportSRC<SportSRCResponse>("type=matches&sport=football&status=finished&days=7");
  if (finished?.data) {
    for (const m of finished.data) {
      if (doTeamsMatch(m.homeTeam?.name, m.awayTeam?.name, team1Id, team2Id)) return m;
    }
  }
  const inprogress = await fetchSportSRC<SportSRCResponse>("type=matches&sport=football&status=inprogress");
  if (inprogress?.data) {
    for (const m of inprogress.data) {
      if (doTeamsMatch(m.homeTeam?.name, m.awayTeam?.name, team1Id, team2Id)) return m;
    }
  }
  return null;
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
  if (cached && cached.status !== "scheduled") {
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

  // Fallback: match SportSRC matches by team names
  const teamMatch = await findSportSRCMatchByTeams(team1Id, team2Id);
  if (teamMatch) {
    const homeScore = teamMatch.homeScore?.current ?? teamMatch.home_score ?? 0;
    const awayScore = teamMatch.awayScore?.current ?? teamMatch.away_score ?? 0;
    const status = teamMatch.status === "inprogress" ? "live" : teamMatch.status === "finished" ? "finished" : "scheduled";
    return { score: [homeScore, awayScore], goals: [], status };
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

  // Fallback: fetch FIFA World Cup matches from calendar and match by teams
  try {
    const calRes = await fetch(`https://api.fifa.com/api/v3/calendar/matches?from=2026-06-10&to=2026-07-20&competition=17&count=104`, {
      headers: { "User-Agent": "WorldCup2026/1.0" },
      next: { revalidate: 120 },
    });
    if (calRes.ok) {
      const calData = await calRes.json() as { Results?: { Date?: string; Home?: { TeamName?: { Description?: string }[]; Score?: number }; Away?: { TeamName?: { Description?: string }[]; Score?: number }; MatchStatus?: number }[] };
      const team1Display = normalizeTeamName(getTeamName(team1Id));
      const team2Display = normalizeTeamName(getTeamName(team2Id));
      const now = new Date();
      const calMatch = (calData.Results || []).find((m) => {
        const h = normalizeTeamName(m.Home?.TeamName?.[0]?.Description || "");
        const a = normalizeTeamName(m.Away?.TeamName?.[0]?.Description || "");
        return (h === team1Display && a === team2Display) || (h === team2Display && a === team1Display);
      });
      if (calMatch) {
        const homeScore = calMatch.Home?.Score ?? 0;
        const awayScore = calMatch.Away?.Score ?? 0;
        const matchDate = calMatch.Date ? new Date(calMatch.Date) : null;
        const hasScore = homeScore > 0 || awayScore > 0;
        const isPast = matchDate ? matchDate <= now : false;
        const status: "scheduled" | "live" | "finished" = isPast && hasScore ? "finished" : isPast && calMatch.MatchStatus === 0 ? "finished" : isPast ? "live" : "scheduled";
        return { score: [homeScore, awayScore], goals: [], status };
      }
    }
  } catch {}

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

  const fifa = await fetchFIFA<FIFAMatchResponse>(`competitions/17/standings?group=${group}`);
  if (fifa?.Results) return fifa.Results;

  return null;
}

export async function getTopScorersList(limit = 30): Promise<ScorerData[] | null> {
  if (!isWcStarted()) return null;

  const fifa = await fetchFIFA<FIFAMatchResponse>(`competitions/17/topscorers?limit=${limit}`);
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

export function computeStandingsFromResults(
  group: string,
  results: Record<string, StoredMatchResult>,
): Standing[] {
  const teams = getTeamsByGroup(group);
  const matches = MATCHES.filter((m) => m.group === group);
  const stats: Record<string, Standing> = {};
  const formTracker: Record<string, ("W" | "D" | "L")[]> = {};

  for (const team of teams) {
    stats[team.id] = {
      teamId: team.id,
      teamName: team.name,
      flag: team.flag,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
      form: [],
    };
    formTracker[team.id] = [];
  }

  for (const match of matches) {
    const t1 = teams.find((t) => t.id === match.team1);
    const t2 = teams.find((t) => t.id === match.team2);
    if (!t1 || !t2) continue;
    const result = results[match.id];
    if (!result || result.status === "scheduled") continue;
    const [goals1, goals2] = result.score;

    stats[match.team1].played++;
    stats[match.team2].played++;
    stats[match.team1].goalsFor += goals1;
    stats[match.team1].goalsAgainst += goals2;
    stats[match.team2].goalsFor += goals2;
    stats[match.team2].goalsAgainst += goals1;

    if (goals1 > goals2) {
      stats[match.team1].won++;
      stats[match.team1].points += 3;
      stats[match.team2].lost++;
      formTracker[match.team1].push("W");
      formTracker[match.team2].push("L");
    } else if (goals2 > goals1) {
      stats[match.team2].won++;
      stats[match.team2].points += 3;
      stats[match.team1].lost++;
      formTracker[match.team2].push("W");
      formTracker[match.team1].push("L");
    } else {
      stats[match.team1].drawn++;
      stats[match.team1].points += 1;
      stats[match.team2].drawn++;
      stats[match.team2].points += 1;
      formTracker[match.team1].push("D");
      formTracker[match.team2].push("D");
    }
  }

  return Object.values(stats)
    .map((s) => ({ ...s, goalDiff: s.goalsFor - s.goalsAgainst, form: formTracker[s.teamId]?.slice(-5) ?? [] }))
    .sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor);
}

export function computeTopScorersFromResults(
  results: Record<string, StoredMatchResult>,
  limit = 30,
): ScorerEntry[] {
  const all = getAllPlayers();
  const map: Record<string, ScorerEntry> = {};
  for (const p of all) {
    const k = `${p.teamId}-${p.name}`;
    map[k] = {
      playerName: p.name,
      teamId: p.teamId,
      teamName: p.teamName,
      teamFlag: p.teamFlag,
      position: p.position,
      goals: 0,
      matches: 0,
      teamGroup: getTeamById(p.teamId)?.group || "",
    };
  }

  for (const m of MATCHES) {
    const t1 = getTeamById(m.team1);
    const t2 = getTeamById(m.team2);
    if (!t1 || !t2) continue;
    const result = results[m.id];
    if (!result || result.status === "scheduled") continue;

    for (const pl of t1.players) { const k = `${t1.id}-${pl.name}`; if (map[k]) map[k].matches++; }
    for (const pl of t2.players) { const k = `${t2.id}-${pl.name}`; if (map[k]) map[k].matches++; }

    for (const g of result.goals) {
      const k = `${g.teamId}-${g.playerName}`;
      if (map[k]) map[k].goals++;
    }
  }

  return Object.values(map)
    .filter((s) => s.goals > 0)
    .sort((a, b) => b.goals - a.goals || b.matches - a.matches)
    .slice(0, limit);
}

export function getBracketData(): KnockoutMatch[] {
  const bracket = getSimulatedBracket();
  if (!isWcStarted()) {
    return bracket.map((m) => ({ ...m, score1: undefined, score2: undefined }));
  }
  return bracket;
}
