"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MATCHES, GROUPS, getTeamFlag, getTeamName, getMatchScore, getStarOfTheMatch, slugify } from "@/data/worldcup-2026";
import Link from "next/link";
import PlayerAvatar from "@/components/player-avatar";
import { Calendar, MapPin, Trophy, ChevronLeft, ChevronRight, Clock, Star, Goal, Medal, Sparkles } from "lucide-react";

function isPast(date: string) {
  return new Date(`2026 ${date}`) <= new Date();
}

export default function MatchesPage() {
  const router = useRouter();
  const [groupIdx, setGroupIdx] = useState(0);
  const group = GROUPS[groupIdx];
  const groupMatches = MATCHES.filter((m) => m.group === group);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Match Schedule</h1>
        <p className="text-muted-foreground">All 104 matches of the FIFA World Cup 2026</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold border-l-4 border-primary pl-3">
          Group {group}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGroupIdx((i) => Math.max(0, i - 1))}
            disabled={groupIdx === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>
          <span className="text-xs text-muted-foreground tabular-nums">
            {groupIdx + 1} / {GROUPS.length}
          </span>
          <button
            onClick={() => setGroupIdx((i) => Math.min(GROUPS.length - 1, i + 1))}
            disabled={groupIdx >= GROUPS.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
        {groupMatches.map((match) => {
          const t1Flag = getTeamFlag(match.team1);
          const t2Flag = getTeamFlag(match.team2);
          const t1Name = getTeamName(match.team1);
          const t2Name = getTeamName(match.team2);
          const played = isPast(match.date);
          const [s1, s2] = played ? getMatchScore(match.id, match.team1, match.team2, match.date) : [0, 0];
          const isDraw = played && s1 === s2;
          const t1Won = played && s1 > s2;
          const star = played ? getStarOfTheMatch(match.id) : null;

          return (
            <div
              key={match.id}
              onClick={() => router.push(`/match/${match.id}`)}
              className="group relative bg-card rounded-xl border border-border hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/[0.02] pointer-events-none" />

              <div className="relative p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Link href={`/team/${match.team1}`} onClick={e => e.stopPropagation()} className="shrink-0">
                      <span className="text-2xl hover:scale-110 transition-transform inline-block">{t1Flag}</span>
                    </Link>
                    <span className={`text-sm truncate ${t1Won ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                      {t1Name}
                    </span>
                  </div>

                  {played ? (
                    <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-lg font-black tabular-nums shadow-sm ${
                      isDraw
                        ? "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20"
                        : t1Won
                          ? "bg-green-500/10 text-green-600 ring-1 ring-green-500/20"
                          : "bg-red-500/10 text-red-600 ring-1 ring-red-500/20"
                    }`}>
                      <span>{s1}</span>
                      <span className="text-muted-foreground text-sm">:</span>
                      <span>{s2}</span>
                    </div>
                  ) : (
                    <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/30 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      TBD
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Link href={`/team/${match.team2}`} onClick={e => e.stopPropagation()} className="shrink-0">
                      <span className="text-2xl hover:scale-110 transition-transform inline-block">{t2Flag}</span>
                    </Link>
                    <span className={`text-sm truncate ${!played ? "text-muted-foreground" : t1Won ? "text-muted-foreground" : "font-bold text-foreground"}`}>
                      {t2Name}
                    </span>
                  </div>

                  <div className="shrink-0 flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="hidden sm:inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {match.date}
                    </span>
                    <span className="hidden md:inline-flex items-center gap-1 max-w-[120px] truncate" title={match.venue}>
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{match.venue}</span>
                    </span>
                  </div>
                </div>

                {played && star && (
                  <>
                    <div className="h-px bg-border my-3" />
                    <Link
                      href={`/player/${slugify(star.playerName)}`}
                      onClick={e => e.stopPropagation()}
                      className="flex items-center gap-3 group/star"
                    >
                      <div className="relative shrink-0">
                        <PlayerAvatar name={star.playerName} size="sm" className="ring-1 ring-amber-500/30" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center shadow-sm">
                          <Star className="h-2.5 w-2.5 text-white fill-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold group-hover/star:text-amber-600 transition-colors truncate">
                          {star.playerName}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <Goal className="h-3 w-3 text-amber-500" />
                          <span className="font-medium text-amber-600 tabular-nums">{star.goals}</span>
                          <span>goal{star.goals !== 1 ? "s" : ""}</span>
                          {star.minutes.length > 0 && (
                            <>
                              <span>·</span>
                              <span>{star.minutes.join("' · ")}'</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-1 rounded-md">
                        <Medal className="h-3 w-3" />
                        MOTM
                      </div>
                    </Link>
                  </>
                )}

                {!played && (
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1 sm:hidden">
                      <Calendar className="h-3 w-3" />
                      {match.date}
                    </span>
                    <span className="inline-flex items-center gap-1 md:hidden max-w-[120px] truncate" title={match.venue}>
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{match.venue}</span>
                    </span>
                    <div className="flex items-center gap-1 ml-auto">
                      <Sparkles className="h-3 w-3 text-muted-foreground/40" />
                      <span>Upcoming</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-1">
          {GROUPS.map((g, i) => (
            <button
              key={g}
              onClick={() => setGroupIdx(i)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                i === groupIdx
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary text-muted-foreground"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <button
          onClick={() => setGroupIdx(Math.floor(Math.random() * GROUPS.length))}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Random
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 text-center">
        <Trophy className="h-8 w-8 mx-auto text-primary mb-2" />
        <h2 className="text-lg font-bold mb-1">Knockout Stage</h2>
        <p className="text-muted-foreground text-sm">
          Round of 32, Round of 16, Quarter-finals, Semi-finals, and Final —
          <Link href="/bracket" className="text-primary hover:underline ml-1">view bracket</Link>
        </p>
      </div>
    </div>
  );
}
