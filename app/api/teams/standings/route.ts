import { NextResponse } from "next/server";
import TEAMS, { getGroupStandings, type TeamData } from "@/data/worldcup-2026";
import { getStandings } from "@/lib/data-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const group = searchParams.get("group") || "";

  const tryLive = !group ? await getStandings("A") : await getStandings(group.toUpperCase());

  if (tryLive) {
    return NextResponse.json(tryLive, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" },
    });
  }

  let body: Record<string, unknown>;

  if (!group) {
    const allStandings = TEAMS.reduce<Record<string, ReturnType<typeof getGroupStandings>>>((acc: Record<string, ReturnType<typeof getGroupStandings>>, t: TeamData) => {
      if (!acc[t.group]) acc[t.group] = getGroupStandings(t.group);
      return acc;
    }, {});
    body = allStandings;
  } else {
    const standings = getGroupStandings(group.toUpperCase());
    body = { [group.toUpperCase()]: standings };
  }

  return NextResponse.json(body, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
