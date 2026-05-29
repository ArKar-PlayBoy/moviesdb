import { getAllPlayers, type PlayerWithTeam } from "@/data/worldcup-2026";
import { resolvePlayerPhotos } from "@/lib/player-photos";
import PlayersContent from "./players-content";

const PER_PAGE = 24;

export default async function PlayersPage() {
  const allPlayers = getAllPlayers();
  const firstPage = allPlayers.slice(0, PER_PAGE);
  const photoMap = await resolvePlayerPhotos(firstPage.map(p => p.name));
  const initialPhotos: Record<string, string | null> = {};
  photoMap.forEach((url, name) => { initialPhotos[name] = url; });
  return <PlayersContent allPlayers={allPlayers} initialPhotos={initialPhotos} />;
}
