import { createClient } from "redis";

export interface StoredMatchResult {
  score: [number, number];
  goals: { playerName: string; teamId: string; minute: number; isPenalty: boolean; isOwnGoal: boolean }[];
  assists: { playerName: string; teamId: string; minute: number }[];
  cards: { playerName: string; teamId: string; minute: string; card: number }[];
  status: "scheduled" | "live" | "finished";
  updatedAt: string;
  team1?: string;
  team2?: string;
  date?: string;
  venue?: string;
  stage?: string;
}

const TTL_SECONDS = 604800;
const SSR_CACHE_TTL = 30_000;
const DATA_VERSION = 3;

let client: ReturnType<typeof createClient> | null = null;

const memoryStore = new Map<string, string>();
const memoryMatchIds = new Set<string>();

let ssrCache: { data: Record<string, StoredMatchResult> | null; ts: number } | null = null;
let fileLoaded = false;

function shouldUseMemoryFallback(): boolean {
  return !process.env.REDIS_URL;
}

function getDataFilePath(): string {
  return require("path").join(process.cwd(), "data", "live-results.json");
}

function loadFromFile(): void {
  if (fileLoaded) return;
  fileLoaded = true;
  try {
    const fs = require("fs") as typeof import("fs");
    const filePath = getDataFilePath();
    if (!fs.existsSync(filePath)) return;
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    const matches = parsed.matches || {};
    for (const id of Object.keys(matches)) {
      const entry = matches[id];
      if (!entry) continue;

      if (entry.score1 !== undefined) {
        const stored = {
          score: [entry.score1 ?? 0, entry.score2 ?? 0] as [number, number],
          goals: (entry.goalScorers || []).map((g: { playerName: string; teamId: string; minute: number }) => ({
            playerName: g.playerName,
            teamId: g.teamId || "",
            minute: g.minute || 0,
            isPenalty: false,
            isOwnGoal: false,
          })),
          assists: [] as { playerName: string; teamId: string; minute: number }[],
          cards: [] as { playerName: string; teamId: string; minute: string; card: number }[],
          status: "finished" as const,
          updatedAt: parsed.updatedAt || "",
          _v: DATA_VERSION,
        };
        memoryStore.set(id, JSON.stringify(stored));
        memoryMatchIds.add(id);
      } else {
        const payload = JSON.stringify({ ...entry, _v: DATA_VERSION });
        memoryStore.set(id, payload);
        memoryMatchIds.add(id);
      }
    }
  } catch {
    // File not found or invalid format — start fresh
  }
}

export function persistToFile(): void {
  try {
    const fs = require("fs") as typeof import("fs");
    const filePath = getDataFilePath();
    const matches: Record<string, unknown> = {};
    for (const id of memoryMatchIds) {
      const raw = memoryStore.get(id);
      if (raw) matches[id] = JSON.parse(raw);
    }
    const output = JSON.stringify(
      { updatedAt: new Date().toISOString(), matches },
      null,
      2,
    );
    fs.writeFileSync(filePath, output, "utf-8");
  } catch {
    // Silently fail on Vercel (read-only filesystem)
  }
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
    if (memoryStore.size === 0 && !fileLoaded) loadFromFile();
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
  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };
  const parts = dateStr.split(" ");
  let matchDate: Date;
  if (parts.length === 2 && parts[0]) {
    const month = months[parts[0].toLowerCase().slice(0, 3)] ?? 0;
    const day = parseInt(parts[1], 10);
    matchDate = new Date(Date.UTC(2026, month, isNaN(day) ? 0 : day));
  } else {
    matchDate = new Date(dateStr);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return matchDate < today;
}

export async function getAllMatchResults(): Promise<Record<string, StoredMatchResult>> {
  if (ssrCache && Date.now() - ssrCache.ts < SSR_CACHE_TTL) {
    return ssrCache.data ?? {};
  }

  const result: Record<string, StoredMatchResult> = {};

  // Always load from file first (source of truth)
  if (memoryStore.size === 0 && !fileLoaded) loadFromFile();
  for (const id of memoryMatchIds) {
    const raw = memoryStore.get(id);
    if (raw) {
      const parsed = parseStoredResult(raw);
      if (parsed) result[id] = parsed;
    }
  }

  // If Redis is available and has more data, merge it
  if (!shouldUseMemoryFallback()) {
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
          for (const [id, data] of entries) {
            if (data && !result[id]) result[id] = data;
          }
        }
      } catch {
        // Redis error, keep file data
      }
    }
  }

  ssrCache = { data: result, ts: Date.now() };
  return result;
}
