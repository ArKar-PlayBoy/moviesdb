import { NextRequest, NextResponse } from "next/server";
import { getMatchDetail } from "@/lib/sportsrc";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const detail = await getMatchDetail(id);
    return NextResponse.json({ detail });
  } catch {
    return NextResponse.json({ detail: null });
  }
}
