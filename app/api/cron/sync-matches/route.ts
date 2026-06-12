import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { MATCHES, getTeamName } from "@/data/worldcup-2026";
import { getMatchData } from "@/lib/data-service";
import { getMatchResult, setMatchResult } from "@/lib/storage";

export const maxDuration = 120;

const TEAM_NAME_ALIASES: Record<string, string> = {
  "korearepublic": "southkorea",
  "czechia": "czechrepublic",
  "unitedstates": "usa",
  "bosniaherzegovina": "bosnia",
  "ivorycoast": "côtedivoire",
  "iran": "irán",
};

function normName(name: string): string {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return TEAM_NAME_ALIASES[normalized] || normalized;
}

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
    // Pre-fetch all SportSRC matches once for efficient team-name matching
    const allSportSRCMatches: { homeTeam?: { name?: string }; awayTeam?: { name?: string }; homeScore?: { current?: number }; awayScore?: { current?: number }; home_score?: number; away_score?: number; status?: string }[] = [];
    const sportsrcKey = process.env.SPORTSRC_KEY || "";
    if (sportsrcKey) {
      const [finishedRes, liveRes] = await Promise.all([
        fetch(`https://api.sportsrc.org/v2/?type=matches&sport=football&status=finished&days=7&api_key=${sportsrcKey}`, { next: { revalidate: 30 } }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`https://api.sportsrc.org/v2/?type=matches&sport=football&status=inprogress&api_key=${sportsrcKey}`, { next: { revalidate: 30 } }).then(r => r.ok ? r.json() : null).catch(() => null),
      ]);
      if (finishedRes?.data) allSportSRCMatches.push(...finishedRes.data);
      if (liveRes?.data) allSportSRCMatches.push(...liveRes.data);
    }

    const results: Record<string, { status: string }> = {};
    const changedIds: string[] = [];
    const batchSize = 5;
    let persisted = 0;

    for (let i = 0; i < MATCHES.length; i += batchSize) {
      const batch = MATCHES.slice(i, i + batchSize);
      const entries = await Promise.all(
        batch.map(async (m) => {
          const team1Display = normName(getTeamName(m.team1));
          const team2Display = normName(getTeamName(m.team2));

          const hit = allSportSRCMatches.find(sm => {
            const home = normName(sm.homeTeam?.name || "");
            const away = normName(sm.awayTeam?.name || "");
            return (home === team1Display && away === team2Display) ||
                   (home === team2Display && away === team1Display);
          });

          if (hit) {
            const homeScore = hit.homeScore?.current ?? hit.home_score ?? 0;
            const awayScore = hit.awayScore?.current ?? hit.away_score ?? 0;
            const status = hit.status === "inprogress" ? "live" : hit.status === "finished" ? "finished" : "scheduled";
            return { matchId: m.id, score: [homeScore, awayScore] as [number, number], goals: [] as { playerName: string; teamId: string; minute: number; isPenalty: boolean; isOwnGoal: boolean }[], status: status as "scheduled" | "live" | "finished" };
          }

          return getMatchData(m.id, m.team1, m.team2).then(d => ({
            matchId: m.id,
            score: d.score,
            goals: d.goals,
            status: d.status,
          }));
        })
      );

      for (const entry of entries) {
        results[entry.matchId] = { status: entry.status };
        if (entry.status !== "scheduled") {
          const prev = await getMatchResult(entry.matchId);
          const changed = !prev || prev.score[0] !== entry.score[0] || prev.score[1] !== entry.score[1] || prev.status !== entry.status;
          const stored = await setMatchResult(entry.matchId, {
            score: entry.score,
            goals: entry.goals,
            status: entry.status,
            updatedAt: new Date().toISOString(),
          });
          if (stored) persisted++;
          if (changed && stored) changedIds.push(entry.matchId);
        }
      }
    }

    const revalidated = new Set<string>();

    // On-demand ISR: revalidate affected pages so data updates instantly
    if (persisted > 0) {
      revalidatePath("/");
      revalidatePath("/matches");
      revalidatePath("/stats");
      revalidatePath("/top-scorers");
      revalidatePath("/standings");
      revalidated.add("/");
      revalidated.add("/matches");
      revalidated.add("/stats");
      revalidated.add("/top-scorers");
      revalidated.add("/standings");
    }
    for (const mid of changedIds) {
      const path = `/match/${mid}` as const;
      revalidatePath(path);
      revalidated.add(path);
    }

    const live = Object.values(results).filter(r => r.status === "live").length;
    const finished = Object.values(results).filter(r => r.status === "finished").length;

    return NextResponse.json({
      ok: true,
      updatedAt: new Date().toISOString(),
      total: MATCHES.length,
      live,
      finished,
      scheduled: MATCHES.length - live - finished,
      persisted,
      revalidated: Array.from(revalidated),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
