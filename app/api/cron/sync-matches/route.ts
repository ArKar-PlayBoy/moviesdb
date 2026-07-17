import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { syncAllMatches } from "@/lib/sync-matches";

export const maxDuration = 120;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key") || "";
  const authHeader = request.headers.get("authorization") || "";
  const secret = process.env.CRON_SECRET || "";

  let isAuthorized = false;
  try {
    const bearer = authHeader.replace(/^Bearer\s+/i, "").trim();
    const input = key || bearer;
    if (input.length > 0 && input.length === secret.length) {
      isAuthorized = crypto.timingSafeEqual(Buffer.from(input), Buffer.from(secret));
    }
  } catch {}

  if (!isAuthorized) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await syncAllMatches();

    const revalidated = new Set<string>();
    if (stats.persisted > 0) {
      for (const path of ["/", "/matches", "/stats", "/top-scorers", "/standings"]) {
        revalidatePath(path);
        revalidated.add(path);
      }
    }
    for (const mid of stats.changedIds) {
      const path = `/match/${mid}` as const;
      revalidatePath(path);
      revalidated.add(path);
    }

    return NextResponse.json({
      ok: true,
      updatedAt: new Date().toISOString(),
      ...stats,
      revalidated: Array.from(revalidated),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
