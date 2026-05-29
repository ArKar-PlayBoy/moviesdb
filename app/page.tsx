import { Suspense } from "react";
import TEAMS, { GROUPS, MATCHES, getTeamsByGroup, getTeamById, getGroupStandings, getStarOfTheWeek, getTopScorers, getVenues, getAllPlayers, slugify } from "@/data/worldcup-2026";

import PlayerAvatar from "@/components/player-avatar";
import Countdown from "@/components/countdown";
import Link from "next/link";
import { Trophy, Calendar, MapPin, Users, Shield, Goal, Footprints, ChevronRight, Sparkles, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

async function StarOfTheWeekSection() {
  const star = getStarOfTheWeek();
  const team = getTeamById(star.teamId);
  let photo: string | null = null;
  let description: string | null = null;
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(star.name)}`,
      { next: { revalidate: 86400 }, signal: AbortSignal.timeout(3000) }
    );
    if (res.ok) {
      const wiki = await res.json();
      photo = wiki?.thumbnail?.source || null;
      description = wiki?.extract || null;
    }
  } catch {}

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border min-h-[300px] md:min-h-[360px]">
      {photo ? (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${photo})` }} />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -ml-12 -mb-12" />

      <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-8 min-h-[300px] md:min-h-[360px]">
        <PlayerAvatar name={star.name} size="xl" photoUrl={photo} className="-mb-8 md:-mb-12 ring-4 ring-background shadow-2xl" />

        <div className="flex-1 text-center md:text-left pb-2">
          <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
            <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.15em]">Star of the Week</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">2026</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-foreground leading-tight tracking-tight">{star.name}</h2>
          <div className="flex items-center gap-2 justify-center md:justify-start mt-1 text-sm text-muted-foreground">
            <Link href={`/team/${team!.id}`} className="flex items-center gap-1 hover:text-foreground transition-colors">
              <span>{team!.flag}</span>
              <span>{team!.name}</span>
            </Link>
            <span className="text-muted-foreground/40">·</span>
            <span>{star.position}</span>
            <span className="text-muted-foreground/40">·</span>
            <span>Age {star.age}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pb-2 shrink-0">
          <Button asChild size="lg" className="bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-xl border-0 text-base px-6 gap-2.5">
            <Link href={`/player/${slugify(star.name)}`}>
              <Users className="h-5 w-5" />
              View Profile
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function StarOfTheWeekFallback() {
  const star = getStarOfTheWeek();
  const team = getTeamById(star.teamId);
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border min-h-[300px] md:min-h-[360px]">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -ml-12 -mb-12" />

      <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-8 min-h-[300px] md:min-h-[360px]">
        <PlayerAvatar name={star.name} size="xl" className="-mb-8 md:-mb-12 ring-4 ring-background shadow-2xl" />

        <div className="flex-1 text-center md:text-left pb-2">
          <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
            <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.15em]">Star of the Week</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">2026</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-foreground leading-tight tracking-tight">{star.name}</h2>
          <div className="flex items-center gap-2 justify-center md:justify-start mt-1 text-sm text-muted-foreground">
            <Link href={`/team/${team!.id}`} className="flex items-center gap-1 hover:text-foreground transition-colors">
              <span>{team!.flag}</span>
              <span>{team!.name}</span>
            </Link>
            <span className="text-muted-foreground/40">·</span>
            <span>{star.position}</span>
            <span className="text-muted-foreground/40">·</span>
            <span>Age {star.age}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pb-2 shrink-0">
          <Button asChild size="lg" className="bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-xl border-0 text-base px-6 gap-2.5">
            <Link href={`/player/${slugify(star.name)}`}>
              <Users className="h-5 w-5" />
              View Profile
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  const totalTeams = TEAMS.length;
  const totalMatches = MATCHES.length;
  const totalVenues = getVenues().length;
  const totalPlayers = getAllPlayers().length;
  const topScorers = getTopScorers(5);

  return (
    <div className="space-y-14">
      {/* ===== HERO ===== */}
      <section className="relative text-center py-20 md:py-28 rounded-2xl border overflow-hidden animate-in">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1400&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/60" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: `radial-gradient(circle at 30% 20%, white 0%, transparent 40%), radial-gradient(circle at 70% 80%, white 0%, transparent 35%)` }}
        />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.15em]">{totalTeams} Teams · {totalMatches} Matches · {totalVenues} Venues</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black mb-3 tracking-tight leading-[1.05]">
            FIFA World Cup
            <span className="block text-primary mt-1">2026</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-lg mx-auto">
            June 11 — July 19 · United States · Canada · Mexico
          </p>
          <Countdown />
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap animate-in animate-in-delay-3">
            <Button asChild size="lg">
              <Link href="/matches">
                <Calendar className="h-4 w-4 mr-2" />
                View Schedule
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/teams">
                <Shield className="h-4 w-4 mr-2" />
                All Teams
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/top-scorers">
                <Goal className="h-4 w-4 mr-2" />
                Top Scorers
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ===== QUICK STATS ===== */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-in animate-in-delay-4">
        <StatCard icon={Trophy} value={totalTeams.toString()} label="Teams" sub="Across 12 groups" />
        <StatCard icon={Calendar} value={totalMatches.toString()} label="Matches" sub="Group stage to final" />
        <StatCard icon={MapPin} value={totalVenues.toString()} label="Venues" sub="3 host nations" />
        <StatCard icon={Users} value={totalPlayers.toString()} label="Players" sub="15 per team squad" />
      </section>

      {/* ===== TOURNAMENT JOURNEY ===== */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Footprints className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Tournament Journey</h2>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { stage: "Group Stage", teams: "48 → 32", desc: "12 groups of 4", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
            { stage: "Round of 32", teams: "32 → 16", desc: "Knockout begins", color: "bg-green-500/10 text-green-600 border-green-500/20" },
            { stage: "Quarter-finals", teams: "8 → 4", desc: "Final stretch", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
            { stage: "Final", teams: "2 → 1", desc: "Champions crowned", color: "bg-primary/10 text-primary border-primary/20" },
          ].map((s, i) => (
            <div key={s.stage} className="relative bg-card rounded-xl border border-border p-4 overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 -mr-6 -mt-6 rounded-full bg-primary/[0.03]" />
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-bold border ${s.color}`}>
                  {i + 1}
                </span>
                <span className="text-xs text-muted-foreground font-medium">{s.teams}</span>
              </div>
              <p className="font-bold text-sm">{s.stage}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TOP SCORERS PREVIEW ===== */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Goal className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Top Scorers</h2>
          <div className="h-px flex-1 bg-border" />
          <Link href="/top-scorers" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5">
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {topScorers.map((s, i) => (
            <Link
              key={`${s.teamId}-${s.playerName}`}
              href={`/player/${slugify(s.playerName)}`}
              className="bg-card rounded-xl border border-border p-4 hover:ring-2 hover:ring-primary/50 transition-all group text-center"
            >
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
                {i + 1}
              </div>
              <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-2 flex items-center justify-center text-xl font-bold text-muted-foreground group-hover:text-primary transition-colors">
                {s.playerName.charAt(0)}
              </div>
              <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{s.playerName}</p>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className="text-xs text-muted-foreground">{s.teamFlag}</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                  s.position === "FW" ? "bg-green-500/10 text-green-600 border-green-500/20" :
                  s.position === "MF" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                  s.position === "DF" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                  "bg-purple-500/10 text-purple-600 border-purple-500/20"
                }`}>{s.position}</span>
              </div>
              <p className="mt-2 text-lg font-black text-primary tabular-nums">{s.goals} <span className="text-xs font-normal text-muted-foreground">goals</span></p>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== STAR OF THE WEEK ===== */}
      <Suspense fallback={<StarOfTheWeekFallback />}>
        <StarOfTheWeekSection />
      </Suspense>

      {/* ===== DID YOU KNOW? ===== */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-blue-500/5 to-transparent rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🌍</span>
            <Lightbulb className="h-4 w-4 text-blue-500" />
          </div>
          <p className="font-bold text-lg text-blue-500">48 Teams</p>
          <p className="text-sm text-muted-foreground mt-1">First World Cup with 48 teams, expanded from 32. 104 matches across 16 venues in 3 countries.</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/5 to-transparent rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🏟️</span>
            <Lightbulb className="h-4 w-4 text-green-500" />
          </div>
          <p className="font-bold text-lg text-green-500">3 Host Nations</p>
          <p className="text-sm text-muted-foreground mt-1">Three nations co-hosting for the first time since 2002. USA, Canada, and Mexico unite for the world&apos;s game.</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/5 to-transparent rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">⚽</span>
            <Lightbulb className="h-4 w-4 text-amber-500" />
          </div>
          <p className="font-bold text-lg text-amber-500">6 Confederations</p>
          <p className="text-sm text-muted-foreground mt-1">Six confederations represented. The expanded format gives more nations than ever a chance to compete.</p>
        </div>
      </section>

      {/* ===== GROUPS AT A GLANCE ===== */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Groups at a Glance</h2>
          <div className="h-px flex-1 bg-border" />
          <Link href="/matches" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5">
            All matches <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {GROUPS.map(group => {
            const teams = getTeamsByGroup(group);
            const standings = getGroupStandings(group);
            return (
              <div key={group} className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="bg-primary/5 border-b border-border px-4 py-2.5 flex items-center justify-between">
                  <span className="font-bold text-sm">Group {group}</span>
                  <Link href={`/team/${standings[0]?.teamId}`} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                    View teams
                  </Link>
                </div>
                <div className="divide-y divide-border">
                  {standings.map((s, i) => (
                    <Link
                      key={s.teamId}
                      href={`/team/${s.teamId}`}
                      className={`flex items-center gap-2 px-4 py-2.5 hover:bg-secondary/30 transition-colors ${i < 2 ? "bg-primary/[0.01]" : ""}`}
                    >
                      <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        i < 2 ? "bg-primary/10 text-primary" : "text-muted-foreground"
                      }`}>
                        {i + 1}
                      </span>
                      <span className="text-base">{s.flag}</span>
                      <span className="font-medium text-sm flex-1 truncate">{s.teamName}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold tabular-nums ${i < 2 ? "text-primary" : "text-muted-foreground"}`}>{s.points}</span>
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Pts</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, sub }: { icon: typeof Trophy; value: string; label: string; sub?: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 hover:ring-2 hover:ring-primary/50 transition-all group">
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-2xl font-black leading-none">{value}</p>
        <p className="text-xs font-medium text-foreground">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}
