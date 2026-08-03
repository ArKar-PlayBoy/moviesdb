import { NextRequest, NextResponse } from "next/server";
import { getWikipediaImage } from "@/lib/player-image";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";

  // This route triggers a server-side Wikipedia fetch per request, so keep a tight limit.
  const rateLimitResult = await rateLimit(`player-image:${ip}`, 30, 60);
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const name = (req.nextUrl.searchParams.get("name") || "").trim().slice(0, 200);
  if (!name) {
    return NextResponse.json({ error: "Missing name parameter" }, { status: 400 });
  }

  try {
    const image = await getWikipediaImage(name);
    return NextResponse.json({ image }, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
