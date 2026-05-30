import type { Metadata } from "next";
import StandingsClient from "./standings-client";

export const metadata: Metadata = {
  title: "Group Standings — FIFA World Cup 2026",
  description: "Live group standings for all 12 groups at the FIFA World Cup 2026. Points, goals, and qualification positions.",
};

export default function StandingsPage() {
  return <StandingsClient />;
}
