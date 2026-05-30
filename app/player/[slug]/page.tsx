import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Trophy, Users, MapPin, Calendar, ChevronRight, Goal, Clock, Activity, Award, Shirt, Star, Zap, Swords, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { findPlayerByName, slugify, getAdjacentPlayers, getRelatedPlayers, getPlayerMatchPerformances, getTeamById, getAllPlayers } from "@/data/worldcup-2026";
import PlayerHighlight from "@/components/player-highlight";
import PlayerAvatar from "@/components/player-avatar";
import ShareButton from "@/components/share-button";
import { getPlayerAttributes, ATTR_LABELS as ATTR_LABELS_UI, ATTR_COLORS as ATTR_COLORS_UI } from "@/lib/player-attributes";

function titleCase(name: string): string {
  return name.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

async function getWikipediaData(name: string) {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const name = titleCase(slug);
  const result = findPlayerByName(name);
  if (!result) return { title: "Player Not Found" };
  return {
    title: `${result.player.name} — WorldCup 2026`,
    description: `${result.player.name} · ${result.player.position} · ${result.team.name}`,
  };
}

const POSITION_GRADIENTS: Record<string, string> = {
  FW: "oklch(0.64 0.24 22)",
  MF: "oklch(0.62 0.21 238)",
  DF: "oklch(0.63 0.19 159)",
  GK: "oklch(0.72 0.20 66)",
};

function posGradient(position: string): string {
  return POSITION_GRADIENTS[position] || POSITION_GRADIENTS.FW;
}

const POSITION_THEME: Record<string, { label: string; accent: string; bg: string; gradient: string; light: string; ring: string; icon: typeof Star }> = {
  FW: { label: "Forward", accent: "text-rose-500", bg: "bg-rose-500", gradient: "from-rose-500/30 to-rose-500/5", light: "bg-rose-500/10", ring: "ring-rose-500/30", icon: Goal },
  MF: { label: "Midfielder", accent: "text-blue-500", bg: "bg-blue-500", gradient: "from-blue-500/30 to-blue-500/5", light: "bg-blue-500/10", ring: "ring-blue-500/30", icon: Zap },
  DF: { label: "Defender", accent: "text-emerald-500", bg: "bg-emerald-500", gradient: "from-emerald-500/30 to-emerald-500/5", light: "bg-emerald-500/10", ring: "ring-emerald-500/30", icon: ShieldCheck },
  GK: { label: "Goalkeeper", accent: "text-amber-500", bg: "bg-amber-500", gradient: "from-amber-500/30 to-amber-500/5", light: "bg-amber-500/10", ring: "ring-amber-500/30", icon: Shirt },
};



export function generateStaticParams() {
  return getAllPlayers().map((p) => ({ slug: slugify(p.name) }));
}

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = titleCase(slug);
  const result = findPlayerByName(name);
  if (!result) notFound();

  const { player, team } = result;
  const wiki = await getWikipediaData(player.name);
  const photo = wiki?.thumbnail?.source || null;
  const description = wiki?.extract || null;

  const { prev, next } = getAdjacentPlayers(player.name);
  const related = getRelatedPlayers(player.name, team.id, player.position);

  const performances = getPlayerMatchPerformances(player.name, team.id);
  const totalGoals = performances.reduce((s, p) => s + p.goals, 0);
  const totalMatches = performances.length;
  const wins = performances.filter(p => p.isWin).length;
  const draws = performances.filter(p => p.isDraw).length;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const lost = totalMatches - wins - draws;

  const theme = POSITION_THEME[player.position] || POSITION_THEME.FW;
  const PositionIcon = theme.icon;
  const attributes = await getPlayerAttributes(player.name, player.position, player.age, team.fifaRanking, team.confederation);

  return (
    <div>
      {/* ===== HERO SECTION ===== */}
      <div className="relative rounded-[2rem] overflow-hidden mb-10 min-h-[420px] md:min-h-[500px]">
        {/* Backdrop */}
        {photo ? (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105" style={{ backgroundImage: `url(${photo})` }} />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/40" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: `radial-gradient(circle, ${posGradient(player.position)}, transparent 70%)` }} />

        {/* Breadcrumbs */}
        <div className="relative z-10 p-6 md:p-8">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground/80 mb-3">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/players" className="hover:text-foreground transition-colors">Players</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/team/${team.id}`} className="hover:text-foreground transition-colors">{team.name}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{player.name}</span>
          </nav>
        </div>

        {/* Hero content */}
        <div className="relative z-10 px-6 md:px-8 pb-6 md:pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 absolute bottom-0 left-0 right-0">
          {/* Avatar */}
          <div className="relative shrink-0 -mb-16 md:-mb-20">
            <div className={`absolute -inset-2 rounded-[2rem] bg-gradient-to-b ${theme.gradient} blur-2xl opacity-60`} />
            <div className={`absolute -inset-1 rounded-[1.5rem] ${theme.light} blur-xl`} />
            {photo ? (
              <div className="relative w-28 h-28 md:w-44 md:h-44 rounded-[1.25rem] overflow-hidden ring-4 ring-background/80 shadow-2xl">
                <img src={photo} alt={player.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className={`relative w-28 h-28 md:w-44 md:h-44 rounded-[1.25rem] bg-gradient-to-br ${theme.gradient} ring-4 ring-background/80 shadow-2xl flex items-center justify-center`}>
                <span className="text-4xl md:text-6xl font-black text-white/80">{player.name.split(" ").map(n => n[0]).join("")}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left pb-2">
            <div className="flex items-center gap-2.5 justify-center md:justify-start mb-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${theme.light} ${theme.accent} border-current/20`}>
                <PositionIcon className="h-3 w-3" />
                {player.position}
              </span>
              <span className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{player.age}</span> years old
              </span>
              <span className="text-muted-foreground/40">·</span>
              <Link href={`/team/${team.id}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group">
                <span className="text-lg group-hover:scale-110 transition-transform">{team.flag}</span>
                <span className="font-medium">{team.name}</span>
              </Link>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-foreground leading-[1.05] tracking-tight">{player.name}</h1>
            <div className="flex items-center gap-4 mt-3 justify-center md:justify-start">
              <ShareButton title={player.name} text={`Check out ${player.name} on WorldCup 2026`} />
              <span className="text-xs text-muted-foreground">
                FIFA #{team.fifaRanking} · Group {team.group} · {team.confederation}
              </span>
            </div>
          </div>

          {/* Prev/Next */}
          <div className="hidden md:flex items-center gap-2 shrink-0 pb-2">
            {prev && (
              <Button variant="secondary" size="sm" asChild className="backdrop-blur-sm bg-background/40 hover:bg-background/60 border-border/50">
                <Link href={`/player/${slugify(prev.name)}`}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {prev.name.split(" ").pop()}
                </Link>
              </Button>
            )}
            {next && (
              <Button variant="secondary" size="sm" asChild className="backdrop-blur-sm bg-background/40 hover:bg-background/60 border-border/50">
                <Link href={`/player/${slugify(next.name)}`}>
                  {next.name.split(" ").pop()}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ===== CONTENT GRID ===== */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-72 flex-shrink-0 order-2 lg:order-1 space-y-4">
          {/* Position card */}
          <div className={`relative overflow-hidden rounded-2xl border border-border p-5 ${theme.light}`}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20" style={{ background: `radial-gradient(circle, ${posGradient(player.position)}, transparent 70%)` }} />
            <div className="relative z-10 flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${theme.bg} flex items-center justify-center shadow-lg`}>
                <PositionIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Position</p>
                <p className="font-bold text-lg">{theme.label}</p>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-2xl border border-border p-4 text-center relative overflow-hidden group hover:ring-2 hover:ring-primary/30 transition-all">
              <div className="absolute top-0 right-0 w-12 h-12 -mr-4 -mt-4 rounded-full bg-blue-500/5" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Age</p>
              <p className="text-3xl font-black tabular-nums">{player.age}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">Years old</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-4 text-center relative overflow-hidden group hover:ring-2 hover:ring-primary/30 transition-all">
              <div className="absolute top-0 right-0 w-12 h-12 -mr-4 -mt-4 rounded-full bg-emerald-500/5" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Squad</p>
              <p className="text-3xl font-black tabular-nums">{team.id === "france" || team.id === "argentina" || team.id === "brazil" ? 23 : 26}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">Players</p>
            </div>
          </div>

          {/* Team card */}
          <div className="bg-card rounded-2xl border border-border p-5 relative overflow-hidden group hover:ring-2 hover:ring-primary/30 transition-all">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">National Team</p>
            <Link href={`/team/${team.id}`} className="flex items-center gap-3 group/link">
              <span className="text-4xl">{team.flag}</span>
              <div className="min-w-0">
                <p className="font-bold group-hover/link:text-primary transition-colors">{team.name}</p>
                <p className="text-xs text-muted-foreground">
                  Group {team.group} · FIFA #{team.fifaRanking}
                </p>
              </div>
            </Link>
            <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
              <Shirt className="h-3 w-3" />
              <span>Coach: <span className="font-medium text-foreground">{team.coach}</span></span>
            </div>
          </div>

          {/* Confederation badge */}
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Confederation</p>
            <p className="font-bold">{team.confederation}</p>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 order-1 lg:order-2 space-y-8">
          {/* ===== ATTRIBUTES (Signature Section) ===== */}
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-[0.04] ${theme.bg}`} />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl ${theme.light} flex items-center justify-center`}>
                  <Zap className={`h-5 w-5 ${theme.accent}`} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Player Attributes</h2>
                  <p className="text-xs text-muted-foreground">Performance rating based on position and experience</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {Object.entries(attributes).map(([key, val]) => {
                  const color = ATTR_COLORS_UI[key] || "bg-primary";
                  return (
                    <div key={key} className="group">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{ATTR_LABELS_UI[key] || key}</span>
                        <span className={`text-sm font-black tabular-nums ${val >= 80 ? theme.accent : val >= 60 ? "text-foreground" : "text-muted-foreground"}`}>
                          {val}
                        </span>
                      </div>
                      <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ${color}`}
                          style={{ width: `${val}%` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                      </div>
                      {/* Threshold markers */}
                      <div className="flex justify-between mt-0.5">
                        <span className="text-[8px] text-muted-foreground/40">0</span>
                        <span className="text-[8px] text-muted-foreground/40">50</span>
                        <span className="text-[8px] text-muted-foreground/40">99</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-[10px] text-muted-foreground">
                <Star className={`h-3 w-3 ${theme.accent}`} />
                <span>Overall ratings adjusted for age and position specialty</span>
              </div>
            </div>
          </div>

          {/* ===== STATS HIGHLIGHTS ===== */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={Goal} value={totalGoals.toString()} label="Goals" accent="text-rose-500" gradient="from-rose-500/20 to-rose-500/5" />
            <StatCard icon={Activity} value={totalMatches.toString()} label="Matches" accent="text-blue-500" gradient="from-blue-500/20 to-blue-500/5" />
            <StatCard icon={Award} value={`${winRate}%`} label="Win Rate" accent="text-amber-500" gradient="from-amber-500/20 to-amber-500/5" />
            <StatCard icon={Trophy} value={wins.toString()} label="Wins" accent="text-emerald-500" gradient="from-emerald-500/20 to-emerald-500/5" />
          </div>

          {/* ===== BIOGRAPHY ===== */}
          {description && (
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-[0.03] bg-primary" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold">Biography</h2>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                {wiki?.content_urls?.edit && (
                  <a href={wiki.content_urls.wikipedia} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-3">
                    Read more on Wikipedia →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* ===== MATCH PERFORMANCE ===== */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-9 h-9 rounded-xl ${theme.light} flex items-center justify-center`}>
                <Goal className={`h-4 w-4 ${theme.accent}`} />
              </div>
              <h2 className="text-lg font-bold">Match Performance</h2>
              <div className="h-px flex-1 bg-border" />
              {totalMatches > 0 && (
                <span className="text-xs text-muted-foreground tabular-nums">{totalMatches} match{totalMatches !== 1 ? "es" : ""}</span>
              )}
            </div>
            {performances.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border p-12 text-center">
                <div className="w-20 h-20 rounded-[1.25rem] bg-gradient-to-br from-secondary to-card mx-auto flex items-center justify-center mb-5 ring-1 ring-border">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">Match data coming soon</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  {player.name}&apos;s performances will appear here once the World Cup begins on <span className="font-semibold text-foreground">June 11, 2026</span>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {performances.map((p, idx) => (
                  <Link
                    key={p.matchId}
                    href={`/match/${p.matchId}`}
                    className="block bg-card rounded-2xl border border-border hover:ring-2 hover:ring-primary/50 transition-all group overflow-hidden"
                  >
                    <div className="flex items-center gap-4 p-4">
                      {/* Win/Draw/Loss indicator */}
                      <div className={`shrink-0 w-1.5 h-12 rounded-full ${
                        p.isWin ? "bg-emerald-500" : p.isDraw ? "bg-amber-500" : "bg-red-500"
                      }`} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{p.opponentFlag}</span>
                          <span className="text-sm font-semibold group-hover:text-primary transition-colors">vs {p.opponent}</span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            p.isWin ? "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20" : p.isDraw ? "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20" : "bg-red-500/10 text-red-600 ring-1 ring-red-500/20"
                          }`}>
                            {p.teamScore} - {p.opponentScore}
                          </span>
                          <span className={`text-[10px] font-medium ${p.isWin ? "text-emerald-600" : p.isDraw ? "text-amber-600" : "text-red-600"}`}>
                            {p.isWin ? "W" : p.isDraw ? "D" : "L"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{p.date}</span>
                          <span>·</span>
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{p.venue}</span>
                          <span>·</span>
                          <span className="text-[10px] capitalize">{p.stage}</span>
                        </div>
                      </div>

                      {/* Goals scored */}
                      <div className="text-right shrink-0">
                        {p.goals > 0 ? (
                          <div className="flex flex-col items-end">
                            <div className={`flex items-center gap-1.5 ${theme.accent}`}>
                              <Goal className={`h-5 w-5 ${theme.accent}`} />
                              <span className="text-2xl font-black tabular-nums">{p.goals}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">goal{p.goals !== 1 ? "s" : ""}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No goals</span>
                        )}
                      </div>
                    </div>
                    {p.goals > 0 && (
                      <div className="flex items-center gap-1.5 px-4 pb-4 pl-[3.25rem]">
                        {p.minutes.map((min, i) => (
                          <span key={i} className={`inline-flex items-center px-2.5 py-0.5 rounded-md ${theme.light} ${theme.accent} text-[10px] font-bold tabular-nums ring-1 ring-current/20`}>
                            {min}&apos;
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ===== HIGHLIGHTS ===== */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-9 h-9 rounded-xl ${theme.light} flex items-center justify-center`}>
                <Star className={`h-4 w-4 ${theme.accent}`} />
              </div>
              <h2 className="text-lg font-bold">Highlights</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <PlayerHighlight
              name={player.name}
              teamName={team.name}
              position={player.position}
              age={player.age}
              teamId={team.id}
            />
          </div>
        </div>
      </div>

      {/* ===== RELATED PLAYERS ===== */}
      {related.length > 0 && (
        <div className="mt-14 pt-10 border-t border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Related Players</h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {related.map((p) => {
              const pTheme = POSITION_THEME[p.position] || POSITION_THEME.FW;
              return (
                <Link
                  key={`${p.teamId}-${p.name}`}
                  href={`/player/${slugify(p.name)}`}
                  className={`group relative bg-card rounded-2xl border border-border hover:${pTheme.ring} transition-all p-5 text-center overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-b ${pTheme.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative z-10">
                    <div className="relative inline-block mb-3">
                      <PlayerAvatar name={p.name} size="sm" className="ring-2 ring-border group-hover:ring-primary/40 transition-all mx-auto" />
                      <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${pTheme.light} flex items-center justify-center ring-2 ring-background`}>
                        <span className={`text-[8px] font-bold ${pTheme.accent}`}>{p.position}</span>
                      </span>
                    </div>
                    <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{p.name}</p>
                    <div className="flex items-center justify-center gap-1 mt-0.5 text-xs text-muted-foreground">
                      <span>{p.teamFlag}</span>
                      <span className="truncate">{p.teamName}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Prev/Next footer */}
          <div className="flex items-center justify-center gap-3 mt-8">
            {prev && (
              <Button variant="outline" asChild>
                <Link href={`/player/${slugify(prev.name)}`}>
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">{prev.name}</span>
                  <span className="sm:hidden">Prev</span>
                </Link>
              </Button>
            )}
            {next && (
              <Button variant="outline" asChild>
                <Link href={`/player/${slugify(next.name)}`}>
                  <span className="hidden sm:inline">{next.name}</span>
                  <span className="sm:hidden">Next</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, value, label, accent, gradient }: { icon: typeof Goal; value: string; label: string; accent: string; gradient: string }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 text-center group hover:ring-2 hover:ring-primary/30 transition-all relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/[0.02]" />
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`h-5 w-5 ${accent}`} />
      </div>
      <p className="text-3xl font-black tabular-nums">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}
