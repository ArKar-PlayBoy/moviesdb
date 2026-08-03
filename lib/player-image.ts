export interface WikipediaImageResult {
  source: string;
  width: number;
  height: number;
}

export async function getWikipediaImage(name: string): Promise<WikipediaImageResult | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,
      {
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(3000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.thumbnail?.source) {
      return {
        source: data.thumbnail.source,
        width: data.thumbnail.width || 0,
        height: data.thumbnail.height || 0,
      };
    }
    return null;
  } catch {
    return null;
  }
}
