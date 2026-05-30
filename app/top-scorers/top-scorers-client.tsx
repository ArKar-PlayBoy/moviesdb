"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PlayerAvatar from "@/components/player-avatar";
import { Trophy, Goal, Medal, ChevronLeft, ChevronRight, Users, Clock } from "lucide-react";

const PER_PAGE = 12;

const positionColors: Record<string, string> = {
  FW: "bg-green-500/10 text-green-600 border-green-500/20",
  MF: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  DF: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  GK: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

const podiumColors = ["text-yellow-500", "text-gray-400", "text-amber-700"];
const podiumBg = ["bg-yellow-500", "bg-gray-400", "bg-amber-700"];
const podiumRings = ["rgba(234,179,8,0.2)", "rgba(156,163,175,0.2)", "rgba(180,83,9,0.2)"];

function slugify(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function TopScorersClient({ scorerPhotos }: { scorerPhotos: Record<string, string | null> }) {
  const [allScorers, setAllScorers] = useState<{
    playerName: string; teamId: string; teamName: string; teamFlag: string;
    teamGroup: string; goals: number; matches: number; position: string; age: number;
  }[]>([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetch("/api/top-scorers?limit=200")
      .then((r) => r.json())
      .then(setAllScorers)
      .catch(() => {});
  }, []);

  const safeScorers = allScorers || [];
  const totalPages = Math.ceil(safeScorers.length / PER_PAGE);
  const scorers = safeScorers.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">Top Scorers</h1>
          <p className="text-muted-foreground text-sm">
            Leading goal scorers across the tournament
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span className="tabular-nums">{safeScorers.length} scorers</span>
          <span className="text-muted-foreground/40">·</span>
          <Goal className="h-3.5 w-3.5" />
          <span className="tabular-nums">{safeScorers.reduce((s, x) => s + x.goals, 0)} total goals</span>
        </div>
      </div>

      {safeScorers.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto flex items-center justify-center mb-4">
            <Goal className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">No goals scored yet</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Goal scoring data will appear here once the tournament begins on June 11, 2026
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Tournament starts in 15 days</span>
          </div>
        </div>
      ) : (
        <>
          {page === 0 && safeScorers.length >= 3 && (
            <div className="flex items-end justify-center gap-2 sm:gap-3 mb-8">
              {[1, 0, 2].map((pos) => {
                const s = safeScorers[pos];
                if (!s) return null;
                const height = pos === 0 ? "h-28 sm:h-40" : pos === 1 ? "h-24 sm:h-32" : "h-20 sm:h-28";
                return (
                  <Link
                    key={s.playerName}
                    href={`/player/${slugify(s.playerName)}`}
                    className={`flex flex-col items-center gap-2 group ${pos === 0 ? "order-2" : pos === 1 ? "order-1" : "order-3"}`}
                  >
                    <div className={`w-10 h-10 rounded-full ${podiumBg[pos]} flex items-center justify-center shadow-lg`}>
                      <Medal className={`h-5 w-5 text-white`} />
                    </div>
                    <PlayerAvatar name={s.playerName} photoUrl={scorerPhotos[s.playerName]} size="lg" className="border-2 border-border group-hover:ring-2 group-hover:ring-primary/50 transition-all" />
                    <div className="text-center">
                      <p className="font-bold text-sm group-hover:text-primary transition-colors truncate max-w-[100px]">{s.playerName}</p>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <span className="text-xs">{s.teamFlag}</span>
                        <span className={`text-[10px] font-bold ${podiumColors[pos]}`}>{s.goals}G</span>
                      </div>
                    </div>
                    <div className={`w-1 ${height} rounded-full ${podiumBg[pos]}/20`} />
                  </Link>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {scorers.map((s, i) => {
              const rank = page * PER_PAGE + i;
              const isPodium = rank < 3;
              return (
                <Link
                  key={`${s.teamId}-${s.playerName}`}
                  href={`/player/${slugify(s.playerName)}`}
                  className={`group relative bg-card rounded-xl border border-border p-4 hover:ring-2 hover:ring-primary/50 transition-all overflow-hidden`}
                  style={isPodium ? { boxShadow: `0 0 0 1px ${podiumRings[rank]}` } : undefined}
                >
                  {isPodium && (
                    <div className="absolute top-0 right-0 w-16 h-16 -mr-6 -mt-6 rounded-full opacity-10">
                      <Medal className={`h-full w-full ${podiumColors[rank]}`} />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <PlayerAvatar name={s.playerName} photoUrl={scorerPhotos[s.playerName]} size="md" className="border border-border group-hover:border-primary/50 transition-colors" />
                      <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${
                        rank === 0 ? "bg-yellow-500" : rank === 1 ? "bg-gray-400" : rank === 2 ? "bg-amber-700" : "bg-primary"
                      }`}>
                        {rank + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors truncate">{s.playerName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs">{s.teamFlag}</span>
                        <span className="text-xs text-muted-foreground truncate">{s.teamName}</span>
                        <span className={`ml-auto inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${positionColors[s.position] || "bg-secondary text-muted-foreground"}`}>
                          {s.position}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span className="tabular-nums">{s.matches} match{s.matches !== 1 ? "es" : ""}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-black text-primary tabular-nums">{s.goals}</span>
                      <span className="text-[10px] text-muted-foreground">goals</span>
                      <span className="text-[10px] text-muted-foreground ml-1">
                        ({(s.goals / Math.max(1, s.matches)).toFixed(1)}/m)
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none max-w-[200px] sm:max-w-none">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={i === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => setPage(i)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
