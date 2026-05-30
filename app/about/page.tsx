import type { Metadata } from "next";
import TEAMS, { GROUPS, MATCHES, getAllPlayers, getVenues } from "@/data/worldcup-2026";
import { Trophy, Calendar, MapPin, Users, Shield, Globe, Star, Goal, ArrowRight, Timer, Flag } from "lucide-react";

export const metadata: Metadata = {
  title: "About — WorldCup 2026",
  description: "Everything about the FIFA World Cup 2026 hosted across USA, Canada, and Mexico.",
};

export default function AboutPage() {
  const allPlayers = getAllPlayers();
  const venues = getVenues();
  const totalMatches = MATCHES.length;
  const totalTeams = TEAMS.length;
  const totalPlayers = allPlayers.length;
  const hostCountries = [...new Set(venues.map((v) => v.country))];
  const totalVenues = venues.length;

  return (
    <div>
      {/* ===== HERO ===== */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary/5 via-primary/[0.02] to-background border border-border mb-8 md:mb-10">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-primary/[0.03] blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-amber-500/[0.03] blur-3xl" />
        <div className="relative z-10 p-6 md:p-10 lg:p-14">
          <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-3">
            <Trophy className="h-3.5 w-3.5" />
            <span>FIFA World Cup 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-[1.05] tracking-tight max-w-2xl">
            The Biggest World Cup Ever
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-xl leading-relaxed">
            48 teams · 104 matches · 16 stadiums · 3 host nations. The 23rd edition of the
            quadrennial championship across USA, Canada, and Mexico.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/80 rounded-full text-xs font-medium text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              June 11 – July 19, 2026
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/80 rounded-full text-xs font-medium text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              16 venues
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/80 rounded-full text-xs font-medium text-muted-foreground">
              <Globe className="h-3.5 w-3.5" />
              3 countries
            </div>
          </div>
        </div>
      </div>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 md:mb-10">
        <StatCard icon={Trophy} value={totalTeams.toString()} label="Teams" gradient="from-rose-500/20 to-rose-500/5" accent="text-rose-500" />
        <StatCard icon={Calendar} value={totalMatches.toString()} label="Matches" gradient="from-blue-500/20 to-blue-500/5" accent="text-blue-500" />
        <StatCard icon={Users} value={totalPlayers.toString()} label="Players" gradient="from-emerald-500/20 to-emerald-500/5" accent="text-emerald-500" />
        <StatCard icon={MapPin} value={totalVenues.toString()} label="Venues" gradient="from-amber-500/20 to-amber-500/5" accent="text-amber-500" />
      </div>

      {/* ===== FORMAT SECTION ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 md:mb-10">
        {/* Group Stage */}
        <div className="bg-card rounded-2xl border border-border p-6 md:p-8 relative overflow-hidden group hover:ring-2 hover:ring-primary/30 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/[0.04] blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Group Stage</h3>
                <p className="text-xs text-muted-foreground">{GROUPS.length} groups · 4 teams each</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                The {totalTeams} teams are divided into <strong className="text-foreground">{GROUPS.length} groups</strong>{" "}
                (A through L). Each team plays the other three in its group once.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                  <Goal className="h-3 w-3" />
                  Win = 3 pts
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 text-xs font-bold">
                  <Timer className="h-3 w-3" />
                  Draw = 1 pt
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 text-xs font-bold">
                  Loss = 0 pts
                </span>
              </div>
              <p>
                Top <strong className="text-foreground">2 teams</strong> per group +{" "}
                <strong className="text-foreground">8 best third-placed</strong> teams advance.
              </p>
            </div>
          </div>
        </div>

        {/* Knockout Stage */}
        <div className="bg-card rounded-2xl border border-border p-6 md:p-8 relative overflow-hidden group hover:ring-2 hover:ring-primary/30 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-amber-500/[0.04] blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Knockout Stage</h3>
                <p className="text-xs text-muted-foreground">Single elimination · 32 teams</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                Five rounds of single elimination: from <strong className="text-foreground">Round of 32</strong>{" "}
                all the way to the <strong className="text-foreground">Final</strong>.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { round: "R32", teams: "32", color: "bg-blue-500/10 text-blue-600" },
                  { round: "R16", teams: "16", color: "bg-emerald-500/10 text-emerald-600" },
                  { round: "QF", teams: "8", color: "bg-amber-500/10 text-amber-600" },
                  { round: "SF", teams: "4", color: "bg-orange-500/10 text-orange-600" },
                  { round: "Final", teams: "2", color: "bg-rose-500/10 text-rose-600" },
                ].map((r) => (
                  <div key={r.round} className={`text-center p-2 rounded-lg ${r.color} border border-current/10`}>
                    <p className="text-xs font-bold">{r.round}</p>
                    <p className="text-[10px] opacity-70">{r.teams} teams</p>
                  </div>
                ))}
              </div>
              <p>
                Extra time and penalties if scores are level after regulation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== HOST NATIONS ===== */}
      <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-8 md:mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-primary/[0.03] blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Flag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Host Nations</h2>
              <p className="text-xs text-muted-foreground">3 countries · {totalVenues} stadiums</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {hostCountries.map((country) => {
              const countryVenues = venues.filter((v) => v.country === country);
              const flag = countryVenues[0]?.flag || "";
              const countryColors: Record<string, { gradient: string; accent: string; light: string }> = {
                "USA": { gradient: "from-blue-600/20 to-red-500/10", accent: "text-blue-600", light: "bg-blue-500/10" },
                "Canada": { gradient: "from-red-600/20 to-white/10", accent: "text-red-600", light: "bg-red-500/10" },
                "Mexico": { gradient: "from-green-600/20 to-red-600/10", accent: "text-green-600", light: "bg-green-500/10" },
              };
              const colors = countryColors[country] || { gradient: "from-primary/20 to-primary/5", accent: "text-primary", light: "bg-primary/10" };

              return (
                <div key={country} className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${colors.gradient} border border-border p-5 group hover:ring-2 hover:ring-primary/30 transition-all`}>
                  <span className="text-5xl block mb-3">{flag}</span>
                  <h3 className="font-bold text-lg text-foreground">{country}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <MapPin className={`h-3.5 w-3.5 ${colors.accent}`} />
                    <p className="text-sm text-muted-foreground">
                      <span className={`font-semibold ${colors.accent}`}>{countryVenues.length}</span> stadium{countryVenues.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex flex-wrap gap-1.5">
                      {countryVenues.slice(0, 4).map((v) => (
                        <span key={v.id} className={`text-[10px] px-2 py-0.5 rounded-full ${colors.light} text-muted-foreground font-medium`}>
                          {v.city}
                        </span>
                      ))}
                      {countryVenues.length > 4 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          +{countryVenues.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== TIMELINE ===== */}
      <div className="bg-card rounded-2xl border border-border p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-amber-500/[0.03] blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Timer className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Tournament Timeline</h2>
              <p className="text-xs text-muted-foreground">June 11 → July 19, 2026</p>
            </div>
          </div>
          <div className="relative">
            {/* Timeline gradient bar */}
            <div className="hidden sm:block absolute left-[7.5px] top-3 bottom-3 w-[3px] rounded-full bg-gradient-to-b from-rose-500 via-amber-500 to-emerald-500 opacity-30" />

            <div className="space-y-0">
              {[
                { date: "June 11", title: "Opening Match", desc: "Mexico City kicks off the tournament", color: "from-rose-500", dot: "bg-rose-500 ring-rose-500/20" },
                { date: "Jun 11 – Jun 28", title: "Group Stage", desc: "72 matches across all venues", color: "from-blue-500", dot: "bg-blue-500 ring-blue-500/20" },
                { date: "Jun 30 – Jul 3", title: "Round of 32", desc: "Knockout stage begins", color: "from-emerald-500", dot: "bg-emerald-500 ring-emerald-500/20" },
                { date: "Jul 6 – Jul 9", title: "Round of 16", desc: "16 teams remain", color: "from-teal-500", dot: "bg-teal-500 ring-teal-500/20" },
                { date: "Jul 12 – Jul 13", title: "Quarter-finals", desc: "8 teams · 4 matches", color: "from-amber-500", dot: "bg-amber-500 ring-amber-500/20" },
                { date: "Jul 16 – Jul 17", title: "Semi-finals", desc: "4 teams · 2 matches", color: "from-orange-500", dot: "bg-orange-500 ring-orange-500/20" },
                { date: "Jul 19", title: "Final", desc: "The champion is crowned", color: "from-rose-600", dot: "bg-rose-600 ring-rose-600/20" },
              ].map((item, i) => (
                <div key={item.title} className="flex gap-4 group">
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-[18px] h-[18px] rounded-full ${item.dot} ring-4 ring-background flex items-center justify-center transition-transform group-hover:scale-125`}>
                      <div className="w-2 h-2 rounded-full bg-background" />
                    </div>
                    {i < 6 && <div className="w-[3px] flex-1 bg-gradient-to-b from-border to-border/20 group-hover:from-primary/30 group-hover:to-primary/10 transition-colors" />}
                  </div>
                  <div className={`pb-6 ${i === 6 ? "pb-0" : ""} flex-1 min-w-0`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-4">
                      <p className="text-xs font-bold text-primary uppercase tracking-wider tabular-nums shrink-0">{item.date}</p>
                      <div className="h-px flex-1 hidden sm:block bg-border/50" />
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${item.color.replace("from-", "bg-").replace("-500", "-500/10")} ${item.color.replace("from-", "text-").replace("-600", "-600").replace("-500", "-500")} sm:hidden inline-flex w-fit`}>
                        {item.title}
                      </span>
                    </div>
                    <h3 className="font-bold text-foreground hidden sm:block mt-0.5 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== WORLD CUP TRIVIA ===== */}
      <div className="mt-8 md:mt-10 bg-gradient-to-br from-amber-500/[0.04] to-rose-500/[0.02] rounded-2xl border border-border p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-amber-500/[0.04] blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Did You Know?</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { fact: "First World Cup with 48 teams", desc: "Expanded from 32 teams for 2026" },
              { fact: "3 host nations for the first time", desc: "USA, Canada, and Mexico co-host" },
              { fact: "104 matches total", desc: "Up from 64 in previous tournaments" },
            ].map((item) => (
              <div key={item.fact} className="bg-background/50 rounded-xl p-4 border border-border/50">
                <p className="font-semibold text-sm text-foreground">{item.fact}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, gradient, accent }: { icon: typeof Trophy; value: string; label: string; gradient: string; accent: string }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 md:p-5 text-center group hover:ring-2 hover:ring-primary/30 transition-all relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/[0.02]" />
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`h-5 w-5 md:h-6 md:w-6 ${accent}`} />
      </div>
      <p className="text-2xl md:text-3xl font-black tabular-nums">{value}</p>
      <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}
