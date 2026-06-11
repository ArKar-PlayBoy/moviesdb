"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PlayerAvatar from "@/components/player-avatar";
import { Calendar, MapPin, Trophy, ChevronLeft, ChevronRight, Star, Goal, Medal, Tv, Clock } from "lucide-react";

function isPast(date: string) {
  return new Date(`2026 ${date}`) <= new Date();
}

function isToday(date: string) {
  const now = new Date();
  const matchDate = new Date(`2026 ${date}`);
  return matchDate.toDateString() === now.toDateString();
}

interface EnrichedMatch {
  id: string; group: string; team1: string; team2: string; date: string;
  venue: string; stage: string;
  team1Name: string; team2Name: string; team1Flag: string; team2Flag: string;
  score1: number; score2: number;
  starOfTheMatch: { playerName: string; teamId: string; goals: number; minutes: number[] } | null;
}

export default function MatchesClient({ starPhotos }: { starPhotos: Record<string, string | null> }) {
  const router = useRouter();
  const [matches, setMatches] = useState<EnrichedMatch[]>([]);
  const [groupIdx, setGroupIdx] = useState(0);

  useEffect(() => {
    fetch("/api/matches")
      .then((r) => r.json())
      .then(setMatches)
      .catch(() => {});
  }, []);

  const safe = matches || [];
  const groups = [...new Set(safe.map((m) => m.group))].sort();
  const group = groups[groupIdx] || "";
  const groupMatches = safe.filter((m) => m.group === group);

  return (
    <div>
      <div className="mb-8 animate-in">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Match Schedule</h1>
        <p className="text-muted-foreground">All 104 matches of the FIFA World Cup 2026</p>
      </div>

      <div className="flex items-center justify-between mb-4 animate-in animate-in-delay-1">
        <h2 className="text-xl font-bold border-l-4 border-primary pl-3">
          Group {group}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGroupIdx((i) => Math.max(0, i - 1))}
            disabled={groupIdx === 0}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Prev</span>
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">
            {groupIdx + 1} / {groups.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGroupIdx((i) => Math.min(groups.length - 1, i + 1))}
            disabled={groupIdx >= groups.length - 1}
            className="flex items-center gap-1"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-4 stagger">
        {groupMatches.map((match) => {
          const played = isPast(match.date);
          const [s1, s2] = [match.score1, match.score2];
          const isDraw = played && s1 === s2;
          const t1Won = played && s1 > s2;
          const star = played ? match.starOfTheMatch : null;

          return (
            <Link
              key={match.id}
              href={`/match/${match.id}`}
              className="group relative bg-card rounded-xl border border-border hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer overflow-hidden card-glow hover:-translate-y-0.5 hover:shadow-lg duration-200"
            >
              {/* Top team-colored accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                played
                  ? isDraw
                    ? "bg-gradient-to-r from-amber-500 to-amber-400"
                    : t1Won
                      ? "bg-gradient-to-r from-green-500 to-emerald-400"
                      : "bg-gradient-to-r from-red-500 to-rose-400"
                  : "bg-gradient-to-r from-primary/40 to-primary/20"
              }`} />

              <div className="relative p-4 pt-4">
                {/* Group label */}
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">
                    Group {match.group} · {match.stage}
                  </span>
                  {isToday(match.date) && (
                    <span className="inline-flex items-center gap-1 ml-auto text-[10px] font-medium text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                      </span>
                      Live
                    </span>
                  )}
                </div>

                {/* Teams vs Score */}
                <div className="flex items-center gap-2 mb-2">
                  {/* Team 1 */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span onClick={e => { e.stopPropagation(); router.push(`/team/${match.team1}`); }} className="shrink-0 cursor-pointer">
                      <span className="text-3xl hover:scale-125 transition-transform inline-block drop-shadow-sm">{match.team1Flag}</span>
                    </span>
                    <span className={`text-sm font-semibold truncate ${played ? (t1Won ? "text-foreground" : "text-muted-foreground") : "text-foreground"}`}>
                      {match.team1Name}
                    </span>
                  </div>

                  {/* Score / VS */}
                  {played ? (
                    <div className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-2xl text-xl font-black tabular-nums shadow-lg ${
                      isDraw
                        ? "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20"
                        : t1Won
                          ? "bg-green-500/10 text-green-600 ring-1 ring-green-500/20"
                          : "bg-red-500/10 text-red-600 ring-1 ring-red-500/20"
                    }`}>
                      <span className={t1Won ? "text-foreground" : "text-muted-foreground/60"}>{s1}</span>
                      <span className="text-muted-foreground text-sm font-normal">:</span>
                      <span className={!t1Won ? "text-foreground" : "text-muted-foreground/60"}>{s2}</span>
                    </div>
                  ) : (
                    <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/40 text-xs font-bold text-muted-foreground border border-border/50">
                      <Clock className="h-3.5 w-3.5" />
                      VS
                    </div>
                  )}
                </div>

                {/* Team 2 */}
                <div className="flex items-center gap-2 mb-3">
                    <span onClick={e => { e.stopPropagation(); router.push(`/team/${match.team2}`); }} className="shrink-0 cursor-pointer">
                      <span className="text-3xl hover:scale-125 transition-transform inline-block drop-shadow-sm">{match.team2Flag}</span>
                    </span>
                  <span className={`text-sm font-semibold truncate ${played ? (!t1Won ? "text-foreground" : "text-muted-foreground") : "text-foreground"}`}>
                    {match.team2Name}
                  </span>
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-md">
                    <Calendar className="h-3 w-3" />
                    {match.date}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-md truncate max-w-[150px]" title={match.venue}>
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{match.venue}</span>
                  </span>
                  {!played && (
                    <span
                      onClick={e => {
                        e.stopPropagation();
                        window.open("https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026", "_blank", "noopener,noreferrer");
                      }}
                      className="ml-auto inline-flex items-center gap-1 font-medium text-green-600 bg-green-500/10 hover:bg-green-500/20 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                    >
                      <Tv className="h-3 w-3" />
                      Watch
                    </span>
                  )}
                </div>

                {/* Star of the Match */}
                {played && star && (
                  <>
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-3" />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); e.preventDefault(); router.push(`/player/${slugify(star.playerName)}`); }}
                      className="flex items-center gap-3 group/star w-full text-left cursor-pointer"
                    >
                      <div className="relative shrink-0">
                        <PlayerAvatar name={star.playerName} photoUrl={starPhotos[star.playerName]} size="sm" className="ring-2 ring-amber-500/30" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center shadow-sm glow" style={{ "--glow-color": "rgba(245,158,11,0.5)" } as React.CSSProperties}>
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
                              <span>{star.minutes.join("' · ")}&apos;</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                        <Medal className="h-3 w-3" />
                        MOTM
                      </div>
                    </button>
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          {groups.map((g, i) => (
            <Button
              key={g}
              variant={i === groupIdx ? "default" : "outline"}
              size="icon"
              onClick={() => setGroupIdx(i)}
            >
              {g}
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setGroupIdx(Math.floor(Math.random() * groups.length))}
          className="text-xs"
        >
          Random
        </Button>
      </div>

      <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-xl border border-border p-6 md:p-8 text-center animate-in">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 float">
          <Trophy className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-1">Knockout Stage</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Round of 32, Round of 16, Quarter-finals, Semi-finals, and Final —
          <Link href="/bracket" className="text-primary hover:underline font-medium ml-1">view bracket →</Link>
        </p>
      </div>
    </div>
  );
}
