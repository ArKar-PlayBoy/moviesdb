import { getAllPlayerPhotos } from "@/lib/player-photo-map";
import { getWorldCupSelection } from "@/data/worldcup-2026";
import PlayersContent from "./players-content";

export default async function PlayersPage() {
  const photoMap = await getAllPlayerPhotos();
  const selection = new Set(getWorldCupSelection().map(p => p.name));
  return <PlayersContent initialPhotos={photoMap} worldCupSelection={selection} />;
}
