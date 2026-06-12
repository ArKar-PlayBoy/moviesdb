import { Suspense } from "react";
import TEAMS, { GROUPS, MATCHES, getTeamById, getGroupStandings, getStarOfTheWeek, getTopScorers, getVenues, getAllPlayers, getRecentPOTMs } from "@/data/worldcup-2026";
import { slugify } from "@/lib/utils";
import { getAllPlayerPhotos } from "@/lib/player-photo-map";
import { getLiveScores, computeStandingsFromResults, computeTopScorersFromResults } from "@/lib/data-service";
import { getAllMatchResults } from "@/lib/storage";

import PlayerAvatar from "@/components/player-avatar";
import Countdown from "@/components/countdown";
import Link from "next/link";
import { Trophy, Calendar, MapPin, Users, Shield, Goal, Footprints, ChevronRight, Sparkles, Lightbulb, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

async function StarOfTheWeekSection() {
  const star = getStarOfTheWeek();
  const team = getTeamById(star.teamId);
  const photos = await getAllPlayerPhotos();
  const photo = photos[star.name] ?? null;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border min-h-[300px] md:min-h-[360px]">
      {photo ? (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${photo})` }} />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -ml-12 -mb-12" />

      <div className="relative z-10 p-5 md:p-8 flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-8 min-h-[280px] md:min-h-[360px]">
        <PlayerAvatar name={star.name} size="xl" photoUrl={photo} className="w-24 h-24 md:w-auto md:h-auto -mb-6 md:-mb-12 ring-4 ring-background shadow-2xl" />

        <div className="flex-1 text-center md:text-left pb-1 md:pb-2">
          <div className="flex items-center gap-1.5 justify-center md:justify-start mb-0.5 md:mb-1">
            <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-500 fill-amber-500" />
            <span className="text-[9px] md:text-[10px] font-bold text-amber-500 uppercase tracking-[0.15em]">Star of the Week</span>
            <span className="text-[9px] md:text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">2026</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-foreground leading-tight tracking-tight">{star.name}</h2>
          <div className="flex items-center gap-1.5 justify-center md:justify-start mt-0.5 md:mt-1 text-xs md:text-sm text-muted-foreground flex-wrap">
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

        <div className="w-full md:w-auto pb-1 md:pb-2 shrink-0">
          <Button asChild size="default" className="w-full md:w-auto bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-xl border-0 text-sm md:text-base px-5 md:px-6 gap-2">
            <Link href={`/player/${slugify(star.name)}`}>
              <Users className="h-4 w-4 md:h-5 md:w-5" />
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

      <div className="relative z-10 p-5 md:p-8 flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-8 min-h-[280px] md:min-h-[360px]">
        <PlayerAvatar name={star.name} size="xl" className="w-24 h-24 md:w-auto md:h-auto -mb-6 md:-mb-12 ring-4 ring-background shadow-2xl" />

        <div className="flex-1 text-center md:text-left pb-1 md:pb-2">
          <div className="flex items-center gap-1.5 justify-center md:justify-start mb-0.5 md:mb-1">
            <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-500 fill-amber-500" />
            <span className="text-[9px] md:text-[10px] font-bold text-amber-500 uppercase tracking-[0.15em]">Star of the Week</span>
            <span className="text-[9px] md:text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">2026</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-foreground leading-tight tracking-tight">{star.name}</h2>
          <div className="flex items-center gap-1.5 justify-center md:justify-start mt-0.5 md:mt-1 text-xs md:text-sm text-muted-foreground flex-wrap">
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

        <div className="w-full md:w-auto pb-1 md:pb-2 shrink-0">
          <Button asChild size="default" className="w-full md:w-auto bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-xl border-0 text-sm md:text-base px-5 md:px-6 gap-2">
            <Link href={`/player/${slugify(star.name)}`}>
              <Users className="h-4 w-4 md:h-5 md:w-5" />
              View Profile
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function RecentPOTMSection() {
  const recent = getRecentPOTMs(5);
  return (
    <section>
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
        <h2 className="text-xl font-bold">Players of the Match</h2>
        <div className="h-px flex-1 bg-border" />
        {recent.length > 0 && (
          <Link href="/matches" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5">
            All matches <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      {recent.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <Star className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">No Players of the Match yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">POTM awards will appear here once the tournament begins on June 11.</p>
        </div>
      ) : (
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 -mx-1 px-1 scrollbar-none sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
          {recent.map((potm) => (
            <Link
              key={`${potm.matchId}-${potm.playerName}`}
              href={`/player/${slugify(potm.playerName)}`}
              className="snap-start shrink-0 w-[155px] sm:w-auto bg-card rounded-xl border border-border p-4 hover:ring-2 hover:ring-amber-500/50 transition-all group text-center"
            >
              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/10 text-amber-500 mb-2">
                <Star className="h-3.5 w-3.5 fill-amber-500" />
              </div>
              <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-2 flex items-center justify-center text-xl font-bold text-muted-foreground group-hover:text-amber-500 transition-colors">
                {potm.playerName.charAt(0)}
              </div>
              <p className="font-semibold text-sm truncate group-hover:text-amber-500 transition-colors">{potm.playerName}</p>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className="text-xs">{potm.teamFlag}</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                  potm.position === "FW" ? "bg-green-500/10 text-green-600 border-green-500/20" :
                  potm.position === "MF" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                  potm.position === "DF" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                  "bg-purple-500/10 text-purple-600 border-purple-500/20"
                }`}>{potm.position}</span>
              </div>
              <p className="mt-2 text-lg font-black text-amber-500 tabular-nums">{potm.goals} <span className="text-xs font-normal text-muted-foreground">goals</span></p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">{potm.stage}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default async function Home() {
  const totalTeams = TEAMS.length;
  const totalMatches = MATCHES.length + 32; // 72 group stage + 32 knockout
  const totalVenues = getVenues().length;
  const totalPlayers = getAllPlayers().length;
  const allResults = await getAllMatchResults();
  const hasResults = Object.keys(allResults).length > 0;
  const topScorers = hasResults ? computeTopScorersFromResults(allResults, 5) : getTopScorers(5);
  const totalGoalsHome = Object.values(allResults).reduce((sum, r) => {
    if (r.status === "finished") return sum + r.score[0] + r.score[1];
    return sum;
  }, 0);
  const liveMatches = await getLiveScores();

  return (
    <div className="space-y-10 md:space-y-14">
      {/* ===== HERO ===== */}
      <section className="relative text-center py-14 sm:py-20 md:py-28 rounded-xl md:rounded-2xl border overflow-hidden animate-in">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1400&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/60" />

        {/* Animated glow orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl float" style={{ animationDelay: "0s" }} />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary/8 rounded-full blur-3xl float" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-green-500/5 rounded-full blur-3xl float" style={{ animationDelay: "3s" }} />
          <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl float" style={{ animationDelay: "0.8s" }} />
        </div>

        {/* Host nation flags */}
        <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-20 md:opacity-30 pointer-events-none">
          <span className="text-3xl md:text-5xl float" style={{ animationDelay: "0s" }}>🇺🇸</span>
          <span className="text-3xl md:text-5xl float" style={{ animationDelay: "1s" }}>🇨🇦</span>
          <span className="text-3xl md:text-5xl float" style={{ animationDelay: "2s" }}>🇲🇽</span>
        </div>
        <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-20 md:opacity-30 pointer-events-none">
          <span className="text-3xl md:text-5xl float" style={{ animationDelay: "0.5s" }}>🇲🇽</span>
          <span className="text-3xl md:text-5xl float" style={{ animationDelay: "1.5s" }}>🇨🇦</span>
          <span className="text-3xl md:text-5xl float" style={{ animationDelay: "2.5s" }}>🇺🇸</span>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-[10px] font-bold text-foreground uppercase tracking-[0.15em]">{totalTeams} Teams · {totalMatches} Matches · {totalVenues} Venues</span>
          </div>
          <h1 className="text-[2rem] sm:text-5xl md:text-7xl font-black mb-3 tracking-tight leading-[1.05] animate-in animate-in-delay-1">
            FIFA World Cup
            <span className="block gradient-text from-primary via-blue-500 to-primary mt-1">2026</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-5 md:mb-6 max-w-lg mx-auto px-2 animate-in animate-in-delay-2">
            <span className="inline-flex items-center gap-1.5">June 11 — July 19</span>
            <span className="mx-2 text-muted-foreground/30">·</span>
            <span className="inline-flex items-center gap-1">🇺🇸🇨🇦🇲🇽</span>
          </p>
          <div className="animate-in animate-in-scale" style={{ animationDelay: "0.6s" }}>
            <Countdown />
          </div>
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center gap-2.5 md:gap-3 animate-in animate-in-delay-3">
            <Button asChild size="lg" className="w-full sm:w-auto md:text-base shadow-lg hover:shadow-xl transition-shadow">
              <Link href="/matches">
                <Calendar className="h-4 w-4 mr-2" />
                View Schedule
              </Link>
            </Button>
            <div className="flex gap-2.5 w-full sm:w-auto">
              <Button variant="outline" size="default" asChild className="flex-1 sm:flex-initial md:text-base glass hover:bg-secondary/80">
                <Link href="/teams">
                  <Shield className="h-4 w-4 mr-1.5" />
                  Teams
                </Link>
              </Button>
              <Button variant="outline" size="default" asChild className="flex-1 sm:flex-initial md:text-base glass hover:bg-secondary/80">
                <Link href="/top-scorers">
                  <Goal className="h-4 w-4 mr-1.5" />
                  Scorers
                </Link>
              </Button>
            </div>
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
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <Footprints className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Tournament Journey</h2>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 -mx-1 px-1 scrollbar-none sm:grid sm:grid-cols-4 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
          {[
            { stage: "Group Stage", teams: "48 → 32", desc: "12 groups of 4", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
            { stage: "Round of 32", teams: "32 → 16", desc: "Knockout begins", color: "bg-green-500/10 text-green-600 border-green-500/20" },
            { stage: "Quarter-finals", teams: "8 → 4", desc: "Final stretch", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
            { stage: "Final", teams: "2 → 1", desc: "Champions crowned", color: "bg-primary/10 text-primary border-primary/20" },
          ].map((s, i) => (
            <div key={s.stage} className="snap-start shrink-0 w-[180px] sm:w-auto relative bg-card rounded-xl border border-border p-4 overflow-hidden">
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
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <Goal className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Top Scorers</h2>
          <div className="h-px flex-1 bg-border" />
          <Link href="/top-scorers" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5">
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 -mx-1 px-1 scrollbar-none sm:grid sm:grid-cols-3 md:grid-cols-5 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
          {topScorers.length > 0 ? topScorers.map((s, i) => (
            <Link
              key={`${s.teamId}-${s.playerName}`}
              href={`/player/${slugify(s.playerName)}`}
              className="snap-start shrink-0 w-[155px] sm:w-auto bg-card rounded-xl border border-border p-4 hover:ring-2 hover:ring-primary/50 transition-all group text-center"
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
          )) : totalGoalsHome > 0 ? (
            <div className="col-span-full bg-card rounded-xl border border-border p-6 text-center">
              <Goal className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="font-semibold text-muted-foreground">{totalGoalsHome} goal{totalGoalsHome !== 1 ? "s" : ""} scored so far</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Scorer details pending — check back soon</p>
            </div>
          ) : (
            <div className="col-span-full bg-card rounded-xl border border-border p-6 text-center">
              <Goal className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="font-semibold text-muted-foreground">No goals scored yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Tournament starts June 11, 2026</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== RECENT PLAYERS OF THE MATCH ===== */}
      <RecentPOTMSection />

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

      {liveMatches.length > 0 && (
        <section className="bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent rounded-2xl border border-red-500/20 p-5 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <h2 className="text-lg font-bold">Live Now</h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-2">
            {liveMatches.map((m) => (
              <div key={m.id} className="flex items-center justify-between bg-card/50 rounded-lg p-3">
                <span className="font-medium">{m.team1Score} - {m.team2Score}</span>
                <span className="text-xs text-muted-foreground">{m.venue}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== GROUPS AT A GLANCE ===== */}
      <section>
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Groups at a Glance</h2>
          <div className="h-px flex-1 bg-border" />
          <Link href="/matches" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5">
            All matches <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {GROUPS.map(group => {
            const standings = hasResults ? computeStandingsFromResults(group, allResults) : getGroupStandings(group);
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

export const revalidate = 0;

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
