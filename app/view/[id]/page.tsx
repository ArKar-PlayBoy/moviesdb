import type { Metadata } from "next";
import { MovieType, CastType, VideoType } from "@/types/global";
import { ThemeProvider } from "@/components/theme-provider";
import Link from "next/link";
import { ArrowLeft, Play, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Movie from "@/components/movie";
import MoviePlayer from "@/components/movie-player";
import FavoriteButton from "@/components/favorite-button";

const posterUrl = "http://image.tmdb.org/t/p/w500";
const backdropUrl = "http://image.tmdb.org/t/p/w1280";
const profileUrl = "http://image.tmdb.org/t/p/w185";

async function fetchMovie(id: string): Promise<MovieType> {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch movie");
  return res.json();
}

async function fetchCredits(id: string): Promise<{ cast: CastType[]; directors: string[] }> {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?language=en-US`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch credits");
  const data = await res.json();
  return {
    cast: data.cast?.slice(0, 20) || [],
    directors: data.crew?.filter((c: any) => c.job === "Director").map((c: any) => c.name) || [],
  };
}

async function fetchVideos(id: string): Promise<VideoType[]> {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results?.filter(
    (v: VideoType) => v.site === "YouTube" && v.type === "Trailer"
  ) || [];
}

async function fetchSimilar(id: string): Promise<MovieType[]> {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/similar?language=en-US&page=1`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results?.slice(0, 10) || [];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const movie = await fetchMovie(id);
  return {
    title: `${movie.title} — Movie App`,
    description: movie.overview?.slice(0, 160) || "View movie details.",
  };
}

function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [movie, credits, videos, similar] = await Promise.all([
    fetchMovie(id),
    fetchCredits(id),
    fetchVideos(id),
    fetchSimilar(id),
  ]);

  const trailer = videos[0];

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="relative h-[40vh] md:h-[50vh]">
          <img
            src={backdropUrl + movie.backdrop_path}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

          <div className="absolute top-4 left-4">
            <Button variant="outline" size="sm" asChild className="bg-background/80 backdrop-blur-sm">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative -mt-40 px-4 md:px-8 pb-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-72 flex-shrink-0">
              <img
                src={posterUrl + movie.poster_path}
                alt={movie.title}
                className="w-48 md:w-72 rounded-lg shadow-2xl border-2 border-border mx-auto md:mx-0"
              />

              <div className="mt-6 space-y-3 text-sm">
                {movie.production_countries && movie.production_countries.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Country</p>
                    <p>{movie.production_countries.map(c => c.name).join(", ")}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Genres</p>
                  <p>{movie.genres?.map(g => g.name).join(", ")}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Released</p>
                  <p>{movie.release_date}</p>
                </div>

                {credits.directors.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Director</p>
                    <p>{credits.directors.join(", ")}</p>
                  </div>
                )}

                {movie.production_companies && movie.production_companies.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Productions</p>
                    <p>{movie.production_companies.slice(0, 3).map(c => c.name).join(", ")}</p>
                  </div>
                )}

                {credits.cast.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Casts</p>
                    <p>{credits.cast.slice(0, 6).map(c => c.name).join(", ")}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-5xl font-bold mb-3">{movie.title}</h1>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="font-bold text-lg">{movie.vote_average.toFixed(1)}</span>
                  <span className="text-muted-foreground text-sm">/ 10</span>
                </div>
                {movie.runtime > 0 && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{formatRuntime(movie.runtime)}</span>
                  </div>
                )}
                {movie.release_date && (
                  <span className="text-sm text-muted-foreground">{movie.release_date?.split("-")[0]}</span>
                )}
                <span className="text-sm text-muted-foreground">{movie.original_language?.toUpperCase()}</span>
              </div>

              {movie.tagline && (
                <p className="text-lg text-muted-foreground italic mb-4">&ldquo;{movie.tagline}&rdquo;</p>
              )}

              <p className="text-muted-foreground leading-relaxed text-base mb-6">
                {movie.overview || "No overview available."}
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-8">
                <a href="#watch">
                  <Button size="lg" className="gap-2">
                    <Play className="h-5 w-5 fill-current" />
                    Watch Now
                  </Button>
                </a>
                {trailer && (
                  <a
                    href={`https://www.youtube.com/watch?v=${trailer.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="lg" className="gap-2">
                      <Play className="h-5 w-5" />
                      Trailer
                    </Button>
                  </a>
                )}
                <FavoriteButton movieId={movie.id} />
              </div>

              {credits.cast.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-bold mb-3">Cast</h2>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {credits.cast.slice(0, 10).map((cast) => (
                      <Link
                        key={cast.id}
                        href={`/person/${cast.id}`}
                        className="flex-shrink-0 w-24 text-center"
                      >
                        {cast.profile_path ? (
                          <img
                            src={profileUrl + cast.profile_path}
                            alt={cast.name}
                            className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-border"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto border-2 border-border">
                            <span className="text-2xl">?</span>
                          </div>
                        )}
                        <p className="text-xs font-medium mt-1 truncate">{cast.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{cast.character}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div id="watch">
            <MoviePlayer movieId={movie.id} title={movie.title} />
          </div>

          {similar.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 underline decoration-primary underline-offset-4">
                You may also like
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {similar.map((m) => (
                  <Movie key={m.id} movie={m} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}
