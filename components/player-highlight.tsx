"use client";

import { useState } from "react";
import { Play, Goal, Star, ExternalLink, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlayerAvatar from "@/components/player-avatar";
import { getYouTubeEmbedUrl, getYouTubeSearchUrl } from "@/lib/youtube";

type HighlightTab = "highlights" | "goals" | "moments";

interface PlayerHighlightProps {
  name: string;
  teamName: string;
  teamId: string;
  position: string;
  age: number;
  photoUrl?: string | null;
  onClose?: () => void;
}

const TABS: { key: HighlightTab; label: string; query: string; icon: typeof Play }[] = [
  { key: "highlights", label: "Highlights", query: "highlights", icon: Play },
  { key: "goals", label: "Top Goals", query: "goals", icon: Goal },
  { key: "moments", label: "Best Moments", query: "best moments", icon: Star },
];

export default function PlayerHighlight({ name, teamName, position, age, photoUrl, onClose = () => {} }: PlayerHighlightProps) {
  const [activeTab, setActiveTab] = useState<HighlightTab>("highlights");
  const [playerActivated, setPlayerActivated] = useState(false);
  const [playerLoaded, setPlayerLoaded] = useState(false);

  const tab = TABS.find((t) => t.key === activeTab)!;
  const embedUrl = getYouTubeEmbedUrl(name, teamName, tab.query);
  const searchUrl = getYouTubeSearchUrl(name, teamName, tab.query);
  return (
    <div className="bg-card rounded-xl border border-border p-6 mb-8">
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <PlayerAvatar name={name} photoUrl={photoUrl} size="lg" />
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl font-bold">{name}</h3>
          <p className="text-sm text-muted-foreground">{position} · Age {age} · {teamName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setPlayerActivated(!playerActivated)}
            className="gap-2"
          >
            <Play className="h-4 w-4 fill-current" />
            {playerActivated ? "Close" : "Watch Now"}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {playerActivated && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {TABS.map((t) => (
              <Button
                key={t.key}
                variant={activeTab === t.key ? "default" : "outline"}
                size="sm"
                onClick={() => { setActiveTab(t.key); setPlayerLoaded(false); }}
                className="flex items-center gap-1.5"
              >
                <t.icon className={`h-3.5 w-3.5 ${t.key === "goals" ? "fill-current" : ""}`} />
                {t.label}
              </Button>
            ))}
          </div>

          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
            {!playerLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <iframe
              key={`${name}-${activeTab}`}
              src={embedUrl}
              title={`${name} - ${tab.label}`}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              sandbox="allow-scripts allow-same-origin allow-presentation"
              onLoad={() => setPlayerLoaded(true)}
            />
          </div>

          <p className="text-xs text-muted-foreground mt-2 text-center">
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              Open in YouTube <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </>
      )}
    </div>
  );
}
