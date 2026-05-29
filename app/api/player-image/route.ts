import { NextRequest, NextResponse } from "next/server";
import { getWikipediaImage } from "@/lib/player-image";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) {
    return NextResponse.json({ error: "Missing name parameter" }, { status: 400 });
  }
  const image = await getWikipediaImage(name);
  return NextResponse.json({ image });
}
