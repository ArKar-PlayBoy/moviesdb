import type { Metadata } from "next";
import { getTeamById, getMatchesForTeam, getTeamName, getTeamFlag, getAllTeams } from "@/data/worldcup-2026";
import TeamPlayerSection from "@/components/team-player-section";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Calendar, Trophy, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const team = getTeamById(id);
  if (!team) return { title: "Team Not Found — WorldCup 2026" };
  return {
    title: `${team.name} — WorldCup 2026`,
    description: `${team.name} — Group ${team.group} · FIFA Ranking #${team.fifaRanking} · Coach: ${team.coach}. View key players and match schedule.`,
  };
}

export function generateStaticParams() {
  return getAllTeams().map((t) => ({ id: t.id }));
}

export const revalidate = 120;

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = getTeamById(id);
  if (!team) notFound();

  const matches = getMatchesForTeam(id);

  return (
    <div>
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/teams">
          <ArrowLeft className="h-4 w-4 mr-1" />
          All Teams
        </Link>
      </Button>

      <div className="bg-card rounded-xl border border-border p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <span className="text-7xl md:text-8xl">{team.flag}</span>
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-bold mb-2">{team.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
                <Trophy className="h-3 w-3" />
                Group {team.group}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-secondary px-2 py-1 rounded-full border border-border">
                <Shield className="h-3 w-3" />
                FIFA #{team.fifaRanking}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-secondary px-2 py-1 rounded-full border border-border">
                <Users className="h-3 w-3" />
                {team.confederation}
              </span>
            </div>
            <p className="text-muted-foreground">
              Coach: <span className="font-medium text-foreground">{team.coach}</span>
            </p>
          </div>
        </div>
      </div>

      <TeamPlayerSection players={team.players} teamName={team.name} teamId={team.id} />

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 border-l-4 border-primary pl-3">Match Schedule</h2>
        {matches.length === 0 ? (
          <p className="text-muted-foreground">No matches scheduled.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Opponent</th>
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground hidden md:table-cell">Venue</th>
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Stage</th>
                  <th className="text-right py-3 px-3 font-medium text-muted-foreground">Highlights</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => {
                  const opponentId = match.team1 === id ? match.team2 : match.team1;
                  const opponentName = getTeamName(opponentId);
                  const opponentFlag = getTeamFlag(opponentId);
                  return (
                    <tr key={match.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{opponentFlag}</span>
                          <Link
                            href={`/team/${opponentId}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {opponentName}
                          </Link>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {match.date}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {match.venue}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs font-medium bg-secondary px-2 py-0.5 rounded-full">
                          {match.stage}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <a
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                            `${team.name} vs ${opponentName} 2026 world cup highlights`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="sm" className="gap-1 text-xs">
                            Watch
                          </Button>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
