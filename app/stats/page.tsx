import type { Metadata } from "next";
import StatsClient from "./stats-client";
import { getAllPlayerPhotos } from "@/lib/player-photo-map";
import { getTopScorers, getTopAssists, getTopCards } from "@/data/worldcup-2026";
import { computeTopScorersFromResults } from "@/lib/data-service";
import { getAllMatchResults } from "@/lib/storage";

export const metadata: Metadata = {
  title: "Stats — FIFA World Cup 2026",
  description: "Top goalscorers, assist leaders, and disciplinary records at the FIFA World Cup 2026.",
};

export default async function StatsPage() {
  const [scorerPhotos, assists, cards] = await Promise.all([
    getAllPlayerPhotos(),
    getTopAssists(200),
    getTopCards(200),
  ]);

  const allResults = await getAllMatchResults();
  const hasResults = Object.keys(allResults).length > 0;
  const scorers = hasResults ? computeTopScorersFromResults(allResults, 200) : getTopScorers(200);

  const totalGoals = Object.values(allResults).reduce((sum, r) => {
    if (r.status === "finished") return sum + r.score[0] + r.score[1];
    return sum;
  }, 0);
  const totalMatchesPlayed = Object.values(allResults).filter(r => r.status === "finished" || r.status === "live").length;

  return <StatsClient scorerPhotos={scorerPhotos} scorers={scorers} assists={assists} cards={cards} totalGoals={totalGoals} totalMatchesPlayed={totalMatchesPlayed} />;
}
