const BASE_URL = "https://api.sportsrc.org/v2";
const API_KEY = process.env.SPORTSRC_KEY || "";
const WC_KEYWORDS = ["world cup", "fifa", "worldcup", "world cup 2026", "fifa world cup", "international"];

function isWorldCupMatch(name: string): boolean {
  return WC_KEYWORDS.some(kw => name.toLowerCase().includes(kw));
}

function isWorldCupTeam(name: string): boolean {
  const wcTeams = [
    "mexico", "canada", "usa", "argentina", "brazil", "france", "england", "germany",
    "spain", "portugal", "belgium", "netherlands", "croatia", "uruguay", "colombia",
    "japan", "south korea", "australia", "iran", "saudi arabia", "qatar", "jordan",
    "uzbekistan", "iraq", "morocco", "senegal", "egypt", "algeria", "nigeria",
    "cameroon", "ghana", "ivory coast", "tunisia", "south africa", "switzerland",
    "sweden", "norway", "turkey", "austria", "scotland", "czech republic", "ukraine",
    "poland", "denmark", "hungary", "serbia", "russia", "slovakia", "slovenia",
  ];
  return wcTeams.some(team => name.toLowerCase().includes(team));
}

export interface SportSRCMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: string;
  date: string;
  hasStream?: boolean;
}

export interface SportSRCDetail {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: string;
  date: string;
  venue?: string;
  streamUrl?: string;
  league?: string;
}

async function fetchApi<T>(params: string): Promise<T | null> {
  try {
    const url = `${BASE_URL}/?${params}&api_key=${API_KEY}`;
    const res = await fetch(url, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function parseMatch(data: any): SportSRCMatch {
  return {
    id: String(data.id || data.match_id || ""),
    homeTeam: data.homeTeam?.name || data.home_name || "TBD",
    awayTeam: data.awayTeam?.name || data.away_name || "TBD",
    homeScore: data.homeScore?.current ?? data.home_score,
    awayScore: data.awayScore?.current ?? data.away_score,
    status: data.status || data.state || "unknown",
    date: data.date || "",
    hasStream: data.has_stream || false,
  };
}

function filterWorldCup(matches: SportSRCMatch[]): SportSRCMatch[] {
  return matches.filter(m => isWorldCupTeam(m.homeTeam) && isWorldCupTeam(m.awayTeam));
}

export async function getLiveMatches(): Promise<SportSRCMatch[]> {
  const res = await fetchApi<any>(`type=matches&sport=football&status=inprogress`);
  if (!res || !res.data) return [];
  return filterWorldCup((res.data || []).map(parseMatch));
}

export async function getUpcomingMatches(date?: string): Promise<SportSRCMatch[]> {
  const dateParam = date || new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const res = await fetchApi<any>(`type=matches&sport=football&status=upcoming&date=${dateParam}`);
  if (!res || !res.data) return [];
  return filterWorldCup((res.data || []).map(parseMatch));
}

export async function getFinishedMatches(date?: string): Promise<SportSRCMatch[]> {
  const dateParam = date || new Date().toISOString().split("T")[0];
  const res = await fetchApi<any>(`type=matches&sport=football&status=finished&date=${dateParam}`);
  if (!res || !res.data) return [];
  return filterWorldCup((res.data || []).map(parseMatch));
}

function cleanHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();
}

export async function getMatchDetail(matchId: string): Promise<SportSRCDetail | null> {
  const res = await fetchApi<any>(`type=detail&id=${matchId}`);
  if (!res || !res.data) return null;
  const d = Array.isArray(res.data) ? res.data[0] : res.data;
  return {
    id: String(d.id || ""),
    homeTeam: d.homeTeam?.name || d.home_name || "TBD",
    awayTeam: d.awayTeam?.name || d.away_name || "TBD",
    homeScore: d.homeScore?.current ?? d.home_score,
    awayScore: d.awayScore?.current ?? d.away_score,
    status: d.status || d.state || "unknown",
    date: d.date || "",
    venue: d.venue?.name || d.venue || "",
    streamUrl: d.streamUrl || d.stream?.url || "",
    league: d.league?.name || d.competition || "",
  };
}
