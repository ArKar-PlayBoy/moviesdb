import MatchesClient from "./matches-client";
import { getAllPlayerPhotos } from "@/lib/player-photo-map";

export default async function MatchesPage() {
  const starPhotos = await getAllPlayerPhotos();
  return <MatchesClient starPhotos={starPhotos} />;
}
