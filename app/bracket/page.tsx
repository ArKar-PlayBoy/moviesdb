import type { Metadata } from "next";
import { getBracketData } from "@/lib/data-service";
import { getTeamName, getTeamFlag } from "@/data/worldcup-2026";
import { getAllMatchResults } from "@/lib/storage";
import { Trophy } from "lucide-react";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Knockout Bracket — WorldCup 2026",
  description: "Predicted knockout bracket for the FIFA World Cup 2026 based on group stage simulations.",
};

const ROUND_ORDER = ["Round of 32", "Round of 16", "Quarter-final", "Semi-final", "Final"];

export default async function BracketPage() {
  const allResults = await getAllMatchResults();
  const matches = Object.keys(allResults).length > 0 ? getBracketData(allResults) : getBracketData();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Knockout Bracket</h1>
        <p className="text-muted-foreground">
          Predicted bracket based on group stage simulations
        </p>
      </div>

      <div className="space-y-8">
        {ROUND_ORDER.map((round) => {
          const roundMatches = matches.filter((m) => m.round === round);
          return (
            <div key={round}>
              <h2 className="text-lg font-bold mb-3 border-l-4 border-primary pl-3">{round}</h2>
              <div className={`grid gap-3 ${round === "Final" ? "grid-cols-1 max-w-md mx-auto" : round === "Semi-final" ? "grid-cols-1 sm:grid-cols-2 max-w-2xl" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`}>
                {roundMatches.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 bg-card rounded-xl border border-border p-6 text-center">
        <Trophy className="h-10 w-10 mx-auto text-primary mb-2" />
        <h2 className="text-xl font-bold mb-1">Champions</h2>
        <p className="text-muted-foreground text-sm">
          Winner of the 2026 FIFA World Cup — determined after the final match on July 19
        </p>
      </div>
    </div>
  );
}

function MatchCard({ match }: { match: { id: string; round: string; team1: string | null; team2: string | null; score1?: number; score2?: number } }) {
  const t1Name = match.team1 ? getTeamName(match.team1) : "TBD";
  const t2Name = match.team2 ? getTeamName(match.team2) : "TBD";
  const t1Flag = match.team1 ? getTeamFlag(match.team1) : "";
  const t2Flag = match.team2 ? getTeamFlag(match.team2) : "";
  const hasScores = match.score1 !== undefined && match.score2 !== undefined;

  return (
    <div className="bg-card rounded-xl border border-border p-4 hover:ring-2 hover:ring-primary/50 transition-all">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm truncate">{t1Flag} {t1Name}</span>
          {hasScores && (
            <span className={`text-sm font-bold tabular-nums ${match.score1! > match.score2! ? "text-green-600" : match.score1! < match.score2! ? "text-muted-foreground" : "text-amber-600"}`}>
              {match.score1}
            </span>
          )}
        </div>
        <div className="border-t border-border" />
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm truncate">{t2Flag} {t2Name}</span>
          {hasScores && (
            <span className={`text-sm font-bold tabular-nums ${match.score2! > match.score1! ? "text-green-600" : match.score2! < match.score1! ? "text-muted-foreground" : "text-amber-600"}`}>
              {match.score2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
