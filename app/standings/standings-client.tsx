"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GROUPS } from "@/data/worldcup-2026";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";

interface StandingRow {
  teamId: string;
  teamName: string;
  flag: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form: ("W" | "D" | "L")[];
}

const formColors: Record<string, string> = {
  W: "bg-green-500 text-white",
  D: "bg-amber-500 text-white",
  L: "bg-red-500 text-white",
};

export default function StandingsClient() {
  const [groupIdx, setGroupIdx] = useState(0);
  const [allStandings, setAllStandings] = useState<Record<string, StandingRow[]>>({});

  useEffect(() => {
    fetch("/api/teams/standings")
      .then((r) => r.json())
      .then((data) => setAllStandings(data))
      .catch(() => {});
  }, []);

  const standings = useMemo(() => allStandings[GROUPS[groupIdx]] || [], [groupIdx, allStandings]);
  const group = GROUPS[groupIdx];

  const topGF = Math.max(...standings.map(s => s.goalsFor), 1);

  return (
    <div>
      <div className="mb-8 animate-in">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Group Standings</h1>
        <p className="text-muted-foreground">Live standings across all 12 groups</p>
      </div>

      <div className="flex items-center justify-between mb-6 animate-in animate-in-delay-1">
        <h2 className="text-xl font-bold border-l-4 border-primary pl-3">Group {group}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setGroupIdx(i => Math.max(0, i - 1))} disabled={groupIdx === 0}>
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Prev</span>
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">{groupIdx + 1} / {GROUPS.length}</span>
          <Button variant="outline" size="sm" onClick={() => setGroupIdx(i => Math.min(GROUPS.length - 1, i + 1))} disabled={groupIdx >= GROUPS.length - 1}>
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {GROUPS.map((g, i) => (
          <Button key={g} variant={i === groupIdx ? "default" : "outline"} size="sm" onClick={() => setGroupIdx(i)} className="min-w-[36px]">
            {g}
          </Button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden animate-in animate-in-delay-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider w-8">#</th>
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">Team</th>
              <th className="text-center py-3 px-2 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider w-7">P</th>
              <th className="text-center py-3 px-2 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider w-7">W</th>
              <th className="text-center py-3 px-2 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider w-7">D</th>
              <th className="text-center py-3 px-2 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider w-7">L</th>
              <th className="text-center py-3 px-2 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider w-8">GF</th>
              <th className="text-center py-3 px-2 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider w-8">GA</th>
              <th className="text-center py-3 px-2 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider w-8">GD</th>
              <th className="text-center py-3 px-2 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider hidden sm:table-cell">Form</th>
              <th className="text-center py-3 px-3 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider w-10">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => {
              const qualified = i < 2;
              const gfPercent = Math.min(100, (s.goalsFor / topGF) * 100);
              const gaPercent = Math.min(100, (s.goalsAgainst / Math.max(...standings.map(x => x.goalsAgainst), 1)) * 100);
              return (
                <tr key={s.teamId} className={`border-b border-border last:border-0 transition-all duration-200 hover:bg-secondary/20 ${
                  qualified ? "bg-primary/[0.015]" : ""
                }`}>
                  <td className="py-3 px-3">
                    <span className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                      i === 0 ? "bg-green-500/15 text-green-600 ring-1 ring-green-500/20" :
                      i === 1 ? "bg-primary/10 text-primary ring-1 ring-primary/20" :
                      "text-muted-foreground bg-secondary/50"
                    }`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <Link href={`/team/${s.teamId}`} className="flex items-center gap-2.5 hover:text-primary transition-colors group">
                      <span className="text-xl drop-shadow-sm">{s.flag}</span>
                      <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {s.teamName}
                      </span>
                      <div className="ml-auto flex items-center gap-1">
                        {i === 0 && <TrendingUp className="h-3.5 w-3.5 text-green-500" />}
                        {i === standings.length - 1 && standings.length > 2 && <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 rounded-full bg-green-500/10 overflow-hidden">
                        <div className="h-full rounded-full bg-green-500/60 transition-all duration-500" style={{ width: `${gfPercent}%` }} />
                      </div>
                      <div className="flex-1 h-1.5 rounded-full bg-red-500/10 overflow-hidden">
                        <div className="h-full rounded-full bg-red-500/60 transition-all duration-500" style={{ width: `${gaPercent}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-muted-foreground/60 mt-0.5">
                      <span>GF {s.goalsFor}</span>
                      <span>GA {s.goalsAgainst}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-2 tabular-nums font-semibold">{s.played}</td>
                  <td className="text-center py-3 px-2 tabular-nums font-semibold text-green-600">{s.won}</td>
                  <td className="text-center py-3 px-2 tabular-nums font-semibold text-amber-600">{s.drawn}</td>
                  <td className="text-center py-3 px-2 tabular-nums font-semibold text-red-600">{s.lost}</td>
                  <td className="text-center py-3 px-2 tabular-nums font-semibold">{s.goalsFor}</td>
                  <td className="text-center py-3 px-2 tabular-nums font-semibold">{s.goalsAgainst}</td>
                  <td className={`text-center py-3 px-2 tabular-nums font-semibold ${
                    s.goalDiff > 0 ? "text-green-600" : s.goalDiff < 0 ? "text-red-600" : ""
                  }`}>
                    {s.goalDiff > 0 ? "+" : ""}{s.goalDiff}
                  </td>
                  <td className="text-center py-3 px-2 hidden sm:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      {s.form.length > 0 ? s.form.map((f, fi) => (
                        <span key={fi} className={`w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center ${formColors[f]}`}>
                          {f}
                        </span>
                      )) : (
                        <span className="text-[9px] text-muted-foreground/40">—</span>
                      )}
                    </div>
                  </td>
                  <td className="text-center py-3 px-3">
                    <span className={`inline-flex items-center justify-center min-w-[2rem] h-7 rounded-lg text-base font-black tabular-nums ${
                      qualified ? "bg-primary/10 text-primary" : ""
                    }`}>
                      {s.points}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground animate-in">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-primary/20 ring-1 ring-primary/30" />
          <span>Qualification</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-green-500" />
          <span>Win</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-500" />
          <span>Draw</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-500" />
          <span>Loss</span>
        </div>
      </div>
    </div>
  );
}
