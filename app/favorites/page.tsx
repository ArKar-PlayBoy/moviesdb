"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MovieType } from "@/types/global";
import { Heart, Loader2 } from "lucide-react";

const posterUrl = "http://image.tmdb.org/t/p/w185";

export default function FavoritesPage() {
  const [movies, setMovies] = useState<MovieType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("favorites");
    const ids: number[] = stored ? JSON.parse(stored) : [];

    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    fetch(`/api/movies?ids=${ids.join(",")}`)
      .then((res) => res.json())
      .then((data) => {
        setMovies(data.filter(Boolean));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-20">
        <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">My Favorites</h1>
        <p className="text-muted-foreground mb-4">No favorites yet.</p>
        <Link href="/" className="text-primary hover:underline">
          Browse movies
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Favorites ({movies.length})</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <div key={movie.id} className="text-center">
            <Link href={`/view/${movie.id}`}>
              <img
                className="hover:scale-105 transition-all rounded-lg"
                src={posterUrl + movie.poster_path}
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
    </div>
  );
}
