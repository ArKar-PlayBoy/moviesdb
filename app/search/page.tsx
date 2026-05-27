import { MovieType } from "@/types/global";
import { Suspense } from "react";
import SearchForm from "./search-form";
import Pagination from "@/components/pagination";
import Movie from "@/components/movie";

async function searchMovies(query: string, page: number = 1): Promise<{ movies: MovieType[]; totalPages: number }> {
  const res = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=${page}`, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return { movies: [], totalPages: 0 };
  }

  const data = await res.json();
  return { movies: data.results || [], totalPages: data.total_pages };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageStr } = await searchParams;
  const query = q || "";
  const page = Math.max(1, parseInt(pageStr || "1", 10) || 1);
  const result = query ? await searchMovies(query, page) : { movies: [], totalPages: 0 };

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
          {result.movies.length} results for &ldquo;{query}&rdquo;
        </p>
      )}

      {result.movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {result.movies.map((movie) => (
            <Movie key={movie.id} movie={movie} />
          ))}
        </div>
      ) : query ? (
        <p className="text-muted-foreground">No movies found for your search.</p>
      ) : (
        <p className="text-muted-foreground">Enter a search term to find movies.</p>
      )}

      {result.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={result.totalPages}
          baseUrl={`/search?q=${encodeURIComponent(query)}&page=`}
        />
      )}
    </div>
  );
}
