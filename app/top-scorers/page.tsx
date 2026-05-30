import type { Metadata } from "next";
import TopScorersClient from "./top-scorers-client";
import { getAllPlayerPhotos } from "@/lib/player-photo-map";

export const metadata: Metadata = {
  title: "Top Scorers — FIFA World Cup 2026",
  description: "Leading goal scorers at the FIFA World Cup 2026. Golden Boot race with goals and match statistics.",
};

export default async function TopScorersPage() {
  const scorerPhotos = await getAllPlayerPhotos();
  return <TopScorersClient scorerPhotos={scorerPhotos} />;
}
