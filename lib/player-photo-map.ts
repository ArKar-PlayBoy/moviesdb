import { getAllPlayers } from "@/data/worldcup-2026";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const WIKI_BASE = "https://en.wikipedia.org/api/rest_v1/page/summary";
const MEMO_KEY = "__playerWikiCache";

const CACHE_DIR = path.join(process.cwd(), ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "player-wiki.json");
const COMMITTED_FILE = path.join(process.cwd(), "data", "player-wiki.json");

interface WikiCache {
  photos: Record<string, string | null>;
  descriptions: Record<string, string | null>;
  wikiUrls: Record<string, string | null>;
}

async function readCacheFile(filePath: string): Promise<WikiCache | null> {
  try {
    if (existsSync(filePath)) {
      const data = JSON.parse(await readFile(filePath, "utf-8"));
      if (data && typeof data === "object" && "photos" in data) return data;
    }
  } catch {}
  return null;
}

async function getCache(): Promise<WikiCache | null> {
  const g = globalThis as unknown as { [key: string]: unknown };
  if (g[MEMO_KEY]) return g[MEMO_KEY] as WikiCache;
  // Prefer the committed cache (bundled with the app) so cold starts and builds
  // never fan out to Wikipedia for all 240 players.
  const committed = await readCacheFile(COMMITTED_FILE);
  if (committed) {
    g[MEMO_KEY] = committed;
    return committed;
  }
  const runtime = await readCacheFile(CACHE_FILE);
  if (runtime) {
    g[MEMO_KEY] = runtime;
    return runtime;
  }
  return null;
}

async function persistCache(cache: WikiCache): Promise<void> {
  const g = globalThis as unknown as { [key: string]: unknown };
  g[MEMO_KEY] = cache;
  try {
    if (!existsSync(CACHE_DIR)) await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(CACHE_FILE, JSON.stringify(cache), "utf-8");
  } catch {}
}

async function fetchPlayerData(name: string): Promise<{ photo: string | null; description: string | null; wikipediaUrl: string | null }> {
  try {
    const res = await fetch(`${WIKI_BASE}/${encodeURIComponent(name)}`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return { photo: null, description: null, wikipediaUrl: null };
    const data = await res.json();
    return {
      photo: data?.thumbnail?.source || null,
      description: data?.extract || null,
      wikipediaUrl: data?.content_urls?.desktop?.page || null,
    };
  } catch {
    return { photo: null, description: null, wikipediaUrl: null };
  }
}

async function ensureCached(): Promise<WikiCache | null> {
  const cached = await getCache();
  if (cached) return cached;

  const players = getAllPlayers();
  const photos: Record<string, string | null> = {};
  const descriptions: Record<string, string | null> = {};
  const wikiUrls: Record<string, string | null> = {};

  const batchSize = 5;
  for (let i = 0; i < players.length; i += batchSize) {
    const batch = players.slice(i, i + batchSize);
    const entries = await Promise.all(batch.map(p => fetchPlayerData(p.name)));
    for (let j = 0; j < batch.length; j++) {
      photos[batch[j].name] = entries[j].photo;
      descriptions[batch[j].name] = entries[j].description;
      wikiUrls[batch[j].name] = entries[j].wikipediaUrl;
    }
  }

  const cache: WikiCache = { photos, descriptions, wikiUrls };
  await persistCache(cache);
  return cache;
}

export async function getPlayerData(name: string): Promise<{ photo: string | null; description: string | null; wikipediaUrl: string | null }> {
  const cache = await getCache();
  if (cache) {
    return {
      photo: cache.photos[name] ?? null,
      description: cache.descriptions[name] ?? null,
      wikipediaUrl: cache.wikiUrls[name] ?? null,
    };
  }
  // No cache available: fetch just this player (bounded, never the full roster).
  return fetchPlayerData(name);
}

export async function getAllPlayerPhotos(): Promise<Record<string, string | null>> {
  const cache = await ensureCached();
  return cache?.photos ?? {};
}

export async function getPlayerPhotoSet(names: string[]): Promise<Record<string, string | null>> {
  const photos: Record<string, string | null> = {};
  const missing: string[] = [];
  let existingCache = await getCache();

  if (existingCache) {
    for (const name of names) {
      if (name in existingCache.photos) {
        photos[name] = existingCache.photos[name];
      } else {
        missing.push(name);
      }
    }
  } else {
    missing.push(...names);
  }

  if (missing.length > 0) {
    const entries = await Promise.all(missing.map(fetchPlayerData));
    for (let i = 0; i < missing.length; i++) {
      photos[missing[i]] = entries[i].photo;
    }
    if (!existingCache) {
      existingCache = { photos: {}, descriptions: {}, wikiUrls: {} };
    }
    for (const name of missing) {
      existingCache.photos[name] = photos[name];
    }
    await persistCache(existingCache);
  }

  return photos;
}
