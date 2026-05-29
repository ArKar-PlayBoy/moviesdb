import { NextResponse } from "next/server";
import { getLiveMatches } from "@/lib/sportsrc";

export async function GET() {
  try {
    const matches = await getLiveMatches();
    return NextResponse.json({ matches });
  } catch {
    return NextResponse.json({ matches: [] });
  }
}
