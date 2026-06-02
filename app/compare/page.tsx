"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeftRight, Search, X, TrendingUp, Swords } from "lucide-react";

interface CompareTeam {
  id: string; name: string; flag: string; fifaRanking: number;
  group: string; confederation: string; coach: string; players: { age: number }[];
}

interface StandingEntry {
  teamId: string; teamName: string; teamFlag: string; won: number;
  drawn: number; lost: number; goalsFor: number; goalsAgainst: number; points: number;
}

interface MatchResult {
  id: string; date: string; venue: string; stage: string;
  team1: string; team2: string; team1Name: string; team2Name: string;
  team1Flag: string; team2Flag: string; score1: number; score2: number;
  liveStatus: string;
}

function useDebounce(value: string, ms: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => { const id = setTimeout(() => setDebounced(value), ms); return () => clearTimeout(id); }, [value, ms]);
  return debounced;
}

export default function ComparePage() {
  const [teams, setTeams] = useState<CompareTeam[]>([]);
  const [standings, setStandings] = useState<Record<string, StandingEntry[]>>({});
  const [allMatches, setAllMatches] = useState<MatchResult[]>([]);
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);

  useEffect(() => {
    fetch("/api/teams").then((r) => r.json()).then(setTeams).catch(() => {});
    fetch("/api/teams/standings").then((r) => r.json()).then(setStandings).catch(() => {});
    fetch("/api/matches?limit=200").then((r) => r.json()).then(setAllMatches).catch(() => {});
  }, []);

  const safeTeams = teams || [];
  const debounced1 = useDebounce(search1, 150);
  const debounced2 = useDebounce(search2, 150);
  const filtered1 = safeTeams.filter((t) => t.name.toLowerCase().includes(debounced1.toLowerCase()));
  const filtered2 = safeTeams.filter((t) => t.name.toLowerCase().includes(debounced2.toLowerCase()));

  const t1 = safeTeams.find((t) => t.id === team1);
  const t2 = safeTeams.find((t) => t.id === team2);

  const h2h = useMemo(() => {
    if (!t1 || !t2) return null;
    const matches = allMatches.filter(
      (m) => (m.team1 === t1.id && m.team2 === t2.id) || (m.team1 === t2.id && m.team2 === t1.id)
    ).filter(m => m.liveStatus === "finished");
    const t1Wins = matches.filter(m => (m.team1 === t1.id && m.score1 > m.score2) || (m.team2 === t1.id && m.score2 > m.score1)).length;
    const t2Wins = matches.filter(m => (m.team1 === t2.id && m.score1 > m.score2) || (m.team2 === t2.id && m.score2 > m.score1)).length;
    const draws = matches.length - t1Wins - t2Wins;
    return { matches, t1Wins, t2Wins, draws };
  }, [t1, t2, allMatches]);

  const form1 = useMemo(() => {
    if (!t1) return [];
    return allMatches.filter(m => (m.team1 === t1.id || m.team2 === t1.id) && m.liveStatus === "finished")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [t1, allMatches]);

  const form2 = useMemo(() => {
    if (!t2) return [];
    return allMatches.filter(m => (m.team1 === t2.id || m.team2 === t2.id) && m.liveStatus === "finished")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [t2, allMatches]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Team Comparison</h1>
        <p className="text-muted-foreground">Compare two teams side by side</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start mb-8">
        <TeamSelector
          label="Team 1"
          team={t1}
          search={search1}
          setSearch={setSearch1}
          filtered={filtered1}
          open={open1}
          setOpen={setOpen1}
          onSelect={(id) => { setTeam1(id); setOpen1(false); setSearch1(""); }}
        />
        <div className="flex items-center justify-center py-4">
          <ArrowLeftRight className="h-6 w-6 text-muted-foreground" />
        </div>
        <TeamSelector
          label="Team 2"
          team={t2}
          search={search2}
          setSearch={setSearch2}
          filtered={filtered2}
          open={open2}
          setOpen={setOpen2}
          onSelect={(id) => { setTeam2(id); setOpen2(false); setSearch2(""); }}
        />
      </div>

      {t1 && t2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <CompareCard label="FIFA Ranking" v1={`#${t1.fifaRanking}`} v2={`#${t2.fifaRanking}`} better={t1.fifaRanking < t2.fifaRanking ? 1 : t1.fifaRanking > t2.fifaRanking ? 2 : 0} />
            <CompareCard label="Group" v1={t1.group} v2={t2.group} />
            <CompareCard label="Confederation" v1={t1.confederation} v2={t2.confederation} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <CompareCard label="Squad Size" v1={String(t1.players.length)} v2={String(t2.players.length)} better={t1.players.length > t2.players.length ? 1 : t1.players.length < t2.players.length ? 2 : 0} />
            <CompareCard label="Avg Age" v1={String(avgAge(t1.players))} v2={String(avgAge(t2.players))} better={avgAge(t1.players) < avgAge(t2.players) ? 1 : avgAge(t1.players) > avgAge(t2.players) ? 2 : 0} />
            <CompareCard label="Coach" v1={t1.coach} v2={t2.coach} />
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Group Stage Projection</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <TeamProjection entry={getTeamEntry(standings, t1.id)} teamName={t1.name} />
              <TeamProjection entry={getTeamEntry(standings, t2.id)} teamName={t2.name} />
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
              <Swords className="h-4 w-4 inline mr-1.5" />
              Head to Head
            </h3>
            {h2h && h2h.matches.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-6 sm:gap-10 text-center">
                  <div>
                    <p className="text-2xl font-black text-green-600">{h2h.t1Wins}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t1.name} wins</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-muted-foreground">{h2h.draws}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Draws</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-red-600">{h2h.t2Wins}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t2.name} wins</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {h2h.matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((m) => (
                    <Link key={m.id} href={`/match/${m.id}`} className="flex items-center justify-between bg-secondary/30 rounded-lg px-4 py-2 hover:bg-secondary/50 transition-colors text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base">{m.team1Flag}</span>
                        <span className="font-medium truncate">{m.team1Name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`font-bold tabular-nums ${m.score1 > m.score2 ? "text-green-600" : m.score1 === m.score2 ? "text-muted-foreground" : "text-red-600"}`}>{m.score1}</span>
                        <span className="text-muted-foreground">-</span>
                        <span className={`font-bold tabular-nums ${m.score2 > m.score1 ? "text-green-600" : m.score2 === m.score1 ? "text-muted-foreground" : "text-red-600"}`}>{m.score2}</span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium truncate">{m.team2Name}</span>
                        <span className="text-base">{m.team2Flag}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground">
                  {t1.flag} {t1.name} {t1.group === t2.group ? `(Group ${t1.group})` : "(different groups)"}
                  <span className="mx-3 text-primary font-bold">vs</span>
                  {t2.flag} {t2.name}
                </p>
                {t1.group === t2.group ? (
                  <p className="text-sm text-muted-foreground mt-2">These teams are in the same group and will face each other in the group stage.</p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">No past meetings between these teams.</p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormCard teamName={t1.name} teamFlag={t1.flag} matches={form1} />
            <FormCard teamName={t2.name} teamFlag={t2.flag} matches={form2} />
          </div>
        </div>
      )}
    </div>
  );
}

function avgAge(players: { age: number }[]) {
  if (players.length === 0) return "-";
  return (players.reduce((s, p) => s + p.age, 0) / players.length).toFixed(1);
}

function getTeamEntry(standings: Record<string, StandingEntry[]>, teamId: string): StandingEntry | undefined {
  for (const group of Object.values(standings)) {
    const entry = group.find((e) => e.teamId === teamId);
    if (entry) return entry;
  }
  return undefined;
}

function resultColor(match: MatchResult, teamId: string) {
  const isTeam1 = match.team1 === teamId;
  const teamScore = isTeam1 ? match.score1 : match.score2;
  const oppScore = isTeam1 ? match.score2 : match.score1;
  if (teamScore > oppScore) return "bg-green-500/20 text-green-600 border-green-500/30";
  if (teamScore < oppScore) return "bg-red-500/20 text-red-600 border-red-500/30";
  return "bg-amber-500/20 text-amber-600 border-amber-500/30";
}

function resultLabel(match: MatchResult, teamId: string) {
  const isTeam1 = match.team1 === teamId;
  const teamScore = isTeam1 ? match.score1 : match.score2;
  const oppScore = isTeam1 ? match.score2 : match.score1;
  if (teamScore > oppScore) return "W";
  if (teamScore < oppScore) return "L";
  return "D";
}

function FormCard({ teamName, teamFlag, matches }: { teamName: string; teamFlag: string; matches: MatchResult[] }) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
        <TrendingUp className="h-4 w-4 inline mr-1.5" />
        {teamFlag} {teamName} — Form
      </h3>
      {matches.length > 0 ? (
        <div className="space-y-2">
          <div className="flex gap-2 mb-3">
            {matches.slice(0, 5).map((m, i) => {
              const isTeam1 = m.team1Name === teamName || m.team1Flag === teamFlag;
              const tid = isTeam1 ? m.team1 : m.team2;
              const label = resultLabel(m, tid);
              const color = resultColor(m, tid);
              return (
                <span key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${color}`}>
                  {label}
                </span>
              );
            })}
          </div>
          {matches.slice(0, 3).map((m) => {
            const isTeam1 = m.team1Name === teamName || m.team1Flag === teamFlag;
            const opponent = isTeam1 ? m.team2Name : m.team1Name;
            const oppFlag = isTeam1 ? m.team2Flag : m.team1Flag;
            const teamScore = isTeam1 ? m.score1 : m.score2;
            const oppScore = isTeam1 ? m.score2 : m.score1;
            const w = teamScore > oppScore ? "W" : teamScore < oppScore ? "L" : "D";
            return (
              <div key={m.id} className="flex items-center justify-between text-xs text-muted-foreground bg-secondary/20 rounded-lg px-3 py-1.5">
                <span className="truncate">{oppFlag} {opponent}</span>
                <span className="tabular-nums font-medium">{teamScore}-{oppScore}</span>
                <span className={`font-bold ${w === "W" ? "text-green-600" : w === "L" ? "text-red-600" : "text-amber-600"}`}>{w}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No recent matches.</p>
      )}
    </div>
  );
}

function TeamSelector({ label, team, search, setSearch, filtered, open, setOpen, onSelect }: {
  label: string;
  team: CompareTeam | undefined;
  search: string;
  setSearch: (s: string) => void;
  filtered: CompareTeam[];
  open: boolean;
  setOpen: (o: boolean) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="relative">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
      <Button
        variant="outline"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 h-auto justify-start"
      >
        {team ? (
          <>
            <span className="text-4xl">{team.flag}</span>
            <div className="text-left min-w-0">
              <p className="font-bold text-lg">{team.name}</p>
              <p className="text-xs text-muted-foreground">Group {team.group} · FIFA #{team.fifaRanking}</p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Search className="h-5 w-5" />
            <span>Select a team...</span>
          </div>
        )}
      </Button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search teams..."
                className="pl-9 pr-8"
                autoFocus
              />
              {search && (
                <Button variant="ghost" size="icon-xs" onClick={() => setSearch("")} className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Clear search">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.map((t) => (
              <Button
                key={t.id}
                variant="ghost"
                onClick={() => onSelect(t.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 h-auto justify-start"
              >
                <span className="text-2xl">{t.flag}</span>
                <div className="text-left min-w-0">
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">Group {t.group}</p>
                </div>
              </Button>
            ))}
            {filtered.length === 0 && <p className="p-3 text-sm text-muted-foreground text-center">No teams found</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function CompareCard({ label, v1, v2, better }: { label: string; v1: string; v2: string; better?: number }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 text-center">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className={`p-2 rounded-lg ${better === 1 ? "bg-green-500/10 ring-1 ring-green-500/30" : ""}`}>
          <p className="text-lg font-black">{v1}</p>
        </div>
        <div className={`p-2 rounded-lg ${better === 2 ? "bg-green-500/10 ring-1 ring-green-500/30" : ""}`}>
          <p className="text-lg font-black">{v2}</p>
        </div>
      </div>
    </div>
  );
}

function TeamProjection({ entry, teamName }: { entry: StandingEntry | undefined; teamName: string }) {
  if (!entry) {
    return <div className="text-center text-sm text-muted-foreground">No standings data for {teamName}</div>;
  }
  return (
    <div className="text-center">
      <p className="text-sm font-medium mb-2">Projected Record</p>
      <div className="flex items-center justify-center gap-3 text-sm">
        <span className="text-green-600 font-bold tabular-nums">{entry.won}W</span>
        <span className="text-amber-600 font-bold tabular-nums">{entry.drawn}D</span>
        <span className="text-red-600 font-bold tabular-nums">{entry.lost}L</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{entry.goalsFor} GF · {entry.goalsAgainst} GA</p>
      <p className="text-lg font-black mt-1">{entry.points} pts</p>
    </div>
  );
}
