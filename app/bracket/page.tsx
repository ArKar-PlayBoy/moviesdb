import type { Metadata } from "next";
import { getBracketData } from "@/lib/data-service";
import { getTeamName, getTeamFlag } from "@/data/worldcup-2026";
import { getAllMatchResults } from "@/lib/storage";
import { ChevronRight } from "lucide-react";
import ChampionCelebration from "@/components/champion-celebration";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Knockout Bracket — WorldCup 2026",
  description: "FIFA World Cup 2026 knockout bracket — real pairings and results.",
};

const ROUNDS = [
  { key: "Round of 32", label: "Round of 32", cols: "grid-cols-1" },
  { key: "Round of 16", label: "Round of 16", cols: "grid-cols-1" },
  { key: "Quarter-final", label: "Quarter-final", cols: "grid-cols-1" },
  { key: "Semi-final", label: "Semi-final", cols: "grid-cols-1" },
  { key: "Final", label: "🏆 Final", cols: "grid-cols-1" },
];

const ROW_POSITIONS: Record<string, number> = {
  "r32-0": 0, "r32-3": 1, "r32-2": 2, "r32-5": 3,
  "r32-10": 4, "r32-11": 5, "r32-8": 6, "r32-9": 7,
  "r32-1": 8, "r32-4": 9, "r32-6": 10, "r32-7": 11,
  "r32-13": 12, "r32-14": 13, "r32-12": 14, "r32-15": 15,
  "r16-0": 0, "r16-1": 2, "r16-4": 4, "r16-5": 6,
  "r16-2": 8, "r16-3": 10, "r16-6": 12, "r16-7": 14,
  "qf-0": 0, "qf-1": 4, "qf-2": 8, "qf-3": 12,
  "sf-0": 0, "sf-1": 8,
  "final": 0,
};

const ROW_SPANS: Record<string, number> = {
  "r32-": 1, "r16-": 2, "qf-": 4, "sf-": 8, "final": 16, "bronze": 1,
};

function getRow(matchId: string): number { return ROW_POSITIONS[matchId] ?? 0; }
function getRowSpan(matchId: string): number {
  for (const [prefix, span] of Object.entries(ROW_SPANS)) {
    if (matchId.startsWith(prefix) || matchId === prefix) return span;
  }
  return 1;
}

export default async function BracketPage() {
  const allResults = await getAllMatchResults();
  const matches = getBracketData(allResults);

  const matchesByRound = new Map<string, typeof matches>();
  for (const m of matches) {
    const arr = matchesByRound.get(m.round) ?? [];
    arr.push(m);
    matchesByRound.set(m.round, arr);
  }

  const isAfterFinal = allResults["final"]?.status === "finished";
  const finalMatch = matches.find(m => m.id === "final");
  const bronzeMatch = matches.find(m => m.id === "bronze");

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Knockout Bracket</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Real pairings from the FIFA World Cup 2026 knockout stage
        </p>
      </div>

      {/* ===== BRACKET TREE ===== */}
      <div className="overflow-x-auto pb-4 -mx-1 px-1 scrollbar-none">
        <div className="flex gap-0 min-w-[900px]">
          {ROUNDS.map((round, ri) => {
            const roundMatches = matchesByRound.get(round.key) ?? [];
            const maxRows = ri === 0 ? 16 : ri === 1 ? 16 : ri === 2 ? 16 : ri === 3 ? 16 : 16;
            return (
              <div key={round.key} className="flex-1 min-w-[180px]">
                <div className="text-center mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {round.label}
                  </span>
                </div>
                <div
                  className="relative"
                  style={{
                    display: "grid",
                    gridTemplateRows: `repeat(${maxRows}, minmax(0, 1fr))`,
                    gap: "6px",
                    height: ri === 0 ? `${16 * 56}px` : ri === 1 ? `${8 * 56}px` : ri === 2 ? `${4 * 56}px` : ri === 3 ? `${2 * 56}px` : `${56}px`,
                    alignItems: "start",
                  }}
                >
                  {roundMatches.map(m => {
                    const row = getRow(m.id) * (ri === 0 ? 1 : ri === 1 ? 2 : ri === 2 ? 4 : ri === 3 ? 8 : 16);
                    const span = getRowSpan(m.id);
                    return (
                      <div
                        key={m.id}
                        className="relative"
                        style={{
                          gridRow: `${row + 1} / span ${span}`,
                          display: "flex",
                          alignItems: span > 1 ? "center" : "start",
                        }}
                      >
                        <MatchCard match={m} />
                        {ri < ROUNDS.length - 1 && (
                          <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== BRONZE FINAL ===== */}
      {bronzeMatch && (bronzeMatch.team1 || bronzeMatch.team2) && (
        <div className="mt-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-lg">🥉</span>
            <h2 className="text-lg font-bold">Bronze Final</h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="max-w-md mx-auto">
            <MatchCard match={bronzeMatch} />
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">July 18, 2026</p>
        </div>
      )}

      {/* ===== CHAMPION / COUNTDOWN ===== */}
      <ChampionCelebration
        finalMatch={finalMatch ?? null}
        isAfterFinal={isAfterFinal}
      />
    </div>
  );
}

function MatchCard({ match }: { match: { id: string; round: string; team1: string | null; team2: string | null; score1?: number; score2?: number } }) {
  const t1Name = match.team1 ? getTeamName(match.team1) : "TBD";
  const t2Name = match.team2 ? getTeamName(match.team2) : "TBD";
  const t1Flag = match.team1 ? getTeamFlag(match.team1) : "";
  const t2Flag = match.team2 ? getTeamFlag(match.team2) : "";
  const hasScores = match.score1 !== undefined && match.score2 !== undefined;
  const t1Won = hasScores && match.score1! > match.score2!;
  const t2Won = hasScores && match.score2! > match.score1!;

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-border/60 p-2.5 hover:ring-2 hover:ring-primary/40 transition-all w-full shadow-sm">
      <div className="flex items-center justify-between gap-1.5">
        <span className={`text-xs font-medium truncate flex items-center gap-1 ${t1Won ? "text-green-600 font-bold" : ""}`}>
          {t1Flag && <span className="text-sm">{t1Flag}</span>}
          <span className="truncate">{t1Name}</span>
        </span>
        {hasScores && (
          <span className={`text-xs font-bold tabular-nums shrink-0 ${t1Won ? "text-green-600" : "text-muted-foreground"}`}>
            {match.score1}
          </span>
        )}
      </div>
      <div className="border-t border-border/40 my-1" />
      <div className="flex items-center justify-between gap-1.5">
        <span className={`text-xs font-medium truncate flex items-center gap-1 ${t2Won ? "text-green-600 font-bold" : ""}`}>
          {t2Flag && <span className="text-sm">{t2Flag}</span>}
          <span className="truncate">{t2Name}</span>
        </span>
        {hasScores && (
          <span className={`text-xs font-bold tabular-nums shrink-0 ${t2Won ? "text-green-600 font-bold" : "text-muted-foreground"}`}>
            {match.score2}
          </span>
        )}
      </div>
    </div>
  );
}
