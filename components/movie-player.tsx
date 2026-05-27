"use client";

import { useState } from "react";
import { Loader2, Play } from "lucide-react";

const SERVERS = [
  { name: "Auto (Best)", url: (id: number) => `https://ezvidapi.com/embed/movie/${id}` },
  { name: "Backup 1", url: (id: number) => `https://vidsrc.to/embed/movie/${id}` },
  { name: "Backup 2", url: (id: number) => `https://apiplayer.ru/embed/movie/${id}` },
];

export default function MoviePlayer({ movieId, title }: { movieId: number; title: string }) {
  const [server, setServer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activated, setActivated] = useState(false);

  const activate = (s?: number) => {
    if (s !== undefined) setServer(s);
    if (!activated) setActivated(true);
    setLoading(true);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-3">Watch Movie</h2>

      <div className="flex flex-wrap gap-2 mb-2">
        {SERVERS.map((s, i) => (
          <button
            key={i}
            onClick={() => activate(i)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition ${
              i === server
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        <strong>Auto (Best)</strong> has 4 built-in sources and auto-fallback if one fails. Use Backup 1 or 2 if it doesn&apos;t work.
      </p>

      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        {!activated ? (
          <button
            onClick={() => activate()}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/80 hover:bg-black/60 transition cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <Play className="h-8 w-8 text-primary-foreground fill-current ml-1" />
            </div>
            <span className="text-white text-lg font-medium">Click to Load Player</span>
            <span className="text-muted-foreground text-sm">Tap to start watching</span>
          </button>
        ) : (
          loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )
        )}

        {activated && (
          <iframe
            key={server}
            src={SERVERS[server].url(movieId)}
            title={`${title} - ${SERVERS[server].name}`}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen"
            sandbox="allow-scripts allow-same-origin"
            onLoad={() => setLoading(false)}
          />
        )}
      </div>
    </div>
  );
}
