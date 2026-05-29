import type { Metadata } from "next";
import { GROUPS, getTeamsByGroup } from "@/data/worldcup-2026";
import Link from "next/link";
import { Trophy, Shield, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Teams — WorldCup 2026",
  description: "All 48 teams competing in the FIFA World Cup 2026 across 12 groups.",
};

export default function TeamsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">All Teams</h1>
        <p className="text-muted-foreground">
          48 teams · 12 groups · 3 host nations
        </p>
      </div>

      {GROUPS.map(group => {
        const teams = getTeamsByGroup(group);
        return (
          <section key={group} className="mb-8">
            <h2 className="text-xl font-bold mb-4 border-l-4 border-primary pl-3">
              Group {group}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {teams.map(team => (
                <Link
                  key={team.id}
                  href={`/team/${team.id}`}
                  className="bg-card rounded-xl border border-border p-5 hover:ring-2 hover:ring-primary/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{team.flag}</span>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base group-hover:text-primary transition-colors truncate">
                        {team.name}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                          <Trophy className="h-2.5 w-2.5" />
                          Group {team.group}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-secondary px-1.5 py-0.5 rounded-full">
                          <Shield className="h-2.5 w-2.5" />
                          #{team.fifaRanking}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-secondary px-1.5 py-0.5 rounded-full">
                          <Users className="h-2.5 w-2.5" />
                          {team.confederation}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
