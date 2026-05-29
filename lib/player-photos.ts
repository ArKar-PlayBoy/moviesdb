const WIKI_BASE = "https://en.wikipedia.org/api/rest_v1/page/summary";

const photoCache = new Map<string, string | null>();

export async function resolvePlayerPhoto(name: string): Promise<string | null> {
  if (photoCache.has(name)) return photoCache.get(name) ?? null;
  try {
    const res = await fetch(`${WIKI_BASE}/${encodeURIComponent(name)}`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) { photoCache.set(name, null); return null; }
    const data = await res.json();
    const url = data?.thumbnail?.source || null;
    photoCache.set(name, url);
    return url;
  } catch {
    photoCache.set(name, null);
    return null;
  }
}

export async function resolvePlayerPhotos(names: string[]): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>();
  const uncached = names.filter(n => !photoCache.has(n));

  const batchSize = 5;
  for (let i = 0; i < uncached.length; i += batchSize) {
    const batch = uncached.slice(i, i + batchSize);
    await Promise.all(batch.map(async (name) => {
      try {
        const res = await fetch(`${WIKI_BASE}/${encodeURIComponent(name)}`, {
          next: { revalidate: 86400 },
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const data = await res.json();
          photoCache.set(name, data?.thumbnail?.source || null);
        } else {
          photoCache.set(name, null);
        }
      } catch {
        photoCache.set(name, null);
      }
    }));
  }

  for (const name of names) {
    result.set(name, photoCache.get(name) ?? null);
  }
  return result;
}
