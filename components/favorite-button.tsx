"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

export default function FavoriteButton({ movieId }: { movieId: number }) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("favorites");
    const ids: number[] = stored ? JSON.parse(stored) : [];
    setIsFavorite(ids.includes(movieId));
  }, [movieId]);

  const toggle = () => {
    const stored = localStorage.getItem("favorites");
    let ids: number[] = stored ? JSON.parse(stored) : [];

    if (isFavorite) {
      ids = ids.filter((id) => id !== movieId);
    } else {
      ids.push(movieId);
    }

    localStorage.setItem("favorites", JSON.stringify(ids));
    setIsFavorite(!isFavorite);
  };

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition ${
        isFavorite
          ? "bg-red-500/10 text-red-500 border-red-500"
          : "bg-card text-muted-foreground border-border hover:border-primary"
      }`}
    >
      <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500" : ""}`} />
      {isFavorite ? "Favorited" : "Add to Favorites"}
    </button>
  );
}
