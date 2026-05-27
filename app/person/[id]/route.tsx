import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const res = await fetch(`https://api.themoviedb.org/3/person/${id}?language=en-US`, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch person" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
