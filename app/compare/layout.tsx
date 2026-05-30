import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Comparison — FIFA World Cup 2026",
  description: "Compare FIFA World Cup 2026 teams side-by-side. Stats, rankings, squad depth, and head-to-head analysis.",
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
