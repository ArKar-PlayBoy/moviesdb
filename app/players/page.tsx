import type { Metadata } from "next";
import { getAllPlayerPhotos } from "@/lib/player-photo-map";
import { getWorldCupSelection } from "@/data/worldcup-2026";
import PlayersContent from "./players-content";

export const metadata: Metadata = {
  title: "Players — FIFA World Cup 2026",
  description: "Browse all players at the FIFA World Cup 2026. Search by name, team, or position.",
};

export default async function PlayersPage() {
  const photoMap = await getAllPlayerPhotos();
  const selection = new Set(getWorldCupSelection().map(p => p.name));
  return <PlayersContent initialPhotos={photoMap} worldCupSelection={selection} />;
}
