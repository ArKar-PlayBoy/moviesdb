import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Trophy, Users, MapPin, Calendar, ChevronRight, Goal, Clock, Activity, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { findPlayerByName, slugify, getAdjacentPlayers, getRelatedPlayers, getPlayerMatchPerformances, getTeamById } from "@/data/worldcup-2026";
import PlayerHighlight from "@/components/player-highlight";
import PlayerAvatar from "@/components/player-avatar";
import ShareButton from "@/components/share-button";

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

  const initials = player.name.split(" ").map(n => n[0]).join("");

  const positionColors: Record<string, { bg: string; text: string; gradient: string }> = {
    FW: { bg: "bg-green-500/10", text: "text-green-600", gradient: "from-green-500/30 to-green-500/5" },
    MF: { bg: "bg-blue-500/10", text: "text-blue-600", gradient: "from-blue-500/30 to-blue-500/5" },
    DF: { bg: "bg-amber-500/10", text: "text-amber-600", gradient: "from-amber-500/30 to-amber-500/5" },
    GK: { bg: "bg-purple-500/10", text: "text-purple-600", gradient: "from-purple-500/30 to-purple-500/5" },
  };
  const pc = positionColors[player.position] || positionColors.FW;

  return (
    <div>
      {/* ===== HERO BACKDROP (moviesdb style) ===== */}
      <div className="relative rounded-2xl overflow-hidden mb-8 min-h-[320px] md:min-h-[400px]">
        {/* Backdrop image */}
        {photo ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${photo})` }}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${pc.gradient}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />

        {/* Breadcrumbs overlay */}
        <div className="relative z-10 p-4 md:p-6">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/team/${team.id}`} className="hover:text-foreground transition-colors">{team.name}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{player.name}</span>
          </nav>
        </div>

        {/* Overlay content */}
        <div className="relative z-10 px-4 md:px-8 pb-6 md:pb-8 flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-8 mt-auto absolute bottom-0 left-0 right-0">
          {/* Avatar */}
          <div className="relative shrink-0 -mb-12 md:-mb-16">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-primary/40 to-transparent blur-xl" />
            {photo ? (
              <div className="relative w-24 h-24 md:w-36 md:h-36 rounded-2xl overflow-hidden ring-4 ring-background shadow-2xl">
                <img
                  src={photo}
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="relative w-24 h-24 md:w-36 md:h-36 rounded-2xl bg-gradient-to-br from-card to-secondary ring-4 ring-background shadow-2xl flex items-center justify-center">
                <span className="text-3xl md:text-5xl font-bold text-muted-foreground">{initials}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left pb-1">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${pc.bg} ${pc.text} border-current/20`}>
                {player.position}
              </span>
              <span className="text-xs text-muted-foreground">Age {player.age}</span>
              <span className="text-muted-foreground/40">·</span>
              <Link href={`/team/${team.id}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <span>{team.flag}</span>
                {team.name}
              </Link>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-foreground leading-tight tracking-tight">{player.name}</h1>
            <div className="flex items-center gap-3 mt-2 justify-center md:justify-start">
              <ShareButton title={player.name} text={`Check out ${player.name} on WorldCup 2026`} />
              <span className="text-xs text-muted-foreground">FIFA #{team.fifaRanking} · Group {team.group}</span>
            </div>
          </div>

          {/* Prev/Next */}
          <div className="hidden md:flex items-center gap-2 shrink-0 pb-1">
            {prev && (
              <Button variant="secondary" size="sm" asChild className="backdrop-blur-sm bg-background/60 hover:bg-background/80">
                <Link href={`/player/${slugify(prev.name)}`}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {prev.name.split(" ").pop()}
                </Link>
              </Button>
            )}
            {next && (
              <Button variant="secondary" size="sm" asChild className="backdrop-blur-sm bg-background/60 hover:bg-background/80">
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
        {/* Sidebar — quick facts */}
        <div className="lg:w-64 flex-shrink-0 order-2 lg:order-1">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            <div className="bg-card rounded-xl border border-border p-4 relative overflow-hidden group hover:ring-2 hover:ring-primary/50 transition-all">
              <div className="absolute top-0 right-0 w-16 h-16 -mr-6 -mt-6 rounded-full bg-primary/5" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Position</p>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg ${pc.bg} flex items-center justify-center`}>
                  <span className={`text-xs font-bold ${pc.text}`}>{player.position}</span>
                </div>
                <p className="font-bold">
                  {player.position === "FW" ? "Forward" : player.position === "MF" ? "Midfielder" : player.position === "DF" ? "Defender" : "Goalkeeper"}
                </p>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 relative overflow-hidden group hover:ring-2 hover:ring-primary/50 transition-all">
              <div className="absolute top-0 right-0 w-16 h-16 -mr-6 -mt-6 rounded-full bg-blue-500/5" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Age</p>
              <p className="text-2xl font-black tabular-nums">{player.age}</p>
              <p className="text-[10px] text-muted-foreground">Years old</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 relative overflow-hidden group hover:ring-2 hover:ring-primary/50 transition-all col-span-2 lg:col-span-1">
              <div className="absolute top-0 right-0 w-16 h-16 -mr-6 -mt-6 rounded-full bg-green-500/5" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">National Team</p>
              <Link href={`/team/${team.id}`} className="flex items-center gap-2 hover:text-primary transition-colors group/link">
                <span className="text-2xl">{team.flag}</span>
                <div>
                  <p className="font-bold text-sm group-hover/link:text-primary transition-colors">{team.name}</p>
                  <p className="text-[10px] text-muted-foreground">Group {team.group} · FIFA #{team.fifaRanking}</p>
                </div>
              </Link>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Coach</p>
              <p className="font-bold truncate">{team.coach}</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 order-1 lg:order-2 space-y-8">
          {/* Stats highlight row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-card rounded-xl border border-border p-4 text-center group hover:ring-2 hover:ring-primary/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <Goal className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-black tabular-nums">{totalGoals}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Goals</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center group hover:ring-2 hover:ring-primary/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-black tabular-nums">{totalMatches}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Matches</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center group hover:ring-2 hover:ring-primary/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <Award className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-2xl font-black tabular-nums">{winRate}%</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Win Rate</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center group hover:ring-2 hover:ring-primary/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <Clock className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-black tabular-nums">{wins}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Wins</p>
            </div>
          </div>

          {/* Biography */}
          {description && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-bold mb-3 border-l-4 border-primary pl-3">Biography</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              {wiki?.content_urls?.edit && (
                <a href={wiki.content_urls.wikipedia} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-2 inline-block">
                  Read more on Wikipedia →
                </a>
              )}
            </div>
          )}

          {/* Match Performance */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Goal className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-lg font-bold">Match Performance</h2>
              <div className="h-px flex-1 bg-border" />
              {totalMatches > 0 && (
                <span className="text-xs text-muted-foreground tabular-nums">{totalMatches} match{totalMatches !== 1 ? "es" : ""}</span>
              )}
            </div>
            {performances.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border p-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-card mx-auto flex items-center justify-center mb-4 ring-1 ring-border">
                  <Clock className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold mb-1">Match data coming soon</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  {player.name}&apos;s match performances will appear here once the World Cup begins on June 11, 2026
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {performances.map((p, idx) => (
                  <Link
                    key={p.matchId}
                    href={`/match/${p.matchId}`}
                    className="block bg-card rounded-xl border border-border hover:ring-2 hover:ring-primary/50 transition-all group overflow-hidden animate-in"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex items-center gap-4 p-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{p.opponentFlag}</span>
                          <span className="text-sm font-semibold group-hover:text-primary transition-colors">vs {p.opponent}</span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            p.isWin ? "bg-green-500/10 text-green-600 ring-1 ring-green-500/20" : p.isDraw ? "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20" : "bg-red-500/10 text-red-600 ring-1 ring-red-500/20"
                          }`}>
                            {p.teamScore} - {p.opponentScore}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{p.date}</span>
                          <span>·</span>
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{p.venue}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {p.goals > 0 ? (
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1 text-green-600">
                              <Goal className="h-4 w-4 fill-current" />
                              <span className="text-xl font-black tabular-nums">{p.goals}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">goal{p.goals !== 1 ? "s" : ""}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No goals</span>
                        )}
                      </div>
                    </div>
                    {p.goals > 0 && (
                      <div className="flex items-center gap-1.5 px-4 pb-3">
                        {p.minutes.map((min, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-500/10 text-green-600 text-[10px] font-bold tabular-nums ring-1 ring-green-500/20">
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

          {/* Highlights */}
          <div>
            <h2 className="text-lg font-bold mb-3 border-l-4 border-primary pl-3">Highlights</h2>
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
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">People you may want to know</h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {related.map((p, idx) => (
              <Link
                key={`${p.teamId}-${p.name}`}
                href={`/player/${slugify(p.name)}`}
                className="group block bg-card rounded-xl border border-border hover:ring-2 hover:ring-primary transition-all p-4 text-center"
              >
                <PlayerAvatar name={p.name} size="sm" className="mx-auto mb-2 ring-2 ring-border group-hover:ring-primary/50 transition-all" />
                <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{p.name}</p>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <span className="text-xs text-muted-foreground">{p.position}</span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-xs text-muted-foreground">{p.age}yr</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.teamFlag} {p.teamName}</p>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {prev && (
              <Button variant="outline" asChild>
                <Link href={`/player/${slugify(prev.name)}`}>
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  {prev.name}
                </Link>
              </Button>
            )}
            {next && (
              <Button variant="outline" asChild>
                <Link href={`/player/${slugify(next.name)}`}>
                  {next.name}
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
