import type { Metadata } from "next";
import TEAMS, { GROUPS, MATCHES, getAllPlayers, getVenues } from "@/data/worldcup-2026";
import { Trophy, Calendar, MapPin, Users, Shield, Globe } from "lucide-react";

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">About the Tournament</h1>
        <p className="text-muted-foreground">FIFA World Cup 2026 — the biggest World Cup ever</p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Stat icon={Trophy} value={totalTeams.toString()} label="Teams" />
        <Stat icon={Calendar} value={totalMatches.toString()} label="Matches" />
        <Stat icon={Users} value={totalPlayers.toString()} label="Players" />
        <Stat icon={MapPin} value={hostCountries.length.toString()} label="Host Countries" />
      </div>

      {/* Format */}
      <div className="bg-card rounded-xl border border-border p-6 md:p-8 mb-8">
        <h2 className="text-xl font-bold mb-4 border-l-4 border-primary pl-3">Tournament Format</h2>
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            The <strong className="text-foreground">FIFA World Cup 2026</strong> is the 23rd edition of the
            quadrennial international men&apos;s football championship. For the first time, the tournament
            features <strong className="text-foreground">48 teams</strong> expanded from 32, and is hosted
            across three nations: <strong className="text-foreground">USA, Canada, and Mexico</strong>.
          </p>

          <div>
            <h3 className="font-bold text-foreground mb-2">Group Stage</h3>
            <p>
              The {totalTeams} teams are divided into <strong className="text-foreground">{GROUPS.length} groups</strong>{" "}
              (Groups A through L), each containing 4 teams. Each team plays the other three teams in its
              group once. A win earns 3 points, a draw earns 1 point, and a loss earns 0 points.
            </p>
            <p className="mt-2">
              The top <strong className="text-foreground">2 teams</strong> from each group advance to the
              knockout stage, along with the <strong className="text-foreground">8 best third-placed teams</strong>,
              making <strong className="text-foreground">32 teams</strong> in the Round of 32.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-2">Knockout Stage</h3>
            <p>
              The knockout stage consists of five rounds: Round of 32, Round of 16, Quarter-finals,
              Semi-finals, and the Final. All knockout matches are single elimination, with extra time
              and penalties if needed.
            </p>
          </div>
        </div>
      </div>

      {/* Host countries */}
      <div className="bg-card rounded-xl border border-border p-6 md:p-8 mb-8">
        <h2 className="text-xl font-bold mb-4 border-l-4 border-primary pl-3">Host Nations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {hostCountries.map((country) => {
            const countryVenues = venues.filter((v) => v.country === country);
            const flag = countryVenues[0]?.flag || "";
            return (
              <div key={country} className="bg-secondary/50 rounded-lg p-4 text-center">
                <span className="text-5xl block mb-2">{flag}</span>
                <h3 className="font-bold text-lg">{country}</h3>
                <p className="text-sm text-muted-foreground">{countryVenues.length} stadiums</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-xl border border-border p-6 md:p-8">
        <h2 className="text-xl font-bold mb-4 border-l-4 border-primary pl-3">Tournament Timeline</h2>
        <div className="space-y-4">
          <TimelineItem date="June 11" title="Opening Match" description="The tournament kicks off at Mexico City" />
          <TimelineItem date="June 11 – June 28" title="Group Stage" description="72 group matches across all venues" />
          <TimelineItem date="June 30 – July 3" title="Round of 32" description="Knockout stage begins with 32 teams" />
          <TimelineItem date="July 6 – July 9" title="Round of 16" description="16 teams remain" />
          <TimelineItem date="July 12 – July 13" title="Quarter-finals" description="8 teams, 4 matches" />
          <TimelineItem date="July 16 – July 17" title="Semi-finals" description="4 teams, 2 matches" />
          <TimelineItem date="July 19" title="Final" description="The World Cup champion is crowned" />
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Trophy; value: string; label: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 text-center">
      <Icon className="h-6 w-6 mx-auto text-primary mb-2" />
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function TimelineItem({ date, title, description }: { date: string; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20" />
        <div className="w-px flex-1 bg-border mt-1" />
      </div>
      <div className="pb-4">
        <p className="text-xs font-bold text-primary uppercase tracking-wider">{date}</p>
        <p className="font-bold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
