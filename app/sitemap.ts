import type { MetadataRoute } from "next";
import { getAllPlayers, getAllTeams } from "@/data/worldcup-2026";
import { slugify } from "@/data/worldcup-2026";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://worldcup2026.vercel.app";

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/matches`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/players`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/venues`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/bracket`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  const teamPages = getAllTeams().map((t) => ({
    url: `${base}/team/${t.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const playerPages = getAllPlayers().map((p) => ({
    url: `${base}/player/${slugify(p.name)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...teamPages, ...playerPages];
}
