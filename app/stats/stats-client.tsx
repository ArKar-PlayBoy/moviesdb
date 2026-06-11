"use client";

import { useState } from "react";
import Link from "next/link";
import PlayerAvatar from "@/components/player-avatar";
import { Goal, Medal, ChevronLeft, ChevronRight, Users, Clock, ShieldAlert, Handshake } from "lucide-react";
import { slugify } from "@/lib/utils";

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

type Tab = "goals" | "assists" | "cards";

interface PlayerStat {
  playerName: string;
  teamId: string;
  teamName: string;
  teamFlag: string;
  position: string;
  matches: number;
  teamGroup: string;
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
}



export default function StatsClient({
  scorerPhotos,
  scorers,
  assists,
  cards,
}: {
  scorerPhotos: Record<string, string | null>;
  scorers: PlayerStat[];
  assists: PlayerStat[];
  cards: PlayerStat[];
}) {
  const [tab, setTab] = useState<Tab>("goals");
  const [page, setPage] = useState(0);

  const data = tab === "goals" ? scorers : tab === "assists" ? assists : cards;
  const totalPages = Math.max(1, Math.ceil(data.length / PER_PAGE));
  const paged = data.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const isEmpty = data.length === 0;

  const tabs: { key: Tab; label: string; icon: typeof Goal; count: number }[] = [
    { key: "goals", label: "Goals", icon: Goal, count: scorers.length },
    { key: "assists", label: "Assists", icon: Handshake, count: assists.length },
    { key: "cards", label: "Cards", icon: ShieldAlert, count: cards.length },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">Tournament Stats</h1>
          <p className="text-muted-foreground text-sm">
            Goals, assists, and disciplinary records
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span className="tabular-nums">{data.length} players</span>
        </div>
      </div>

      <div className="flex gap-1 mb-8 bg-muted/40 rounded-xl p-1 border border-border w-fit">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setPage(0); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? "bg-background text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              <span className="text-[10px] ml-0.5 text-muted-foreground/60">({t.count})</span>
            </button>
          );
        })}
      </div>

      {isEmpty ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto flex items-center justify-center mb-4">
            <Goal className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">No data yet</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Stats will appear here once the tournament begins on June 11, 2026
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Tournament starts June 11, 2026</span>
          </div>
        </div>
      ) : (
        <>
          {tab === "goals" && page === 0 && data.length >= 3 && (
            <div className="flex items-end justify-center gap-2 sm:gap-3 mb-8">
              {[1, 0, 2].map((pos) => {
                const s = data[pos];
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
            {paged.map((s, i) => {
              const rank = page * PER_PAGE + i;
              const isPodium = tab === "goals" && rank < 3;
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
                      {tab === "goals" && (
                        <>
                          <span className="text-xl font-black text-primary tabular-nums">{s.goals}</span>
                          <span className="text-[10px] text-muted-foreground">goals</span>
                          <span className="text-[10px] text-muted-foreground ml-1">
                            ({(s.goals! / Math.max(1, s.matches)).toFixed(1)}/m)
                          </span>
                        </>
                      )}
                      {tab === "assists" && (
                        <>
                          <span className="text-xl font-black text-blue-500 tabular-nums">{s.assists}</span>
                          <span className="text-[10px] text-muted-foreground">assists</span>
                        </>
                      )}
                      {tab === "cards" && (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-amber-500 font-bold tabular-nums">
                            <span className="w-3 h-2 rounded-sm bg-amber-400 inline-block" /> {s.yellowCards}
                          </span>
                          <span className="flex items-center gap-1 text-red-600 font-bold tabular-nums">
                            <span className="w-3 h-2 rounded-sm bg-red-600 inline-block" /> {s.redCards}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border border-border bg-card hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none max-w-[200px] sm:max-w-none">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                      i === page
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card hover:bg-muted"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border border-border bg-card hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
