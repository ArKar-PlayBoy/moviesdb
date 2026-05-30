import type { Metadata } from "next";
import MatchesClient from "./matches-client";
import { getAllPlayerPhotos } from "@/lib/player-photo-map";

export const metadata: Metadata = {
  title: "Match Schedule — FIFA World Cup 2026",
  description: "All 104 matches of the FIFA World Cup 2026. Group stage, knockout rounds, and final fixtures with dates, venues, and results.",
};

export default async function MatchesPage() {
  const starPhotos = await getAllPlayerPhotos();
  return <MatchesClient starPhotos={starPhotos} />;
}
