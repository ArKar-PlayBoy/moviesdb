import { createClient } from "redis";

export interface StoredMatchResult {
  score: [number, number];
  goals: { playerName: string; teamId: string; minute: number; isPenalty: boolean; isOwnGoal: boolean }[];
  status: "scheduled" | "live" | "finished";
  updatedAt: string;
}

let client: ReturnType<typeof createClient> | null = null;

export async function getClient() {
  if (client?.isOpen) return client;
  if (!process.env.REDIS_URL) return null;
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
  const c = await getClient();
  if (!c) return false;
  try {
    await c.hSet("matches", matchId, JSON.stringify(data));
    await c.sAdd("match_ids", matchId);
    return true;
  } catch {
    return false;
  }
}

export async function getMatchResult(matchId: string): Promise<StoredMatchResult | null> {
  if (!isValidMatchId(matchId)) return null;
  const c = await getClient();
  if (!c) return null;
  try {
    const raw = await c.hGet("matches", matchId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function getAllMatchResults(): Promise<Record<string, StoredMatchResult>> {
  const c = await getClient();
  if (!c) return {};
  try {
    const ids = await c.sMembers("match_ids");
    if (!ids.length) return {};
    const entries = await Promise.all(
      ids.map(async (id: string) => {
        const data = await getMatchResult(id);
        return [id, data] as const;
      })
    );
    return Object.fromEntries(entries.filter(([, d]) => d !== null)) as Record<string, StoredMatchResult>;
  } catch {
    return {};
  }
}
