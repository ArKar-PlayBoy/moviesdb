import type { Metadata } from "next";
import StatsClient from "./stats-client";
import { getAllPlayerPhotos } from "@/lib/player-photo-map";
import { getTopScorers, getTopAssists, getTopCards } from "@/data/worldcup-2026";

export const metadata: Metadata = {
  title: "Stats — FIFA World Cup 2026",
  description: "Top goalscorers, assist leaders, and disciplinary records at the FIFA World Cup 2026.",
};

export default async function StatsPage() {
  const [scorerPhotos, scorers, assists, cards] = await Promise.all([
    getAllPlayerPhotos(),
    getTopScorers(200),
    getTopAssists(200),
    getTopCards(200),
  ]);

  return <StatsClient scorerPhotos={scorerPhotos} scorers={scorers} assists={assists} cards={cards} />;
}
