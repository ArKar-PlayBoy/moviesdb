import { getAllPlayers } from "@/data/worldcup-2026";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const WIKI_BASE = "https://en.wikipedia.org/api/rest_v1/page/summary";
const MEMO_KEY = "__playerWikiCache";

const CACHE_DIR = path.join(process.cwd(), ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "player-wiki.json");

interface WikiCache {
  photos: Record<string, string | null>;
  descriptions: Record<string, string | null>;
  wikiUrls: Record<string, string | null>;
}

async function getCache(): Promise<WikiCache | null> {
  const g = globalThis as unknown as { [key: string]: unknown };
  if (g[MEMO_KEY]) return g[MEMO_KEY] as WikiCache;
  try {
    if (existsSync(CACHE_FILE)) {
      const data = JSON.parse(await readFile(CACHE_FILE, "utf-8"));
      g[MEMO_KEY] = data;
      return data;
    }
  } catch {}
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

export async function getAllPlayerPhotos(): Promise<Record<string, string | null>> {
  const cached = await getCache();
  if (cached) return cached.photos;

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
  return photos;
}

export async function getPlayerDescription(name: string): Promise<string | null> {
  const cached = await getCache();
  if (cached) return cached.descriptions[name] ?? null;
  await getAllPlayerPhotos();
  const refilled = await getCache();
  return refilled?.descriptions[name] ?? null;
}

export async function getPlayerWikiUrl(name: string): Promise<string | null> {
  const cached = await getCache();
  if (cached) return cached.wikiUrls[name] ?? null;
  await getAllPlayerPhotos();
  const refilled = await getCache();
  return refilled?.wikiUrls[name] ?? null;
}
