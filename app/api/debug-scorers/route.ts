import { NextResponse } from "next/server";
import { getAllMatchResults } from "@/lib/storage";

export async function GET() {
  const results = await getAllMatchResults();
  const matchCount = Object.keys(results).length;
  
  // Count goals for top players
  const goalCounts: Record<string, number> = {};
  for (const result of Object.values(results)) {
    if (result.status !== "finished" || !result.goals) continue;
    for (const g of result.goals) {
      if (g.isOwnGoal) continue;
      goalCounts[g.playerName] = (goalCounts[g.playerName] || 0) + 1;
    }
  }
  
  const top = Object.entries(goalCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));
  
  return NextResponse.json({
    matchCount,
    topScorers: top,
    sampleMatch: Object.keys(results)[0] ? results[Object.keys(results)[0]] : null,
  });
}
