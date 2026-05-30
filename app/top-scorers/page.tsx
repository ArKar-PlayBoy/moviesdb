import TopScorersClient from "./top-scorers-client";
import { getAllPlayerPhotos } from "@/lib/player-photo-map";

export default async function TopScorersPage() {
  const scorerPhotos = await getAllPlayerPhotos();
  return <TopScorersClient scorerPhotos={scorerPhotos} />;
}
