import { NextResponse } from "next/server";
import { getAllMatchResults } from "@/lib/storage";
import { computeTopScorersFromResults } from "@/lib/data-service";

export async function GET() {
  const results = await getAllMatchResults();
  const matchCount = Object.keys(results).length;
  
  // Count goals for top players (raw count)
  const goalCounts: Record<string, number> = {};
  for (const result of Object.values(results)) {
    if (result.status !== "finished" || !result.goals) continue;
    for (const g of result.goals) {
      if (g.isOwnGoal) continue;
      goalCounts[g.playerName] = (goalCounts[g.playerName] || 0) + 1;
    }
  }
  
  const rawTop = Object.entries(goalCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));
  
  // Now call computeTopScorersFromResults
  const computed = computeTopScorersFromResults(results, 10);
  
  return NextResponse.json({
    matchCount,
    rawTopScorers: rawTop,
    computedTopScorers: computed.map(s => ({ name: s.playerName, team: s.teamName, goals: s.goals })),
  });
}
