import type { Metadata } from "next";
import StatsClient from "./stats-client";
import { getAllPlayerPhotos } from "@/lib/player-photo-map";
import { getTopScorers } from "@/data/worldcup-2026";
import { computeTopAssistsFromResults, computeTopCardsFromResults } from "@/lib/data-service";
import { getAllMatchResults } from "@/lib/storage";

export const metadata: Metadata = {
  title: "Stats — FIFA World Cup 2026",
  description: "Top goalscorers, assist leaders, and disciplinary records at the FIFA World Cup 2026.",
};

export default async function StatsPage() {
  const [scorerPhotos] = await Promise.all([
    getAllPlayerPhotos(),
  ]);

  const allResults = await getAllMatchResults();
  const hasResults = Object.keys(allResults).length > 0;
  const scorers = getTopScorers(200, allResults);
  const assists = hasResults ? computeTopAssistsFromResults(allResults, 200) : [];
  const cards = hasResults ? computeTopCardsFromResults(allResults, 200) : [];

  const totalGoals = Object.values(allResults).reduce((sum, r) => {
    if (r.status === "finished") return sum + r.score[0] + r.score[1];
    return sum;
  }, 0);
  const totalMatchesPlayed = Object.values(allResults).filter(r => r.status === "finished" || r.status === "live").length;

  return <StatsClient scorerPhotos={scorerPhotos} scorers={scorers} assists={assists} cards={cards} totalGoals={totalGoals} totalMatchesPlayed={totalMatchesPlayed} />;
}
