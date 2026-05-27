import { MovieType, CastType } from "@/types/global";
import { ThemeProvider } from "@/components/theme-provider";
import Link from "next/link";

const posterUrl = "http://image.tmdb.org/t/p/w500";
const backdropUrl = "http://image.tmdb.org/t/p/w1280";
const profileUrl = "http://image.tmdb.org/t/p/w185";

async function fetchMovie(id: string): Promise<MovieType> {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch movie");
  }

  const data = await res.json();
  return data;
}

async function fetchCredits(id: string): Promise<CastType[]> {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?language=en-US`, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch credits");
  }

  const data = await res.json();
  return data.cast.slice(0, 20);
}

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [movie, credits] = await Promise.all([
    fetchMovie(id),
    fetchCredits(id)
  ]);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="relative h-[50vh] md:h-[60vh]">
          <img
            src={backdropUrl + movie.backdrop_path}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="relative -mt-32 px-4 md:px-8 pb-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            <div className="flex-shrink-0">
              <img
                src={posterUrl + movie.poster_path}
                alt={movie.title}
                className="w-48 md:w-72 rounded-lg shadow-2xl border-2 border-border"
              />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-bold mb-2">{movie.title}</h1>
              
              {movie.tagline && (
                <p className="text-lg text-muted-foreground italic mb-4">&ldquo;{movie.tagline}&rdquo;</p>
              )}

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres?.map((genre) => (
                  <span key={genre.id} className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                    {genre.name}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 bg-card p-4 rounded-lg border">
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Rating</p>
                  <p className="text-2xl font-bold text-yellow-500">★ {movie.vote_average.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">{movie.vote_count} votes</p>
                </div>
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Runtime</p>
                  <p className="text-2xl font-bold">{movie.runtime}</p>
                  <p className="text-xs text-muted-foreground">minutes</p>
                </div>
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Release</p>
                  <p className="text-lg font-bold">{movie.release_date?.split("-")[0]}</p>
                  <p className="text-xs text-muted-foreground">{movie.release_date}</p>
                </div>
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Status</p>
                  <p className="text-lg font-bold">{movie.status}</p>
                </div>
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Budget</p>
                  <p className="text-lg font-bold text-green-500">${movie.budget.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Revenue</p>
                  <p className="text-lg font-bold text-green-500">${movie.revenue.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Language</p>
                  <p className="text-lg font-bold uppercase">{movie.original_language}</p>
                </div>
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Production</p>
                  <p className="text-sm font-medium truncate">{movie.production_companies?.map((c) => c.name).slice(0, 2).join(", ")}</p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3 border-l-4 border-primary pl-3">Overview</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">{movie.overview || "No overview available."}</p>
              </div>

              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-3">Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {credits.map((cast) => (
                    <Link key={cast.id} href={`/person/${cast.id}`} className="block bg-card rounded-lg overflow-hidden border hover:ring-2 hover:ring-primary transition-all">
                      {cast.profile_path ? (
                        <img
                          src={profileUrl + cast.profile_path}
                          alt={cast.name}
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div className="w-full h-40 bg-secondary flex items-center justify-center">
                          <span className="text-4xl">🎭</span>
                        </div>
                      )}
                      <div className="p-3">
                        <p className="font-bold text-sm truncate">{cast.name}</p>
                        <p className="text-muted-foreground text-xs truncate">{cast.character}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
