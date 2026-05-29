"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlayerHighlight from "@/components/player-highlight";
import { slugify } from "@/data/worldcup-2026";

interface Player {
  name: string;
  position: string;
  age: number;
}

interface TeamPlayerSectionProps {
  players: Player[];
  teamName: string;
  teamId: string;
}

const POSITION_LABELS: Record<string, string> = {
  FW: "Forward",
  MF: "Midfielder",
  DF: "Defender",
  GK: "Goalkeeper",
};

const POSITION_COLORS: Record<string, string> = {
  FW: "bg-red-500/10 text-red-500 border-red-500/20",
  MF: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  DF: "bg-green-500/10 text-green-500 border-green-500/20",
  GK: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

export default function TeamPlayerSection({ players, teamName, teamId }: TeamPlayerSectionProps) {
  const [selected, setSelected] = useState<Player | null>(null);
  const [photos, setPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all(
      players.map((p) =>
        fetch(`/api/player-image?name=${encodeURIComponent(p.name)}`)
          .then((r) => r.json())
          .then((data) => ({ name: p.name, url: data?.image?.source || "" }))
          .catch(() => ({ name: p.name, url: "" }))
      )
    ).then((results) => {
      const map: Record<string, string> = {};
      results.forEach((r) => {
        if (r.url) map[r.name] = r.url;
      });
      setPhotos(map);
    });
  }, [players]);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 border-l-4 border-primary pl-3">Key Players</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
        {players.map((player) => {
          const isActive = selected?.name === player.name;
          const photoUrl = photos[player.name];
          return (
            <div
              key={player.name}
              className={`bg-card rounded-lg border p-4 text-center transition-all ${
                isActive
                  ? "border-primary ring-2 ring-primary/50"
                  : "border-border hover:ring-2 hover:ring-primary/50"
              }`}
            >
              <Link href={`/player/${slugify(player.name)}`} className="block">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={player.name}
                    className="w-14 h-14 rounded-full object-cover mx-auto mb-2 border-2 border-border hover:ring-2 hover:ring-primary transition-all"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg font-bold text-primary">
                      {player.name.split(" ").pop()?.charAt(0)}
                      {player.name.split(" ")[0]?.charAt(0)}
                    </span>
                  </div>
                )}
                <p className="font-medium text-sm truncate hover:text-primary transition-colors">{player.name}</p>
              </Link>
              <span
                className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border mt-1 ${
                  POSITION_COLORS[player.position] || "bg-secondary text-muted-foreground border-border"
                }`}
              >
                {POSITION_LABELS[player.position] || player.position}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Age {player.age}</p>
              <Button
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className="mt-2 w-full gap-1 text-xs"
                onClick={() => setSelected(isActive ? null : player)}
              >
                <Play className="h-3 w-3 fill-current" />
                {isActive ? "Close" : "Watch"}
              </Button>
            </div>
          );
        })}
      </div>

      {selected && (
        <PlayerHighlight
          name={selected.name}
          teamName={teamName}
          position={POSITION_LABELS[selected.position] || selected.position}
          age={selected.age}
          teamId={teamId}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
