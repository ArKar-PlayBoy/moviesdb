import { createClient } from "redis";

export interface StoredMatchResult {
  score: [number, number];
  goals: { playerName: string; teamId: string; minute: number; isPenalty: boolean; isOwnGoal: boolean }[];
  assists: { playerName: string; teamId: string; minute: number }[];
  cards: { playerName: string; teamId: string; minute: string; card: number }[];
  status: "scheduled" | "live" | "finished";
  updatedAt: string;
}

const TTL_SECONDS = 604800; // 7 days — refreshed every 30min by cron
const SSR_CACHE_TTL = 30_000; // 30 seconds in-memory cache for SSR pages
const DATA_VERSION = 2; // Increment to invalidate all cached data on deploy

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

export function clearMemoryStore(): void {
  memoryStore.clear();
  memoryMatchIds.clear();
  clearSSRCache();
}

export async function clearAllMatchResults(): Promise<void> {
  clearMemoryStore();
  const c = await getClient();
  if (!c) return;
  try {
    await c.del("matches");
    await c.del("match_ids");
  } catch {}
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

  const payload = JSON.stringify({ ...data, _v: DATA_VERSION });

  if (shouldUseMemoryFallback()) {
    memoryStore.set(matchId, payload);
    memoryMatchIds.add(matchId);
    clearSSRCache();
    return true;
  }

  const c = await getClient();
  if (!c) return false;
  try {
    await c.hSet("matches", matchId, payload);
    await c.expire("matches", TTL_SECONDS);
    await c.sAdd("match_ids", matchId);
    await c.expire("match_ids", TTL_SECONDS);
    clearSSRCache();
    return true;
  } catch {
    return false;
  }
}

function parseStoredResult(raw: string): StoredMatchResult | null {
  const parsed = JSON.parse(raw);
  if (parsed._v !== DATA_VERSION) return null;
  return parsed as StoredMatchResult;
}

export async function getMatchResult(matchId: string): Promise<StoredMatchResult | null> {
  if (!isValidMatchId(matchId)) return null;

  if (shouldUseMemoryFallback()) {
    const raw = memoryStore.get(matchId);
    return raw ? parseStoredResult(raw) : null;
  }

  const c = await getClient();
  if (!c) {
    const raw = memoryStore.get(matchId);
    return raw ? parseStoredResult(raw) : null;
  }
  try {
    const raw = await c.hGet("matches", matchId);
    return raw ? parseStoredResult(raw) : null;
  } catch {
    return null;
  }
}

function isDateBeforeToday(dateStr: string): boolean {
  const matchDate = new Date(`2026 ${dateStr}`);
  const today = new Date();
  matchDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return matchDate < today;
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
      if (raw) {
        const parsed = parseStoredResult(raw);
        if (parsed) result[id] = parsed;
      }
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

  ssrCache = { data: result, ts: Date.now() };
  return result;
}
