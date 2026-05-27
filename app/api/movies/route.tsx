import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids")?.split(",").map(Number) || [];

  if (ids.length === 0) {
    return NextResponse.json([]);
  }

  const movies = await Promise.all(
    ids.map((id) =>
      fetch(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, {
        headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` },
        next: { revalidate: 86400 },
      }).then((r) => r.json())
    )
  );

  return NextResponse.json(movies);
}
