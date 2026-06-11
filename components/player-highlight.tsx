"use client";

import { useState } from "react";
import { Play, Goal, Star, ExternalLink, X, Loader2, Calendar } from "lucide-react";
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

const WC_START = new Date("2026-06-11T00:00:00");

function isWcStarted(): boolean {
  return new Date() >= WC_START;
}

export default function PlayerHighlight({ name, teamName, position, age, photoUrl, onClose = () => {} }: PlayerHighlightProps) {
  const [activeTab, setActiveTab] = useState<HighlightTab>("highlights");
  const [playerActivated, setPlayerActivated] = useState(false);
  const [playerLoaded, setPlayerLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [started] = useState(isWcStarted);

  const tab = TABS.find((t) => t.key === activeTab)!;
  const embedUrl = getYouTubeEmbedUrl(name, teamName, tab.query);
  const searchUrl = getYouTubeSearchUrl(name, teamName, tab.query);

  function handleActivate() {
    if (playerActivated) {
      setPlayerActivated(false);
      return;
    }
    setPlayerActivated(true);
    setHasError(false);
    setPlayerLoaded(false);
  }

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
            onClick={handleActivate}
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

      {playerActivated && !started && (
        <div className="bg-muted/30 rounded-lg border border-border p-8 text-center">
          <Calendar className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h4 className="font-bold text-lg mb-1">Highlights Coming Soon</h4>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Match highlights will be available once the World Cup begins on <strong>June 11, 2026</strong>.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-3">
            <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors inline-flex items-center gap-1">
              Search on YouTube <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
      )}

      {playerActivated && started && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {TABS.map((t) => (
              <Button
                key={t.key}
                variant={activeTab === t.key ? "default" : "outline"}
                size="sm"
                onClick={() => { setActiveTab(t.key); setPlayerLoaded(false); setHasError(false); }}
                className="flex items-center gap-1.5"
              >
                <t.icon className={`h-3.5 w-3.5 ${t.key === "goals" ? "fill-current" : ""}`} />
                {t.label}
              </Button>
            ))}
          </div>

          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
            {!playerLoaded && !hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {hasError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <div className="text-center p-6">
                  <p className="text-sm text-muted-foreground mb-2">Could not load video</p>
                  <a href={searchUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      Search on YouTube <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </a>
                </div>
              </div>
            ) : (
            <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 hover:bg-zinc-900 transition-colors group z-20">
              <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-red-500 transition-all shadow-lg">
                <Play className="h-8 w-8 text-white ml-1 fill-current" />
              </div>
              <p className="text-white font-medium mb-1">Watch {tab.label} on YouTube</p>
              <p className="text-zinc-400 text-xs flex items-center gap-1">Opens in a new tab <ExternalLink className="h-3 w-3" /></p>
            </a>
            )}
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
