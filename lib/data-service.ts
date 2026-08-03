import { getKnockoutBracket as getSimulatedBracket, getTeamName, getTeamsByGroup, getAllPlayers, getTeamById, MATCHES, LIVE_RESULTS, type KnockoutMatch, type Standing, type ScorerEntry } from "@/data/worldcup-2026";
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

interface FIFAPlayer {
  IdPlayer: string;
  PlayerName?: { Locale?: string; Description?: string }[];
  Position?: number;
  ShirtNumber?: number;
}

interface FIFATeam {
  Score?: number;
  IdTeam?: string;
  TeamName?: { Locale?: string; Description?: string }[];
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

interface FIFALiveResponse {
  HomeTeam?: FIFATeam;
  AwayTeam?: FIFATeam;
  MatchStatus?: number;
}

function findFIFAPlayerName(players: FIFAPlayer[] | undefined, idPlayer: string): string {
  if (!players) return "Unknown";
  const p = players.find(p => p.IdPlayer === idPlayer);
  if (!p?.PlayerName) return "Unknown";
  const name = p.PlayerName.find(n => n.Locale?.startsWith("en"))?.Description;
  return name || "Unknown";
}

interface FIFAMatchResponse {
  Results?: unknown[];
}

interface FIFACalendarMatch {
  IdMatch?: number;
  Date?: string;
  Home?: { TeamName?: { Description?: string }[]; Score?: number; IdTeam?: string };
  Away?: { TeamName?: { Description?: string }[]; Score?: number; IdTeam?: string };
  MatchStatus?: number;
  StageName?: { Description?: string }[];
}

interface FIFACalendarResponse {
  Results?: FIFACalendarMatch[];
}

let idMatchCache: { map: Map<string, number>; ts: number } | null = null;
const ID_MATCH_CACHE_TTL = 120_000;
let buildFIFAIdMatchMapPromise: Promise<Map<string, number>> | null = null;

export async function buildFIFAIdMatchMap(): Promise<Map<string, number>> {
  if (idMatchCache && Date.now() - idMatchCache.ts < ID_MATCH_CACHE_TTL) {
    return idMatchCache.map;
  }
  if (buildFIFAIdMatchMapPromise) return buildFIFAIdMatchMapPromise;

  buildFIFAIdMatchMapPromise = (async () => {
    try {
      const calRes = await fetch(
        `https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&from=2026-06-10&to=2026-07-20&count=104`,
        {
          headers: { "User-Agent": "WorldCup2026/1.0" },
          next: { revalidate: 120 },
        }
      );
      if (!calRes.ok) {
        idMatchCache = { map: new Map(), ts: Date.now() };
        return idMatchCache.map;
      }
      const calData = await calRes.json() as FIFACalendarResponse;
      const map = new Map<string, number>();
      for (const match of calData.Results || []) {
        const home = normalizeTeamName(match.Home?.TeamName?.[0]?.Description || "");
        const away = normalizeTeamName(match.Away?.TeamName?.[0]?.Description || "");
        if (home && away && match.IdMatch) {
          const key1 = `${home}-${away}`;
          const key2 = `${away}-${home}`;
          if (!map.has(key1) && !map.has(key2)) {
            map.set(key1, match.IdMatch);
          }
        }
      }
      idMatchCache = { map, ts: Date.now() };
      return map;
    } catch {
      idMatchCache = { map: new Map(), ts: Date.now() };
      return idMatchCache.map;
    } finally {
      buildFIFAIdMatchMapPromise = null;
    }
  })();

  return buildFIFAIdMatchMapPromise;
}

export async function fetchFIFACalendar(): Promise<FIFACalendarMatch[]> {
  try {
    const res = await fetch(
      `https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&from=2026-06-10&to=2026-07-20&count=104`,
      {
        headers: { "User-Agent": "WorldCup2026/1.0" },
        next: { revalidate: 120 },
      }
    );
    if (!res.ok) return [];
    const data = await res.json() as FIFACalendarResponse;
    return data.Results || [];
  } catch {
    return [];
  }
}

export async function getFIFAIdMatch(team1Id: string, team2Id: string): Promise<number | null> {
  const map = await buildFIFAIdMatchMap();
  const t1 = normalizeTeamName(getTeamName(team1Id));
  const t2 = normalizeTeamName(getTeamName(team2Id));
  return map.get(`${t1}-${t2}`) ?? map.get(`${t2}-${t1}`) ?? null;
}

export function getFIFATeamOrientation(
  fifaHome: { TeamName?: { Description?: string }[] } | undefined,
  fifaAway: { TeamName?: { Description?: string }[] } | undefined,
  team1Id: string,
  team2Id: string,
): { homeIsTeam1: boolean; homeOurId: string; awayOurId: string } {
  const t1 = normalizeTeamName(getTeamName(team1Id));
  const t2 = normalizeTeamName(getTeamName(team2Id));
  const home = normalizeTeamName(fifaHome?.TeamName?.[0]?.Description || "");
  const away = normalizeTeamName(fifaAway?.TeamName?.[0]?.Description || "");
  let homeIsTeam1: boolean;
  if (home === t1 || away === t2) homeIsTeam1 = true;
  else if (home === t2 || away === t1) homeIsTeam1 = false;
  else homeIsTeam1 = true;
  return {
    homeIsTeam1,
    homeOurId: homeIsTeam1 ? team1Id : team2Id,
    awayOurId: homeIsTeam1 ? team2Id : team1Id,
  };
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

export async function fetchFIFA<T>(path: string): Promise<T | null> {
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

export function normalizeTeamName(name: string): string {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return TEAM_NAME_ALIASES[normalized] || normalized;
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

function doTeamsMatch(sportsrcHome: string | undefined, sportsrcAway: string | undefined, team1Id: string, team2Id: string): boolean {
  const home = normalizeTeamName(sportsrcHome || "");
  const away = normalizeTeamName(sportsrcAway || "");
  const t1 = normalizeTeamName(getTeamName(team1Id));
  const t2 = normalizeTeamName(getTeamName(team2Id));
  return (home === t1 && away === t2) || (home === t2 && away === t1);
}

async function findSportSRCMatchByTeams(team1Id: string, team2Id: string): Promise<SportSRCMatchRaw | null> {
  const [finishedRes, inprogressRes] = await Promise.allSettled([
    fetchSportSRC<SportSRCResponse>("type=matches&sport=football&status=finished&days=7"),
    fetchSportSRC<SportSRCResponse>("type=matches&sport=football&status=inprogress")
  ]);

  const finished = finishedRes.status === "fulfilled" ? finishedRes.value : null;
  const inprogress = inprogressRes.status === "fulfilled" ? inprogressRes.value : null;

  if (finished?.data) {
    for (const m of finished.data) {
      if (doTeamsMatch(m.homeTeam?.name, m.awayTeam?.name, team1Id, team2Id)) return m;
    }
  }
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
  cachedResults?: Record<string, StoredMatchResult>,
): Promise<MatchDetail> {
  if (!isWcStarted()) {
    return { score: [0, 0], goals: [], status: "scheduled" };
  }

  const cached = cachedResults?.[matchId] ?? (await getMatchResult(matchId));
  if (cached && cached.status !== "scheduled") {
    return { score: cached.score, goals: cached.goals, status: cached.status };
  }

  // Triage: try each data source, picking best available result.
  // SportSRC paths may provide scores but never goals; FIFA live/football can provide both.
  // We collect all attempts and use the richest result.

  interface TriageResult {
    score: [number, number];
    goals: GoalEvent[];
    status: "scheduled" | "live" | "finished";
    rank: number; // higher = richer data
  }
  const attempts: TriageResult[] = [];

  // Phase 1: Fire all independent requests in parallel
  const [sportsrcRes, teamMatchRes, fifaIdMapRes] = await Promise.allSettled([
    fetchSportSRC<SportSRCResponse>(`type=detail&id=${matchId}`),
    findSportSRCMatchByTeams(team1Id, team2Id),
    buildFIFAIdMatchMap()
  ]);

  const sportsrc = sportsrcRes.status === "fulfilled" ? sportsrcRes.value : null;
  const teamMatch = teamMatchRes.status === "fulfilled" ? teamMatchRes.value : null;

  if (sportsrc?.data) {
    const d = sportsrc.data[0];
    attempts.push({
      score: [d?.homeScore?.current ?? d?.home_score ?? 0, d?.awayScore?.current ?? d?.away_score ?? 0],
      goals: [],
      status: d?.status === "inprogress" ? "live" : d?.status === "finished" ? "finished" : "scheduled",
      rank: 1,
    });
  }

  if (teamMatch) {
    attempts.push({
      score: [teamMatch.homeScore?.current ?? teamMatch.home_score ?? 0, teamMatch.awayScore?.current ?? teamMatch.away_score ?? 0],
      goals: [],
      status: teamMatch.status === "inprogress" ? "live" : teamMatch.status === "finished" ? "finished" : "scheduled",
      rank: 1,
    });
  }

  // Phase 2: FIFA live match
  if (fifaIdMapRes.status === "fulfilled" && fifaIdMapRes.value) {
    const map = fifaIdMapRes.value;
    const t1 = normalizeTeamName(getTeamName(team1Id));
    const t2 = normalizeTeamName(getTeamName(team2Id));
    const fifaIdMatch = map.get(`${t1}-${t2}`) ?? map.get(`${t2}-${t1}`) ?? null;

    if (fifaIdMatch) {
      const fifa = await fetchFIFA<FIFALiveResponse>(`live/football/${fifaIdMatch}`);
      if (fifa) {
        const { homeIsTeam1, homeOurId, awayOurId } = getFIFATeamOrientation(fifa.HomeTeam, fifa.AwayTeam, team1Id, team2Id);
        const goals: GoalEvent[] = [];
        const teams = [
          { data: fifa.HomeTeam, ourId: homeOurId },
          { data: fifa.AwayTeam, ourId: awayOurId },
        ];
        for (const { data: team, ourId } of teams) {
          if (!team?.Goals) continue;
          for (const g of team.Goals) {
            const playerName = findFIFAPlayerName(team.Players, g.IdPlayer || "");
            const minuteNum = parseInt(g.Minute || "0", 10);
            goals.push({
              playerName,
              teamId: ourId,
              minute: isNaN(minuteNum) ? 0 : minuteNum,
              isPenalty: g.Type === 2,
              isOwnGoal: g.Type === 3,
            });
          }
        }
        const homeScore = fifa.HomeTeam?.Score ?? 0;
        const awayScore = fifa.AwayTeam?.Score ?? 0;
        attempts.push({
          score: homeIsTeam1 ? [homeScore, awayScore] : [awayScore, homeScore],
          goals,
          status: fifa.MatchStatus === 0 ? "finished" : fifa.MatchStatus === 2 ? "live" : "scheduled",
          rank: 2,
        });
      }
    }
  }

  // Pick the best result: highest rank wins (2 = FIFA with goals > 1 = SportSRC scores only)
  const best = attempts.sort((a, b) => b.rank - a.rank)[0];
  if (best) return { score: best.score, goals: best.goals, status: best.status };

  // Fallback to LIVE_RESULTS from static JSON (populated from cron)
  const staticResult = LIVE_RESULTS[matchId];
  if (staticResult) {
    const goals: GoalEvent[] = (staticResult.goalScorers || []).map(g => ({
      playerName: g.playerName,
      teamId: g.teamId,
      minute: g.minute,
      isPenalty: false,
      isOwnGoal: false,
    }));
    return { score: [staticResult.score1, staticResult.score2], goals, status: "finished" };
  }

  // 5) Past matches with no live data: show as finished with no details available
  if (isWcStarted()) {
    const matchInfo = MATCHES.find(m => m.id === matchId);
    if (matchInfo) {
      const months: Record<string, number> = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
      const parts = matchInfo.date.split(" ");
      let matchDate: Date;
      if (parts.length === 2 && parts[0]) {
        const month = months[parts[0].toLowerCase().slice(0, 3)] ?? 0;
        const day = parseInt(parts[1], 10);
        matchDate = new Date(Date.UTC(2026, month, isNaN(day) ? 0 : day));
      } else {
        matchDate = new Date(matchInfo.date);
      }
      const today = new Date();
      matchDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (matchDate < today) {
        return { score: [0, 0], goals: [], status: "finished" };
      }
    }
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

  const { getAllMatchResults } = await import("@/lib/storage");
  const allResults = await getAllMatchResults();
  const rosterKeys = new Set(getAllPlayers().map(p => normalizePlayerName(p.name)));
  const goalCounts = new Map<string, { name: string; teamId: string; goals: number; matches: Set<string> }>();

  for (const [matchId, result] of Object.entries(allResults)) {
    if (result.status !== "finished") continue;
    for (const g of result.goals) {
      if (g.isOwnGoal) continue;
      if (!rosterKeys.has(normalizePlayerName(g.playerName))) continue;
      const key = `${g.teamId}-${g.playerName}`;
      const existing = goalCounts.get(key);
      if (existing) {
        existing.goals++;
        existing.matches.add(matchId);
      } else {
        goalCounts.set(key, { name: g.playerName, teamId: g.teamId, goals: 1, matches: new Set([matchId]) });
      }
    }
  }

  if (goalCounts.size === 0) return null;

  const top = [...goalCounts.entries()].sort((a, b) => b[1].goals - a[1].goals)[0];
  if (!top) return null;

  const { name, teamId, goals, matches } = top[1];
  const t = getTeamById(teamId);
  const teamName = t?.name || teamId;

  return {
    name,
    teamId,
    reason: `Top scorer with ${goals} goal${goals > 1 ? "s" : ""} in ${matches.size} match${matches.size > 1 ? "es" : ""}`,
    photo: undefined,
    stats: [
      { label: "Goals", value: String(goals) },
      { label: "Matches", value: String(matches.size) },
      { label: "Team", value: teamName },
    ],
  };
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
    const score = Array.isArray(result.score) && result.score.length >= 2 ? result.score : [0, 0];
    const goals1 = Number(score[0]) || 0;
    const goals2 = Number(score[1]) || 0;

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

function normalizePlayerName(name: string): string {
  return name.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9\s-]/g, "").trim();
}

function getOrCreateEntry<T extends { playerName: string; teamId: string; teamName: string; teamFlag: string; position: string }>(
  map: Record<string, T>,
  teamId: string,
  playerName: string,
): T | null {
  const exact = `${teamId}-${playerName}`;
  if (map[exact]) return map[exact];
  const normalized = normalizePlayerName(playerName);
  for (const k of Object.keys(map)) {
    if (k.startsWith(`${teamId}-`) && normalizePlayerName(k.slice(teamId.length + 1)) === normalized) {
      return map[k];
    }
  }
  return null;
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
      playerName: p.name, teamId: p.teamId, teamName: p.teamName, teamFlag: p.teamFlag,
      position: p.position, goals: 0, matches: 0, teamGroup: getTeamById(p.teamId)?.group || "",
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
      if (g.isOwnGoal) continue;
      const entry = getOrCreateEntry(map, g.teamId, g.playerName);
      if (!entry) continue;
      entry.goals++;
    }
  }

  return Object.values(map)
    .filter((s) => s.goals > 0)
    .sort((a, b) => b.goals - a.goals || b.matches - a.matches)
    .slice(0, limit);
}

export interface AssistEntry {
  playerName: string;
  teamId: string;
  teamName: string;
  teamFlag: string;
  position: string;
  assists: number;
  matches: number;
  teamGroup: string;
}

export interface CardEntry {
  playerName: string;
  teamId: string;
  teamName: string;
  teamFlag: string;
  position: string;
  yellowCards: number;
  redCards: number;
  matches: number;
  teamGroup: string;
}

export function computeTopAssistsFromResults(
  results: Record<string, StoredMatchResult>,
  limit = 30,
): AssistEntry[] {
  const all = getAllPlayers();
  const map: Record<string, AssistEntry> = {};
  for (const p of all) {
    const k = `${p.teamId}-${p.name}`;
    map[k] = {
      playerName: p.name, teamId: p.teamId, teamName: p.teamName, teamFlag: p.teamFlag,
      position: p.position, assists: 0, matches: 0, teamGroup: getTeamById(p.teamId)?.group || "",
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

    for (const a of (result.assists || [])) {
      const entry = getOrCreateEntry(map, a.teamId, a.playerName);
      if (!entry) continue;
      entry.assists++;
    }
  }

  return Object.values(map)
    .filter((s) => s.assists > 0)
    .sort((a, b) => b.assists - a.assists || b.matches - a.matches)
    .slice(0, limit);
}

export function computeTopCardsFromResults(
  results: Record<string, StoredMatchResult>,
  limit = 30,
): CardEntry[] {
  const all = getAllPlayers();
  const map: Record<string, CardEntry> = {};
  for (const p of all) {
    const k = `${p.teamId}-${p.name}`;
    map[k] = {
      playerName: p.name, teamId: p.teamId, teamName: p.teamName, teamFlag: p.teamFlag,
      position: p.position, yellowCards: 0, redCards: 0, matches: 0, teamGroup: getTeamById(p.teamId)?.group || "",
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

    for (const c of (result.cards || [])) {
      const entry = getOrCreateEntry(map, c.teamId, c.playerName);
      if (!entry) continue;
      if (c.card === 2) entry.redCards++;
      else entry.yellowCards++;
    }
  }

  return Object.values(map)
    .filter((s) => s.yellowCards > 0 || s.redCards > 0)
    .sort((a, b) => b.yellowCards - a.yellowCards || b.redCards - a.redCards)
    .slice(0, limit);
}

export function getBracketData(dynamicResults?: Record<string, StoredMatchResult>): KnockoutMatch[] {
  const bracket = getSimulatedBracket(dynamicResults);
  if (!isWcStarted()) {
    return bracket.map((m) => ({ ...m, score1: undefined, score2: undefined }));
  }
  return bracket;
}
