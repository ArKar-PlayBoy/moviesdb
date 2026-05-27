import { MovieType } from "@/types/global";
import Link from "next/link";
import { Suspense } from "react";
import SearchForm from "./search-form";

const url = "http://image.tmdb.org/t/p/w185";

async function searchMovies(query: string): Promise<MovieType[]> {
  const res = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
    },
  });

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return data.results || [];
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";
  const movies = query ? await searchMovies(query) : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Search Movies</h1>
        <Suspense fallback={
          <div className="h-10 w-64 bg-muted animate-pulse rounded-md" />
        }>
          <SearchForm />
        </Suspense>
      </div>

      {query && (
        <p className="mb-4 text-muted-foreground">
          {movies.length} results for &ldquo;{query}&rdquo;
        </p>
      )}

      {movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((movie) => (
            <div key={movie.id} className="text-center">
              <Link href={`/view/${movie.id}`}>
                <img
                  className="hover:scale-105 transition-all rounded-lg"
                  src={url + movie.poster_path}
                  alt={movie.title}
                />
              </Link>
              <h3 className="font-bold mt-2 line-clamp-1">{movie.title}</h3>
              <div className="text-muted-foreground text-sm">
                {movie.release_date?.split("-")[0]}
              </div>
            </div>
          ))}
        </div>
      ) : query ? (
        <p className="text-muted-foreground">No movies found for your search.</p>
      ) : (
        <p className="text-muted-foreground">Enter a search term to find movies.</p>
      )}
    </div>
  );
}
