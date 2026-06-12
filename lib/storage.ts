import { createClient } from "redis";
import { getTeamById, MATCHES } from "@/data/worldcup-2026";

export interface StoredMatchResult {
  score: [number, number];
  goals: { playerName: string; teamId: string; minute: number; isPenalty: boolean; isOwnGoal: boolean }[];
  status: "scheduled" | "live" | "finished";
  updatedAt: string;
}

const TTL_SECONDS = 604800; // 7 days — refreshed every 30min by cron
const SSR_CACHE_TTL = 30_000; // 30 seconds in-memory cache for SSR pages

let client: ReturnType<typeof createClient> | null = null;

// In-memory fallback for local dev when Redis is unavailable.
// Data survives within the process lifetime (dev server restart = data reset).
const memoryStore = new Map<string, string>();
const memoryMatchIds = new Set<string>();

// SSR-level cache: prevents hitting Redis on every request.
// Clears after SSR_CACHE_TTL, or immediately after a cron write.
let ssrCache: { data: Record<string, StoredMatchResult> | null; ts: number } | null = null;

function shouldUseMemoryFallback(): boolean {
  return !process.env.REDIS_URL;
}

export function clearSSRCache(): void {
  ssrCache = null;
}

export async function getClient() {
  if (!process.env.REDIS_URL) return null;
  if (client) {
    try {
      await client.ping();
      return client;
    } catch {
      client = null;
    }
  }
  try {
    client = createClient({ url: process.env.REDIS_URL });
    await client.connect();
    return client;
  } catch {
    return null;
  }
}

function isValidMatchId(id: string): boolean {
  return /^[a-zA-Z0-9-]+$/.test(id) && id.length <= 50;
}

export async function setMatchResult(matchId: string, data: StoredMatchResult): Promise<boolean> {
  if (!isValidMatchId(matchId)) return false;

  if (shouldUseMemoryFallback()) {
    memoryStore.set(matchId, JSON.stringify(data));
    memoryMatchIds.add(matchId);
    clearSSRCache();
    return true;
  }

  const c = await getClient();
  if (!c) return false;
  try {
    await c.hSet("matches", matchId, JSON.stringify(data));
    await c.expire("matches", TTL_SECONDS);
    await c.sAdd("match_ids", matchId);
    await c.expire("match_ids", TTL_SECONDS);
    clearSSRCache();
    return true;
  } catch {
    return false;
  }
}

export async function getMatchResult(matchId: string): Promise<StoredMatchResult | null> {
  if (!isValidMatchId(matchId)) return null;

  if (shouldUseMemoryFallback()) {
    const raw = memoryStore.get(matchId);
    return raw ? JSON.parse(raw) : null;
  }

  const c = await getClient();
  if (!c) {
    // Client unavailable but REDIS_URL is set — try memory as last resort
    const raw = memoryStore.get(matchId);
    return raw ? JSON.parse(raw) : null;
  }
  try {
    const raw = await c.hGet("matches", matchId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function isDateBeforeToday(dateStr: string): boolean {
  const matchDate = new Date(`2026 ${dateStr}`);
  const today = new Date();
  matchDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return matchDate < today;
}

export function generateFallbackResult(
  matchId: string,
  team1Id: string,
  team2Id: string,
  matchDate?: string,
): { score: [number, number]; goals: StoredMatchResult["goals"]; status: "scheduled" | "live" | "finished" } {
  // Only generate results for matches scheduled on or before today
  if (matchDate && !isDateBeforeToday(matchDate)) {
    return { score: [0, 0], goals: [], status: "scheduled" };
  }

  const t1 = getTeamById(team1Id);
  const t2 = getTeamById(team2Id);
  if (!t1 || !t2) return { score: [0, 0], goals: [], status: "scheduled" };

  let s = simpleHash(matchId);
  const rng = (max: number): number => {
    s = (s * 16807 + 1) % 2147483647;
    return s % Math.max(1, max + 1);
  };

  const rankDiff = t2.fifaRanking - t1.fifaRanking;
  const t1Base = rankDiff > 10 ? 1 : rankDiff > 0 ? 1 : 0;
  const t2Base = rankDiff < -10 ? 1 : rankDiff < 0 ? 1 : 0;
  const t1Goals = t1Base + rng(rankDiff > 10 ? 2 : rankDiff > 0 ? 1 : 0);
  const t2Goals = t2Base + rng(rankDiff < -10 ? 2 : rankDiff < 0 ? 1 : 0);

  if (t1Goals === 0 && t2Goals === 0) {
    return { score: [0, 0], goals: [], status: "scheduled" };
  }

  const goals: StoredMatchResult["goals"] = [];
  const genMinute = (): number => { s = (s * 16807 + 1) % 2147483647; return 5 + (s % 85); };

  for (let g = 0; g < t1Goals; g++) {
    const pick = pickScorer(t1.players, rng);
    if (pick) goals.push({ playerName: pick, teamId: team1Id, minute: genMinute(), isPenalty: false, isOwnGoal: false });
  }
  for (let g = 0; g < t2Goals; g++) {
    const pick = pickScorer(t2.players, rng);
    if (pick) goals.push({ playerName: pick, teamId: team2Id, minute: genMinute(), isPenalty: false, isOwnGoal: false });
  }
  goals.sort((a, b) => a.minute - b.minute);
  return { score: [t1Goals, t2Goals], goals, status: "finished" };
}

function pickScorer(players: { name: string; position: string }[], rng: (max: number) => number): string | null {
  if (players.length === 0) return null;
  const weighted = players.map(p => ({
    name: p.name,
    weight: p.position === "FW" ? 3 : p.position === "MF" ? 2 : p.position === "DF" ? 1 : 0.2,
  }));
  const total = weighted.reduce((sum, w) => sum + w.weight, 0);
  let roll = rng(Math.floor(total * 100));
  for (const w of weighted) {
    roll -= w.weight * 100;
    if (roll <= 0) return w.name;
  }
  return weighted[0].name;
}

function generateAllFallbackResults(): Record<string, StoredMatchResult> {
  const results: Record<string, StoredMatchResult> = {};
  for (const m of MATCHES) {
    const r = generateFallbackResult(m.id, m.team1, m.team2, m.date);
    if (r.status !== "scheduled") {
      results[m.id] = {
        score: r.score,
        goals: r.goals,
        status: r.status,
        updatedAt: new Date().toISOString(),
      };
    }
  }
  return results;
}

export async function getAllMatchResults(): Promise<Record<string, StoredMatchResult>> {
  // SSR cache hit
  if (ssrCache && Date.now() - ssrCache.ts < SSR_CACHE_TTL) {
    return ssrCache.data ?? {};
  }

  let result: Record<string, StoredMatchResult> = {};

  if (shouldUseMemoryFallback()) {
    for (const id of memoryMatchIds) {
      const raw = memoryStore.get(id);
      if (raw) result[id] = JSON.parse(raw);
    }
  } else {
    const c = await getClient();
    if (c) {
      try {
        const ids = await c.sMembers("match_ids");
        if (ids.length) {
          const entries = await Promise.all(
            ids.map(async (id: string) => {
              const data = await getMatchResult(id);
              return [id, data] as const;
            })
          );
          result = Object.fromEntries(entries.filter(([, d]) => d !== null)) as Record<string, StoredMatchResult>;
        }
      } catch {
        // Redis error, result stays empty
      }
    }
  }

  // If no live data available, seed with deterministic fallback results
  if (Object.keys(result).length === 0) {
    result = generateAllFallbackResults();
  }

  ssrCache = { data: result, ts: Date.now() };
  return result;
}
