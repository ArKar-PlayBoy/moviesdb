import { NextRequest, NextResponse } from "next/server";
import { getUpcomingMatches, getFinishedMatches } from "@/lib/sportsrc";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") || "upcoming";
  const date = req.nextUrl.searchParams.get("date") || undefined;
  try {
    const matches = status === "finished"
      ? await getFinishedMatches(date)
      : await getUpcomingMatches(date);
    return NextResponse.json({ matches });
  } catch {
    return NextResponse.json({ matches: [] });
  }
}
