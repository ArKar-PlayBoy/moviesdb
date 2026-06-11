import { NextResponse } from "next/server";
import crypto from "crypto";
import { MATCHES } from "@/data/worldcup-2026";
import { getMatchData } from "@/lib/data-service";
import { setMatchResult } from "@/lib/storage";

export const maxDuration = 120;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key") || "";
  const secret = process.env.CRON_SECRET || "";

  let isAuthorized = false;
  try {
    if (key.length > 0 && key.length === secret.length) {
      isAuthorized = crypto.timingSafeEqual(Buffer.from(key), Buffer.from(secret));
    }
  } catch {}

  if (!isAuthorized) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results: Record<string, unknown> = {};
    const batchSize = 5;
    let persisted = 0;

    for (let i = 0; i < MATCHES.length; i += batchSize) {
      const batch = MATCHES.slice(i, i + batchSize);
      const entries = await Promise.all(
        batch.map(m => getMatchData(m.id, m.team1, m.team2))
      );
      for (let j = 0; j < batch.length; j++) {
        const matchId = batch[j].id;
        const data = entries[j] as { score: [number, number]; goals: unknown[]; status: string };
        results[matchId] = data;
        const stored = await setMatchResult(matchId, {
          score: data.score,
          goals: data.goals as { playerName: string; teamId: string; minute: number; isPenalty: boolean; isOwnGoal: boolean }[],
          status: data.status as "scheduled" | "live" | "finished",
          updatedAt: new Date().toISOString(),
        });
        if (stored) persisted++;
      }
    }

    const live = Object.values(results).filter(r => (r as { status: string }).status === "live").length;
    const finished = Object.values(results).filter(r => (r as { status: string }).status === "finished").length;

    return NextResponse.json({
      ok: true,
      updatedAt: new Date().toISOString(),
      total: MATCHES.length,
      live,
      finished,
      scheduled: MATCHES.length - live - finished,
      persisted,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
