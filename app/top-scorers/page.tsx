import type { Metadata } from "next";
import TopScorersClient from "./top-scorers-client";
import { getAllPlayerPhotos } from "@/lib/player-photo-map";
import { getAllMatchResults } from "@/lib/storage";

export const metadata: Metadata = {
  title: "Top Scorers — FIFA World Cup 2026",
  description: "Leading goal scorers at the FIFA World Cup 2026. Golden Boot race with goals and match statistics.",
};

export default async function TopScorersPage() {
  const [scorerPhotos, allResults] = await Promise.all([
    getAllPlayerPhotos(),
    getAllMatchResults(),
  ]);

  const totalGoals = Object.values(allResults).reduce((sum, r) => {
    if (r.status === "finished") return sum + r.score[0] + r.score[1];
    return sum;
  }, 0);
  const totalMatchesPlayed = Object.values(allResults).filter(r => r.status === "finished" || r.status === "live").length;

  return <TopScorersClient scorerPhotos={scorerPhotos} totalGoals={totalGoals} totalMatchesPlayed={totalMatchesPlayed} />;
}
